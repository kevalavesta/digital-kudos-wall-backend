export class Result<T, E = string> {
  private readonly _value: T | null;
  private readonly _error: E | null;
  private readonly _isSuccess: boolean;

  private constructor(
    isSuccess: boolean,
    error: E | null = null,
    value: T | null = null,
  ) {
    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (!this._isSuccess || this._value === null) {
      throw new Error("Can't get the value of an error result");
    }
    return this._value;
  }

  public error(): E {
    if (this._isSuccess || this._error === null) {
      throw new Error("Can't get the error of a success result");
    }
    return this._error;
  }

  public static ok<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, null, value);
  }

  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, error, null);
  }
}
