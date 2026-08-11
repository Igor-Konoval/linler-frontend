'use client';

import { MenuModeEnum } from '@/src/constants/content-editor.constants';
import { getBoundedMenuPosition } from '@/src/utils/content-editor.utils';
import { RefObject, SetStateAction, useCallback, useState } from 'react';

export type FloatingMenuState = {
  open: boolean;
  x: number;
  y: number;
  mode: MenuModeEnum;
  hasTextSelection: boolean;
};

interface FloatingMenuInterface {
  setSlashQuery: (value: SetStateAction<string | null>) => void;
  editorAreaRef: RefObject<HTMLDivElement | null>;
}

export function useFloatingMenu({
  setSlashQuery,
  editorAreaRef,
}: FloatingMenuInterface) {
  const [floatingMenu, setFloatingMenu] = useState<FloatingMenuState>({
    open: false,
    x: 0,
    y: 0,
    mode: MenuModeEnum.SLASH,
    hasTextSelection: false,
  });

  const closeFloatingMenu = useCallback(() => {
    setFloatingMenu((prev) => ({
      ...prev,
      open: false,
    }));
    setSlashQuery(null);
  }, [setSlashQuery]);

  const openFloatingMenuAtViewportPoint = useCallback(
    (
      clientX: number,
      clientY: number,
      mode: MenuModeEnum,
      hasTextSelection: boolean,
    ) => {
      const editorRect = editorAreaRef.current?.getBoundingClientRect();

      if (!editorRect) {
        return;
      }

      const { x, y } = getBoundedMenuPosition(editorRect, clientX, clientY);

      setFloatingMenu({
        open: true,
        x,
        y,
        mode,
        hasTextSelection,
      });
    },
    [editorAreaRef],
  );

  return {
    openFloatingMenuAtViewportPoint,
    closeFloatingMenu,
    floatingMenu,
    setFloatingMenu,
  };
}
