import {ImageIcon, X} from 'lucide-react';
import {useState, type CSSProperties, type MouseEvent, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Skeleton} from '../Skeleton';
import {Spinner} from '../Spinner';
import {Tooltip} from '../Tooltip';

export interface ThumbnailProps {
  /**
   * Alt text for the image.
   */
  alt?: string;
  /**
   * Additional CSS class names applied to the root.
   */
  className?: string;
  /**
   * Test ID applied to the root.
   */
  'data-testid'?: string;
  /**
   * Whether the thumbnail is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the thumbnail is loading.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Accessible label and tooltip text.
   */
  label?: string;
  /**
   * Called when the thumbnail image area is clicked.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Called when the remove button is clicked.
   */
  onRemove?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Image source.
   */
  src?: string;
  /**
   * Inline styles applied to the root.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    w: '16',
    flexShrink: 0,
    isolation: 'isolate',
  }),
  disabled: css({
    opacity: 0.5,
    pointerEvents: 'none',
  }),
  imageContainer: css({
    position: 'relative',
    w: 'full',
    aspectRatio: '1',
    borderRadius: 'md',
    overflow: 'hidden',
    bg: 'silver-neutral.100',
  }),
  interactive: css({
    cursor: 'pointer',
    transitionProperty: 'opacity, box-shadow',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      boxShadow: 'lg',
      opacity: 0.9,
    },
    _active: {
      opacity: 0.75,
    },
    '&:has(:focus-visible)': {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  imageButton: css({
    all: 'unset',
    display: 'block',
    w: 'full',
    h: 'full',
    cursor: 'pointer',
    borderRadius: 'inherit',
    overflow: 'hidden',
  }),
  image: css({
    display: 'block',
    w: 'full',
    h: 'full',
    objectFit: 'cover',
  }),
  placeholder: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: 'full',
    h: 'full',
    color: 'fg.muted',
  }),
  insetBorder: css({
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    boxShadow: 'inset 0 0 0 1px var(--silver-colors-silver-neutral-300)',
    pointerEvents: 'none',
  }),
  remove: css({
    position: 'absolute',
    top: '1',
    right: '1',
    zIndex: 1,
  }),
  overlay: css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 'inherit',
    zIndex: 1,
  }),
} as const;

/**
 * Square image preview for attachments and media.
 */
export function Thumbnail({
  alt,
  className,
  'data-testid': dataTestId,
  isDisabled = false,
  isLoading = false,
  label,
  onClick,
  onRemove,
  ref,
  src,
  style,
}: ThumbnailProps): React.JSX.Element {
  const [hasImageError, setHasImageError] = useState(false);
  const hasImage = src != null && !hasImageError;
  const isInteractive = onClick != null && !isDisabled && !isLoading;
  const accessibleName = label ?? alt ?? 'thumbnail';
  const imageContent =
    isLoading && !hasImage ? (
      <Skeleton radius={2} />
    ) : hasImage ? (
      <img
        alt={alt ?? ''}
        className={styles.image}
        onError={() => setHasImageError(true)}
        src={src}
      />
    ) : (
      <div className={styles.placeholder}>
        <Icon icon={ImageIcon} size="lg" />
      </div>
    );

  const thumbnail = (
    <div
      aria-label={accessibleName}
      className={cx(
        styles.root,
        isDisabled ? styles.disabled : undefined,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <div
        className={cx(
          styles.imageContainer,
          isInteractive ? styles.interactive : undefined,
        )}>
        {isInteractive ? (
          <button
            aria-label={`Open ${accessibleName}`}
            className={styles.imageButton}
            onClick={onClick}
            type="button">
            {imageContent}
          </button>
        ) : (
          imageContent
        )}
        {hasImage ? <div className={styles.insetBorder} /> : null}
        {isLoading && hasImage ? (
          <div className={styles.overlay}>
            <Spinner size="sm" variant="onMedia" />
          </div>
        ) : null}
        {onRemove != null && !isDisabled ? (
          <div className={styles.remove}>
            <Button
              icon={<Icon icon={X} size="sm" />}
              isIconOnly
              label={`Remove ${accessibleName}`}
              onClick={event => {
                event.stopPropagation();
                onRemove(event);
              }}
              size="sm"
              variant="secondary"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  return label != null ? (
    <Tooltip content={label}>{thumbnail}</Tooltip>
  ) : (
    thumbnail
  );
}

Thumbnail.displayName = 'Thumbnail';
