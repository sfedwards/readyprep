import { Injectable } from '@nestjs/common';
import * as parser from 'cron-parser';
import { Account } from '@modules/v1/accounts/account.entity';
import { JobName } from '@modules/v1/jobs/enum/JobName';
import { JobSchedule } from '@modules/v1/jobs/job-schedule.entity';
import { EntityManager } from 'typeorm';

import { Event, EventType } from '../event.entity';
import { Handler } from './handler';

@Injectable()
export class JobHandler extends Handler {
  constructor() {
    super();
  }

  async handle(event: Event, manager: EntityManager) {
    switch (event.type) {
      case EventType.JOB:
        await this.handleJob(event, manager);
        break;
    }
  }

  async handleJob(event: Event, manager: EntityManager) {
    const { data } = event;

    const { name } = data;

    const schedule = await manager.getRepository(JobSchedule).findOne({ name });

    // If job is to send out prep logs, then insert a row for each user to generate theirs
    switch (name) {
      case JobName.DAILY_PREP_EMAIL_ALL_LOCATIONS:
        const allAccounts = await manager.find(Account, {
          relations: ['locations'],
        });

        const events = allAccounts.flatMap((account) =>
          (account.locations ?? []).map((location) => {
            return <Partial<Event>>{
              type: EventType.DAILY_PREP_EMAIL,
              data: {
                locationId: location.id,
              },
            };
          }),
        );

        if (events.length === 0) break;

        await manager
          .createQueryBuilder()
          .insert()
          .into(Event)
          .values(events)
          .execute();
        break;
      default:
        console.error('Unkown Job: ' + name);
    }

    schedule.lastRanAt = new Date();
    schedule.nextRunAt = parser
      .parseExpression(schedule.schedule, {
        currentDate: schedule.nextRunAt,
      })
      .next()
      .toDate();

    await manager.save(schedule);
    await manager.insert(Event, {
      type: EventType.JOB,
      data,
      time: schedule.nextRunAt,
    });
  }
}
