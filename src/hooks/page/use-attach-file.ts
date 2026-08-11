import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { PagesService } from '@/src/api/services/client/pages.service';
import type { PageAttachment } from '@/src/types/pages.types';

const ATTACH_FILE_MUTATION_KEY = 'attach-file';

export const useAttachFile = (): UseMutationResult<
  PageAttachment,
  RequestFailure,
  { pageId: string; file: File },
  unknown
> => {
  return useMutation({
    mutationKey: [ATTACH_FILE_MUTATION_KEY],
    mutationFn: async ({ pageId, file }: { pageId: string; file: File }) =>
      await PagesService.attachFile(pageId, file),
  });
};
