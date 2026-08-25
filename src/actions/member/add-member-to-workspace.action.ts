'use server';
import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import {
  ERROR_MESSAGES,
  ErrorCodes,
  StatusCodes,
} from '@/src/constants/http.constants';
import { ActionResult } from '@/src/types/network.types';
import {
  AddMemberToWorkspaceRequest,
  WorkspaceInvitationResponse,
} from '@/src/types/workspaces.types';
import { isRequestFailure } from '@/src/utils/request-failure.utils';

export async function addMemberToWorkspaceAction(
  workspaceId: string,
  request: AddMemberToWorkspaceRequest,
): Promise<ActionResult<WorkspaceInvitationResponse>> {
  try {
    const data = await WorkspaceService.addMemberToWorkspace(
      workspaceId,
      request,
    );

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
