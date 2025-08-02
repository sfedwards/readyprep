import { partition } from 'lodash';
import { Comparable } from './comparable';

export class WatchedList<T extends Comparable<T>> {
  private items: T[];
  private new: T[];
  private removed: T[];

  constructor(initialItems?: T[]) {
    this.items = initialItems ? initialItems : [];
    this.new = [];
    this.removed = [];
  }

  [Symbol.iterator] = function () {
    return this.items[Symbol.iterator]();
  };

  public getItems(): T[] {
    return this.items;
  }

  public getNewItems(): T[] {
    return this.new;
  }

  public getRemovedItems(): T[] {
    return this.removed;
  }

  public has(a: T): boolean {
    return this.items.some((b) => a.equals(b));
  }

  public add(item: T): void {
    if (this.isRemovedItem(item)) {
      this.removeFromRemoved(item);
    } else if (!this.isNewItem(item)) {
      this.new.push(item);
    }

    this.items.push(item);
  }

  public remove(item: T): void {
    this.removeFromCurrent(item);

    if (this.isNewItem(item)) {
      this.removeFromNew(item);
      return;
    }

    if (!this.isRemovedItem(item)) {
      this.removed.push(item);
    }
  }

  private isNewItem(item: T): boolean {
    return this.new.some((v: T) => item.equals(v));
  }

  private isRemovedItem(item: T): boolean {
    return this.removed.some((v: T) => item.equals(v));
  }

  private removeFromNew(item: T) {
    this.new = this.new.filter((b) => !item.equals(b));
  }

  private removeFromRemoved(item: T) {
    this.removed = this.removed.filter((b) => !item.equals(b));
  }

  private removeFromCurrent(a: T): void {
    const [toRemove, toKeep] = partition(this.items, (b: T) => a.equals(b));
    this.items = toKeep;
    this.removed = this.removed.concat(toRemove);
  }
}
