'use server';
import { WorkspaceService } from '../../api/services/server/workspace.service';
import {
  ERROR_MESSAGES,
  ErrorCodes,
  StatusCodes,
} from '../../constants/http.constants';
import { ActionResult } from '../../types/network.types';
import {
  CreateWorkspaceRequest,
  GetWorkspaceResponse,
} from '../../types/workspaces.types';
import { isRequestFailure } from '../../utils/request-failure.utils';

export async function createWorkspaceAction(
  request: CreateWorkspaceRequest,
): Promise<ActionResult<GetWorkspaceResponse>> {
  try {
    const data = await WorkspaceService.createWorkspace(request);

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
