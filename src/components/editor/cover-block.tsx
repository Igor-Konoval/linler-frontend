'use client';

import { PageCoverMeta } from '@/src/types/pages.types';
import { clamp } from '@/src/utils/content-editor.utils';
import { RefObject } from 'react';
import { Button } from '../ui/button';
import { ImageUp, Trash2 } from 'lucide-react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { CoverResizeModeEnum } from '@/src/constants/content-editor.constants';

interface CoverBlockProps {
  coverUrl: string | null;
  editable: boolean;
  coverContainerRef: RefObject<HTMLDivElement | null>;
  coverMeta: PageCoverMeta;
  title: string;
  openCoverPicker: () => void;
  isUploadingCover: boolean;
  startCoverResize: (
    event: ReactPointerEvent<HTMLButtonElement>,
    mode: CoverResizeModeEnum,
  ) => void;
  removeCover: () => void;
}

export function CoverBlock({
  coverUrl,
  editable,
  coverContainerRef,
  coverMeta,
  title,
  isUploadingCover,
  openCoverPicker,
  startCoverResize,
  removeCover,
}: CoverBlockProps) {
  return (
    (coverUrl || editable) && (
      <div className="mb-5">
        {coverUrl && (
          <div
            ref={coverContainerRef}
            className="group/cover relative mx-auto w-full overflow-visible"
          >
            <div
              className="relative mx-auto"
              style={{ width: `${clamp(coverMeta.width, 40, 100)}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={`${title || 'Page'} cover`}
                className="block w-full rounded-[14px] object-cover"
                style={{
                  height: `${clamp(coverMeta.height, 120, 620)}px`,
                  objectPosition: `${clamp(coverMeta.objectPositionX, 0, 100)}% ${clamp(coverMeta.objectPositionY, 0, 100)}%`,
                }}
              />

              {editable && (
                <>
                  <div className="absolute right-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-2 opacity-0 transition-opacity group-hover/cover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={openCoverPicker}
                      disabled={isUploadingCover}
                    >
                      <ImageUp className="size-4" />
                      Change cover
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={removeCover}
                      disabled={isUploadingCover}
                    >
                      <Trash2 className="size-4" />
                      Remove cover
                    </Button>
                  </div>

                  <button
                    type="button"
                    aria-label="Resize cover width"
                    className="absolute bottom-0 right-0 top-0 z-10 w-3 cursor-ew-resize touch-none opacity-0 transition-opacity group-hover/cover:opacity-100"
                    onPointerDown={(event) =>
                      startCoverResize(event, CoverResizeModeEnum.RIGHT)
                    }
                  >
                    <span className="bg-foreground/55 absolute bottom-4 right-1 top-4 w-px rounded-full" />
                  </button>
                  <button
                    type="button"
                    aria-label="Resize cover height"
                    className="absolute bottom-0 left-0 right-0 z-10 h-3 cursor-ns-resize touch-none opacity-0 transition-opacity group-hover/cover:opacity-100"
                    onPointerDown={(event) =>
                      startCoverResize(event, CoverResizeModeEnum.BOTTOM)
                    }
                  >
                    <span className="bg-foreground/55 absolute bottom-1 left-4 right-4 h-px rounded-full" />
                  </button>
                  <button
                    type="button"
                    aria-label="Resize cover"
                    className="bg-background/85 border-foreground/40 absolute bottom-2 right-2 z-10 size-3.5 cursor-nwse-resize touch-none rounded-sm border opacity-0 shadow-sm transition-opacity group-hover/cover:opacity-100"
                    onPointerDown={(event) =>
                      startCoverResize(event, CoverResizeModeEnum.CORNER)
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}

        {editable && !coverUrl && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCoverPicker}
              disabled={isUploadingCover}
            >
              <ImageUp className="size-4" />
              Add cover
            </Button>
          </div>
        )}
      </div>
    )
  );
}
