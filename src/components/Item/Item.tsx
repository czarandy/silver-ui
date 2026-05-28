/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as/link component props */

import type {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useRel} from '../../internal/linkAccessibility';
import {useLinkComponent} from '../Link';
import {Text} from '../Text';

export type ItemAlign = 'center' | 'start';
export type ItemDensity = 'default' | 'compact';
export type ItemElement = 'div' | 'li' | 'span';

export interface ItemProps {
  /**
   * Vertical alignment of the media and trailing slots.
   * @default 'center'
   */
  align?: ItemAlign;
  /**
   * HTML element used for the root.
   * @default 'div'
   */
  as?: ItemElement;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Spacing density.
   * @default 'default'
   */
  density?: ItemDensity;
  /**
   * Supporting text shown below the label.
   */
  description?: ReactNode;
  /**
   * Maximum number of description lines before truncation.
   */
  descriptionLines?: number;
  /**
   * Link URL. When set, the content area renders as a link.
   */
  href?: string;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the item should show highlighted styling.
   * @default false
   */
  isHighlighted?: boolean;
  /**
   * Whether the item is selected.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Primary item label.
   */
  label: ReactNode;
  /**
   * Maximum number of label lines before truncation.
   */
  labelLines?: number;
  /**
   * Leading visual content, such as an icon, avatar, or image.
   */
  media?: ReactNode;
  /**
   * Click handler. When set, the content area renders as a button.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Link relationship. `noopener noreferrer` are added for `_blank` targets.
   */
  rel?: string;
  /**
   * ARIA role applied to the root element. When set, click handling is attached
   * to the root so parent composite widgets can own keyboard behavior.
   */
  role?: string;
  /**
   * Content rendered before the media slot as a direct flex child.
   */
  startAdornment?: ReactNode;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Link target.
   */
  target?: string;
  /**
   * Trailing content rendered at the end of the item.
   */
  trailing?: ReactNode;
}

const styles = {
  root: css({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    w: 'full',
    px: '2',
    textAlign: 'start',
    borderRadius: 'md',
  }),
  alignStart: css({
    alignItems: 'flex-start',
  }),
  density: {
    default: css({py: '2'}),
    compact: css({py: '1'}),
  } satisfies Record<ItemDensity, string>,
  interactive: css({
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {bg: 'bg.subtle'},
    _active: {bg: 'silver-neutral.100'},
    '&:has(:focus-visible)': {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  highlighted: css({
    bg: 'bg.subtle',
  }),
  selected: css({
    bg: 'primary.subtle',
  }),
  disabled: css({
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
  disabledContent: css({
    opacity: 0.5,
  }),
  media: css({
    display: 'inline-flex',
    flexShrink: 0,
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
    textAlign: 'start',
  }),
  interactiveContent: css({
    all: 'unset',
    boxSizing: 'border-box',
    cursor: 'inherit',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
    textAlign: 'start',
    textDecoration: 'none',
  }),
  trailing: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    marginInlineStart: 'auto',
  }),
} as const;

function getMaxLines(
  explicitLines: number | undefined,
  content: ReactNode,
): number {
  if (explicitLines != null) {
    return explicitLines;
  }

  return typeof content === 'string' ? 1 : 0;
}

/**
 * Shared media, label, description, and trailing-content row primitive.
 */
export function Item({
  align = 'center',
  as: Component = 'div',
  className,
  'data-testid': dataTestId,
  density = 'default',
  description,
  descriptionLines,
  href,
  isDisabled = false,
  isHighlighted = false,
  isSelected = false,
  label,
  labelLines,
  media,
  onClick,
  ref,
  rel,
  role,
  startAdornment,
  style,
  target,
  trailing,
}: ItemProps): React.JSX.Element {
  const LinkComponent = useLinkComponent();
  const linkRel = useRel({target, rel});
  const isInteractive = href != null || onClick != null;
  const hasParentRole = role != null;

  const labelAndDescription = (
    <>
      <Text as="span" maxLines={getMaxLines(labelLines, label)} type="body">
        {label}
      </Text>
      {description != null ? (
        <Text
          as="span"
          maxLines={getMaxLines(descriptionLines, description)}
          type="supporting">
          {description}
        </Text>
      ) : null}
    </>
  );

  const handleContainerClick = (event: MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      return;
    }

    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('button, a, input, select, textarea')) {
      return;
    }

    onClick?.(event);
  };

  const content = hasParentRole ? (
    <span
      className={cx(
        styles.content,
        isDisabled ? styles.disabledContent : undefined,
      )}>
      {labelAndDescription}
    </span>
  ) : href != null ? (
    <LinkComponent
      aria-disabled={isDisabled || undefined}
      className={cx(
        styles.interactiveContent,
        isDisabled ? styles.disabledContent : undefined,
      )}
      href={href}
      ref={undefined}
      rel={linkRel}
      tabIndex={isDisabled ? -1 : undefined}
      target={target}
      to={LinkComponent === 'a' ? undefined : href}>
      {labelAndDescription}
    </LinkComponent>
  ) : onClick != null ? (
    <button
      className={cx(
        styles.interactiveContent,
        isDisabled ? styles.disabledContent : undefined,
      )}
      disabled={isDisabled}
      onClick={onClick}
      type="button">
      {labelAndDescription}
    </button>
  ) : (
    <span
      className={cx(
        styles.content,
        isDisabled ? styles.disabledContent : undefined,
      )}>
      {labelAndDescription}
    </span>
  );

  return (
    <Component
      aria-disabled={isDisabled || undefined}
      aria-selected={isSelected || undefined}
      className={cx(
        styles.root,
        styles.density[density],
        align === 'start' ? styles.alignStart : undefined,
        isInteractive ? styles.interactive : undefined,
        isHighlighted ? styles.highlighted : undefined,
        isSelected ? styles.selected : undefined,
        isDisabled && !hasParentRole ? styles.disabled : undefined,
        className,
      )}
      data-testid={dataTestId}
      onClick={
        hasParentRole
          ? onClick
          : isInteractive
            ? handleContainerClick
            : undefined
      }
      ref={ref as Ref<never>}
      role={role}
      style={style}>
      {startAdornment}
      {media != null ? <span className={styles.media}>{media}</span> : null}
      {content}
      {trailing != null ? (
        <span
          className={cx(
            styles.trailing,
            isDisabled ? styles.disabledContent : undefined,
          )}>
          {trailing}
        </span>
      ) : null}
    </Component>
  );
}

Item.displayName = 'Item';
