export interface Repository<T> {
  load: (id: string) => Promise<T>;
  save: (aggregate: T) => Promise<void>;
  create: (aggregate: T) => Promise<T>;
  delete: (id: string) => Promise<void>;
}
