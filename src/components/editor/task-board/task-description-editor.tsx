'use client';

import { PagesService } from '@/src/api/services/client/pages.service';
import { Button } from '@/src/components/ui/button';
import {
  ACCEPTED_ATTACHMENT_ACCEPT_ATTR,
  ACCEPTED_IMAGE_ACCEPT_ATTR,
  ForsedTypeEnum,
  ImageResizeDirectionEnum,
  MenuModeEnum,
} from '@/src/constants/content-editor.constants';
import { EMPTY_TASK_DESCRIPTION } from '@/src/constants/task-board.constants';
import { useDownloadAttachment } from '@/src/hooks/page/use-download-attachment';
import { useGetProjectPage } from '@/src/hooks/page/use-get-project-page';
import type {
  TiptapDocument,
  UpdatePageRequest,
} from '@/src/types/pages.types';
import {
  clamp,
  getAttachmentUrl,
  getImageResizeMode,
  getNumberAttr,
  hydrateContentWithAttachments,
  type ImageResizeState,
  normalizeUrl,
  resolveImageNodePos,
  toAttachmentMap,
} from '@/src/utils/content-editor.utils';
import { cn } from '@/src/utils/utils';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent } from '@tiptap/react';
import { ArrowDownToLine } from 'lucide-react';
import type {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FloatingMenu } from '../floating-menu';
import { useEditorConfig } from '../hooks/use-editor-config';
import { useEditorContextMenu } from '../hooks/use-editor-context-menu';
import { useEditorEvents } from '../hooks/use-editor-events';
import { useFloatingMenu } from '../hooks/use-floating-menu';
import { useFloatingMenuContent } from '../hooks/use-floating-menu-content';

type MediaUploadAnchor = {
  x: number;
  y: number;
  accept: string;
  attachmentId: string | null;
};

