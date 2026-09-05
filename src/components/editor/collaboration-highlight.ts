import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export type RemoteBlockAwareness = {
  userId: string;
  username: string;
  color: string;
  blockId: string;
};

const awarenessPluginKey = new PluginKey<DecorationSet>('pageAwareness');

function buildDecorations(
  doc: ProseMirrorNode,
  users: RemoteBlockAwareness[],
): DecorationSet {
  if (users.length === 0) {
    return DecorationSet.empty;
  }

  const usersByBlockId = new Map<string, RemoteBlockAwareness[]>();

  for (const user of users) {
    if (!user.blockId) {
      continue;
    }

    const current = usersByBlockId.get(user.blockId) ?? [];
    current.push(user);
    usersByBlockId.set(user.blockId, current);
  }

  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    const blockId = node.attrs.blockId as string | null | undefined;

    if (!blockId) {
      return;
    }

    const blockUsers = usersByBlockId.get(blockId);

    if (!blockUsers?.length) {
      return;
    }

    const latest = blockUsers[blockUsers.length - 1];

    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        class: 'collab-block',
        style: `--collab-color: ${latest.color}`,
      }),
    );

    if (!node.isTextblock && node.type.name !== 'callout') {
      return;
    }

    decorations.push(
      Decoration.widget(
        pos + 1,
        () => {
          const label = document.createElement('span');
          label.className = 'collab-block-label';
          label.textContent = blockUsers
            .map((user) => user.username)
            .join(', ');
          label.style.backgroundColor = latest.color;
          return label;
        },
        {
          side: -1,
          ignoreSelection: true,
          key: `collab-label-${blockId}`,
        },
      ),
    );
  });

  return DecorationSet.create(doc, decorations);
}

export const CollaborationHighlight = Extension.create({
  name: 'collaborationHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin<DecorationSet>({
        key: awarenessPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (transaction, value, _oldState, newState) => {
            const next = transaction.getMeta('pageAwareness') as
              | RemoteBlockAwareness[]
              | undefined;

            if (next) {
              return buildDecorations(newState.doc, next);
            }

            if (transaction.docChanged) {
              return value.map(transaction.mapping, newState.doc);
            }

            return value;
          },
        },
        props: {
          decorations: (state) => awarenessPluginKey.getState(state),
        },
      }),
    ];
  },
});
