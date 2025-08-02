export class CountDate {
  private constructor(public readonly value: Date) {}

  public static from(value: string) {
    if (!/\d{4}-\d\d-\d\d/.test(value))
      throw new Error('CountDate must be in the form 2020-02-20');
    const date = new Date(value);
    return new CountDate(date);
  }

  public valueOf() {
    return this.toString();
  }

  public toString() {
    return this.value.toISOString().slice(0, 10);
  }
}
