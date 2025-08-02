import {
  Injectable,
  UnprocessableEntityException,
  Inject,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

import { User } from './user.entity';
import { PasswordHashService } from '../auth/password-hash/password-hash.service';
import { TransactionManagerService } from '../transaction-manager/transaction-manager.service';
import { Account } from '../accounts/account.entity';
import { BillingService } from '../billing/billing.service';
import { Role, RoleType } from './role.entity';
import { EmailsService, EmailTemplate } from '../emails/emails.service';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PLAN } from '../plans/plans.service';
import { SandboxService } from '../sandbox/sandbox.service';
import { LocationsService } from '@modules/app/locations/locations.service';
import { PopulateCountingListsJob } from '@modules/app/counting-lists/jobs/populate-counting-lists/populate-counting-lists.job';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import Segment = require('analytics-node');

export interface CreateUserOptions {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly passwordHashService: PasswordHashService,
    private readonly billingService: BillingService,
    @Inject('Stripe') private readonly stripe,
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
    private readonly sandboxService: SandboxService,
    private readonly segment: Segment,
  ) {}

  @Transactional()
  async findOrCreate(options: CreateUserOptions): Promise<User> {
    const { email, name, googleId, password } = options;

    const manager = Transactional.getManager();
    let user = await this.findOneByEmail(email, manager);

    if (!user) {
      user = await this.create({ email, password, googleId, name }, manager);

      const link = `${this.configService.get('app.baseUrl')}/faq`;
      const data = { name: name.slice(name.trim().indexOf(' ') + 1), link };
      await this.emailsService.send(EmailTemplate.WELCOME, email, data);

      const names = user.name.trim().split(/\s+/g);

      const firstName = names[0];
      const lastName = names[names.length - 1];

      this.segment.identify({
        userId: user.id,
        traits: {
          email: user.email,
          firstName,
          lastName,
          createdAt: user.createdAt.toISOString(),
          accountId: user.accountId,
        },
      });

      // Track sign up
      this.segment.track({
        userId: user.id,
        event: 'Signed Up',
      });
    }

    await this.billingService.getStripeCustomer(user);

    return user;
  }

  async create(
    options: CreateUserOptions,
    manager: EntityManager = this.entityManager,
  ): Promise<User> {
    const { email, password, googleId, name } = options;

    const user = new User();
    user.account = new Account({
      plan: DEFAULT_PLAN,
      planState: 'trialing',
      isInSandboxMode: true,
    });
    user.email = email;
    user.name = name;
    user.googleId = googleId;

    const role = await manager.findOne(Role, { type: RoleType.ACCOUNT_OWNER });
    user.roles = [role];

    if (password) {
      const passwordHash = await this.passwordHashService.hash(password);
      user.passwordHash = passwordHash;
    }

    await this.transactionManagerService.ensureTransactional(
      manager,
      async (manager) => {
        const existingUser = await this.findOneByEmail(email, manager);
        if (existingUser) throw new UnprocessableEntityException();

        await manager.getRepository(Account).save(user.account);
        await manager.getRepository(User).save(user);
      },
    );

    try {
      await this.transactionManagerService.ensureTransactional(
        manager,
        async (manager) => {
          await this.sandboxService.createSandboxData(user.accountId, manager);
        },
      );
    } catch (err) {
      console.error('Failed to insert sandbox data');
      console.error(err.message);
      console.error(err);
    }

    return user;
  }

  async setPassword(
    email,
    newPassword,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    const passwordHash = await this.passwordHashService.hash(newPassword);
    await this.update(email, { passwordHash }, manager);
  }

  async update(
    email,
    values: Partial<User>,
    manager: EntityManager = this.entityManager,
  ): Promise<void> {
    await manager.update(User, { email }, values);
  }

  async findOneByEmail(
    email: string,
    manager: EntityManager = this.entityManager,
  ): Promise<User> {
    return await manager.getRepository(User).findOne({ email });
  }
}
