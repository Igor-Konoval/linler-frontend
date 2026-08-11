import { mergeAttributes, Node } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import type { DOMOutputSpec } from '@tiptap/pm/model';

export type LinkChipType = 'project' | 'page' | 'external';

type LinkChipHtmlAttributes = {
  href?: string;
  label?: string;
  linkType?: LinkChipType;
};

export const LinkChip = Node.create({
  name: 'linkChip',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      href: {
        default: '',
        parseHTML: (element) => element.getAttribute('href') ?? '',
        renderHTML: (attributes: LinkChipHtmlAttributes) => ({
          href: attributes.href || '',
        }),
      },
      label: {
        default: '',
        parseHTML: (element) =>
          element.getAttribute('data-label') ?? element.textContent ?? '',
        renderHTML: () => ({}),
      },
      linkType: {
        default: 'external',
        parseHTML: (element) =>
          (element.getAttribute('data-link-type') as LinkChipType | null) ??
          'external',
        renderHTML: (attributes: LinkChipHtmlAttributes) => ({
          'data-link-type': attributes.linkType ?? 'external',
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-type="link-chip"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = node.attrs as LinkChipHtmlAttributes;
    const isExternal = (attrs.linkType ?? 'external') === 'external';

    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'link-chip',
        'data-label': attrs.label ?? '',
        class: 'linler-link-chip',
        target: isExternal ? '_blank' : null,
        rel: isExternal ? 'noreferrer' : null,
      }),
      ['span', { class: 'linler-link-chip-icon' }],
      ['span', { class: 'linler-link-chip-label' }, attrs.label ?? ''],
    ] as DOMOutputSpec;
  },
});

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      tone: {
        default: 'blue',
        parseHTML: (element) => element.getAttribute('data-tone') ?? 'blue',
        renderHTML: (attributes) => ({ 'data-tone': attributes.tone }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        class: 'linler-callout',
      }),
      0,
    ];
  },
});

type AttachmentHtmlAttributes = {
  attachmentId?: string | null;
  href?: string;
  title?: string;
  name?: string;
  width?: number | string | null;
  height?: number | string | null;
};

export const AttachmentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      attachmentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-attachment-id'),
        renderHTML: (attributes: AttachmentHtmlAttributes) =>
          attributes.attachmentId
            ? { 'data-attachment-id': attributes.attachmentId }
            : {},
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-width');

          if (!value) {
            return null;
          }

          const parsed = Number.parseInt(value, 10);
          return Number.isNaN(parsed) ? null : parsed;
        },
        renderHTML: (attributes: AttachmentHtmlAttributes) => {
          if (
            typeof attributes.width !== 'number' ||
            !Number.isFinite(attributes.width)
          ) {
            return {};
          }

          return {
            'data-width': String(Math.max(80, Math.round(attributes.width))),
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-height');

          if (!value) {
            return null;
          }

          const parsed = Number.parseInt(value, 10);
          return Number.isNaN(parsed) ? null : parsed;
        },
        renderHTML: (attributes: AttachmentHtmlAttributes) => {
          if (
            typeof attributes.height !== 'number' ||
            !Number.isFinite(attributes.height)
          ) {
            return {};
          }

          return {
            'data-height': String(Math.max(80, Math.round(attributes.height))),
          };
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    // node.attrs, not HTMLAttributes: per-attribute renderHTML only emits data-width/data-height.
    const attrs = node.attrs as AttachmentHtmlAttributes;
    const styleParts: string[] = [];

    if (typeof attrs.width === 'number' && Number.isFinite(attrs.width)) {
      styleParts.push(`width: ${Math.max(80, Math.round(attrs.width))}px`);
    }

    if (typeof attrs.height === 'number' && Number.isFinite(attrs.height)) {
      styleParts.push(`height: ${Math.max(80, Math.round(attrs.height))}px`);
    }

    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        style: styleParts.join('; '),
      }),
    ];
  },
});

function renderFileNode(
  htmlAttributes: Record<string, unknown>,
  nodeType: 'file' | 'attachment',
): DOMOutputSpec {
  const attributes = htmlAttributes as AttachmentHtmlAttributes;

  const href =
    typeof attributes.href === 'string' && attributes.href.length > 0
      ? attributes.href
      : '#';
  const title =
    typeof attributes.title === 'string' && attributes.title.length > 0
      ? attributes.title
      : typeof attributes.name === 'string' && attributes.name.length > 0
        ? attributes.name
        : 'Attachment';

  return [
    'a',
    mergeAttributes(htmlAttributes, {
      'data-type': nodeType,
      class: 'linler-file',
      href,
      target: '_blank',
      rel: 'noreferrer',
      'data-attachment-id':
        typeof attributes.attachmentId === 'string'
          ? attributes.attachmentId
          : undefined,
    }),
    title,
  ] as DOMOutputSpec;
}

function getAttachmentAttributes() {
  return {
    attachmentId: { default: null },
    title: { default: '' },
    href: { default: '' },
    mimeType: { default: '' },
    fileSize: { default: null },
  };
}

export const FileAttachment = Node.create({
  name: 'file',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return getAttachmentAttributes();
  },

  parseHTML() {
    return [{ tag: 'a[data-type="file"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return renderFileNode(HTMLAttributes, 'file');
  },
});

export const Attachment = Node.create({
  name: 'attachment',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      ...getAttachmentAttributes(),
      name: { default: 'Attachment' },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-type="attachment"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return renderFileNode(HTMLAttributes, 'attachment');
  },
});
