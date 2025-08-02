import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '../users/user.entity';
import { Reflector } from '@nestjs/core';
import { Plans } from './enum/plans.enum';
import { Account } from '../accounts/account.entity';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  public async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const userId = req.session?.userId;

    const requiredPlan = this.reflector.get<Account['plan']>(
      'plan',
      context.getHandler(),
    );
    if (!requiredPlan) return true;

    if (requiredPlan && !Plans[requiredPlan])
      throw new Error('Bad Plan Guard. No plan matching: ' + requiredPlan);

    const upgradeRequiredErrorObject = {
      message: 'PLAN_UPGRADE_REQUIRED',
      plan: requiredPlan,
    };

    if (!userId) throw new BadRequestException(upgradeRequiredErrorObject);

    const { account } = await this.entityManager.findOne(User, userId, {
      relations: ['account'],
    });

    if (Plans[requiredPlan] > Plans[account.plan]) {
      throw new BadRequestException(upgradeRequiredErrorObject);
    }

    if (account.planState !== 'active' && account.planState !== 'trialing') {
      throw new BadRequestException(upgradeRequiredErrorObject);
    }

    return true;
  }
}
