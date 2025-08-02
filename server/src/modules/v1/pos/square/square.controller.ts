import {
  Controller,
  Get,
  UseGuards,
  Session,
  Query,
  Res,
  Post,
  Body,
  NotFoundException,
  Headers,
  Request,
  BadRequestException,
  Inject,
  Delete,
} from '@nestjs/common';
import { LoggedInGuard } from '@modules/v1/auth/logged-in.guard';
import { Response } from 'express';
import { SquareService } from './square.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { SquareToken } from './square-token.entity';
import { SquarePos } from './square-pos.entity';
import { LocationModel } from '../../../app/locations/infra/models/location.model';
import {
  MenuItem,
  MenuItemType,
} from '@modules/v1/menu-items/menu-item.entity';
import { SquarePosItemLink } from './square-item-link.entity';
import { MenuItemsService } from '@modules/v1/menu-items/menu-items.service';
import { SquareGetItemsResponse } from './DTO/get-items.dto';
import crypto = require('crypto');
import { Event, EventType } from '@modules/v1/events/event.entity';
import { Account } from '@modules/v1/accounts/account.entity';
import { Plan } from '@modules/v1/plans/plan.decorator';
import { PlanGuard } from '@modules/v1/plans/plan.guard';
import { Transactional } from '@modules/infra/database/transactional.decorator';

const DAY = 24 * 60 * 60 * 1000;

