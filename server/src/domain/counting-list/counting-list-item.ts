export class CountingListItem {
  private constructor(
    public readonly ingredientId: string,
    public readonly unitId: string,
  ) {}

  public static from({
    ingredientId,
    unitId,
  }: {
    ingredientId: string;
    unitId: string;
  }): CountingListItem {
    return new CountingListItem(ingredientId, unitId);
  }

  public equals(item: CountingListItem): boolean {
    return this.ingredientId === item.ingredientId;
  }
}
