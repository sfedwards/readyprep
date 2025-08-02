import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Register } from './DTO/register.dto';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '../users/user.entity';
import { BillingService } from '../billing/billing.service';
import { Transactional } from '@modules/infra/database/transactional.decorator';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly billingService: BillingService,
  ) {}

  @Transactional()
  async completeRegistration(data: Register): Promise<User> {
    const { email, password, name } = data;
    return await this.usersService.findOrCreate({ email, password, name });
  }
}
