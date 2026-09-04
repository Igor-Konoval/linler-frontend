'use client';

import { PagesService } from '@/src/api/services/client/pages.service';
import {
  ACCEPTED_ATTACHMENT_ACCEPT_ATTR,
  ACCEPTED_IMAGE_ACCEPT_ATTR,
  CoverResizeModeEnum,
  DEFAULT_COVER_META,
  ForsedTypeEnum,
  ImageResizeDirectionEnum,
  MenuModeEnum,
} from '@/src/constants/content-editor.constants';
import { ProjectMemberRole } from '@/src/constants/workspaces.constants';
import { useDownloadAttachment } from '@/src/hooks/page/use-download-attachment';
import { useGetProjectPage } from '@/src/hooks/page/use-get-project-page';
import { seedPageActivity } from '@/src/hooks/realtime/use-page-activity';
import { usePageAwareness } from '@/src/hooks/realtime/use-page-awareness';
import type { PageCoverMeta, PageResponse } from '@/src/types/pages.types';
import {
  clamp,
  type EditorResizeState,
  getAttachmentUrl,
  getImageResizeMode,
  getNumberAttr,
  getPageApplyFingerprint,
  hydrateContentWithAttachments,
  type ImageResizeMode,
  isImageMimeType,
  normalizeUrl,
  resolveAtomNodePos,
  resolveImageNodePos,
  sanitizeContentForSave,
  toAttachmentMap,
} from '@/src/utils/content-editor.utils';
import { cn } from '@/src/utils/utils';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent } from '@tiptap/react';
import { ArrowDownToLine } from 'lucide-react';
import type {
  ChangeEvent,
  DragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { CoverBlock } from './cover-block';
import { FloatingMenu } from './floating-menu';
import { useEditorConfig } from './hooks/use-editor-config';
import { useEditorEvents } from './hooks/use-editor-events';
import { useFloatingMenu } from './hooks/use-floating-menu';
import { useFloatingMenuContent } from './hooks/use-floating-menu-content';
import { useSave } from './hooks/use-save';
import { PageEditorSkeleton } from './page-editor-skeleton';
import { RemoteUserFrame } from './remote-user-frame';

export type CoverResizeState = {
  mode: CoverResizeModeEnum;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  containerWidth: number;
};

export type ImageResizeState = {
  mode: ImageResizeMode;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  nextWidth: number;
  nextHeight: number;
  imageNodePos: number;
  ratio: number;
  imageElement: HTMLImageElement;
};

type MediaUploadAnchor = {
  x: number;
  y: number;
  accept: string;
  attachmentId: string | null;
};

export function PageEditor({
  pageId,
  initialData,
}: {
  pageId: string;
  initialData?: PageResponse;
}) {
  const { data: page, isPending } = useGetProjectPage({
    initialData,
    pageId,
  });

  if (isPending || !page) {
    return <PageEditorSkeleton />;
  }

  return <PageEditorContent key={page.id} page={page} />;
}

function PageEditorContent({ page }: { page: PageResponse }) {
  const editable = page.projectRole !== ProjectMemberRole.VIEWER;
  const [title, setTitle] = useState(page.title);
  const [coverUrl, setCoverUrl] = useState(page.cover);
  const [coverMeta, setCoverMeta] = useState<PageCoverMeta>(
    page.coverMeta ?? {
      width: page.width,
      height: page.height,
      objectPositionX: page.objectPositionX,
      objectPositionY: page.objectPositionY,
    },
  );
  const [editorMinHeight, setEditorMinHeight] = useState(420);
  const [editorContentWidth, setEditorContentWidth] = useState<number | null>(
    page.contentWidth ?? page.editorMeta?.contentWidth ?? null,
  );
  const [editorContentOffsetX, setEditorContentOffsetX] = useState<
    number | null
  >(page.contentOffsetX ?? page.editorMeta?.contentOffsetX ?? null);
  const [isEditorEdgeResizeEnabled, setIsEditorEdgeResizeEnabled] =
    useState(true);
  const [isEditorLeftHandleVisible, setIsEditorLeftHandleVisible] =
    useState(false);
  const [isEditorRightHandleVisible, setIsEditorRightHandleVisible] =
    useState(false);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [mediaUploadAnchor, setMediaUploadAnchor] =
    useState<MediaUploadAnchor | null>(null);
  const mediaUploadInputRef = useRef<HTMLInputElement | null>(null);

  const coverMetaRef = useRef<PageCoverMeta>(
    page.coverMeta ?? DEFAULT_COVER_META,
  );
  const editorContentWidthRef = useRef<number | null>(
    page.editorMeta?.contentWidth ?? page.contentWidth ?? null,
  );
  const editorContentOffsetXRef = useRef<number | null>(
    page.editorMeta?.contentOffsetX ?? page.contentOffsetX ?? null,
  );
  const pageId = useRef(page.id);
  const editorLayoutRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const editorAreaRef = useRef<HTMLDivElement | null>(null);
  const coverContainerRef = useRef<HTMLDivElement | null>(null);
  const floatingMenuRef = useRef<HTMLDivElement | null>(null);
  const coverResizeStateRef = useRef<CoverResizeState | null>(null);
  const imageResizeStateRef = useRef<ImageResizeState | null>(null);
  const isImageResizeInProgressRef = useRef(false);
  const editorResizeStateRef = useRef<EditorResizeState | null>(null);
  const initialAttachmentMap = useMemo(
    () => toAttachmentMap(page.attachments),
    [page.attachments],
  );
  const initialContent = useMemo(
    () => hydrateContentWithAttachments(page.content, initialAttachmentMap),
    [initialAttachmentMap, page.content],
  );

  const {
    mutateAsync: downloadAttachment,
    isPending: isDownloadingAttachment,
  } = useDownloadAttachment();

  useEffect(() => {
    pageId.current = page.id;
  }, [page.id]);

  useEffect(() => {
    coverMetaRef.current = coverMeta;
  }, [coverMeta]);

  useEffect(() => {
    editorContentWidthRef.current = editorContentWidth;
  }, [editorContentWidth]);

  useEffect(() => {
    editorContentOffsetXRef.current = editorContentOffsetX;
  }, [editorContentOffsetX]);

  const {
    openFloatingMenuAtViewportPoint,
    closeFloatingMenu,
    floatingMenu,
    setFloatingMenu,
  } = useFloatingMenu({
    setSlashQuery,
    editorAreaRef,
  });

  const { save, saveTimer, scheduleSave, hasUnsavedChanges } = useSave({
    coverMetaRef,
    editorContentOffsetXRef,
    editorContentWidthRef,
    pageId,
    sanitizeContentForSave,
    projectId: page.projectId,
  });

  const { editor, uploadAndInsertAttachments, isUploadingAttachment } =
    useEditorConfig({
      closeFloatingMenu,
      editable,
      initialContent,
      openFloatingMenuAtViewportPoint,
      scheduleSave,
      setFloatingMenu,
      isImageResizeInProgressRef,
      setSlashQuery,
      pageId,
    });

  const { titleUsers, coverUsers, emitTitleAwareness, emitCoverAwareness } =
    usePageAwareness({
      editor,
      pageId: page.id,
      enabled: true,
    });

  const appliedFingerprintRef = useRef(getPageApplyFingerprint(page));

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const fingerprint = getPageApplyFingerprint(page);

    if (fingerprint === appliedFingerprintRef.current) {
      return;
    }

    const applyRemotePage = (): boolean => {
      if (hasUnsavedChanges()) {
        return false;
      }

      const nextContent = hydrateContentWithAttachments(
        page.content,
        toAttachmentMap(page.attachments),
      );
      const contentChanged =
        JSON.stringify(editor.getJSON()) !== JSON.stringify(nextContent);
      const scrollY = window.scrollY;
      const areaScroll = editorAreaRef.current?.scrollTop ?? 0;

      if (contentChanged) {
        editor.chain().setContent(nextContent, { emitUpdate: false }).run();
      }

      setTitle(page.title);
      setCoverUrl(page.cover);
      setCoverMeta(
        page.coverMeta ?? {
          width: page.width,
          height: page.height,
          objectPositionX: page.objectPositionX,
          objectPositionY: page.objectPositionY,
        },
      );
      setEditorContentWidth(
        page.contentWidth ?? page.editorMeta?.contentWidth ?? null,
      );
      setEditorContentOffsetX(
        page.contentOffsetX ?? page.editorMeta?.contentOffsetX ?? null,
      );

      appliedFingerprintRef.current = fingerprint;

      const restoreScroll = () => {
        window.scrollTo({ top: scrollY, left: 0, behavior: 'auto' });
        if (editorAreaRef.current) {
          editorAreaRef.current.scrollTop = areaScroll;
        }
      };

      restoreScroll();
      requestAnimationFrame(restoreScroll);
      return true;
    };

    if (applyRemotePage()) {
      return;
    }

    let attempts = 0;
    const retryId = window.setInterval(() => {
      attempts += 1;

      if (applyRemotePage() || attempts >= 25) {
        window.clearInterval(retryId);
      }
    }, 400);

    return () => {
      window.clearInterval(retryId);
    };
  }, [editor, hasUnsavedChanges, page]);

  useEffect(() => {
    seedPageActivity(
      page.id,
      page.recentEditors?.length
        ? page.recentEditors
        : page.updatedBy
          ? [
              {
                id: page.updatedBy.id,
                username: page.updatedBy.username,
                avatarUrl: page.updatedBy.avatarUrl,
                updatedAt: page.updatedAt,
              },
            ]
          : [],
    );
  }, [page.id, page.recentEditors, page.updatedAt, page.updatedBy]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void save();
    },
    [save, saveTimer],
  );

  const removeSlashQuery = useCallback(() => {
    if (!editor) return;
    const { $from } = editor.state.selection;
    editor
      .chain()
      .focus()
      .deleteRange({ from: $from.start(), to: $from.pos })
      .run();
    setSlashQuery(null);
  }, [editor]);

  const insertImageFromUrl = useCallback(() => {
    if (!editor) {
      return;
    }

    const rawValue = window.prompt('Paste an image URL');

    if (!rawValue) {
      return;
    }

    const src = normalizeUrl(rawValue);

    if (!src) {
      toast.error('Please enter a valid image URL.');
      return;
    }

    editor.chain().focus().setImage({ src, width: 640 }).run();
  }, [editor]);

  const uploadCover = useCallback(
    async (file: File) => {
      if (!editable) return;

      if (!isImageMimeType(file.type)) {
        toast.error('Cover must be an image file.');
        return;
      }

      setIsUploadingCover(true);
      try {
        const attachment = await PagesService.attachFile(pageId.current, file);
        const nextCoverUrl = getAttachmentUrl(attachment);
        setCoverUrl(nextCoverUrl);
        const nextMeta = page.coverMeta ?? coverMeta;
        setCoverMeta(nextMeta);
        scheduleSave({ cover: nextCoverUrl, coverMeta: nextMeta });
      } catch {
        toast.error('Could not upload cover image.');
      } finally {
        setIsUploadingCover(false);
      }
    },
    [coverMeta, editable, page.coverMeta, scheduleSave],
  );

  const removeCover = useCallback(() => {
    setCoverUrl(null);
    scheduleSave({ cover: null, coverMeta: null });
  }, [scheduleSave]);

  const updateCoverMeta = useCallback(
    (partial: Partial<PageCoverMeta>) => {
      const nextMeta: PageCoverMeta = {
        ...coverMeta,
        ...partial,
      };

      setCoverMeta(nextMeta);
      scheduleSave({ coverMeta: nextMeta });
    },
    [coverMeta, scheduleSave],
  );

  const resizeActiveImage = useCallback(
    (direction: ImageResizeDirectionEnum) => {
      if (!editor || !editor.isActive('image')) {
        return;
      }

      const attrs = editor.getAttributes('image') as Record<string, unknown>;
      const currentWidth = getNumberAttr(attrs, 'width') ?? 640;
      const currentHeight = getNumberAttr(attrs, 'height');
      const delta = direction === ImageResizeDirectionEnum.INCREASE ? 40 : -40;
      const nextWidth = clamp(currentWidth + delta, 80, 2200);

      const updates: Record<string, unknown> = { width: nextWidth };

      if (currentHeight !== null) {
        const ratio = currentHeight / currentWidth;
        updates.height = clamp(Math.round(nextWidth * ratio), 80, 2200);
      }

      editor.chain().focus().updateAttributes('image', updates).run();
    },
    [editor],
  );

  const deleteCurrentBlock = useCallback(() => {
    if (!editor) {
      return;
    }

    if (editor.state.selection instanceof NodeSelection) {
      editor.chain().focus().deleteSelection().run();
      return;
    }

    if (editor.isActive('table')) {
      editor.chain().focus().deleteTable().run();
      return;
    }

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);

      if (!node.isBlock) {
        continue;
      }

      const from = $from.before(depth);
      const to = from + node.nodeSize;

      if (state.doc.childCount <= 1 && depth === 1) {
        editor.commands.clearContent(true);
        return;
      }

      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .deleteSelection()
        .run();

      return;
    }
  }, [editor]);

  const openImagePicker = useCallback(() => {
    const input = document.getElementById(
      'page-editor-image-upload',
    ) as HTMLInputElement | null;
    input?.click();
  }, []);

  const openFilePicker = useCallback(() => {
    const input = document.getElementById(
      'page-editor-file-upload',
    ) as HTMLInputElement | null;
    input?.click();
  }, []);

  const replaceHoveredMedia = useCallback(
    async (file: File) => {
      if (!editor || !mediaUploadAnchor?.attachmentId) {
        return false;
      }

      const uploadedAttachment = await PagesService.attachFile(
        pageId.current,
        file,
      );

      let targetPos: number | null = null;

      editor.state.doc.descendants((node, position) => {
        if (
          (node.type.name === 'image' ||
            node.type.name === 'file' ||
            node.type.name === 'attachment') &&
          node.attrs.attachmentId === mediaUploadAnchor.attachmentId &&
          targetPos === null
        ) {
          targetPos = position;
          return false;
        }

        return true;
      });

      if (targetPos === null) {
        return false;
      }

      const targetNode = editor.state.doc.nodeAt(targetPos);

      if (!targetNode) {
        return false;
      }

      const baseAttrs = {
        ...targetNode.attrs,
        attachmentId: uploadedAttachment.id,
      };
      const fileUrl = getAttachmentUrl(uploadedAttachment);

      const nextAttrs =
        targetNode.type.name === 'image'
          ? {
              ...baseAttrs,
              src: fileUrl,
              alt: uploadedAttachment.originalName,
            }
          : {
              ...baseAttrs,
              title: uploadedAttachment.originalName,
              name: uploadedAttachment.originalName,
              href: fileUrl,
              mimeType: uploadedAttachment.mimeType,
              fileSize: uploadedAttachment.fileSize,
            };

      const transaction = editor.state.tr.setNodeMarkup(
        targetPos,
        undefined,
        nextAttrs,
      );

      editor.view.dispatch(transaction);
      setMediaUploadAnchor(null);
      return true;
    },
    [editor, mediaUploadAnchor, pageId],
  );

  const downloadHoveredAttachment = useCallback(async () => {
    if (!mediaUploadAnchor?.attachmentId) {
      toast.error('This media has no attachment id for download.');
      return;
    }

    try {
      const blob = await downloadAttachment({
        pageId: pageId.current,
        attachmentId: mediaUploadAnchor.attachmentId,
      });
      const originalName =
        page.attachments.find(
          (attachment) => attachment.id === mediaUploadAnchor.attachmentId,
        )?.originalName ?? 'attachment';

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = originalName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download attachment.');
    }
  }, [downloadAttachment, mediaUploadAnchor, page.attachments, pageId]);

  const openCoverPicker = useCallback(() => {
    const input = document.getElementById(
      'page-editor-cover-upload',
    ) as HTMLInputElement | null;
    input?.click();
  }, []);

  const handleImageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) return;
      void uploadAndInsertAttachments(files, ForsedTypeEnum.IMAGE);
    },
    [uploadAndInsertAttachments],
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) return;
      void uploadAndInsertAttachments(files, ForsedTypeEnum.FILE);
    },
    [uploadAndInsertAttachments],
  );

  const handleMediaInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) return;
      if (mediaUploadAnchor?.attachmentId) {
        void (async () => {
          try {
            const replaced = await replaceHoveredMedia(files[0]);

            if (!replaced) {
              await uploadAndInsertAttachments(files);
            }
          } catch {
            toast.error('Could not replace media.');
          }
        })();

        return;
      }

      void uploadAndInsertAttachments(files);
    },
    [mediaUploadAnchor, replaceHoveredMedia, uploadAndInsertAttachments],
  );

  const handleCoverInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) return;
      void uploadCover(file);
    },
    [uploadCover],
  );

  const handleEditorDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!editable) return;

      const hasFiles = Array.from(event.dataTransfer.types).includes('Files');
      if (hasFiles) {
        event.preventDefault();
      }
    },
    [editable],
  );

  const handleEditorDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!editable || !editor) return;

      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length === 0) return;

      event.preventDefault();

      const dropPosition = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (dropPosition) {
        editor.chain().focus().setTextSelection(dropPosition.pos).run();
      } else {
        editor.chain().focus().run();
      }

      void uploadAndInsertAttachments(files);
    },
    [editable, editor, uploadAndInsertAttachments],
  );

  const startCoverResize = useCallback(
    (
      event: ReactPointerEvent<HTMLButtonElement>,
      mode: CoverResizeModeEnum,
    ) => {
      if (!editable || !coverUrl || !coverContainerRef.current) {
        return;
      }

      event.preventDefault();

      const containerRect = coverContainerRef.current.getBoundingClientRect();

      coverResizeStateRef.current = {
        mode,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: clamp(coverMeta.width, 40, 100),
        startHeight: clamp(coverMeta.height, 120, 620),
        containerWidth: Math.max(1, containerRect.width),
      };
    },
    [coverMeta.height, coverMeta.width, coverUrl, editable],
  );

  const startEditorWidthResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, mode: 'left' | 'right') => {
      if (!editable || !articleRef.current || !editorLayoutRef.current) {
        return;
      }

      event.preventDefault();
      const articleRect = articleRef.current.getBoundingClientRect();
      const layoutRect = editorLayoutRef.current.getBoundingClientRect();

      setIsEditorLeftHandleVisible(true);
      setIsEditorRightHandleVisible(true);

      editorResizeStateRef.current = {
        mode,
        startX: event.clientX,
        startLeft: articleRect.left - layoutRect.left,
        startWidth: articleRect.width,
        containerWidth: layoutRect.width,
      };
    },
    [editable],
  );

  const handleEditorPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) {
        return;
      }

      const articleRect = articleRef.current?.getBoundingClientRect();

      if (articleRect) {
        const rightEdgeDistance = articleRect.right - event.clientX;
        const leftEdgeDistance = event.clientX - articleRect.left;
        const isResizing = editorResizeStateRef.current !== null;

        setIsEditorLeftHandleVisible(
          isResizing || (leftEdgeDistance <= 14 && leftEdgeDistance >= -2),
        );
        setIsEditorRightHandleVisible(
          isResizing || (rightEdgeDistance <= 14 && rightEdgeDistance >= -2),
        );
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const insideTableCell =
        target.closest('td') !== null || target.closest('th') !== null;
      const insideImage = target.closest('img') !== null;

      setIsEditorEdgeResizeEnabled(!(insideTableCell || insideImage));

      const hoveringUploadButton =
        target.closest('[data-media-action-trigger="true"]') !== null;

      if (!hoveringUploadButton) {
        const mediaElement = target.closest(
          'img, a[data-type="file"], a[data-type="attachment"]',
        );

        if (mediaElement instanceof HTMLElement && editorAreaRef.current) {
          const mediaRect = mediaElement.getBoundingClientRect();
          const areaRect = editorAreaRef.current.getBoundingClientRect();
          const attachmentId = mediaElement.getAttribute('data-attachment-id');
          const isImageMedia = mediaElement.tagName === 'IMG';
          const nextAnchor: MediaUploadAnchor = {
            x: Math.round(mediaRect.right - areaRect.left),
            y: Math.round(mediaRect.top - areaRect.top),
            accept: isImageMedia
              ? ACCEPTED_IMAGE_ACCEPT_ATTR
              : ACCEPTED_ATTACHMENT_ACCEPT_ATTR,
            attachmentId,
          };

          setMediaUploadAnchor((current) => {
            if (
              current &&
              current.x === nextAnchor.x &&
              current.y === nextAnchor.y &&
              current.accept === nextAnchor.accept &&
              current.attachmentId === nextAnchor.attachmentId
            ) {
              return current;
            }

            return nextAnchor;
          });
        } else {
          setMediaUploadAnchor((current) => (current ? null : current));
        }
      }

      const image = target.closest('img');

      if (!(image instanceof HTMLImageElement)) {
        return;
      }

      const mode = getImageResizeMode(
        image.getBoundingClientRect(),
        event.clientX,
        event.clientY,
      );

      if (!mode) {
        image.style.cursor = '';
        return;
      }

      image.style.cursor =
        mode === 'right'
          ? 'ew-resize'
          : mode === 'bottom'
            ? 'ns-resize'
            : 'nwse-resize';
    },
    [editable],
  );

  const handleEditorPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable || !editor) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        return;
      }

      const mode = getImageResizeMode(
        target.getBoundingClientRect(),
        event.clientX,
        event.clientY,
      );

      if (!mode) {
        return;
      }

      const imageNodePos = editor.view.posAtDOM(target, 0);

      if (imageNodePos === null || imageNodePos === undefined) {
        return;
      }

      const resolvedImagePos = resolveImageNodePos(
        editor.state.doc,
        imageNodePos,
      );

      if (resolvedImagePos === null) {
        return;
      }

      const startWidth = target.clientWidth;
      const startHeight = target.clientHeight;

      if (startWidth <= 0 || startHeight <= 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      target.setPointerCapture(event.pointerId);
      isImageResizeInProgressRef.current = true;

      imageResizeStateRef.current = {
        mode,
        startX: event.clientX,
        startY: event.clientY,
        startWidth,
        startHeight,
        nextWidth: startWidth,
        nextHeight: startHeight,
        imageNodePos: resolvedImagePos,
        ratio: startWidth / startHeight,
        imageElement: target,
      };
    },
    [editable, editor],
  );

  useEditorEvents({
    articleRef,
    coverResizeStateRef,
    editor,
    editorLayoutRef,
    editorResizeStateRef,
    imageResizeStateRef,
    isImageResizeInProgressRef,
    setEditorContentOffsetX,
    setEditorContentWidth,
    setIsEditorLeftHandleVisible,
    setIsEditorRightHandleVisible,
    scheduleSave,
    updateCoverMeta,
    closeFloatingMenu,
    floatingMenu,
    floatingMenuRef,
  });

  const {
    quickActions,
    slashCommands,
    isLinkPickerOpen,
    linkPickerQuery,
    setLinkPickerQuery,
    linkPickerItems,
    selectLinkPickerItem,
    setExternalLinkFromPrompt,
  } = useFloatingMenuContent({
    editor,
    deleteCurrentBlock,
    insertImageFromUrl,
    openImagePicker,
    openFilePicker,
    resizeActiveImage,
    isUploadingAttachment,
    setEditorMinHeight,
    floatingMenuOpen: floatingMenu.open,
  });

  if (!editor) return null;

  const runFloatingMenuAction = (command: () => void) => {
    if (floatingMenu.mode === MenuModeEnum.SLASH) {
      removeSlashQuery();
    }

    command();
    closeFloatingMenu();
  };

  const handleEditorContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!editable) {
      return;
    }

    event.preventDefault();

    if (editor.state.selection.empty) {
      const targetEl = event.target as HTMLElement;
      const atomEl = targetEl.closest?.(
        'img, a[data-type="file"], a[data-type="attachment"]',
      );

      const atomDomPos =
        atomEl instanceof HTMLElement ? editor.view.posAtDOM(atomEl, 0) : null;
      const atomPos =
        typeof atomDomPos === 'number'
          ? resolveAtomNodePos(editor.state.doc, atomDomPos, [
              'image',
              'file',
              'attachment',
            ])
          : null;

      if (atomPos !== null) {
        editor.chain().focus().setNodeSelection(atomPos).run();
      } else {
        const dropPosition = editor.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (dropPosition) {
          editor.chain().focus().setTextSelection(dropPosition.pos).run();
        } else {
          editor.chain().focus().run();
        }
      }
    }

    const hasTextSelection =
      !editor.state.selection.empty &&
      !(editor.state.selection instanceof NodeSelection);

    setSlashQuery(null);
    openFloatingMenuAtViewportPoint(
      event.clientX,
      event.clientY,
      MenuModeEnum.CONTEXT,
      hasTextSelection,
    );
  };

  return (
    <main className="bg-background min-h-[calc(100vh-var(--header-height))] px-5 py-8 sm:px-10 lg:px-16">
      {editable && (
        <>
          <input
            id="page-editor-image-upload"
            type="file"
            accept={ACCEPTED_IMAGE_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={handleImageInputChange}
          />
          <input
            id="page-editor-file-upload"
            type="file"
            accept={ACCEPTED_ATTACHMENT_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          <input
            id="page-editor-media-upload"
            ref={mediaUploadInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={handleMediaInputChange}
          />
          <input
            id="page-editor-cover-upload"
            type="file"
            accept={ACCEPTED_IMAGE_ACCEPT_ATTR}
            className="hidden"
            onChange={handleCoverInputChange}
          />
        </>
      )}

      <div onPointerDown={editable ? emitCoverAwareness : undefined}>
        <RemoteUserFrame users={coverUsers}>
          <CoverBlock
            coverContainerRef={coverContainerRef}
            coverUrl={coverUrl}
            editable={editable}
            coverMeta={coverMeta}
            title={title}
            openCoverPicker={openCoverPicker}
            isUploadingCover={isUploadingCover}
            startCoverResize={startCoverResize}
            removeCover={removeCover}
          />
        </RemoteUserFrame>
      </div>

      <div ref={editorLayoutRef} className="mx-auto w-full max-w-7xl">
        <article
          ref={articleRef}
          className="relative w-full pb-24"
          style={{
            width: editorContentWidth
              ? `min(100%, ${editorContentWidth}px)`
              : undefined,
            maxWidth: editorContentWidth ? 'none' : undefined,
            marginLeft:
              editorContentWidth !== null && editorContentOffsetX !== null
                ? `clamp(0px, ${editorContentOffsetX}px, calc(100% - min(100%, ${editorContentWidth}px)))`
                : undefined,
            marginRight:
              editorContentWidth !== null && editorContentOffsetX !== null
                ? '0px'
                : undefined,
          }}
        >
          <RemoteUserFrame users={titleUsers}>
            <div className="flex w-fit gap-1">
              {page.icon && (
                <h6 className="mb-5 text-4xl font-bold sm:text-5xl">
                  {page.icon}
                </h6>
              )}
              <input
                aria-label="Page title"
                className="placeholder:text-muted-foreground mb-5 w-full border-0 bg-transparent text-4xl font-bold tracking-tight outline-none sm:text-5xl"
                value={title}
                disabled={!editable}
                placeholder="Untitled"
                onFocus={editable ? emitTitleAwareness : undefined}
                onChange={(event) => {
                  setTitle(event.target.value);
                  scheduleSave({ title: event.target.value || 'Untitled' });
                }}
              />
            </div>
          </RemoteUserFrame>

          <div
            ref={editorAreaRef}
            className="relative min-h-80 overflow-auto"
            style={{ minHeight: `${editorMinHeight}px` }}
            onDragOver={handleEditorDragOver}
            onDrop={handleEditorDrop}
            onContextMenu={handleEditorContextMenu}
            onPointerMove={handleEditorPointerMove}
            onPointerDown={handleEditorPointerDown}
            onPointerLeave={() => {
              if (!editorResizeStateRef.current) {
                setIsEditorLeftHandleVisible(false);
                setIsEditorRightHandleVisible(false);
                setIsEditorEdgeResizeEnabled(true);
              }

              setMediaUploadAnchor(null);
            }}
          >
            <EditorContent
              editor={editor}
              className={cn(
                'linler-editor',
                !editable && 'linler-editor-readonly',
              )}
            />

            <FloatingMenu
              editable={editable}
              floatingMenu={floatingMenu}
              floatingMenuRef={floatingMenuRef}
              quickActions={quickActions}
              runFloatingMenuAction={runFloatingMenuAction}
              editor={editor}
              slashQuery={slashQuery}
              slashCommands={slashCommands}
              isLinkPickerOpen={isLinkPickerOpen}
              linkPickerQuery={linkPickerQuery}
              setLinkPickerQuery={setLinkPickerQuery}
              linkPickerItems={linkPickerItems}
              selectLinkPickerItem={selectLinkPickerItem}
              setExternalLinkFromPrompt={setExternalLinkFromPrompt}
            />

            {editable && mediaUploadAnchor && (
              <div
                className="pointer-events-none absolute z-40"
                style={{
                  left: mediaUploadAnchor.x,
                  top: mediaUploadAnchor.y,
                  transform: 'translate(calc(-100% - 8px), 8px)',
                }}
              >
                <div className="pointer-events-auto flex gap-1">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="outline"
                    data-media-action-trigger="true"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void downloadHoveredAttachment()}
                    disabled={
                      isDownloadingAttachment || !mediaUploadAnchor.attachmentId
                    }
                    title="Download media"
                  >
                    <ArrowDownToLine />
                  </Button>
                </div>
              </div>
            )}

            {editable && isEditorEdgeResizeEnabled && (
              <>
                <span
                  className={cn(
                    'bg-border pointer-events-none absolute bottom-3 left-0 top-3 z-20 w-px transition-opacity',
                    isEditorLeftHandleVisible ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'bg-border pointer-events-none absolute bottom-3 right-0 top-3 z-20 w-px transition-opacity',
                    isEditorRightHandleVisible ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <button
                  type="button"
                  aria-label="Resize editor left edge"
                  className="absolute bottom-2 left-0 top-2 z-30 w-1.5 cursor-ew-resize touch-none bg-transparent"
                  onPointerDown={(event) =>
                    startEditorWidthResize(event, 'left')
                  }
                />
                <button
                  type="button"
                  aria-label="Resize editor width"
                  className="absolute bottom-2 right-0 top-2 z-30 w-1.5 cursor-ew-resize touch-none bg-transparent"
                  onPointerDown={(event) =>
                    startEditorWidthResize(event, 'right')
                  }
                />
              </>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
