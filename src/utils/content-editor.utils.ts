import type { Node as PMNode } from '@tiptap/pm/model';
import {
  IMAGE_RESIZE_HOTSPOT,
  IMAGE_RESIZE_HOTSPOT_TOUCH,
  MENU_MAX_WIDTH,
  MENU_SIDE_PADDING,
} from '../constants/content-editor.constants';
import type {
  PageAttachment,
  PageCoverMeta,
  PageResponse,
  TiptapDocument,
  UpdatePageRequest,
} from '../types/pages.types';

export type ImageResizeMode = 'right' | 'bottom' | 'corner';

export type EditorResizeState = {
  mode: 'left' | 'right';
  startX: number;
  startLeft: number;
  startWidth: number;
  containerWidth: number;
};

export type PagePatchKey = keyof UpdatePageRequest;

export type LayoutState = {
  coverMeta: PageCoverMeta;
  editorContentWidth: number | null;
  editorContentOffsetX: number | null;
};

export function toPageStamp(updatedAt: string | Date): string {
  return typeof updatedAt === 'string'
    ? updatedAt
    : new Date(updatedAt).toISOString();
}

export function getPageApplyFingerprint(page: PageResponse): string {
  return JSON.stringify({
    updatedAt: toPageStamp(page.updatedAt),
    title: page.title,
    cover: page.cover,
    coverMeta: page.coverMeta,
    content: page.content,
    contentWidth: page.contentWidth,
    contentOffsetX: page.contentOffsetX,
    width: page.width,
    height: page.height,
  });
}

export function buildPagePatchPayload(
  state: LayoutState,
  changedKeys: Set<PagePatchKey>,
  changedPayload: UpdatePageRequest,
): UpdatePageRequest {
  const payload: UpdatePageRequest = { ...changedPayload };

  const effectiveCoverMeta =
    payload.coverMeta && payload.coverMeta !== null
      ? payload.coverMeta
      : state.coverMeta;

  const width = clamp(payload.width ?? effectiveCoverMeta.width, 40, 100);
  const height = clamp(payload.height ?? effectiveCoverMeta.height, 120, 620);
  const objectPositionX = clamp(
    payload.objectPositionX ?? effectiveCoverMeta.objectPositionX,
    0,
    100,
  );
  const objectPositionY = clamp(
    payload.objectPositionY ?? effectiveCoverMeta.objectPositionY,
    0,
    100,
  );

  const effectiveEditorMeta =
    payload.editorMeta && payload.editorMeta !== null
      ? payload.editorMeta
      : null;

  const draftContentWidth =
    payload.contentWidth ??
    effectiveEditorMeta?.contentWidth ??
    state.editorContentWidth;
  const draftContentOffsetX =
    payload.contentOffsetX ??
    effectiveEditorMeta?.contentOffsetX ??
    state.editorContentOffsetX;

  const contentWidth =
    draftContentWidth !== null
      ? Math.round(clamp(draftContentWidth, 320, 2200))
      : null;
  const contentOffsetX =
    draftContentOffsetX !== null && draftContentOffsetX !== undefined
      ? Math.round(Math.max(0, draftContentOffsetX))
      : null;

  const coverLayoutChanged =
    changedKeys.has('coverMeta') ||
    changedKeys.has('width') ||
    changedKeys.has('height') ||
    changedKeys.has('objectPositionX') ||
    changedKeys.has('objectPositionY');

  if (coverLayoutChanged) {
    payload.width = width;
    payload.height = height;
    payload.objectPositionX = objectPositionX;
    payload.objectPositionY = objectPositionY;

    if (payload.coverMeta !== null) {
      payload.coverMeta = {
        width,
        height,
        objectPositionX,
        objectPositionY,
      };
    }
  }

  const editorLayoutChanged =
    changedKeys.has('editorMeta') ||
    changedKeys.has('contentWidth') ||
    changedKeys.has('contentOffsetX');

  if (editorLayoutChanged) {
    if (contentWidth !== null) {
      payload.contentWidth = contentWidth;
    }

    if (contentOffsetX !== null) {
      payload.contentOffsetX = contentOffsetX;
    }

    if (payload.editorMeta === null) {
      payload.editorMeta = null;
    } else if (contentWidth !== null) {
      payload.editorMeta = {
        contentWidth,
        contentOffsetX: contentOffsetX ?? 0,
      };
    }
  }

  return payload;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getNumberAttr(
  attrs: Record<string, unknown>,
  key: string,
): number | null {
  const value = attrs[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function isDocument(content: TiptapDocument): TiptapDocument {
  return content?.type === 'doc' ? content : { type: 'doc', content: [] };
}

export function isImageMimeType(mimeType: string | null | undefined): boolean {
  return typeof mimeType === 'string' && mimeType.startsWith('image/');
}

export function getAttachmentUrl(attachment: PageAttachment): string {
  return attachment.fullUrl || attachment.fileUrl;
}

export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return null;
    }
  }
}

export function getBoundedMenuPosition(
  editorRect: DOMRect,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const maxMenuHeight = Math.max(
    220,
    Math.min(
      window.innerHeight * 0.7,
      editorRect.height - MENU_SIDE_PADDING * 2,
    ),
  );

  let x = clientX - editorRect.left;
  let y = clientY - editorRect.top + 8;

  if (x + MENU_MAX_WIDTH + MENU_SIDE_PADDING > editorRect.width) {
    x -= MENU_MAX_WIDTH;
  }

  if (y + maxMenuHeight + MENU_SIDE_PADDING > editorRect.height) {
    y -= maxMenuHeight;
  }

  x = clamp(
    x,
    MENU_SIDE_PADDING,
    Math.max(
      MENU_SIDE_PADDING,
      editorRect.width - MENU_MAX_WIDTH - MENU_SIDE_PADDING,
    ),
  );
  y = clamp(
    y,
    MENU_SIDE_PADDING,
    Math.max(
      MENU_SIDE_PADDING,
      editorRect.height - maxMenuHeight - MENU_SIDE_PADDING,
    ),
  );

  return { x, y };
}

