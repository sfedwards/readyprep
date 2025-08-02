export class IngredientScopedId extends Number {
  private __nominal: void;

  private constructor(...args: any[]) {
    super(...args);
  }

  public static from(id: number): IngredientScopedId {
    return new IngredientScopedId(id);
  }
}
