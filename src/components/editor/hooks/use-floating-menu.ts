'use client';

import { MenuModeEnum } from '@/src/constants/content-editor.constants';
import {
  getBoundedMenuPosition,
  getFixedMenuPosition,
} from '@/src/utils/content-editor.utils';
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
  placement?: 'absolute' | 'fixed';
  positionRootRef?: RefObject<HTMLElement | null>;
}

export function useFloatingMenu({
  setSlashQuery,
  editorAreaRef,
  placement = 'absolute',
  positionRootRef,
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
      if (placement === 'fixed') {
        const { x: viewportX, y: viewportY } = getFixedMenuPosition(
          clientX,
          clientY,
        );
        const rootRect = positionRootRef?.current?.getBoundingClientRect();

        setFloatingMenu({
          open: true,
          x: rootRect ? viewportX - rootRect.left : viewportX,
          y: rootRect ? viewportY - rootRect.top : viewportY,
          mode,
          hasTextSelection,
        });
        return;
      }

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
    [editorAreaRef, placement, positionRootRef],
  );

  return {
    openFloatingMenuAtViewportPoint,
    closeFloatingMenu,
    floatingMenu,
    setFloatingMenu,
  };
}
