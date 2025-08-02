import { v4 as uuid } from 'uuid';

export class EntityId {
  public constructor(private readonly id?: string) {
    this.id = id ?? uuid();
  }

  static new<T extends EntityId>(this: { new (id: string): T }): T {
    return new this(uuid());
  }

  static from<T extends EntityId>(
    this: { new (id: string): T },
    id: string,
  ): T {
    return new this(id);
  }

  toValue(): string {
    return this.toString();
  }

  toString(): string {
    return this.id;
  }
}
