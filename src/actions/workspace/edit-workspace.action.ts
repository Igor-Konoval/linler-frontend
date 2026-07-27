'use server';
import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import {
  ERROR_MESSAGES,
  ErrorCodes,
  StatusCodes,
} from '@/src/constants/http.constants';
import { ActionResult } from '@/src/types/network.types';
import {
  EditWorkspaceRequest,
  GetWorkspaceResponse,
} from '@/src/types/workspaces.types';
import { isRequestFailure } from '@/src/utils/request-failure.utils';

export async function editWorkspaceAction(
  id: string,
  request: EditWorkspaceRequest,
): Promise<ActionResult<GetWorkspaceResponse>> {
  try {
    const data = await WorkspaceService.editWorkspace(id, request);

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
