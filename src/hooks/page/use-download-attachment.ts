import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { PagesService } from '@/src/api/services/client/pages.service';

const DOWNLOAD_ATTACHMENT_MUTATION_KEY = 'download-attachment';

export const useDownloadAttachment = (): UseMutationResult<
  Blob,
  RequestFailure,
  { pageId: string; attachmentId: string },
  unknown
> => {
  return useMutation({
    mutationKey: [DOWNLOAD_ATTACHMENT_MUTATION_KEY],
    mutationFn: async ({
      pageId,
      attachmentId,
    }: {
      pageId: string;
      attachmentId: string;
    }) => await PagesService.downloadAttachment(pageId, attachmentId),
  });
};
