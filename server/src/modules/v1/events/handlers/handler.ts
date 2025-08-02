import { Event } from '../event.entity';
import { EntityManager } from 'typeorm';

export abstract class Handler {
  public abstract handle(event: Event, manager: EntityManager): Promise<void>;
}
