import {X} from 'lucide-react';
import type {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {Link} from 'components/Link';
import {tagRecipe} from 'components/Tag/Tag.recipe';
import {Tooltip} from 'components/Tooltip';
import {ActionElement} from 'internal/ActionElement';
import {VisuallyHidden} from 'internal/VisuallyHidden';
import {cx} from 'internal/cx';

export type TagColor =
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
   * @default 'gray'
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
   * Content rendered before the icon and label.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the tag.
   */
  style?: CSSProperties;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
}

function TagBody({
  endContent,
  icon,
  isLabelHidden,
  label,
  labelClassName,
  size = 'md',
  startContent,
}: Pick<
  TagProps,
  'endContent' | 'icon' | 'isLabelHidden' | 'label' | 'size' | 'startContent'
> & {
  labelClassName?: string;
}): React.JSX.Element {
  return (
    <>
      {startContent}
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size={size} />
      ) : null}
      {isLabelHidden === true ? (
        <VisuallyHidden>{label}</VisuallyHidden>
      ) : (
        <span className={labelClassName}>{label}</span>
      )}
      {endContent}
    </>
  );
}

function RemoveButton({
  className,
  isDisabled,
  label,
  onRemove,
}: {
  className?: string;
  isDisabled?: boolean;
  label: string;
  onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
}): React.JSX.Element {
  return (
    <button
      aria-label={`Remove ${label}`}
      className={className}
      disabled={isDisabled}
      onClick={event => {
        event.stopPropagation();
        onRemove(event);
      }}
      type="button">
      <Icon icon={X} size="sm" />
    </button>
  );
}

/**
 * Compact chip for displaying selected values, filters, tags, or removable entities.
 */
export function Tag({
  className,
  color = 'gray',
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
  startContent,
  style,
  tooltip,
}: TagProps): React.JSX.Element {
  const isInteractive = href != null || onClick != null;
  const isRootInteractive = href == null && onClick != null && onRemove == null;
  const classes = tagRecipe({
    size,
    color,
    isInteractive: isInteractive || undefined,
    isDisabled: isDisabled || undefined,
    isRootInteractive: isRootInteractive || undefined,
  });
  const rootClassName = cx(classes.root, className);
  const sharedProps = {
    'aria-description': description,
    className: rootClassName,
    'data-testid': dataTestId,
    style,
  };

  let element: React.JSX.Element;

  const bodyProps = {
    endContent,
    icon,
    isLabelHidden,
    label,
    labelClassName: classes.label,
    size,
    startContent,
  } as const;

  if (href != null && onRemove != null) {
    element = (
      <span {...sharedProps} aria-label={label} ref={ref} role="group">
        <Link
          className={classes.body}
          color="inherit"
          href={href}
          isDisabled={isDisabled}
          onClick={onClick}>
          <TagBody {...bodyProps} />
        </Link>
        <RemoveButton
          className={classes.removeButton}
          isDisabled={isDisabled}
          label={label}
          onRemove={onRemove}
        />
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
        ref={ref}>
        <TagBody {...bodyProps} />
      </Link>
    );
  } else if (onClick != null && onRemove != null) {
    element = (
      <span {...sharedProps} aria-label={label} ref={ref} role="group">
        <ActionElement
          className={classes.body}
          disabled={isDisabled}
          onClick={onClick}>
          <TagBody {...bodyProps} />
        </ActionElement>
        <RemoveButton
          className={classes.removeButton}
          isDisabled={isDisabled}
          label={label}
          onRemove={onRemove}
        />
      </span>
    );
  } else if (onClick != null) {
    element = (
      <ActionElement
        {...sharedProps}
        disabled={isDisabled}
        onClick={onClick}
        ref={ref}>
        <TagBody {...bodyProps} />
      </ActionElement>
    );
  } else {
    element = (
      <span {...sharedProps} ref={ref}>
        <TagBody {...bodyProps} />
        {onRemove != null ? (
          <RemoveButton
            className={classes.removeButton}
            isDisabled={isDisabled}
            label={label}
            onRemove={onRemove}
          />
        ) : null}
      </span>
    );
  }

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Tag.displayName = 'Tag';
