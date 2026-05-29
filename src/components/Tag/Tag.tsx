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
import {Icon} from '../Icon';
import {Link} from '../Link';

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
  icon?: ReactNode;
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
   * Click handler. Ignored when `href` is provided.
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
}

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    maxW: 'full',
    overflow: 'hidden',
    borderWidth: 0,
    borderRadius: 'sm',
    fontFamily: 'body',
    fontWeight: 'medium',
    lineHeight: 'normal',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
  }),
  interactive: css({
    cursor: 'pointer',
    _hover: {
      bg: 'bg.subtle',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  buttonReset: css({
    p: 0,
    borderWidth: 0,
    font: 'inherit',
    color: 'inherit',
    bg: 'transparent',
  }),
  disabled: css({
    opacity: 0.55,
    cursor: 'not-allowed',
    pointerEvents: 'none',
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
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  size: {
    sm: css({
      '--tag-icon-size': 'var(--silver-sizes-icon-sm)',
      minH: '6',
      px: '2',
      fontSize: 'sm',
    }),
    md: css({
      '--tag-icon-size': 'var(--silver-sizes-icon-sm)',
      minH: '8',
      px: '2',
      fontSize: 'sm',
    }),
    lg: css({
      '--tag-icon-size': 'var(--silver-sizes-icon-md)',
      minH: '10',
      px: '2.5',
      fontSize: 'md',
    }),
  } satisfies Record<TagSize, string>,
  color: {
    default: css({bg: 'silver-neutral.100', color: 'fg'}),
    red: css({bg: 'red.100', color: 'red.800'}),
    orange: css({bg: 'orange.100', color: 'orange.800'}),
    yellow: css({bg: 'yellow.100', color: 'yellow.800'}),
    green: css({bg: 'green.100', color: 'green.800'}),
    teal: css({bg: 'teal.100', color: 'teal.800'}),
    cyan: css({bg: 'cyan.100', color: 'cyan.800'}),
    blue: css({bg: 'blue.100', color: 'blue.800'}),
    purple: css({bg: 'purple.100', color: 'purple.800'}),
    pink: css({bg: 'pink.100', color: 'pink.800'}),
    gray: css({bg: 'silver-neutral.200', color: 'silver-neutral.800'}),
  } satisfies Record<TagColor, string>,
} as const;

function TagContent({
  endContent,
  icon,
  isLabelHidden,
  label,
  onRemove,
  isDisabled,
}: Pick<
  TagProps,
  'endContent' | 'icon' | 'isDisabled' | 'isLabelHidden' | 'label' | 'onRemove'
>): React.JSX.Element {
  return (
    <>
      {icon}
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
}: TagProps): React.JSX.Element {
  const classNames = cx(
    styles.root,
    styles.size[size],
    styles.color[color],
    href != null || onClick != null ? styles.interactive : undefined,
    href == null && onClick != null && onRemove == null
      ? styles.buttonReset
      : undefined,
    isDisabled ? styles.disabled : undefined,
    className,
  );
  const sharedProps = {
    'aria-description': description,
    'aria-label': isLabelHidden ? label : undefined,
    className: classNames,
    'data-testid': dataTestId,
    style,
  };

  if (href != null) {
    return (
      <Link
        {...sharedProps}
        color="inherit"
        href={href}
        isDisabled={isDisabled}
        label={isLabelHidden ? label : undefined}
        ref={ref as Ref<HTMLAnchorElement>}>
        <TagContent
          endContent={endContent}
          icon={icon}
          isDisabled={isDisabled}
          isLabelHidden={isLabelHidden}
          label={label}
          onRemove={onRemove}
        />
      </Link>
    );
  }

  if (onClick != null && onRemove == null) {
    return (
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
        />
      </button>
    );
  }

  if (onClick != null) {
    return (
      <span {...sharedProps} ref={ref}>
        {icon}
        <button
          className={cx(styles.buttonReset, styles.label)}
          disabled={isDisabled}
          onClick={onClick}
          type="button">
          {isLabelHidden ? <VisuallyHidden>{label}</VisuallyHidden> : label}
        </button>
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
      </span>
    );
  }

  return (
    <span {...sharedProps} ref={ref}>
      <TagContent
        endContent={endContent}
        icon={icon}
        isDisabled={isDisabled}
        isLabelHidden={isLabelHidden}
        label={label}
        onRemove={onRemove}
      />
    </span>
  );
}

Tag.displayName = 'Tag';
