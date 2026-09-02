'use client';

import { MenuModeEnum } from '@/src/constants/content-editor.constants';
import { resolveAtomNodePos } from '@/src/utils/content-editor.utils';
import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { FloatingMenuState } from './use-floating-menu';

const MOBILE_SELECTION_MENU_DELAY_MS = 280;
const ATOM_CONTEXT_SELECTOR =
  'img, a[data-type="file"], a[data-type="attachment"]';

function isCoarsePointer(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

interface EditorContextMenuInterface {
  editor: Editor | null;
  editable: boolean;
  floatingMenu: FloatingMenuState;
  setSlashQuery: (value: string | null) => void;
  openFloatingMenuAtViewportPoint: (
    clientX: number,
    clientY: number,
    mode: MenuModeEnum,
    hasTextSelection: boolean,
  ) => void;
}

export function useEditorContextMenu({
  editor,
  editable,
  floatingMenu,
  setSlashQuery,
  openFloatingMenuAtViewportPoint,
}: EditorContextMenuInterface) {
  const floatingMenuRef = useRef(floatingMenu);

  useEffect(() => {
    floatingMenuRef.current = floatingMenu;
  }, [floatingMenu]);

  useEffect(() => {
    if (!editor || !editable) {
      return;
    }

    let timeoutId: number | undefined;

    const openMenuForSelection = () => {
      if (!isCoarsePointer()) {
        return;
      }

      const menu = floatingMenuRef.current;
      if (menu.open && menu.mode === MenuModeEnum.SLASH) {
        return;
      }

      const { selection } = editor.state;
      const hasTextSelection =
        !selection.empty && !(selection instanceof NodeSelection);

      if (!hasTextSelection) {
        return;
      }

      try {
        const coords = editor.view.coordsAtPos(selection.to);
        openFloatingMenuAtViewportPoint(
          coords.left,
          coords.bottom + 8,
          MenuModeEnum.CONTEXT,
          true,
        );
      } catch {
        return;
      }
    };

    const handleSelectionUpdate = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(
        openMenuForSelection,
        MOBILE_SELECTION_MENU_DELAY_MS,
      );
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      window.clearTimeout(timeoutId);
    };
  }, [editable, editor, openFloatingMenuAtViewportPoint]);

  return useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!editable || !editor) {
        return;
      }

      const targetEl = event.target as HTMLElement;
      const isAtomTarget = Boolean(targetEl.closest?.(ATOM_CONTEXT_SELECTOR));

      if (isCoarsePointer() && editor.state.selection.empty && !isAtomTarget) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (editor.state.selection.empty) {
        const atomEl = targetEl.closest?.(ATOM_CONTEXT_SELECTOR);
        const atomDomPos =
          atomEl instanceof HTMLElement
            ? editor.view.posAtDOM(atomEl, 0)
            : null;
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
    },
    [editable, editor, openFloatingMenuAtViewportPoint, setSlashQuery],
  );
}
