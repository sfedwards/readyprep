import * as _ from 'lodash';

export function onlyDefined<T extends _.Dictionary<any>>(obj: T): Partial<T> {
  return <Partial<T>>_.omitBy(obj, _.isUndefined);
}

export function omitEmpty<T extends _.Dictionary<any>>(obj: T): Partial<T> {
  return <Partial<T>>(
    _.omitBy(obj, (value) => value === undefined || value === '')
  );
}

export function toStringOrNull(x: any): string | null {
  return x === null || x === undefined ? null : '' + x;
}

export function toNumberOrNull(x: any): number | null {
  return x === null || x === undefined ? null : +x;
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
