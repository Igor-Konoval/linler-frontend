'use client';

import type {
  PageCoverMeta,
  TiptapDocument,
  UpdatePageRequest,
} from '@/src/types/pages.types';
import {
  clamp,
  EditorResizeState,
  resolveImageNodePos,
} from '@/src/utils/content-editor.utils';
import { RefObject, SetStateAction, useEffect } from 'react';
import { ImageResizeState, type CoverResizeState } from '../page-editor';
import { Editor } from '@tiptap/core';
import { FloatingMenuState } from './use-floating-menu';

interface EditorEventsInterface {
  isImageResizeInProgressRef: RefObject<boolean>;
  scheduleSave: (request: UpdatePageRequest) => void;
  coverResizeStateRef: RefObject<CoverResizeState | null>;
  updateCoverMeta: (partial: Partial<PageCoverMeta>) => void;
  editorResizeStateRef: RefObject<EditorResizeState | null>;
  setEditorContentOffsetX: (value: SetStateAction<number | null>) => void;
  setEditorContentWidth: (value: SetStateAction<number | null>) => void;
  imageResizeStateRef: RefObject<ImageResizeState | null>;
  articleRef: RefObject<HTMLElement | null>;
  editorLayoutRef: RefObject<HTMLDivElement | null>;
  setIsEditorLeftHandleVisible: (value: SetStateAction<boolean>) => void;
  setIsEditorRightHandleVisible: (value: SetStateAction<boolean>) => void;
  editor: Editor | null;
  floatingMenu: FloatingMenuState;
  floatingMenuRef: RefObject<HTMLDivElement | null>;
  closeFloatingMenu: () => void;
}

