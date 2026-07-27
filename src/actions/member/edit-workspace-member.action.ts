'use server';
import { WorkspaceService } from '@/src/api/services/server/workspace.service';
import {
  ERROR_MESSAGES,
  ErrorCodes,
  StatusCodes,
} from '@/src/constants/http.constants';
import { ActionResult } from '@/src/types/network.types';
import type {
  EditWorkspaceMemberRequest,
  WorkspaceMemberResponse,
} from '@/src/types/workspaces.types';
import { isRequestFailure } from '@/src/utils/request-failure.utils';

export async function editWorkspaceMemberAction(
  id: string,
  userId: string,
  request: Partial<EditWorkspaceMemberRequest>,
): Promise<ActionResult<WorkspaceMemberResponse>> {
  try {
    const data = await WorkspaceService.editWorkspaceMember(
      id,
      userId,
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