export function TaskDescriptionEditor({
  pageId,
  projectId,
  editable,
  content,
  onChange,
}: {
  pageId: string;
  projectId: string;
  editable: boolean;
  content: TiptapDocument;
  onChange: (content: TiptapDocument) => void;
}) {
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [editorMinHeight, setEditorMinHeight] = useState(180);
  const [mediaUploadAnchor, setMediaUploadAnchor] =
    useState<MediaUploadAnchor | null>(null);
  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLElement | null>(
    null,
  );

  const [seedContent] = useState(content ?? EMPTY_TASK_DESCRIPTION);
  const pageIdRef = useRef(pageId);
  const editorAreaRef = useRef<HTMLDivElement | null>(null);
  const menuPositionRootRef = useRef<HTMLElement | null>(null);
  const floatingMenuRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const imageResizeStateRef = useRef<ImageResizeState | null>(null);
  const isImageResizeInProgressRef = useRef(false);

  const { data: page } = useGetProjectPage({ pageId });
  const {
    mutateAsync: downloadAttachment,
    isPending: isDownloadingAttachment,
  } = useDownloadAttachment();

  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);

  const initialContent = useMemo(
    () =>
      hydrateContentWithAttachments(
        seedContent,
        toAttachmentMap(page?.attachments ?? []),
      ),
    [page, seedContent],
  );

  const bindEditorArea = useCallback((node: HTMLDivElement | null) => {
    editorAreaRef.current = node;
    const root =
      node?.closest<HTMLElement>('[data-slot="sheet-content"]') ?? node;

    menuPositionRootRef.current = root;
    setMenuPortalTarget(root);
  }, []);

  const {
    openFloatingMenuAtViewportPoint,
    closeFloatingMenu,
    floatingMenu,
    setFloatingMenu,
  } = useFloatingMenu({
    setSlashQuery,
    editorAreaRef,
    placement: 'fixed',
    positionRootRef: menuPositionRootRef,
  });

  const scheduleSave = useCallback(
    (request: UpdatePageRequest) => {
      if (request.content) {
        onChange(request.content);
      }
    },
    [onChange],
  );

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
      pageId: pageIdRef,
      projectId,
      enableTaskBoard: false,
    });

  const removeSlashQuery = useCallback(() => {
    if (!editor) {
      return;
    }

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
    const { $from } = state.selection;

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
    imageInputRef.current?.click();
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const replaceHoveredMedia = useCallback(
    async (file: File) => {
      if (!editor || !mediaUploadAnchor?.attachmentId) {
        return false;
      }

      const uploadedAttachment = await PagesService.attachFile(
        pageIdRef.current,
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

      const fileUrl = getAttachmentUrl(uploadedAttachment);
      const nextAttrs =
        targetNode.type.name === 'image'
          ? {
              ...targetNode.attrs,
              attachmentId: uploadedAttachment.id,
              src: fileUrl,
              alt: uploadedAttachment.originalName,
            }
          : {
              ...targetNode.attrs,
              attachmentId: uploadedAttachment.id,
              title: uploadedAttachment.originalName,
              name: uploadedAttachment.originalName,
              href: fileUrl,
              mimeType: uploadedAttachment.mimeType,
              fileSize: uploadedAttachment.fileSize,
            };

      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(targetPos, undefined, nextAttrs),
      );
      setMediaUploadAnchor(null);
      return true;
    },
    [editor, mediaUploadAnchor],
  );

  const downloadHoveredAttachment = useCallback(async () => {
    if (!mediaUploadAnchor?.attachmentId) {
      toast.error('This media has no attachment id for download.');
      return;
    }

    try {
      const blob = await downloadAttachment({
        pageId: pageIdRef.current,
        attachmentId: mediaUploadAnchor.attachmentId,
      });
      const originalName =
        page?.attachments.find(
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
  }, [downloadAttachment, mediaUploadAnchor, page]);

  const handleImageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) {
        return;
      }

      void uploadAndInsertAttachments(files, ForsedTypeEnum.IMAGE);
    },
    [uploadAndInsertAttachments],
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) {
        return;
      }

      void uploadAndInsertAttachments(files, ForsedTypeEnum.FILE);
    },
    [uploadAndInsertAttachments],
  );

  const handleMediaInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';

      if (files.length === 0) {
        return;
      }

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

  const handleEditorDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!editable) {
        return;
      }

      const hasFiles = Array.from(event.dataTransfer.types).includes('Files');

      if (hasFiles) {
        event.preventDefault();
      }
    },
    [editable],
  );

  const handleEditorDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!editable || !editor) {
        return;
      }

      const files = Array.from(event.dataTransfer.files ?? []);

      if (files.length === 0) {
        return;
      }

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

  const handleEditorPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!editable) {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const hoveringUploadButton =
        target.closest('[data-media-action-trigger="true"]') !== null;

      if (!hoveringUploadButton) {
        const mediaElement = target.closest(
          'img, a[data-type="file"], a[data-type="attachment"]',
        );

        if (mediaElement instanceof HTMLElement && editorAreaRef.current) {
          const mediaRect = mediaElement.getBoundingClientRect();
          const areaRect = editorAreaRef.current.getBoundingClientRect();
          const isImageMedia = mediaElement.tagName === 'IMG';

          setMediaUploadAnchor({
            x: Math.round(mediaRect.right - areaRect.left),
            y: Math.round(mediaRect.top - areaRect.top),
            accept: isImageMedia
              ? ACCEPTED_IMAGE_ACCEPT_ATTR
              : ACCEPTED_ATTACHMENT_ACCEPT_ATTR,
            attachmentId: mediaElement.getAttribute('data-attachment-id'),
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
    editor,
    imageResizeStateRef,
    isImageResizeInProgressRef,
    scheduleSave,
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
    enableTaskBoard: false,
  });

  const handleEditorContextMenu = useEditorContextMenu({
    editor,
    editable,
    floatingMenu,
    setSlashQuery,
    openFloatingMenuAtViewportPoint,
  });

  if (!editor) {
    return null;
  }

  const runFloatingMenuAction = (command: () => void) => {
    if (floatingMenu.mode === MenuModeEnum.SLASH) {
      removeSlashQuery();
    }

    command();
    closeFloatingMenu();
  };

  return (
    <div
      ref={bindEditorArea}
      className="relative min-w-0 overflow-x-hidden px-1"
      style={{ minHeight: `${editorMinHeight}px` }}
      onDragOver={handleEditorDragOver}
      onDrop={handleEditorDrop}
      onContextMenu={handleEditorContextMenu}
      onPointerMove={handleEditorPointerMove}
      onPointerDown={handleEditorPointerDown}
      onPointerLeave={() => {
        setMediaUploadAnchor(null);
      }}
    >
      {editable ? (
        <>
          <input
            ref={imageInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={handleImageInputChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          <input
            ref={mediaInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={handleMediaInputChange}
          />
        </>
      ) : null}

      <EditorContent
        editor={editor}
        className={cn(
          'linler-editor linler-editor-nested block w-full min-w-0 max-w-full text-sm',
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
        placement="fixed"
        portalTarget={menuPortalTarget}
      />

      {editable && mediaUploadAnchor ? (
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
      ) : null}
    </div>
  );
}
