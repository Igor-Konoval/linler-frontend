'use server';
import { PagesService } from '@/src/api/services/server/pages.service';
import {
  ERROR_MESSAGES,
  ErrorCodes,
  StatusCodes,
} from '@/src/constants/http.constants';
import { ActionResult } from '@/src/types/network.types';
import type {
  CreateProjectPageRequest,
  PageResponse,
} from '@/src/types/pages.types';
import { isRequestFailure } from '@/src/utils/request-failure.utils';

export async function createProjectPageAction(
  projectId: string,
  request: CreateProjectPageRequest,
): Promise<ActionResult<PageResponse>> {
  try {
    const data = await PagesService.createProjectPage(projectId, request);

    return { success: true, data };
  } catch (error) {
    if (isRequestFailure(error)) {
      return {
        success: false,
        error: {
          statusCode: error.statusCode,
          code: error.code,
          errorMessage: error.errorMessage,
          fieldErrors: error.fieldErrors,
        },
      };
    }

    return {
      success: false,
      error: {
        statusCode: StatusCodes.InternalServerError,
        code: ErrorCodes.UnknownError,
        errorMessage: ERROR_MESSAGES.UnexpectedRequestError,
      },
    };
  }
}
