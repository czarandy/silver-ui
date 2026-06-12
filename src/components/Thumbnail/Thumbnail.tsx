import {ImageIcon, X} from 'lucide-react';
import {useState, type CSSProperties, type MouseEvent, type Ref} from 'react';
import {cx} from 'internal/cx';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Skeleton} from '../Skeleton';
import {Spinner} from '../Spinner';
import {Tooltip} from '../Tooltip';
import {thumbnailRecipe} from './Thumbnail.recipe';

export interface ThumbnailProps {
  /**
   * Alt text describing the image content. Use `label` for a file name or
   * action label shown in the tooltip and button accessible names.
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
   * File name or short item label used for the root accessible name, tooltip,
   * and open/remove button labels. When omitted, `alt` is used as a fallback.
   */
  label?: string;
  /**
   * Called when the thumbnail image area is clicked.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Called when the remove button is clicked.
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
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

type ThumbnailClasses = ReturnType<typeof thumbnailRecipe>;

type ThumbnailImageAreaProps = Pick<
  ThumbnailProps,
  'alt' | 'isLoading' | 'onClick' | 'onRemove' | 'src'
> & {
  accessibleName: string;
  classes: ThumbnailClasses;
  isDisabled: boolean;
};

function ThumbnailImageArea({
  accessibleName,
  alt,
  classes,
  isDisabled,
  isLoading = false,
  onClick,
  onRemove,
  src,
}: ThumbnailImageAreaProps): React.JSX.Element {
  const [hasImageError, setHasImageError] = useState(false);
  const hasImage = src != null && !hasImageError;
  const isInteractive = onClick != null && !isDisabled && !isLoading;
  const imageContent =
    isLoading && !hasImage ? (
      <Skeleton radius={2} />
    ) : hasImage ? (
      <img
        alt={alt ?? ''}
        className={classes.image}
        onError={() => setHasImageError(true)}
        src={src}
      />
    ) : (
      <div className={classes.placeholder}>
        <Icon icon={ImageIcon} size="lg" />
      </div>
    );

  return (
    <div className={classes.imageContainer}>
      {isInteractive ? (
        <button
          aria-label={`Open ${accessibleName}`}
          className={classes.imageButton}
          onClick={onClick}
          type="button">
          {imageContent}
        </button>
      ) : (
        imageContent
      )}
      {hasImage ? <div className={classes.insetBorder} /> : null}
      {isLoading && hasImage ? (
        <div className={classes.overlay}>
          <Spinner size="sm" variant="onMedia" />
        </div>
      ) : null}
      {onRemove != null && !isDisabled ? (
        <div className={classes.remove}>
          <Button
            icon={X}
            isIconOnly
            label={`Remove ${accessibleName}`}
            onClick={event => {
              event.stopPropagation();
              onRemove(event as MouseEvent<HTMLButtonElement>);
            }}
            size="sm"
            variant="onSolid"
          />
        </div>
      ) : null}
    </div>
  );
}

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
  const accessibleName = label ?? alt ?? 'thumbnail';
  const isInteractive = onClick != null && !isDisabled && !isLoading;
  const classes = thumbnailRecipe({isDisabled, isInteractive});

  const thumbnail = (
    <div
      aria-busy={isLoading || undefined}
      aria-label={accessibleName}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <ThumbnailImageArea
        accessibleName={accessibleName}
        alt={alt}
        classes={classes}
        isDisabled={isDisabled}
        isLoading={isLoading}
        key={src ?? 'empty'}
        onClick={onClick}
        onRemove={onRemove}
        src={src}
      />
    </div>
  );

  return label != null ? (
    <Tooltip content={label}>{thumbnail}</Tooltip>
  ) : (
    thumbnail
  );
}

Thumbnail.displayName = 'Thumbnail';
