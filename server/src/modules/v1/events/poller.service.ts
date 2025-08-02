import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Event } from './event.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, IsNull } from 'typeorm';
import { delay } from '../../../util/Util';
import { SquareHandler } from './handlers/square';
import { Handler } from './handlers/handler';
import { DailyPrepReportHandler } from './handlers/daily-prep-report';
import { JobHandler } from './handlers/job';
import { CloverHandler } from './handlers/clover';
import { Transactional } from '@modules/infra/database/transactional.decorator';
import util = require('util');

@Injectable()
export class PollerService implements OnModuleDestroy {
  private handlers: Handler[];

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly dailyPrepReportHandler: DailyPrepReportHandler,
    private readonly jobHandler: JobHandler,
    private readonly squareHandler: SquareHandler,
    private readonly cloverHandler: CloverHandler,
  ) {
    this.handlers = [
      dailyPrepReportHandler,
      jobHandler,
      squareHandler,
      cloverHandler,
    ];
  }

  private polling = false;

  async start() {
    if (this.polling) return;

    this.polling = true;
    //this.poll();
  }

  async stop() {
    this.polling = false;
  }

  @Transactional()
  async poll() {
    const manager = Transactional.getManager();

    let eventId;

    try {
      const event = await manager.getRepository(Event).findOne({
        where: {
          time: LessThanOrEqual(new Date().toISOString()),
          processedAt: IsNull(),
        },
        order: {
          time: 'ASC',
        },
        lock: {
          mode: 'pessimistic_partial_write',
        },
      });

      if (!event) {
        await delay(1000);
        return;
      }

      eventId = event.id;

      event.processedAt = new Date();

      await manager.save(event);

      await Promise.all(
        this.handlers.map((handler) => handler.handle(event, manager)),
      );
    } catch (err) {
      console.error(util.inspect(err, null, 20));
      await this.entityManager.update(Event, eventId, {
        processedAt: new Date(),
        error: err.message,
      });
    }

    if (this.polling) this.poll();
  }

  onModuleDestroy() {
    this.stop();
  }
}
