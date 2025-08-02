import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { AppModule, CLIENT_PATH } from './modules/app.module';
import { PollerService } from './modules/v1/events/poller.service';

import passport = require('passport');
import session = require('express-session');
import helmet = require('helmet');
import csurfFactory = require('csurf');
const csurf = csurfFactory();
import bodyParser = require('body-parser');

import path = require('path');

import PgSessionStoreFactory = require('connect-pg-simple');
const PgSessionStore = PgSessionStoreFactory(session);
const useSecureCookie = process.env.NODE_ENV !== 'development';

export const REMEMBER_ME_INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Except to be running behind an ELB in prod
  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  const pgPool = (getConnection().driver as PostgresDriver).master;

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = app.get(ConfigService);

  app.use(
    session({
      secret: config.get('SECRET'),
      name: config.get('session.cookie'),
      cookie: {
        secure: useSecureCookie,
        sameSite: 'lax',
        httpOnly: true,
      },
      store: new PgSessionStore({
        pool: pgPool,
        ttl: REMEMBER_ME_INACTIVITY_TIMEOUT,
        pruneSessionInterval: 60 * 60,
      }),
      resave: false,
      saveUninitialized: false,
      rolling: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const exceptions = [
    '/api/auth/logout',
    '/api/auth/google/login',
    '/api/auth/google/callback',
    '/api/billing/webhook',
  ];
  app.use((req: Request, res: Response, next: () => void) => {
    if (exceptions.includes(req.path)) return next();
    csurf(req, res, () => {
      res.cookie('CSRF', (<any>req).csrfToken(), {
        httpOnly: false,
        secure: useSecureCookie,
        sameSite: true,
      });
      next();
    });
  });

  app.use(
    ['/api/billing/webhook', '/api/square/webhook'],
    bodyParser.raw({ type: '*/*' }),
  );

  app.setGlobalPrefix('api');

  await app.listen(config.get('app').port);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('404', (req: Request, res: Response) => {
    res.status(404);
  });
  expressApp.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(CLIENT_PATH, 'index.html'));
  });

  app.get(PollerService).start();
}

bootstrap();
