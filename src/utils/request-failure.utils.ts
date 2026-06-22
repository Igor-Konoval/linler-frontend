import { ErrorPayload } from '../types/network.types';

export function getReadableErrorMessage(
  errorMessage: string | string[],
): string {
  return Array.isArray(errorMessage)
    ? `${errorMessage[0].slice(0, 1).toUpperCase() + errorMessage[0].slice(1)}`
    : `${errorMessage.slice(0, 1).toUpperCase() + errorMessage.slice(1)}`;
}

export function errorLogging(name: string, error: unknown) {
  if (!isRequestFailure(error)) {
    console.error(`[${name} + UnknownError]`, error);
    return;
  }

  console.error(
    `[${name} + RequestFailure] ${error.message} (${error.statusCode})`,
  );
}

export class RequestFailure extends Error {
  readonly statusCode: ErrorPayload['statusCode'];
  readonly code: ErrorPayload['code'];
  readonly errorMessage: ErrorPayload['errorMessage'];
  readonly fieldErrors?: ErrorPayload['fieldErrors'];

  constructor(payload: ErrorPayload) {
    super(getReadableErrorMessage(payload.errorMessage));
    if (process.env.NODE_ENV === 'development') {
      errorLogging('BaseLogger', payload);
    }
    this.name = 'RequestFailure';

    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.errorMessage = payload.errorMessage;
    this.fieldErrors = payload.fieldErrors;

    Object.setPrototypeOf(this, RequestFailure.prototype);
  }
}

export const isRequestFailure = (value: unknown): value is RequestFailure =>
  value instanceof RequestFailure;
