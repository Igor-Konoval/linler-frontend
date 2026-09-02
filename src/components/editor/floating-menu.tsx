'use client';

import {
  BG_COLOR_SWATCHES,
  TEXT_COLOR_SWATCHES,
} from '@/src/constants/content-editor.constants';
import { cn } from '@/src/utils/utils';
import { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { RefObject, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { type FloatingMenuState } from './hooks/use-floating-menu';
import {
  type LinkPickerItem,
  type QuickAction,
  type SlashCommand,
} from './hooks/use-floating-menu-content';

interface FloatingMenuProps {
  floatingMenu: FloatingMenuState;
  editable: boolean;
  floatingMenuRef: RefObject<HTMLDivElement | null>;
  quickActions: QuickAction[];
  runFloatingMenuAction: (command: () => void) => void;
  editor: Editor;
  slashQuery: string | null;
  slashCommands: SlashCommand[];
  isLinkPickerOpen: boolean;
  linkPickerQuery: string;
  setLinkPickerQuery: (value: string) => void;
  linkPickerItems: LinkPickerItem[];
  selectLinkPickerItem: (item: LinkPickerItem) => void;
  setExternalLinkFromPrompt: () => void;
  placement?: 'absolute' | 'fixed';
  portalTarget?: HTMLElement | null;
}

export function FloatingMenu({
  floatingMenu,
  editable,
  floatingMenuRef,
  quickActions,
  runFloatingMenuAction,
  editor,
  slashQuery,
  slashCommands,
  isLinkPickerOpen,
  linkPickerQuery,
  setLinkPickerQuery,
  linkPickerItems,
  selectLinkPickerItem,
  setExternalLinkFromPrompt,
  placement = 'absolute',
  portalTarget,
}: FloatingMenuProps) {
  const setTextColor = useCallback(
    (color: string | null) => {
      if (!editor) {
        return;
      }

      if (color) {
        editor.chain().focus().setColor(color).run();
        return;
      }

      editor.chain().focus().unsetColor().run();
    },
    [editor],
  );

  const setHighlightColor = useCallback(
    (color: string | null) => {
      if (!editor) {
        return;
      }

      if (color) {
        editor.chain().focus().setHighlight({ color }).run();
        return;
      }

      editor.chain().focus().unsetHighlight().run();
    },
    [editor],
  );

  const visibleSlashCommands = useMemo(
    () =>
      slashQuery === null
        ? slashCommands
        : slashCommands.filter((command) =>
            `${command.label} ${command.description}`
              .toLowerCase()
              .includes(slashQuery),
          ),
    [slashCommands, slashQuery],
  );

  const { currentTextColor, currentHighlightColor } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      const textStyleAttrs = currentEditor.getAttributes('textStyle') as Record<
        string,
        unknown
      >;
      const highlightAttrs = currentEditor.getAttributes('highlight') as Record<
        string,
        unknown
      >;

      return {
        currentTextColor:
          typeof textStyleAttrs.color === 'string'
            ? textStyleAttrs.color
            : null,
        currentHighlightColor:
          typeof highlightAttrs.color === 'string'
            ? highlightAttrs.color
            : null,
      };
    },
  });

  const menu =
    floatingMenu.open && editable ? (
      <div
        ref={floatingMenuRef}
        data-linler-floating-menu=""
        className={cn(
          'bg-popover max-w-75 pointer-events-auto w-full overflow-auto rounded-xl border p-2 shadow-xl',
          placement === 'fixed' && !portalTarget
            ? 'fixed z-[80]'
            : placement === 'fixed'
              ? 'absolute z-[80]'
              : 'absolute z-30',
        )}
        style={{
          left: floatingMenu.x,
          top: floatingMenu.y,
          maxHeight: '70vh',
        }}
      >
        <div className="mb-2 flex flex-wrap gap-1.5 border-b pb-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant={action.active ? 'secondary' : 'ghost'}
              size="icon-xs"
              aria-label={action.label}
              title={action.label}
              disabled={action.disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (action.keepMenuOpen) {
                  action.execute();
                  return;
                }

                runFloatingMenuAction(action.execute);
              }}
            >
              <action.icon className="size-4" />
            </Button>
          ))}
        </div>
        {isLinkPickerOpen && (
          <div className="mb-2 rounded-lg border p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Link to project or page</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onMouseDown={(event) => event.preventDefault()}
                onClick={setExternalLinkFromPrompt}
              >
                External URL
              </Button>
            </div>

            <Input
              value={linkPickerQuery}
              onChange={(event) => setLinkPickerQuery(event.target.value)}
              placeholder="Search projects and pages..."
              className="mb-2 h-8"
            />

            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {linkPickerItems.length > 0 ? (
                linkPickerItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      'hover:bg-accent flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left',
                      item.type === 'page' && 'pl-2',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectLinkPickerItem(item)}
                  >
                    <span className="min-w-0">
                      <span
                        className="block truncate text-sm"
                        style={{
                          paddingLeft:
                            item.type === 'page'
                              ? `${(item.depth ?? 0) * 12}px`
                              : 0,
                        }}
                      >
                        {item.title}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {item.type === 'project'
                          ? 'Project'
                          : `Page in ${item.subtitle}`}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground px-2 py-1.5 text-sm">
                  No matches found.
                </p>
              )}
            </div>
          </div>
        )}
        {floatingMenu.mode === 'context' && floatingMenu.hasTextSelection && (
          <div className="mb-2 rounded-lg border p-2">
            <div className="mb-1 text-xs font-medium">Text color</div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {TEXT_COLOR_SWATCHES.map((swatch) => {
                const isActive =
                  (swatch.color === null && currentTextColor === null) ||
                  (swatch.color !== null &&
                    currentTextColor?.toLowerCase() ===
                      swatch.color.toLowerCase());

                return (
                  <button
                    key={swatch.name}
                    type="button"
                    className={cn(
                      'flex h-7 min-w-7 items-center justify-center rounded-md border px-1 text-[11px] transition-colors',
                      isActive ? 'ring-ring ring-1' : '',
                    )}
                    title={swatch.name}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setTextColor(swatch.color)}
                  >
                    <span
                      className="font-semibold"
                      style={{
                        color: swatch.color ?? 'currentColor',
                      }}
                    >
                      A
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-1 text-xs font-medium">Background color</div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {BG_COLOR_SWATCHES.map((swatch) => {
                const isActive =
                  (swatch.color === null && currentHighlightColor === null) ||
                  (swatch.color !== null &&
                    currentHighlightColor?.toLowerCase() ===
                      swatch.color.toLowerCase());

                return (
                  <button
                    key={swatch.name}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-md border transition-colors',
                      isActive ? 'ring-ring ring-1' : '',
                    )}
                    title={swatch.name}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setHighlightColor(swatch.color)}
                    style={{
                      backgroundColor: swatch.color ?? 'transparent',
                    }}
                  />
                );
              })}
            </div>

            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setTextColor(null)}
              >
                Reset text
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setHighlightColor(null)}
              >
                Reset bg
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
        {visibleSlashCommands.length ? (
          visibleSlashCommands.map((command) => (
            <button
              key={command.label}
              type="button"
              className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runFloatingMenuAction(command.execute)}
            >
              <span className="bg-secondary flex size-8 items-center justify-center rounded-md">
                <command.icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">
                  {command.label}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {command.description}
                </span>
              </span>
            </button>
          ))
        ) : (
          <p className="text-muted-foreground px-3 py-2 text-sm">
            {slashQuery === null
              ? 'No commands found.'
              : `No block matches “${slashQuery}”`}
          </p>
        )}
      </div>
    ) : null;

  if (!menu) {
    return null;
  }

  if (placement === 'fixed' && typeof document !== 'undefined') {
    return createPortal(menu, portalTarget ?? document.body);
  }

  return menu;
}
