/* eslint-disable jsx-a11y-x/no-noninteractive-element-interactions */

import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {lightboxRecipe} from 'components/Lightbox/Lightbox.recipe';
import {cx} from 'internal/cx';
import isReactNode from '../../internal/isReactNode';
import {mergeRefs} from '../../internal/mergeRefs';
import {useIsomorphicLayoutEffect} from '../../internal/useIsomorphicLayoutEffect';
import {useScrollLock} from '../../internal/useScrollLock';

export type LightboxMediaType = 'image' | 'video';

export interface LightboxMedia {
  /**
   * Accessible image alt text, or video label.
   */
  alt: string;
  /**
   * Optional caption shown below the media.
   */
  caption?: ReactNode;
  /**
   * Optional WebVTT captions source for video media.
   */
  captionsSrc?: string;
  /**
   * Media source URL.
   */
  src: string;
  /**
   * Media type.
   * @default 'image'
   */
  type?: LightboxMediaType;
}

export interface LightboxProps {
  /**
   * Additional CSS class names applied to the dialog.
   */
  className?: string;
  /**
   * Test ID applied to the dialog.
   */
  'data-testid'?: string;
  /**
   * Initial gallery index for uncontrolled usage.
   * @default 0
   */
  defaultIndex?: number;
  /**
   * Whether videos autoplay when opened.
   * @default false
   */
  hasAutoPlay?: boolean;
  /**
   * Whether images can be double-clicked to zoom.
   * @default false
   */
  hasZoom?: boolean;
  /**
   * Controlled gallery index.
   */
  index?: number;
  /**
   * Whether the lightbox is open.
   */
  isOpen: boolean;
  /**
   * Media to display.
   */
  media: LightboxMedia | ReadonlyArray<LightboxMedia>;
  /**
   * Called when gallery index changes.
   */
  onIndexChange?: (index: number) => void;
  /**
   * Called when the lightbox requests an open-state change.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the dialog element.
   */
  ref?: Ref<HTMLDialogElement>;
  /**
   * Inline styles applied to the dialog.
   */
  style?: CSSProperties;
}

function isMediaArray(
  media: LightboxMedia | ReadonlyArray<LightboxMedia>,
): media is ReadonlyArray<LightboxMedia> {
  return Array.isArray(media);
}

/**
 * Fullscreen dialog for viewing image or video media, with optional gallery navigation.
 */
