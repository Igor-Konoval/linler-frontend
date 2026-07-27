'use server';
import type {
  EditProjectRequest,
  ProjectResponse,
} from '@/src/types/projects.types';
import { ActionResult } from '@/src/types/network.types';
import { ProjectsService } from '@/src/api/services/server/projects.service';
import { isRequestFailure } from '@/src/utils/request-failure.utils';
import {
  ERROR_MESSAGES,
  ErrorCodes,
  StatusCodes,
} from '@/src/constants/http.constants';

export async function editProjectAction(
  projectId: string,
  request: Partial<EditProjectRequest>,
): Promise<ActionResult<ProjectResponse>> {
  try {
    const data = await ProjectsService.editProject(projectId, request);

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
