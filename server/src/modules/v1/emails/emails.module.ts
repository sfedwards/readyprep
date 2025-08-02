import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
import { MailConfig } from 'config/mailer.config';

import { EmailsService } from './emails.service';

import mail = require('@sendgrid/mail');

@Module({
  providers: [
    EmailsService,
    {
      provide: MailService,
      useFactory: (config: ConfigService) => {
        const { apiKey } = config.get<MailConfig>('mailer');
        mail.setApiKey(apiKey);
        return mail;
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailsService],
})
export class EmailsModule {}
