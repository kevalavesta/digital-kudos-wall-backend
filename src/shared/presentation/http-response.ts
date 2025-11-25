export class HttpResponse<T = any> {
  constructor(
    public readonly statusCode: number,
    public readonly body: T,
  ) {}

  static ok<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(200, data);
  }

  static created<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(201, data);
  }

  static badRequest<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(400, data);
  }

  static unauthorized<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(401, data);
  }

  static forbidden<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(403, data);
  }

  static notFound<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(404, data);
  }

  static serverError<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(500, data);
  }

  static conflict<T>(data: T): HttpResponse<T> {
    return new HttpResponse<T>(409, data);
  }
}
