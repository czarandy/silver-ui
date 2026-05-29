/* eslint-disable jsx-a11y-x/no-noninteractive-element-interactions */

import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {useIsomorphicLayoutEffect} from '../../internal/useIsomorphicLayoutEffect';
import {Button} from '../Button';

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

const styles = {
  dialog: css({
    position: 'fixed',
    inset: 0,
    w: '100dvw',
    h: '100dvh',
    maxW: 'none',
    maxH: 'none',
    m: 0,
    p: 0,
    borderWidth: 0,
    bg: 'transparent',
    overflow: 'hidden',
    outline: 'none',
    _backdrop: {
      bg: 'rgba(0, 0, 0, 0.76)',
      backdropFilter: 'blur(2px)',
    },
  }),
  container: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'full',
    h: 'full',
    p: '8',
  }),
  mediaGroup: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxW: 'full',
    maxH: 'full',
    minH: 0,
  }),
  mediaWrap: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minH: 0,
    userSelect: 'none',
  }),
  zoomable: css({cursor: 'zoom-in'}),
  zoomed: css({cursor: 'grab'}),
  dragging: css({cursor: 'grabbing'}),
  image: css({
    display: 'block',
    maxW: '100%',
    maxH: 'calc(100dvh - 7rem)',
    objectFit: 'contain',
    pointerEvents: 'none',
    transitionProperty: 'transform',
    transitionDuration: 'normal',
    transitionTimingFunction: 'default',
  }),
  imageDragging: css({transitionProperty: 'none'}),
  video: css({
    maxW: '100%',
    maxH: 'calc(100dvh - 7rem)',
    objectFit: 'contain',
    outline: 'none',
  }),
  caption: css({
    maxW: '150',
    px: '3',
    pt: '2',
    color: 'white',
    fontFamily: 'body',
    fontSize: 'lg',
    lineHeight: 'normal',
    textAlign: 'center',
  }),
  close: css({
    position: 'absolute',
    top: '3',
    right: '3',
    zIndex: 1,
  }),
  nav: css({
    position: 'absolute',
    top: '50%',
    zIndex: 1,
    transform: 'translateY(-50%)',
  }),
  prev: css({left: '3'}),
  next: css({right: '3'}),
  counter: css({
    position: 'absolute',
    top: '3',
    left: '3',
    zIndex: 1,
    color: 'white',
    fontFamily: 'body',
    fontSize: 'md',
  }),
} as const;

function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
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
  const mediaItems: ReadonlyArray<LightboxMedia> = Array.isArray(media)
    ? media
    : [media];
  const currentIndex = Math.min(index, mediaItems.length - 1);
  const currentItem = mediaItems[currentIndex] ?? mediaItems[0];
  const isGallery = mediaItems.length > 1;
  const isVideo = (currentItem.type ?? 'image') === 'video';
  const canPrev = isGallery && currentIndex > 0;
  const canNext = isGallery && currentIndex < mediaItems.length - 1;
  const imageTransform =
    zoom === 1
      ? undefined
      : `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`;

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
  }, [currentIndex, currentItem.src]);

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

  const close = () => onOpenChange(false);
  const goPrev = () => {
    if (canPrev) {
      setIndex(currentIndex - 1);
    }
  };
  const goNext = () => {
    if (canNext) {
      setIndex(currentIndex + 1);
    }
  };

  return (
    <dialog
      aria-label={currentItem.alt}
      className={cx(styles.dialog, className)}
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
      <div className={styles.container}>
        <div className={styles.close}>
          <Button
            icon={X}
            isIconOnly
            label="Close"
            onClick={close}
            variant="secondary"
          />
        </div>
        {canPrev ? (
          <div className={cx(styles.nav, styles.prev)}>
            <Button
              icon={ChevronLeft}
              isIconOnly
              label="Previous image"
              onClick={goPrev}
              variant="secondary"
            />
          </div>
        ) : null}
        <div className={styles.mediaGroup}>
          {/* eslint-disable-next-line jsx-a11y-x/no-static-element-interactions -- media viewport supports image zoom/pan gestures */}
          <div
            className={cx(
              styles.mediaWrap,
              !isVideo && hasZoom && zoom === 1 ? styles.zoomable : undefined,
              !isVideo && zoom > 1 ? styles.zoomed : undefined,
              isDragging ? styles.dragging : undefined,
            )}
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
              <video
                aria-label={currentItem.alt}
                autoPlay={hasAutoPlay}
                className={styles.video}
                controls
                src={currentItem.src}>
                <track kind="captions" />
              </video>
            ) : (
              <img
                alt={currentItem.alt}
                className={cx(
                  styles.image,
                  isDragging ? styles.imageDragging : undefined,
                )}
                draggable={false}
                src={currentItem.src}
                style={{transform: imageTransform}}
              />
            )}
          </div>
          {currentItem.caption != null ? (
            <div className={styles.caption}>{currentItem.caption}</div>
          ) : null}
        </div>
        {canNext ? (
          <div className={cx(styles.nav, styles.next)}>
            <Button
              icon={ChevronRight}
              isIconOnly
              label="Next image"
              onClick={goNext}
              variant="secondary"
            />
          </div>
        ) : null}
        {isGallery ? (
          <div className={styles.counter}>
            {currentIndex + 1} / {mediaItems.length}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

Lightbox.displayName = 'Lightbox';
