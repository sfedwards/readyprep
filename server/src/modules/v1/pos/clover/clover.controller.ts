import { LocationModel } from '@modules/app/locations/infra/models';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import { Account } from '@modules/v1/accounts/account.entity';
import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import { Event, EventType } from '@modules/v1/events/event.entity';
import { MenuItem } from '@modules/v1/menu-items/menu-item.entity';
import { MenuItemsService } from '@modules/v1/menu-items/menu-items.service';
import { Plan } from '@modules/v1/plans/plan.decorator';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Session,
  UseGuards,
  Inject,
  BadRequestException,
  Res,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { CloverPosItemLink } from './clover-item-link.entity';
import { CloverPos } from './clover-pos.entity';
import { CloverToken } from './clover-token.entity';
import { CloverService } from './clover.service';

interface Item {
  id: string;
  name: string;
  match?: { id: number; name: string };
  link?: { id: number; name: string };
  ignored?: boolean;
}

@Controller('pos/clover')
export class CloverController {
  constructor(
    private readonly cloverService: CloverService,
    private readonly menuItemsService: MenuItemsService,
    @Inject('CLOVER_CODE') private readonly code: string,
  ) {}

  @Get('connect')
  @UseGuards(LoggedInGuard)
  @Transactional()
  async connect(
    @Query() query,
    @Session() { accountId },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { code, merchant_id: merchantId } = query;

      const manager = Transactional.getManager();

      const { accessToken } = await this.cloverService.getAccessToken(code);

      const token = new CloverToken({
        accountId,
        accessToken,
        cloverMerchantId: merchantId,
      });

      await manager.softDelete(CloverToken, { accountId });

      await manager.save(token);

      const newPos = new CloverPos({
        accountId,
        cloverMerchantId: merchantId,
        token,
      });

      const existingPos = await manager.findOne(CloverPos, {
        accountId,
        cloverMerchantId: merchantId,
      });

      if (existingPos) {
        existingPos.token = token;
        manager.save(existingPos);
      } else {
        const location = await manager.findOne(LocationModel, {
          accountId,
        });
        newPos.token = token;
        newPos.location = location;
        await manager.insert(CloverPos, newPos);
      }

      return res.redirect('/pos/associations');
    } catch (e) {
      console.log(e);
      return res.redirect('/settings?error=clover');
    }
  }

  @Post('webhook')
  @HttpCode(200)
  @Transactional()
  async webhook(
    @Headers('x-clover-auth') authToken: string,
    @Body() body: any,
  ): Promise<void> {
    const manager = Transactional.getManager();

    if (authToken !== this.code) {
      throw new BadRequestException();
    }

    const event = new Event({
      type: EventType.CLOVER_WEBHOOK,
      data: body,
    });

    await manager.insert(Event, event);
  }

  @Get('items')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  @Transactional()
  async getItems(@Session() { accountId }) {
    const manager = Transactional.getManager();

    const token = await manager.findOne(CloverToken, {
      where: {
        accountId,
      },
      relations: ['pos'],
    });

    if (!token) throw new NotFoundException();

    const { accessToken, pos } = token;
    const items = await this.cloverService.getItems({
      accessToken,
      merchantId: pos.cloverMerchantId,
    });

    const links = await manager.find(CloverPosItemLink, {
      where: {
        posId: pos.id,
      },
      relations: ['item'],
    });

    const response: { items: Item[] } = {
      items: [],
    };

    for (const item of items) {
      const { id, name } = item;
      const link = links.find((link) => id === link.idInPos);

      const scoreExpression =
        'GREATEST( word_similarity(:name, "name"), word_similarity("name", :name) )';
      const match = await manager
        .createQueryBuilder()
        .select('item')
        .from(MenuItem, 'item')
        .addSelect(scoreExpression, 'score')
        .where(`${scoreExpression} > :threshold`, { threshold: 0.6 })
        .andWhere('"ownerId" = :accountId', { accountId })
        .orderBy('"score"', 'DESC')
        .setParameters({ name })
        .getOne();

      const ignored = link && !link.item;

      const dtoItem: Item = {
        id,
        name,
        ignored,
      };

      if (link && !ignored)
        dtoItem.link = {
          id: link.itemId,
          name: link.item.name,
        };

      response.items.push(dtoItem);
    }

    return response;
  }

  @Post('associate')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  @Transactional()
  async associate(
    @Body() body: { posId: string; item: string; name?: string }[],
    @Session() { accountId },
  ) {
    const manager = Transactional.getManager();

    const token = await manager.findOne(CloverToken, {
      where: {
        accountId,
      },
      relations: ['pos'],
    });

    const items = await this.cloverService.getItems({
      accessToken: token.accessToken,
      merchantId: token.cloverMerchantId,
    });

    for (const row of body) {
      const { posId, item, name } = row;

      let menuItem;

      if (item === 'ignore') {
        menuItem = null;
      } else if (item === 'new') {
        const price = items.find(({ id }) => id === posId)?.price;
        menuItem = await this.menuItemsService.create(accountId, {
          name,
          price,
        });
      } else {
        menuItem = await manager.findOne(MenuItem, {
          where: {
            ownerId: accountId,
            scopedId: item,
          },
        });

        if (!menuItem) throw new NotFoundException();
      }

      await manager
        .createQueryBuilder()
        .insert()
        .into(CloverPosItemLink)
        .values([
          {
            pos: token.pos,
            idInPos: posId,
            item: menuItem,
          },
        ])
        .orUpdate({
          conflict_target: ['posId', 'idInPos'],
          overwrite: ['itemId'],
        })
        .execute();
    }

    const { pos } = token;
    const hasNewPosItems = await this.cloverService.hasUnassociatedItems(
      token,
      pos,
    );
    await manager.update(Account, pos.accountId, { hasNewPosItems });

    return {};
  }
}
