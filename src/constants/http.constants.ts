export enum StatusCodes {
  Success = 200,
  Created = 201,
  NoContent = 204,

  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  TooManyRequests = 429,
  TooLarge = 413,
  UnprocessableEntity = 422,

  InternalServerError = 500,
  ServiceUnavailable = 503,
}

export enum ErrorCodes {
  ValidationError = 'VALIDATION_ERROR',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  TokenExpired = 'TOKEN_EXPIRED',
  UnknownError = 'UNKNOWN_ERROR',
  Unauthorized = 'UNAUTHORIZED',
}
