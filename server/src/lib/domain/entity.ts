import { EntityId } from './entity-id';

export abstract class Entity<T extends EntityId> {
  constructor(private readonly id?: T) {}

  public getId(): T {
    return this.id;
  }
}