export function useEditorEvents({
  isImageResizeInProgressRef,
  scheduleSave,
  coverResizeStateRef,
  updateCoverMeta,
  editorResizeStateRef,
  setEditorContentOffsetX,
  setEditorContentWidth,
  imageResizeStateRef,
  articleRef,
  editorLayoutRef,
  editor,
  setIsEditorLeftHandleVisible,
  setIsEditorRightHandleVisible,
  floatingMenu,
  floatingMenuRef,
  closeFloatingMenu,
}: EditorEventsInterface) {
  useEffect(() => {
    if (!floatingMenu.open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      if (floatingMenuRef.current?.contains(targetNode)) {
        return;
      }

      closeFloatingMenu();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      closeFloatingMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeFloatingMenu, floatingMenu.open, floatingMenuRef]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const coverState = coverResizeStateRef.current;

      if (coverState) {
        const deltaX = event.clientX - coverState.startX;
        const deltaY = event.clientY - coverState.startY;

        const next: Partial<PageCoverMeta> = {};

        if (coverState.mode === 'right' || coverState.mode === 'corner') {
          next.width = clamp(
            coverState.startWidth + (deltaX / coverState.containerWidth) * 100,
            40,
            100,
          );
        }

        if (coverState.mode === 'bottom' || coverState.mode === 'corner') {
          next.height = clamp(coverState.startHeight + deltaY, 120, 620);
        }

        updateCoverMeta(next);
      }

      const editorWidthState = editorResizeStateRef.current;

      if (editorWidthState) {
        const deltaX = event.clientX - editorWidthState.startX;
        const minWidth = 320;

        if (editorWidthState.mode === 'right') {
          const nextWidth = clamp(
            editorWidthState.startWidth + deltaX,
            minWidth,
            editorWidthState.containerWidth - editorWidthState.startLeft,
          );

          setEditorContentOffsetX(editorWidthState.startLeft);
          setEditorContentWidth(nextWidth);
        } else {
          const maxLeft =
            editorWidthState.startLeft + editorWidthState.startWidth - minWidth;
          const nextLeft = clamp(
            editorWidthState.startLeft + deltaX,
            0,
            maxLeft,
          );
          const leftDelta = nextLeft - editorWidthState.startLeft;
          const nextWidth = clamp(
            editorWidthState.startWidth - leftDelta,
            minWidth,
            editorWidthState.containerWidth - nextLeft,
          );

          setEditorContentOffsetX(nextLeft);
          setEditorContentWidth(nextWidth);
        }
      }

      const imageState = imageResizeStateRef.current;

      if (imageState) {
        const deltaX = event.clientX - imageState.startX;
        const deltaY = event.clientY - imageState.startY;

        let nextWidth = imageState.startWidth;
        let nextHeight = imageState.startHeight;

        if (imageState.mode === 'right' || imageState.mode === 'corner') {
          nextWidth = clamp(imageState.startWidth + deltaX, 80, 2200);
        }

        if (imageState.mode === 'bottom') {
          nextHeight = clamp(imageState.startHeight + deltaY, 80, 2200);
        } else {
          nextHeight = clamp(
            Math.round(nextWidth / imageState.ratio),
            80,
            2200,
          );
        }

        imageState.nextWidth = nextWidth;
        imageState.nextHeight = nextHeight;
        imageState.imageElement.style.width = `${nextWidth}px`;
        imageState.imageElement.style.height = `${nextHeight}px`;
      }
    };

    const handlePointerUp = () => {
      coverResizeStateRef.current = null;

      const editorWidthState = editorResizeStateRef.current;
      editorResizeStateRef.current = null;

      if (editorWidthState) {
        const articleRect = articleRef.current?.getBoundingClientRect();
        const layoutRect = editorLayoutRef.current?.getBoundingClientRect();

        if (articleRect && layoutRect && Number.isFinite(articleRect.width)) {
          const normalizedWidth = Math.round(
            clamp(articleRect.width, 320, 2200),
          );
          const normalizedOffsetX = clamp(
            Math.round(articleRect.left - layoutRect.left),
            0,
            Math.max(0, Math.round(layoutRect.width - normalizedWidth)),
          );

          setEditorContentOffsetX(normalizedOffsetX);
          setEditorContentWidth(normalizedWidth);
          scheduleSave({
            editorMeta: {
              contentWidth: normalizedWidth,
              contentOffsetX: normalizedOffsetX,
            },
          });
        }
      }

      setIsEditorLeftHandleVisible(false);
      setIsEditorRightHandleVisible(false);

      const imageState = imageResizeStateRef.current;
      if (!imageState || !editor) {
        isImageResizeInProgressRef.current = false;
        imageResizeStateRef.current = null;
        return;
      }

      isImageResizeInProgressRef.current = false;

      const domPos = editor.view.posAtDOM(imageState.imageElement, 0);
      const attachmentId =
        imageState.imageElement.getAttribute('data-attachment-id');

      let targetPos: number | null =
        typeof domPos === 'number'
          ? resolveImageNodePos(editor.state.doc, domPos)
          : null;

      if (targetPos === null) {
        targetPos = resolveImageNodePos(
          editor.state.doc,
          imageState.imageNodePos,
        );
      }

      if (targetPos === null && attachmentId) {
        editor.state.doc.descendants((node, position) => {
          if (
            node.type.name === 'image' &&
            node.attrs.attachmentId === attachmentId &&
            targetPos === null
          ) {
            targetPos = position;
            return false;
          }

          return true;
        });
      }

      if (targetPos === null) {
        imageResizeStateRef.current = null;
        return;
      }

      const targetNode = editor.state.doc.nodeAt(targetPos);

      if (!targetNode || targetNode.type.name !== 'image') {
        imageResizeStateRef.current = null;
        return;
      }

      const nextWidth = clamp(imageState.nextWidth, 80, 2200);
      const nextHeight = clamp(imageState.nextHeight, 80, 2200);

      const updatedByCommand = editor
        .chain()
        .focus()
        .setNodeSelection(targetPos)
        .updateAttributes('image', {
          width: nextWidth,
          height: nextHeight,
        })
        .run();

      if (updatedByCommand) {
        scheduleSave({ content: editor.getJSON() as TiptapDocument });
        imageResizeStateRef.current = null;
        return;
      }

      const transaction = editor.state.tr.setNodeMarkup(targetPos, undefined, {
        ...targetNode.attrs,
        width: nextWidth,
        height: nextHeight,
      });

      editor.view.dispatch(transaction);
      scheduleSave({ content: editor.getJSON() as TiptapDocument });
      imageResizeStateRef.current = null;
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [
    editor,
    scheduleSave,
    updateCoverMeta,
    articleRef,
    editorLayoutRef,
    setEditorContentOffsetX,
    setEditorContentWidth,
    setIsEditorLeftHandleVisible,
    setIsEditorRightHandleVisible,
    coverResizeStateRef,
    editorResizeStateRef,
    imageResizeStateRef,
    isImageResizeInProgressRef,
  ]);

  return null;
}
