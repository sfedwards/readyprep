export class CountItem {
  private constructor(
    public readonly ingredientId: string,
    public readonly theoreticalQuantity: number,
    public readonly actualQuantity: number,
  ) {}

  public static from({
    ingredientId,
    theoreticalQuantity,
    actualQuantity,
  }: {
    ingredientId: string;
    theoreticalQuantity: number;
    actualQuantity: number;
  }) {
    return new CountItem(ingredientId, theoreticalQuantity, actualQuantity);
  }

  public equals(item: CountItem) {
    return (
      this.ingredientId === item.ingredientId &&
      this.theoreticalQuantity === item.theoreticalQuantity &&
      this.actualQuantity === item.actualQuantity
    );
  }
}
