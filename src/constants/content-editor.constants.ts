import type { PageCoverMeta } from '../types/pages.types';

export const DEFAULT_COVER_META: PageCoverMeta = {
  width: 100,
  height: 224,
  objectPositionX: 50,
  objectPositionY: 50,
};

export const MENU_SIDE_PADDING = 8;
export const MENU_MAX_WIDTH = 300;
export const IMAGE_RESIZE_HOTSPOT = 10;

// Must mirror the backend's accepted attachment mime types allowlist.
export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ACCEPTED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/octet-stream',
] as const;

export const ACCEPTED_ATTACHMENT_MIME_TYPES = [
  ...ACCEPTED_IMAGE_MIME_TYPES,
  ...ACCEPTED_DOCUMENT_MIME_TYPES,
] as const;

export const ACCEPTED_IMAGE_ACCEPT_ATTR = ACCEPTED_IMAGE_MIME_TYPES.join(',');
export const ACCEPTED_ATTACHMENT_ACCEPT_ATTR =
  ACCEPTED_ATTACHMENT_MIME_TYPES.join(',');

export const TEXT_COLOR_SWATCHES = [
  { name: 'Default', color: null },
  { name: 'Gray', color: '#6b7280' },
  { name: 'Brown', color: '#92400e' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Yellow', color: '#ca8a04' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Pink', color: '#db2777' },
  { name: 'Red', color: '#dc2626' },
] as const;

export const BG_COLOR_SWATCHES = [
  { name: 'Default', color: null },
  { name: 'Gray bg', color: '#d4d4d8' },
  { name: 'Brown bg', color: '#d6b89b' },
  { name: 'Orange bg', color: '#fdba74' },
  { name: 'Yellow bg', color: '#fde68a' },
  { name: 'Green bg', color: '#86efac' },
  { name: 'Blue bg', color: '#93c5fd' },
  { name: 'Purple bg', color: '#c4b5fd' },
  { name: 'Pink bg', color: '#f9a8d4' },
  { name: 'Red bg', color: '#fca5a5' },
] as const;

export enum ForsedTypeEnum {
  IMAGE = 'image',
  FILE = 'file',
}

export enum MenuModeEnum {
  SLASH = 'slash',
  CONTEXT = 'context',
}

export enum CoverResizeModeEnum {
  RIGHT = 'right',
  BOTTOM = 'bottom',
  CORNER = 'corner',
}

export enum ImageResizeDirectionEnum {
  INCREASE = 'increase',
  DECREASE = 'decrease',
}

export enum SaveStateEnum {
  SAVED = 'saved',
  SAVING = 'saving',
  ERROR = 'error',
}

export enum LinkPickerTypeEnum {
  PROJECT = 'project',
  PAGE = 'page',
}
