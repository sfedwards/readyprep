export class Result<T = unknown> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;

  private constructor(
    success: boolean,
    private readonly value: T | null,
    private readonly error?: string,
  ) {
    this.isSuccess = !!success;
    this.isFailure = !success;
  }

  public getValue(): T {
    if (this.isFailure) {
      console.log(new Error(this.error));
      throw new Error(`Can't get value from failed result`);
    }
    return this.value!;
  }

  public getError(): string {
    if (this.isSuccess)
      throw new Error(`Can't get error from successful result`);
    return this.error!;
  }

  public static ok<T>(value?: T): Result<T> {
    return new Result(true, value ?? null);
  }

  public static fail<T>(msgOrResult: string | Result<any>): Result<T> {
    if (typeof msgOrResult === 'string')
      return new Result<T>(false, null, msgOrResult);
    if (msgOrResult.isSuccess)
      throw new Error(`Can't use successful result as failure reason`);
    return Result.fail(msgOrResult.getError());
  }

  public static all<T extends Result<any>[]>(
    ...results: [...T]
  ): Result<{ [K in keyof T]: T[K] extends Result<infer I> ? I : never }> {
    for (const result of results) if (result.isFailure) return result;
    return Result.ok(results.map((result) => result.getValue())) as Result<
      { [K in keyof T]: T[K] extends Result<infer I> ? I : never }
    >;
  }
}

export type AsyncResult<T> = Promise<Result<T>>;