@Controller('square')
@UseGuards(PlanGuard)
export class SquareController {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly squareService: SquareService,
    private readonly menuItemsService: MenuItemsService,
    @Inject('SQUARE_WEBHOOK_KEY') private readonly signatureKey: string,
    @Inject('SQUARE_V1_WEBHOOK_KEY') private readonly v1SignatureKey: string,
  ) {}

  @Post('webhook')
  async webhook(
    @Headers('x-square-signature') signature,
    @Body() body,
    @Request() req,
  ) {
    const requestUrl = req.protocol + '://' + req.hostname + req.originalUrl;
    const url = process.env.SQUARE_WEBHOOK_URL ?? requestUrl;

    const data = JSON.parse(body);

    const isVersion1 = !data.type;
    const key = isVersion1 ? this.v1SignatureKey : this.signatureKey;

    const hmac = crypto.createHmac('sha1', key);
    hmac.write(url + body.toString());
    hmac.end();
    const checkHash = hmac.read().toString('base64');

    if (signature !== checkHash) {
      throw new BadRequestException();
    }

    const event = new Event({
      type: EventType.SQUARE_WEBHOOK,
      dedupeId: data.event_id ?? data.entity_id, // entity_id is a fallback for webhooks v1
      data,
    });

    await this.entityManager.insert(Event, event);
  }

  @Get('connect')
  @UseGuards(LoggedInGuard)
  @Transactional()
  async connect(
    @Query() query,
    @Session() { accountId },
    @Res() res: Response,
  ) {
    const manager = Transactional.getManager();

    try {
      const {
        accessToken,
        expiresAt,
        refreshToken,
      } = await this.squareService.getAccessToken({ code: query.code });

      const locations = (
        await this.squareService.getLocations(accessToken)
      ).filter(({ status }) => status === 'ACTIVE');

      const token = new SquareToken({
        accountId,
        accessToken,
        expiresAt,
        refreshToken,
        squareMerchantId: locations[0].merchant_id,
      });

      await manager.softDelete(SquareToken, { accountId });
      await manager.save(token);
      await manager.insert(
        Event,
        new Event({
          type: EventType.SQUARE_REFRESH_TOKEN_REQUEST,
          data: { accountId, tokenId: token.id },
          time: new Date(+Date.now() + DAY),
        }),
      );

      if (locations.length === 1) {
        const address = [
          locations[0].address.address_line_1,
          locations[0].address.address_line_2,
          [
            locations[0].locality,
            locations[0].address.administrative_district_level_1,
          ]
            .filter(Boolean)
            .join(', '),
        ]
          .filter((x) => x && x.toString())
          .join('\n');
        const phoneNumber = locations[0].phone_number;
        await this.initializeLocation(
          accountId,
          locations[0].id,
          locations[0].name,
          address,
          phoneNumber,
        );
      }
      return res.redirect('/pos/associations');
    } catch (err) {
      console.log(err);
      return res.redirect('/settings?error=square');
    }
  }

  @Delete()
  @UseGuards(LoggedInGuard)
  async disconnect(@Session() { accountId }) {
    await this.squareService.disconnect(accountId);
  }

  @Get('locations')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  async getLocations(@Session() { accountId }) {
    const token = await this.entityManager.findOne(SquareToken, { accountId });
    if (!token) throw new NotFoundException();
    const locations = await this.squareService.getLocations(token.accessToken);

    await Promise.all(
      locations.map(async (location) => {
        const pos = await this.entityManager.findOne(
          SquarePos,
          { squareLocationId: location.id, accountId },
          { relations: ['location', 'token'] },
        );
        if (pos?.token && !pos.token.deletedAt) location.pos = pos.id;
      }),
    );
    return locations;
  }

  @Post('location')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  @Transactional()
  async setLocations(
    @Session() { accountId },
    @Body() { location: locationId }: { location: string },
  ) {
    const manager = Transactional.getManager();

    const { accessToken } = await manager.findOne(SquareToken, {
      accountId,
    });
    const locations = await this.squareService.getLocations(accessToken);

    const location = locations.find(({ id }) => id === locationId);
    if (!location) throw new NotFoundException();

    const address = [
      location.address.address_line_1,
      location.address.address_line_2,
      [location.locality, location.address.administrative_district_level_1]
        .filter(Boolean)
        .join(', '),
    ]
      .filter((x) => x && x.toString())
      .join('\n');
    const phoneNumber = locations[0].phone_number;

    await this.initializeLocation(
      accountId,
      location.id,
      location.name,
      address,
      phoneNumber,
    );
    return {};
  }

  @Get('items')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  async getItems(@Session() { accountId }) {
    const token = await this.entityManager.findOne(SquareToken, {
      where: {
        accountId,
      },
      relations: ['pos'],
    });

    if (!token) throw new NotFoundException();

    const { accessToken, pos } = token;
    const items = await this.squareService.getItems(
      accessToken,
      pos.squareLocationId,
    );

    const links = await this.entityManager.find(SquarePosItemLink, {
      where: {
        posId: pos.id,
      },
      relations: ['item'],
    });

    for (const item of items) {
      let name, variations;

      if (item.type === 'MODIFIER') {
        name = item.modifier_data.name;
        variations = [item];
      } else {
        ({ name, variations } = item.item_data);
      }

      for (const variation of variations) {
        const link = links.find((link) => variation.id === link.idInPos);
        if (link?.item) {
          variation.link = link.item;
        } else {
          if (link) variation.ignored = true;
          const scoreExpression =
            'GREATEST( word_similarity(:name, "name"), word_similarity("name", :name) )';
          variation.match = await this.entityManager
            .createQueryBuilder()
            .select('item')
            .from(MenuItem, 'item')
            .addSelect(scoreExpression, 'score')
            .where(`${scoreExpression} > :threshold`, { threshold: 0.6 })
            .andWhere('"ownerId" = :accountId', { accountId })
            .orderBy('"score"', 'DESC')
            .setParameters({ name })
            .getOne();
        }
      }
    }

    return new SquareGetItemsResponse(items);
  }

  @Post('associate')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  async associate(
    @Body() body: { posId: string; item: string; name?: string }[],
    @Session() { accountId },
  ) {
    const token = await this.entityManager.findOne(SquareToken, {
      where: {
        accountId,
      },
      relations: ['pos'],
    });

    const items = await this.squareService.getItems(
      token.accessToken,
      token.pos.squareLocationId,
    );

    for (const row of body) {
      const { posId, item, name } = row;

      let menuItem;

      if (item === 'ignore') {
        menuItem = null;
      } else if (item === 'new') {
        const type = items.some(
          ({ id, type }) => id === posId && type === 'MODIFIER',
        )
          ? MenuItemType.Modifier
          : MenuItemType.Regular;
        const price =
          type === MenuItemType.Modifier
            ? items.find(({ id }) => id === posId)?.modifier_data?.price_money
                ?.amount / 100 ?? null
            : items
                .flatMap((item) => item?.item_data?.variations ?? [])
                .find(({ id }) => id === posId)?.item_variation_data
                ?.price_money?.amount / 100 ?? null;
        menuItem = await this.menuItemsService.create(accountId, {
          name,
          type,
          price,
        });
      } else {
        menuItem = await this.entityManager.findOne(MenuItem, {
          where: {
            ownerId: accountId,
            scopedId: item,
          },
        });

        if (!menuItem) throw new NotFoundException();
      }

      await this.entityManager
        .createQueryBuilder()
        .insert()
        .into(SquarePosItemLink)
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
    const hasNewPosItems = await this.squareService.hasUnassociatedItems(
      token,
      pos,
      this.entityManager,
    );
    await this.entityManager.update(Account, pos.accountId, { hasNewPosItems });

    return {};
  }

  @Post('associate/new')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  async associateNew(
    @Body() body: { posId: string; name: string },
    @Session() { accountId },
  ) {
    const { posId, name } = body;

    const token = await this.entityManager.findOne(SquareToken, {
      where: {
        accountId,
      },
      relations: ['pos'],
    });

    const menuItem = await this.menuItemsService.create(accountId, { name });

    await this.entityManager.insert(SquarePosItemLink, {
      pos: token.pos,
      idInPos: posId,
      item: menuItem,
    });

    const { pos } = token;
    const hasNewPosItems = await this.squareService.hasUnassociatedItems(
      token,
      pos,
      this.entityManager,
    );
    await this.entityManager.update(Account, pos.accountId, { hasNewPosItems });

    return {};
  }

  @Transactional()
  private async initializeLocation(
    accountId: Account['id'],
    id: string,
    name: string,
    address: string,
    phoneNumber: string,
  ) {
    const manager = Transactional.getManager();

    const token = await manager.findOne(SquareToken, {
      where: {
        accountId,
      },
      relations: ['pos'],
    });

    await this.squareService.subscribeToPaymentUpdates(token.accessToken, id);

    const newPos = new SquarePos({
      accountId,
      squareLocationId: id,
    });

    const existingPos = await manager.findOne(SquarePos, {
      accountId,
      squareLocationId: id,
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
      await manager.insert(SquarePos, newPos);
    }
  }
}
