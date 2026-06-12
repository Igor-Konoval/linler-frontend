import { ErrorCodes, StatusCodes } from '@/src/constants/http.constants';
import { ErrorPayload } from '@/src/types/network.types';
import { RequestFailure } from '@/src/utils/request-failure.utils';

type DefaultErrorPayload = {
  statusCode: StatusCodes;
  error: ErrorCodes;
  message: string | string[];
};

export class RequestErrorHandler {
  createFailure(error: ErrorPayload): RequestFailure {
    return new RequestFailure(error);
  }

  createUnknownFailure(response: Response): RequestFailure {
    return new RequestFailure(this.createUnknownError(response));
  }

  normalize(payload: unknown, response: Response): ErrorPayload {
    if (this.isErrorPayload(payload)) {
      return payload;
    }

    if (this.isDefaultErrorPayload(payload)) {
      return {
        statusCode: payload.statusCode,
        code: payload.error,
        errorMessage: payload.message,
      };
    }

    return this.createUnknownError(response);
  }

  private createUnknownError(response: Response): ErrorPayload {
    return {
      statusCode: response.status as StatusCodes,
      code: ErrorCodes.UnknownError,
      errorMessage: response.statusText || 'Unexpected request error',
    };
  }

  private isErrorPayload(payload: unknown): payload is ErrorPayload {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Partial<ErrorPayload>;

    return (
      typeof candidate.statusCode === 'number' &&
      typeof candidate.code === 'string' &&
      (typeof candidate.errorMessage === 'string' ||
        Array.isArray(candidate.errorMessage))
    );
  }

  private isDefaultErrorPayload(
    payload: unknown,
  ): payload is DefaultErrorPayload {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Partial<DefaultErrorPayload>;

    return (
      typeof candidate.statusCode === 'number' &&
      typeof candidate.error === 'string' &&
      (typeof candidate.message === 'string' ||
        Array.isArray(candidate.message))
    );
  }
}

export const requestErrorHandler = new RequestErrorHandler();
