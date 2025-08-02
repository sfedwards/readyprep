import {
  Controller,
  Get,
  UseGuards,
  Session,
  Patch,
  Body,
  UnauthorizedException,
  Param,
  Redirect,
  ForbiddenException,
  Delete,
  Request,
  Response,
  Inject,
} from '@nestjs/common';
import { LoggedInGuard } from '../auth/logged-in.guard';
import { UsersService } from './users.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileRequest } from './DTO/profile.update.dto';
import { PasswordHashService } from '../auth/password-hash/password-hash.service';
import { JwtService, JWT_TYPES } from '../jwt/jwt.service';
import { ConfigService } from '@nestjs/config';
import { EmailsService, EmailTemplate } from '../emails/emails.service';
import { Menu } from '../menus/menu.entity';
import { MenuItem } from '../menu-items/menu-item.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { Account } from '../accounts/account.entity';
import { LocationModel } from '../../app/locations/infra/models/location.model';

@Controller('')
export class UsersController {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly passwordHashService: PasswordHashService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
    @Inject('Stripe') private readonly stripe,
  ) {}

  @Get('/profile')
  @UseGuards(LoggedInGuard)
  async getProfile(@Session() { userId }) {
    return await this.entityManager.transaction(async (manager) => {
      const [user] = await manager.find(User, {
        where: { id: userId },
        relations: ['account', 'account.locations'],
      });

      const { account } = user;
      let location: { id: string; name: string } = undefined;

      if (account.locations?.[0]) {
        location = {
          id: account.locations?.[0].id,
          name: account.locations?.[0].name,
        };
      }

      const {
        account: { plan, planState, trialEnd, isInSandboxMode },
        id,
        name,
        email,
        passwordHash,
        photoUrl,
      } = user;

      return {
        id,
        name,
        email,
        hasPassword: !!passwordHash,
        hasNewPosItems: !!account.hasNewPosItems,
        isInSandboxMode,
        photoUrl,
        location,
        plan: {
          plan,
          state: planState,
          trialEnd,
        },
      };
    });
  }

  @Get('/profile/email/:token')
  @Redirect('/settings?emailChanged')
  async confirmEmailChange(@Param('token') token): Promise<void> {
    try {
      const data: any = this.jwtService.verify(token, JWT_TYPES.EMAIL_CHANGE);
      const user = await this.entityManager.findOne(User, { id: data.userId });

      if (user.email !== data.currentEmail) throw new Error('Invalid token');

      if (await this.entityManager.findOne(User, { email: data.newEmail }))
        throw new Error('Invalid token');

      user.email = data.newEmail;

      await this.entityManager.save(user);
    } catch (err) {
      throw new ForbiddenException('Token is no longer valid');
    }
  }

  @Patch('/profile')
  @UseGuards(LoggedInGuard)
  async updateProfile(
    @Body() body: UpdateProfileRequest,
    @Session() { userId },
  ): Promise<boolean> {
    const { name, currentPassword, email, password } = body;

    const user = await this.entityManager.findOne(User, { id: userId });

    if (currentPassword || email || password) {
      if (
        !user ||
        !currentPassword ||
        !(await this.passwordHashService.verify(
          user.passwordHash,
          currentPassword,
        ))
      )
        throw new UnauthorizedException();
    }

    if (name) user.name = name;

    await this.entityManager.save(user);

    if (password) await this.usersService.setPassword(user.email, password);

    if (email && email != user.email) {
      const token = this.jwtService.create(
        {
          type: JWT_TYPES.EMAIL_CHANGE,
          userId: user.id,
          currentEmail: user.email,
          newEmail: email,
        },
        '2 hours',
      );
      const link = `${this.configService.get(
        'app.baseUrl',
      )}/api/profile/email/${token}`;
      const data = { name: user.name, link };
      await this.emailsService.send(
        EmailTemplate.CONFIRM_EMAIL_CHANGE,
        email,
        data,
      );
    }

    return true;
  }

  @Delete('/profile')
  @UseGuards(LoggedInGuard)
  async deleteAccount(
    @Request() req,
    @Response() res,
    @Body() body: { confirmation: string },
    @Session() { accountId, userId },
  ): Promise<boolean> {
    const { confirmation } = body;
    if (confirmation !== 'delete') return false;

    const ownerId = accountId;

    const manager = this.entityManager;
    await manager.transaction(
      'REPEATABLE READ',
      async (manager: EntityManager) => {
        await manager.delete(User, { id: userId });
        await manager.delete(LocationModel, { accountId });

        await manager
          .createQueryBuilder()
          .delete()
          .from(Menu)
          .where({ ownerId })
          .execute();
        await manager.delete(MenuItem, { ownerId });
        await manager.delete(Ingredient, { ownerId });
      },
    );

    await require('util').promisify(req.session.destroy.bind(req.session))();
    res.clearCookie(this.configService.get('session.cookie')).send('{}');

    try {
      const account = await this.entityManager.findOne(Account, {
        where: { id: ownerId },
        select: ['stripeCustomerId'],
      });
      if (account.stripeCustomerId) {
        await this.stripe.customers.del(account.stripeCustomerId);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
