import { ErrorCodes, StatusCodes } from '../constants/http.constants';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestSettings<TBody = BodyInit | null | undefined> {
  endpoint: string;
  url?: string;
  method: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  authorized?: boolean;
  retryOnUnauthorized?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorPayload;
  httpStatus: StatusCodes;
}

export interface ErrorPayload {
  statusCode: StatusCodes;
  code: ErrorCodes;
  errorMessage: string | string[];
}
