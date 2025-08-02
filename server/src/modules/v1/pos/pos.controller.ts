import { Controller, Get, Session, UseGuards } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { Plan } from '../plans/plan.decorator';
import { CloverToken } from './clover/clover-token.entity';
import { SquareToken } from './square/square-token.entity';
import { SquareService } from './square/square.service';

@Controller('pos')
export class PosController {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly squareService: SquareService,
  ) {}

  @Get('/')
  @Plan('PREMIUM')
  @UseGuards(LoggedInGuard)
  async getPosIntegrations(@Session() { accountId }) {
    const integrations: any = {};

    {
      const token = await this.entityManager.findOne(SquareToken, {
        where: { accountId },
      });

      if (token && !token.deletedAt) {
        try {
          await this.squareService.getLocations(token.accessToken);
          integrations.square = {
            status: +token.expiresAt < Date.now() ? 'EXPIRED' : 'ACTIVE',
          };
        } catch {}
      }
    }

    const token = await this.entityManager.findOne(CloverToken, {
      where: { accountId },
    });

    if (token && !token.deletedAt) {
      integrations.clover = {
        status: 'ACTIVE',
      };
    }

    return integrations;
  }
}
