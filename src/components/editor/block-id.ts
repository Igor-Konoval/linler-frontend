import { Extension } from '@tiptap/core';
import type { ResolvedPos } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const BLOCK_ID_TYPES = [
  'paragraph',
  'heading',
  'blockquote',
  'codeBlock',
  'bulletList',
  'orderedList',
  'taskList',
  'table',
  'image',
  'callout',
  'file',
  'attachment',
  'horizontalRule',
] as const;

const AWARENESS_BLOCK_TYPES = new Set([
  'paragraph',
  'heading',
  'codeBlock',
  'image',
  'file',
  'attachment',
  'horizontalRule',
  'callout',
]);

export function getAwarenessBlockId($from: ResolvedPos): string | null {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);

    if (!AWARENESS_BLOCK_TYPES.has(node.type.name)) {
      continue;
    }

    const blockId = node.attrs.blockId as string | null | undefined;

    if (blockId) {
      return blockId;
    }
  }

  const after = $from.nodeAfter;
  const afterId = after?.attrs.blockId as string | null | undefined;

  if (after && AWARENESS_BLOCK_TYPES.has(after.type.name) && afterId) {
    return afterId;
  }

  return null;
}

function isBlockIdType(typeName: string): boolean {
  return BLOCK_ID_TYPES.includes(typeName as (typeof BLOCK_ID_TYPES)[number]);
}

export const BlockId = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: [...BLOCK_ID_TYPES],
        attributes: {
          blockId: {
            default: null,
            keepOnSplit: false,
            parseHTML: (element) => element.getAttribute('data-block-id'),
            renderHTML: (attributes: { blockId?: string | null }) => {
              if (!attributes.blockId) {
                return {};
              }

              return { 'data-block-id': attributes.blockId };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockId'),
        appendTransaction: (transactions, _oldState, newState) => {
          const hasDocChange = transactions.some(
            (transaction) => transaction.docChanged,
          );
          const shouldEnsureIds =
            hasDocChange ||
            transactions.some((transaction) =>
              transaction.getMeta('ensureBlockIds'),
            );

          if (!shouldEnsureIds) {
            return null;
          }

          const transaction = newState.tr;
          const seenIds = new Set<string>();
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (!isBlockIdType(node.type.name)) {
              return;
            }

            const currentId = node.attrs.blockId as string | null;

            if (currentId && !seenIds.has(currentId)) {
              seenIds.add(currentId);
              return;
            }

            if (currentId && !hasDocChange) {
              return;
            }

            const nextId = crypto.randomUUID();
            seenIds.add(nextId);
            transaction.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              blockId: nextId,
            });
            modified = true;
          });

          if (!modified) {
            return null;
          }

          if (!hasDocChange) {
            transaction.setMeta('skipSave', true);
          }

          transaction.setMeta('addToHistory', false);
          return transaction;
        },
      }),
    ];
  },

  onCreate() {
    this.editor.view.dispatch(
      this.editor.state.tr
        .setMeta('ensureBlockIds', true)
        .setMeta('addToHistory', false),
    );
  },
});