export function isCoarsePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

export function getImageResizeHotspot(): number {
  return isCoarsePointer() ? IMAGE_RESIZE_HOTSPOT_TOUCH : IMAGE_RESIZE_HOTSPOT;
}

export function getImageResizeMode(
  rect: DOMRect,
  clientX: number,
  clientY: number,
): ImageResizeMode | null {
  const hotspot = getImageResizeHotspot();
  const nearRight = rect.right - clientX <= hotspot;
  const nearBottom = rect.bottom - clientY <= hotspot;

  if (nearRight && nearBottom) {
    return 'corner';
  }

  if (nearRight) {
    return 'right';
  }

  if (nearBottom) {
    return 'bottom';
  }

  return null;
}

export function resolveAtomNodePos(
  doc: PMNode,
  pos: number,
  typeNames: string[],
): number | null {
  const candidates = [pos, pos - 1, pos + 1];

  for (const candidate of candidates) {
    if (candidate < 0) {
      continue;
    }

    const node = doc.nodeAt(candidate);
    if (node && typeNames.includes(node.type.name)) {
      return candidate;
    }
  }

  return null;
}

export function resolveImageNodePos(doc: PMNode, pos: number): number | null {
  return resolveAtomNodePos(doc, pos, ['image']);
}

export function toAttachmentMap(
  attachments: PageAttachment[],
): Record<string, PageAttachment> {
  return attachments.reduce<Record<string, PageAttachment>>(
    (accumulator, attachment) => {
      accumulator[attachment.id] = attachment;
      return accumulator;
    },
    {},
  );
}

export function mapDocumentNodes(
  nodes: Array<Record<string, unknown>>,
  mapNode: (node: Record<string, unknown>) => Record<string, unknown>,
): Array<Record<string, unknown>> {
  return nodes.map((node) => {
    const mappedNode = mapNode(node);
    const content = mappedNode.content;

    if (!Array.isArray(content)) {
      return mappedNode;
    }

    return {
      ...mappedNode,
      content: mapDocumentNodes(
        content.filter(
          (item): item is Record<string, unknown> =>
            typeof item === 'object' && item !== null,
        ),
        mapNode,
      ),
    };
  });
}

export function hydrateContentWithAttachments(
  content: TiptapDocument,
  attachmentsById: Record<string, PageAttachment>,
): TiptapDocument {
  const document = isDocument(content);

  return {
    ...document,
    content: mapDocumentNodes(document.content ?? [], (node) => {
      const attrs =
        typeof node.attrs === 'object' && node.attrs !== null
          ? (node.attrs as Record<string, unknown>)
          : {};
      const attachmentId =
        typeof attrs.attachmentId === 'string' ? attrs.attachmentId : null;

      if (!attachmentId) {
        return node;
      }

      const attachment = attachmentsById[attachmentId];

      if (!attachment) {
        return node;
      }

      if (node.type === 'image') {
        return {
          ...node,
          attrs: {
            ...attrs,
            src: getAttachmentUrl(attachment),
            alt:
              typeof attrs.alt === 'string' && attrs.alt.length > 0
                ? attrs.alt
                : attachment.originalName,
          },
        };
      }

      if (node.type === 'file' || node.type === 'attachment') {
        return {
          ...node,
          attrs: {
            ...attrs,
            href: getAttachmentUrl(attachment),
            title:
              typeof attrs.title === 'string' && attrs.title.length > 0
                ? attrs.title
                : attachment.originalName,
            mimeType: attachment.mimeType,
            fileSize: attachment.fileSize,
          },
        };
      }

      return node;
    }),
  };
}

export function sanitizeContentForSave(
  content: TiptapDocument,
): TiptapDocument {
  const document = isDocument(content);

  return {
    ...document,
    content: mapDocumentNodes(document.content ?? [], (node) => {
      const attrs =
        typeof node.attrs === 'object' && node.attrs !== null
          ? (node.attrs as Record<string, unknown>)
          : {};
      const attachmentId =
        typeof attrs.attachmentId === 'string' ? attrs.attachmentId : null;

      if (!attachmentId) {
        return node;
      }

      if (node.type === 'image') {
        const nextAttrs: Record<string, unknown> = { attachmentId };

        if (typeof attrs.alt === 'string' && attrs.alt.length > 0) {
          nextAttrs.alt = attrs.alt;
        }

        if (typeof attrs.title === 'string' && attrs.title.length > 0) {
          nextAttrs.title = attrs.title;
        }

        const width = getNumberAttr(attrs, 'width');
        const height = getNumberAttr(attrs, 'height');

        if (width !== null) {
          nextAttrs.width = clamp(width, 80, 2200);
        }

        if (height !== null) {
          nextAttrs.height = clamp(height, 80, 2200);
        }

        return {
          ...node,
          attrs: nextAttrs,
        };
      }

      if (node.type === 'file') {
        const nextAttrs: Record<string, unknown> = { attachmentId };

        if (typeof attrs.title === 'string' && attrs.title.length > 0) {
          nextAttrs.title = attrs.title;
        }

        return {
          ...node,
          attrs: nextAttrs,
        };
      }

      return node;
    }),
  };
}
