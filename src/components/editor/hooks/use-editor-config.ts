'use client';

import {
  ForsedTypeEnum,
  MenuModeEnum,
} from '@/src/constants/content-editor.constants';
import { useAttachFile } from '@/src/hooks/page/use-attach-file';
import type {
  PageAttachment,
  TiptapDocument,
  UpdatePageRequest,
} from '@/src/types/pages.types';
import {
  getAttachmentUrl,
  isImageMimeType,
} from '@/src/utils/content-editor.utils';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { RefObject, SetStateAction, useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  Attachment,
  AttachmentImage,
  Callout,
  FileAttachment,
  LinkChip,
} from '../extensions';
import type { FloatingMenuState } from './use-floating-menu';

interface EditorConfigInterface {
  editable: boolean;
  initialContent: TiptapDocument;
  closeFloatingMenu: () => void;
  isImageResizeInProgressRef: RefObject<boolean>;
  scheduleSave: (request: UpdatePageRequest) => void;
  setSlashQuery: (value: SetStateAction<string | null>) => void;
  setFloatingMenu: (value: SetStateAction<FloatingMenuState>) => void;
  openFloatingMenuAtViewportPoint: (
    clientX: number,
    clientY: number,
    mode: MenuModeEnum,
    hasTextSelection: boolean,
  ) => void;
  pageId: RefObject<string>;
}

export function useEditorConfig({
  editable,
  initialContent,
  closeFloatingMenu,
  isImageResizeInProgressRef,
  scheduleSave,
  setSlashQuery,
  openFloatingMenuAtViewportPoint,
  setFloatingMenu,
  pageId,
}: EditorConfigInterface) {
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const { mutateAsync: attachFile, isPending: isAttachingFile } =
    useAttachFile();
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content: initialContent,
    extensions: [
      StarterKit.configure({ link: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        isAllowedUri: (url, ctx) => {
          if (url.startsWith('/')) {
            return true;
          }

          if (url.startsWith('#')) {
            return true;
          }

          return ctx.defaultValidate(url);
        },
      }),
      AttachmentImage.configure({ allowBase64: false }),
      LinkChip,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({
        table: {
          resizable: true,
          handleWidth: 8,
          cellMinWidth: 120,
          lastColumnResizable: true,
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: "Type '/' for commands…" }),
      Callout,
      FileAttachment,
      Attachment,
    ],
    editorProps: {
      handlePaste: (_view, event) => {
        if (!editable) {
          return false;
        }

        const files = Array.from(event.clipboardData?.files ?? []);

        if (files.length === 0) {
          return false;
        }

        event.preventDefault();
        void uploadAndInsertAttachments(files);
        closeFloatingMenu();
        return true;
      },
      handleKeyDown: (_view, event) => {
        if (event.key !== 'Escape') {
          return false;
        }

        closeFloatingMenu();
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isImageResizeInProgressRef.current) {
        return;
      }

      scheduleSave({ content: currentEditor.getJSON() as TiptapDocument });
      const text = currentEditor.state.selection.$from.parent.textContent;
      const nextSlashQuery = text.startsWith('/')
        ? text.slice(1).toLowerCase()
        : null;

      setSlashQuery(nextSlashQuery);

      if (!editable) {
        return;
      }

      if (nextSlashQuery === null) {
        setFloatingMenu((prev) =>
          prev.open && prev.mode === MenuModeEnum.SLASH
            ? { ...prev, open: false }
            : prev,
        );
        return;
      }

      const { from } = currentEditor.state.selection;
      const coordinates = currentEditor.view.coordsAtPos(from);

      openFloatingMenuAtViewportPoint(
        coordinates.left,
        coordinates.bottom,
        MenuModeEnum.SLASH,
        false,
      );
    },
  });

  const insertUploadedAttachment = useCallback(
    (attachment: PageAttachment, forcedType?: 'image' | 'file') => {
      if (!editor) return;

      const fileType =
        forcedType ?? (isImageMimeType(attachment.mimeType) ? 'image' : 'file');

      if (fileType === 'image') {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'image',
            attrs: {
              attachmentId: attachment.id,
              src: getAttachmentUrl(attachment),
              alt: attachment.originalName,
              width: 640,
            },
          })
          .run();
        return;
      }

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'file',
          attrs: {
            attachmentId: attachment.id,
            title: attachment.originalName,
            href: getAttachmentUrl(attachment),
            mimeType: attachment.mimeType,
            fileSize: attachment.fileSize,
          },
        })
        .run();
    },
    [editor],
  );

  const uploadAndInsertAttachments = useCallback(
    async (files: File[], forcedType?: ForsedTypeEnum) => {
      if (!editable || !editor || files.length === 0) return;

      setIsUploadingAttachment(true);
      try {
        for (const file of files) {
          if (
            forcedType === ForsedTypeEnum.IMAGE &&
            !isImageMimeType(file.type)
          ) {
            toast.error(`"${file.name}" is not an image.`);
            continue;
          }

          try {
            const attachment = await attachFile({
              pageId: pageId.current,
              file,
            });
            insertUploadedAttachment(attachment, forcedType);
          } catch {
            toast.error(`Could not upload "${file.name}".`);
          }
        }
      } finally {
        setIsUploadingAttachment(false);
      }
    },
    [editable, editor, insertUploadedAttachment, attachFile, pageId],
  );

  return {
    editor,
    uploadAndInsertAttachments,
    isUploadingAttachment,
    isAttachingFile,
  };
}
