import { Injectable } from '@nestjs/common';
import {
  EmailTemplate,
  EmailsService,
} from '@modules/v1/emails/emails.service';
import { InventoryService } from '@modules/v1/inventory/inventory.service';
import { LocationModel } from '@modules/app/locations/infra/models/location.model';
import { PrepService } from '@modules/v1/prep/prep.service';
import { EntityManager } from 'typeorm';

import { Event, EventType } from '../event.entity';
import { Handler } from './handler';

@Injectable()
export class DailyPrepReportHandler extends Handler {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly inventoryService: InventoryService,
    private readonly prepService: PrepService,
  ) {
    super();
  }

  async handle(event: Event, manager: EntityManager) {
    switch (event.type) {
      case EventType.DAILY_PREP_EMAIL:
        await this.handleDailyPrepEmail(event, manager);
        break;
    }
  }

  async handleDailyPrepEmail(event: Event, manager: EntityManager) {
    const { data } = event;
    const { locationId } = data;
    const location = await manager.findOne(LocationModel, locationId, {
      relations: ['account', 'account.users'],
      withDeleted: true,
    });

    const account = location.account;

    const date = new Date().toISOString().slice(0, 10);
    const [prep] = await this.prepService.getPrepForDate(
      location,
      new Date(date),
    );

    await Promise.all(
      account.users.map(async (user) => {
        await this.emailsService.send(EmailTemplate.DAILY_PREP, user.email, {
          name: user.name.split(/\s+/)[0],
          link: `${process.env.BASE_URL}/prep/log/${new Date(date)
            .toISOString()
            .slice(0, 10)}`,
          prepItems: (
            await Promise.all(
              prep.items
                .filter((item) => item.actualPrep.value > 0)
                .map(async (item) => {
                  const { prepIngredient } = item;
                  const { recipe } = prepIngredient;
                  const { batchSize, batchUnit } = recipe;

                  const inventory = await this.inventoryService.getInventory(
                    location,
                    prepIngredient,
                    new Date(date),
                  );
                  return {
                    name: prepIngredient.name,
                    inventory: +inventory.toFixed(2),
                    batchSize: +batchSize,
                    batchUnit: batchUnit.symbol,
                    suggestedPrep: {
                      amount: +(+item.actualPrep.value).toFixed(2),
                      batches:
                        Math.round((+item.actualPrep.value / +batchSize) * 2) /
                        2,
                    },
                  };
                }),
            )
          ).sort((a, b) => a.name.localeCompare(b.name)),
        });
      }),
    );
  }
}
