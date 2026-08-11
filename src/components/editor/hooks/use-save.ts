'use client';

import { SaveStateEnum } from '@/src/constants/content-editor.constants';
import { useUpdatePage } from '@/src/hooks/page/use-update-page';
import {
  PageCoverMeta,
  TiptapDocument,
  UpdatePageRequest,
} from '@/src/types/pages.types';
import {
  buildPagePatchPayload,
  PagePatchKey,
} from '@/src/utils/content-editor.utils';
import { RefObject, useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseSaveInterface {
  sanitizeContentForSave: (content: TiptapDocument) => TiptapDocument;
  pageId: RefObject<string>;
  coverMetaRef: RefObject<PageCoverMeta>;
  editorContentWidthRef: RefObject<number | null>;
  editorContentOffsetXRef: RefObject<number | null>;
}

export function useSave({
  sanitizeContentForSave,
  pageId,
  coverMetaRef,
  editorContentWidthRef,
  editorContentOffsetXRef,
}: UseSaveInterface) {
  const pendingUpdate = useRef<UpdatePageRequest>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [saveState, setSaveState] = useState<SaveStateEnum>(
    SaveStateEnum.SAVED,
  );
  const { mutateAsync, isPending } = useUpdatePage();

  const save = useCallback(async () => {
    const request = pendingUpdate.current;
    pendingUpdate.current = {};
    if (Object.keys(request).length === 0) return;

    const requestToSave = request.content
      ? {
          ...request,
          content: sanitizeContentForSave(request.content),
        }
      : request;

    setSaveState(SaveStateEnum.SAVING);
    try {
      await mutateAsync({ pageId: pageId.current, request: requestToSave });
      setSaveState(SaveStateEnum.SAVED);
    } catch {
      if ('editorMeta' in requestToSave) {
        const fallbackRequest: UpdatePageRequest = { ...requestToSave };
        delete fallbackRequest.editorMeta;

        try {
          await mutateAsync({
            pageId: pageId.current,
            request: fallbackRequest,
          });
          setSaveState(SaveStateEnum.SAVED);
          return;
        } catch {
          // no-op: handled by common error branch below
        }
      }

      pendingUpdate.current = { ...requestToSave, ...pendingUpdate.current };
      setSaveState(SaveStateEnum.ERROR);
      toast.error(
        'Could not save the page. Your changes are still in this tab.',
      );
    }
  }, [mutateAsync, pageId, sanitizeContentForSave]);

  const scheduleSave = useCallback(
    (request: UpdatePageRequest) => {
      const changedKeys = new Set<PagePatchKey>(
        Object.keys(request) as PagePatchKey[],
      );

      const normalizedPayload = buildPagePatchPayload(
        {
          coverMeta: coverMetaRef.current,
          editorContentWidth: editorContentWidthRef.current,
          editorContentOffsetX: editorContentOffsetXRef.current,
        },
        changedKeys,
        request,
      );

      pendingUpdate.current = {
        ...pendingUpdate.current,
        ...normalizedPayload,
      };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void save(), 700);
    },
    [save, coverMetaRef, editorContentWidthRef, editorContentOffsetXRef],
  );

  return { save, scheduleSave, saveState, isSaving: isPending, saveTimer };
}
