import { ErrorPayload } from '../types/network.types';

function getReadableErrorMessage(errorMessage: string | string[]): string {
  return Array.isArray(errorMessage) ? errorMessage[0] : errorMessage;
}

export function errorLogging(name: string, error: unknown) {
  if (!isRequestFailure(error)) {
    console.error(`[${name} + UnknownError]`, error);
  } else {
    console.error(
      `[${name} + RequestFailure] ${error.message} (${error.statusCode})`,
    );
  }
}

export class RequestFailure extends Error {
  readonly statusCode: ErrorPayload['statusCode'];
  readonly code: ErrorPayload['code'];
  readonly errorMessage: ErrorPayload['errorMessage'];

  constructor(payload: ErrorPayload) {
    super(getReadableErrorMessage(payload.errorMessage));

    this.name = 'RequestFailure';

    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.errorMessage = payload.errorMessage;

    Object.setPrototypeOf(this, RequestFailure.prototype);
  }
}

export const isRequestFailure = (value: unknown): value is RequestFailure =>
  value instanceof RequestFailure;
