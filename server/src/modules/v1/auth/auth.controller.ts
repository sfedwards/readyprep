import {
  Controller,
  Post,
  UseGuards,
  Request,
  Response,
  Body,
  Param,
  Get,
  Redirect,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Register } from './DTO/register.dto';
import { EmailsService, EmailTemplate } from '../emails/emails.service';
import { JwtService, JWT_TYPES } from '../jwt/jwt.service';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetRequest } from './DTO/password-reset.dto';
import { ConfirmPasswordResetRequest } from './DTO/confirm-password-reset.dto';
import { UsersService } from '../users/users.service';
import { REMEMBER_ME_INACTIVITY_TIMEOUT } from 'main';
import { SessionData } from './interface/session-data.interface';
import Segment = require('analytics-node');

@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly segment: Segment,
  ) {}

  @Post('/register')
  async register(@Body() body: Register): Promise<boolean> {
    const { name, email, password } = body;
    const token = this.jwtService.create({
      type: JWT_TYPES.REGISTER,
      name,
      email,
      password,
    });
    const link = `${this.configService.get(
      'app.baseUrl',
    )}/api/auth/confirm/${token}`;
    const data = { name, link };
    await this.emailsService.send(
      EmailTemplate.EMAIL_CONFIRMATION,
      email,
      data,
    );
    return true;
  }

  @Get('/confirm/:token')
  @Redirect('/getting-started')
  async confirm(@Request() req, @Param('token') token): Promise<void> {
    try {
      const data = <Register>this.jwtService.verify(token, JWT_TYPES.REGISTER);
      req.user = await this.authService.completeRegistration(data);
      await this.initializeSession(req);
    } catch (err) {
      // TODO: Handle already registered and direct user to forgot password flow
    }
  }

  @Post('/password-reset')
  async passwordReset(@Body() body: PasswordResetRequest): Promise<boolean> {
    const { email } = body;

    const user = await this.usersService.findOneByEmail(email);

    // Be sure to return the same response whether the account exists or not
    if (!user) return true;

    const token = this.jwtService.create(
      { type: JWT_TYPES.PASSWORD_RESET, email, currentHash: user.passwordHash },
      '2 hours',
    );
    const link = `${this.configService.get(
      'app.baseUrl',
    )}/password/reset/${token}`;
    const data = {
      name: user.name,
      link,
    };

    await this.emailsService.send(EmailTemplate.PASSWORD_RESET, email, data);

    return true;
  }

  @Post('/password-reset/confirm')
  async confirmPasswordReset(
    @Body() body: ConfirmPasswordResetRequest,
  ): Promise<boolean> {
    const { token, password } = body;

    try {
      const data: any = this.jwtService.verify(token, JWT_TYPES.PASSWORD_RESET);
      const user = await this.usersService.findOneByEmail(data.email);

      if (data.currentHash !== user.passwordHash)
        throw new Error('Invalid token');

      await this.usersService.setPassword(data.email, password);
    } catch (err) {
      throw new ForbiddenException('Token is no longer valid');
    }

    return true;
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async localLogin(@Request() req, @Response() res): Promise<void> {
    await this.initializeSession(req);
    if (req.body.rememberMe)
      req.session.cookie.maxAge = REMEMBER_ME_INACTIVITY_TIMEOUT;
    res.send('{}');
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/login')
  googleLogin(): void {
    //
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @Redirect('/items')
  async googleLoginCallback(@Request() req): Promise<void> {
    await this.initializeSession(req);
  }

  @Get('logout')
  async logout(@Request() req, @Response() res): Promise<void> {
    await require('util').promisify(req.session.destroy.bind(req.session))();
    res.clearCookie(this.configService.get('session.cookie')).send('{}');
  }

  private async initializeSession(req): Promise<void> {
    await require('util').promisify(req.session.regenerate.bind(req.session))();

    const sessionData: SessionData = {
      userId: req.user.id,
      accountId: req.user.accountId,
      locationId: req.user.account.locations?.[0]?.id,
    };

    Object.assign(req.session, sessionData);

    this.segment.track({
      userId: req.user.id,
      event: 'Signed In',
    });
  }
}
