import { Injectable } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';

export enum EmailTemplate {
  CONFIRM_EMAIL_CHANGE = 'd-821bc27c2a7349a9a278f4e00b4146e8',
  DAILY_PREP = 'd-3e92433a62ae4f14a2de27fc61937d9c',
  EMAIL_CONFIRMATION = 'd-011ef725d0a644cd94b86f14beed3d77',
  PASSWORD_RESET = 'd-db270b1f553c4238a4e3e8d40799b3a8',
  WELCOME = 'd-324252a90358443fb3e64917263feb3f',
  PURCHASE_ORDER = 'd-c2621da8e49843e8b3310ba5c948afb4',
  ORDER_UNOPENED_NOTIFICATION = 'd-3c9434e804d440209af3b9c1f04aba9f',
}

export type EmailTemplateData = {
  [EmailTemplate.EMAIL_CONFIRMATION]: {
    name: string;
    link: string;
  };
  [EmailTemplate.DAILY_PREP]: {
    name: string;
    link: string;
    prepItems: {
      name: string;
      inventory: number;
      batchSize: number;
      batchUnit: string;
      suggestedPrep: {
        amount: number;
        batches: number;
      };
    }[];
  };
  [EmailTemplate.WELCOME]: {
    name: string;
    link: string;
  };
  [EmailTemplate.PASSWORD_RESET]: {
    name: string;
    link: string;
  };
  [EmailTemplate.CONFIRM_EMAIL_CHANGE]: {
    name: string;
    link: string;
  };
  [EmailTemplate.PURCHASE_ORDER]: {
    orderNumber: string;
    link: string;
    restaurantName: string;
  };
  [EmailTemplate.ORDER_UNOPENED_NOTIFICATION]: {
    orderNumber: string;
  };
};

type EmailTemplateName = keyof EmailTemplateData;

@Injectable()
export class EmailsService {
  constructor(private readonly mailer: MailService) {}

  async send<T extends EmailTemplateName>(
    template: EmailTemplateName,
    to: string,
    data: EmailTemplateData[T],
    options?: Partial<MailDataRequired>,
  ): Promise<void> {
    await this.mailer.send({
      templateId: template,
      from: 'ReadyPrep <noreply@readyprep.io>',
      personalizations: [
        {
          to,
          dynamicTemplateData: data,
        },
      ],
      ...options,
    });
  }
}
