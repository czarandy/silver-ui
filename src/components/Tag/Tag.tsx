import {X} from 'lucide-react';
import type {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {Link} from '../Link';
import {Tooltip} from '../Tooltip';
import {tagRecipe} from './Tag.recipe';

export type TagColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

export type TagSize = 'sm' | 'md' | 'lg';

export interface TagProps {
  /**
   * Additional CSS class names applied to the tag.
   */
  className?: string;
  /**
   * Visual color.
   * @default 'default'
   */
  color?: TagColor;
  /**
   * Test ID applied to the tag root.
   */
  'data-testid'?: string;
  /**
   * Accessible description for the tag.
   */
  description?: string;
  /**
   * Content rendered after the label and before the remove button.
   */
  endContent?: ReactNode;
  /**
   * Link destination. When provided, the tag renders as a link.
   */
  href?: string;
  /**
   * Icon rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the tag is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label while keeping it available to screen readers.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Tag text.
   */
  label: string;
  /**
   * Click handler.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Called when the remove button is clicked. When provided, a remove button is shown.
   */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * Ref forwarded to the tag root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: TagSize;
  /**
   * Inline styles applied to the tag.
   */
  style?: CSSProperties;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
}

const styles = {
  buttonReset: css({
    p: 0,
    borderWidth: 0,
    font: 'inherit',
    color: 'inherit',
    bg: 'transparent',
    cursor: 'pointer',
  }),
  bodyButton: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'inherit',
    p: 0,
    borderWidth: 0,
    font: 'inherit',
    color: 'inherit',
    bg: 'transparent',
    cursor: 'pointer',
    minW: 0,
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  label: css({
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  removeButton: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    p: 0,
    borderWidth: 0,
    borderRadius: 'full',
    bg: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    _hover: {
      opacity: 0.7,
    },
    _active: {
      opacity: 0.5,
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
} as const;

function TagContent({
  endContent,
  icon,
  isLabelHidden,
  label,
  onRemove,
  isDisabled,
  size = 'md',
}: Pick<
  TagProps,
  'endContent' | 'icon' | 'isDisabled' | 'isLabelHidden' | 'label' | 'size'
> & {
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
}): React.JSX.Element {
  return (
    <>
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size={size} />
      ) : null}
      {isLabelHidden === true ? (
        <VisuallyHidden>{label}</VisuallyHidden>
      ) : (
        <span className={styles.label}>{label}</span>
      )}
      {endContent}
      {onRemove != null ? (
        <button
          aria-label={`Remove ${label}`}
          className={styles.removeButton}
          disabled={isDisabled}
          onClick={event => {
            event.stopPropagation();
            onRemove(event);
          }}
          type="button">
          <Icon icon={X} size="sm" />
        </button>
      ) : null}
    </>
  );
}

/**
 * Compact chip for displaying selected values, filters, tags, or removable entities.
 */
export function Tag({
  className,
  color = 'default',
  'data-testid': dataTestId,
  description,
  endContent,
  href,
  icon,
  isDisabled = false,
  isLabelHidden = false,
  label,
  onClick,
  onRemove,
  ref,
  size = 'md',
  style,
  tooltip,
}: TagProps): React.JSX.Element {
  const isInteractive = href != null || onClick != null;
  const classNames = cx(
    tagRecipe({size, color, isInteractive, isDisabled}),
    href == null && onClick != null && onRemove == null
      ? styles.buttonReset
      : undefined,
    className,
  );
  const sharedProps = {
    'aria-description': description,
    className: classNames,
    'data-testid': dataTestId,
    style,
  };

  let element: React.JSX.Element;

  if (href != null && onRemove != null) {
    element = (
      <span {...sharedProps} ref={ref}>
        <Link
          className={styles.bodyButton}
          color="inherit"
          href={href}
          isDisabled={isDisabled}
          onClick={onClick}>
          {icon != null ? (
            <Icon aria-hidden="true" color="inherit" icon={icon} size={size} />
          ) : null}
          {isLabelHidden ? (
            <VisuallyHidden>{label}</VisuallyHidden>
          ) : (
            <span className={styles.label}>{label}</span>
          )}
          {endContent}
        </Link>
        <button
          aria-label={`Remove ${label}`}
          className={styles.removeButton}
          disabled={isDisabled}
          onClick={event => {
            event.stopPropagation();
            onRemove(event);
          }}
          type="button">
          <Icon icon={X} size="sm" />
        </button>
      </span>
    );
  } else if (href != null) {
    element = (
      <Link
        {...sharedProps}
        color="inherit"
        href={href}
        isDisabled={isDisabled}
        onClick={onClick}
        ref={ref as Ref<HTMLAnchorElement>}>
        <TagContent
          endContent={endContent}
          icon={icon}
          isDisabled={isDisabled}
          isLabelHidden={isLabelHidden}
          label={label}
          size={size}
        />
      </Link>
    );
  } else if (onClick != null && onRemove != null) {
    element = (
      <span {...sharedProps} ref={ref}>
        <button
          className={styles.bodyButton}
          disabled={isDisabled}
          onClick={onClick}
          type="button">
          {icon != null ? (
            <Icon aria-hidden="true" color="inherit" icon={icon} size={size} />
          ) : null}
          {isLabelHidden ? (
            <VisuallyHidden>{label}</VisuallyHidden>
          ) : (
            <span className={styles.label}>{label}</span>
          )}
          {endContent}
        </button>
        <button
          aria-label={`Remove ${label}`}
          className={styles.removeButton}
          disabled={isDisabled}
          onClick={event => {
            event.stopPropagation();
            onRemove(event);
          }}
          type="button">
          <Icon icon={X} size="sm" />
        </button>
      </span>
    );
  } else if (onClick != null) {
    element = (
      <button
        {...sharedProps}
        disabled={isDisabled}
        onClick={onClick}
        ref={ref as Ref<HTMLButtonElement>}
        type="button">
        <TagContent
          endContent={endContent}
          icon={icon}
          isDisabled={isDisabled}
          isLabelHidden={isLabelHidden}
          label={label}
          size={size}
        />
      </button>
    );
  } else {
    element = (
      <span {...sharedProps} ref={ref}>
        <TagContent
          endContent={endContent}
          icon={icon}
          isDisabled={isDisabled}
          isLabelHidden={isLabelHidden}
          label={label}
          onRemove={onRemove}
          size={size}
        />
      </span>
    );
  }

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Tag.displayName = 'Tag';