export function Lightbox({
  className,
  'data-testid': dataTestId,
  defaultIndex = 0,
  hasAutoPlay = false,
  hasZoom = false,
  index: indexFromProps,
  isOpen,
  media,
  onIndexChange,
  onOpenChange,
  ref,
  style,
}: LightboxProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({x: 0, y: 0, panX: 0, panY: 0});
  const isControlled = indexFromProps !== undefined;
  const index = isControlled ? indexFromProps : uncontrolledIndex;
  const mediaItems: ReadonlyArray<LightboxMedia> = useMemo(
    () => (isMediaArray(media) ? media : [media]),
    [media],
  );
  const currentIndex =
    mediaItems.length === 0
      ? 0
      : Math.min(Math.max(index, 0), mediaItems.length - 1);
  const currentItem =
    mediaItems.length === 0 ? undefined : mediaItems[currentIndex];
  const hasMedia = currentItem != null;
  const isGallery = mediaItems.length > 1;
  const isVideo = (currentItem?.type ?? 'image') === 'video';
  const canPrev = isGallery && currentIndex > 0;
  const canNext = isGallery && currentIndex < mediaItems.length - 1;
  const imageTransform =
    zoom === 1
      ? undefined
      : `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`;
  const cursor = isDragging
    ? 'dragging'
    : !isVideo && zoom > 1
      ? 'zoomed'
      : !isVideo && hasZoom && zoom === 1
        ? 'zoomable'
        : 'default';
  const classes = lightboxRecipe({cursor, isDragging});

  useScrollLock(isOpen);

  const setIndex = useCallback(
    (nextIndex: number) => {
      if (!isControlled) {
        setUncontrolledIndex(nextIndex);
      }
      onIndexChange?.(nextIndex);
    },
    [isControlled, onIndexChange],
  );

  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setZoom(1);
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setPan({x: 0, y: 0});
  }, [currentIndex, currentItem?.src, isOpen]);

  useEffect(() => {
    if (!isGallery) {
      return;
    }

    for (const nextIndex of [currentIndex - 1, currentIndex + 1]) {
      if (nextIndex < 0 || nextIndex >= mediaItems.length) {
        continue;
      }
      const item = mediaItems[nextIndex];
      if (item.type === 'video') {
        continue;
      }

      const image = new Image();
      image.src = item.src;
    }
  }, [currentIndex, isGallery, mediaItems]);

  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }
    if (isOpen && !dialog.open) {
      triggerRef.current = document.activeElement;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const handlePointerMove = (event: PointerEvent) => {
      setPan({
        x: dragStartRef.current.panX + event.clientX - dragStartRef.current.x,
        y: dragStartRef.current.panY + event.clientY - dragStartRef.current.y,
      });
    };
    const handlePointerUp = () => setIsDragging(false);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const goPrev = useCallback(() => {
    if (canPrev) {
      setIndex(currentIndex - 1);
    }
  }, [canPrev, currentIndex, setIndex]);
  const goNext = useCallback(() => {
    if (canNext) {
      setIndex(currentIndex + 1);
    }
  }, [canNext, currentIndex, setIndex]);

  return (
    <dialog
      aria-label="Media lightbox"
      className={cx(classes.dialog, className)}
      data-testid={dataTestId}
      onCancel={event => {
        event.preventDefault();
        close();
      }}
      onClick={(event: ReactMouseEvent<HTMLDialogElement>) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
        }
      }}
      ref={mergeRefs(ref, dialogRef)}
      style={style}>
      <div className={classes.container}>
        <div className={classes.close}>
          <Button
            className={classes.controlButton}
            icon={X}
            isIconOnly
            label="Close"
            onClick={close}
          />
        </div>
        {canPrev ? (
          <div className={lightboxRecipe({position: 'prev'}).nav}>
            <Button
              className={classes.controlButton}
              icon={ChevronLeft}
              isIconOnly
              label="Previous"
              onClick={goPrev}
            />
          </div>
        ) : null}
        {hasMedia ? (
          <div className={classes.mediaGroup}>
            {/* eslint-disable-next-line jsx-a11y-x/no-static-element-interactions -- media viewport supports image zoom/pan gestures */}
            <div
              className={classes.mediaWrap}
              onDoubleClick={() => {
                if (!hasZoom || isVideo) {
                  return;
                }
                setZoom(zoom === 1 ? 2 : 1);
                setPan({x: 0, y: 0});
              }}
              onPointerDown={event => {
                if (!hasZoom || isVideo || zoom <= 1) {
                  return;
                }
                setIsDragging(true);
                dragStartRef.current = {
                  x: event.clientX,
                  y: event.clientY,
                  panX: pan.x,
                  panY: pan.y,
                };
              }}>
              {isVideo ? (
                // eslint-disable-next-line jsx-a11y-x/media-has-caption -- captions are rendered only when callers provide a real WebVTT source
                <video
                  aria-label={currentItem.alt}
                  autoPlay={hasAutoPlay}
                  className={classes.video}
                  controls
                  src={currentItem.src}>
                  {currentItem.captionsSrc != null ? (
                    <track
                      kind="captions"
                      label="Captions"
                      src={currentItem.captionsSrc}
                    />
                  ) : null}
                </video>
              ) : (
                <img
                  alt={currentItem.alt}
                  className={classes.image}
                  draggable={false}
                  src={currentItem.src}
                  style={{transform: imageTransform}}
                />
              )}
            </div>
            {isReactNode(currentItem.caption) ? (
              <div className={classes.caption}>{currentItem.caption}</div>
            ) : null}
          </div>
        ) : null}
        {canNext ? (
          <div className={lightboxRecipe({position: 'next'}).nav}>
            <Button
              className={classes.controlButton}
              icon={ChevronRight}
              isIconOnly
              label="Next"
              onClick={goNext}
            />
          </div>
        ) : null}
        {isGallery ? (
          <div className={classes.counter}>
            {currentIndex + 1} / {mediaItems.length}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

Lightbox.displayName = 'Lightbox';
