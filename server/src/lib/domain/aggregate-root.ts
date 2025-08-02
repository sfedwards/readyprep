import { Entity } from './entity';
import { EntityId } from './entity-id';
import { DomainEvent } from './event.interface';

export abstract class AggregateRoot<T extends EntityId> extends Entity<T> {
  private readonly _domainEvents: DomainEvent[] = [];
}
