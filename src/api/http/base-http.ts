import { ErrorCodes, StatusCodes } from '@/src/constants/http.constants';

import { AuthAdapter } from '@/src/types/adapter.types';

import {
  ApiResponse,
  RequestSettings,
  ResponseType,
} from '@/src/types/network.types';

import { clientEnv } from '@/src/env/client';
import { RequestFailure } from '@/src/utils/request-failure.utils';
import { RequestErrorHandler } from './http-error-handler';

export class BaseHttpClient {
  constructor(
    protected readonly authAdapter: AuthAdapter,
    protected readonly apiUrl: string = clientEnv.NEXT_PUBLIC_API_URL!,
    protected readonly errorHandler: RequestErrorHandler = new RequestErrorHandler(),
  ) {}

  async request<TResult, TBody = undefined>(
    settings: RequestSettings<TBody>,
  ): Promise<TResult> {
    const response = await this.sendRequest(settings);

    if (
      response.status === StatusCodes.Unauthorized &&
      settings.retryOnUnauthorized &&
      this.authAdapter.supportsRefresh
    ) {
      const retryResult = await this.refreshAndRetry<TResult, TBody>(settings);

      if (retryResult !== null) {
        return retryResult;
      }
    }

    const result = await this.parseResponse<TResult>(
      response,
      settings.responseType,
    );

    if (!result.success) {
      if (result.error) {
        throw this.errorHandler.createFailure(result.error);
      }

      throw this.errorHandler.createUnknownFailure(response);
    }

    return result.data as TResult;
  }

  protected async refreshAndRetry<TResult, TBody>(
    settings: RequestSettings<TBody>,
  ): Promise<TResult | null> {
    const refreshed = await this.authAdapter.refreshToken();

    if (!refreshed) {
      throw new RequestFailure({
        statusCode: StatusCodes.Unauthorized,
        code: ErrorCodes.Unauthorized,
        errorMessage: 'Unauthorized',
      });
    }

    const retryResponse = await this.sendRequest({
      ...settings,
      retryOnUnauthorized: false,
    });

    const retryResult = await this.parseResponse<TResult>(
      retryResponse,
      settings.responseType,
    );

    if (!retryResult.success) {
      if (retryResult.error) {
        throw this.errorHandler.createFailure(retryResult.error);
      }

      throw this.errorHandler.createUnknownFailure(retryResponse);
    }

    return retryResult.data as TResult;
  }

  protected async sendRequest<TBody>(
    settings: RequestSettings<TBody>,
  ): Promise<Response> {
    const headers = await this.createHeaders(settings);

    const isFormData =
      typeof FormData !== 'undefined' && settings.body instanceof FormData;

    const body = this.createRequestBody(settings.body, isFormData);

    if (settings.body !== undefined && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(`${settings.url ?? this.apiUrl}${settings.endpoint}`, {
      method: settings.method,
      headers,
      body,
      credentials: 'include',
    });
  }

  protected async createHeaders<TBody>(
    settings: RequestSettings<TBody>,
  ): Promise<Headers> {
    const headers = new Headers(settings.headers);

    const cookieHeader = await this.authAdapter.getCookieHeader();

    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    return headers;
  }

  protected createRequestBody<TBody>(
    body: TBody | undefined,
    isFormData: boolean,
  ): BodyInit | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }

    if (isFormData) {
      return body as BodyInit;
    }

    return JSON.stringify(body);
  }

  protected async parseResponse<TResult>(
    response: Response,
    responseType: ResponseType = 'auto',
  ): Promise<ApiResponse<TResult>> {
    if (response.status === StatusCodes.NoContent) {
      return {
        success: true,
        data: undefined as TResult,
        httpStatus: StatusCodes.NoContent,
      };
    }

    const payload = await this.getResponsePayload(response, responseType);

    if (response.ok) {
      return {
        success: true,
        data: payload as TResult,
        httpStatus: response.status as StatusCodes,
      };
    }

    return {
      success: false,
      error: this.errorHandler.normalize(payload, response),
      httpStatus: response.status as StatusCodes,
    };
  }

  protected async getResponsePayload(
    response: Response,
    responseType: ResponseType = 'auto',
  ): Promise<unknown> {
    if (responseType === 'blob') {
      return response.blob();
    }

    if (responseType === 'text') {
      return response.text().catch(() => '');
    }

    if (responseType === 'json') {
      return response.json().catch(() => ({}));
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (isJson) {
      return response.json().catch(() => ({}));
    }

    const text = await response.text().catch(() => '');

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
