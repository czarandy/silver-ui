/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as/link component props */

import type {
  AriaAttributes,
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useRel} from '../../internal/linkAccessibility';
import type {LinkComponent as LinkComponentType} from '../Link';
import {useLinkComponent} from '../Link';
import {Text} from '../Text';

const SELECTABLE_ROLES = new Set([
  'option',
  'tab',
  'row',
  'gridcell',
  'treeitem',
]);

export type ItemAlign = 'center' | 'start';
export type ItemElement = 'div' | 'li' | 'span';

export interface ItemProps {
  /**
   * Vertical alignment of the start and end content slots.
   * @default 'center'
   */
  align?: ItemAlign;
  /**
   * ARIA current indicator forwarded to the interactive element.
   */
  'aria-current'?: AriaAttributes['aria-current'];
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
   * Supporting text shown below the label.
   */
  description?: ReactNode;
  /**
   * Maximum number of description lines before truncation.
   */
  descriptionLines?: number;
  /**
   * Content rendered after the label and description.
   * Position controlled by `endContentPosition`.
   */
  endContent?: ReactNode;
  /**
   * Where to place `endContent` within the item.
   * `'end'` pushes it to the trailing edge; `'inline'` keeps it next to the label.
   * @default 'end'
   */
  endContentPosition?: 'end' | 'inline';
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
   * Content rendered outside the interactive area, before it.
   */
  leadingContent?: ReactNode;
  /**
   * Custom link component used when href is set.
   */
  linkComponent?: LinkComponentType;
  /**
   * Click handler. When set without href, the content area renders as a
   * button. When set with href, also fires on link clicks.
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
   * Leading visual content, such as an icon, avatar, or image.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Link target.
   */
  target?: string;
  /**
   * Content rendered outside the interactive area, after it.
   */
  trailingContent?: ReactNode;
  /**
   * Width of the root element.
   * @default 'full'
   */
  width?: 'full' | 'auto';
}

const styles = {
  root: css({
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '2',
    py: '2',
    textAlign: 'start',
    borderRadius: 'md',
  }),
  widthFull: css({
    w: 'full',
  }),
  alignStart: css({
    alignItems: 'flex-start',
  }),
  interactive: css({
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {bg: 'bg.subtle'},
    _active: {bg: 'bg.hover'},
    '&:has(:focus-visible)': {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  highlighted: css({
    bg: 'bg.subtle',
  }),
  selected: css({
    bg: 'bg.selected',
  }),
  disabled: css({
    cursor: 'not-allowed',
    pointerEvents: 'none',
  }),
  disabledContent: css({
    opacity: 0.5,
  }),
  interactiveContent: css({
    all: 'unset',
    boxSizing: 'border-box',
    cursor: 'inherit',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flex: 1,
    minW: 0,
    textAlign: 'start',
    textDecoration: 'none',
  }),
  content: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flex: 1,
    minW: 0,
    textAlign: 'start',
  }),
  textContent: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
  }),
  startContent: css({
    display: 'inline-flex',
    flexShrink: 0,
  }),
  endContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    marginInlineStart: 'auto',
  }),
  endContentInline: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  labelRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
  }),
  trailingContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
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
 * Shared start content, label, description, and end content row primitive.
 */
export function Item({
  align = 'center',
  'aria-current': ariaCurrent,
  as: Component = 'div',
  className,
  'data-testid': dataTestId,
  description,
  descriptionLines,
  endContent,
  endContentPosition = 'end',
  href,
  isDisabled = false,
  isHighlighted = false,
  isSelected = false,
  label,
  labelLines,
  leadingContent,
  linkComponent,
  onClick,
  ref,
  rel,
  role,
  startContent,
  style,
  target,
  trailingContent,
  width = 'full',
}: ItemProps): React.JSX.Element {
  const LinkComponent = useLinkComponent(linkComponent);
  const linkRel = useRel({target, rel});
  const isInteractive = href != null || onClick != null;
  const hasParentRole = role != null;

  const inlineEndContent =
    endContent != null && endContentPosition === 'inline' ? (
      <span
        className={cx(
          styles.endContentInline,
          isDisabled ? styles.disabledContent : undefined,
        )}>
        {endContent}
      </span>
    ) : null;

  const labelAndDescription = (
    <>
      {inlineEndContent != null ? (
        <span className={styles.labelRow}>
          <Text as="span" maxLines={getMaxLines(labelLines, label)} type="body">
            {label}
          </Text>
          {inlineEndContent}
        </span>
      ) : (
        <Text as="span" maxLines={getMaxLines(labelLines, label)} type="body">
          {label}
        </Text>
      )}
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

  const innerSlots = (
    <>
      {startContent != null ? (
        <span className={styles.startContent}>{startContent}</span>
      ) : null}
      <span className={styles.textContent}>{labelAndDescription}</span>
      {endContent != null && endContentPosition !== 'inline' ? (
        <span
          className={cx(
            styles.endContent,
            isDisabled ? styles.disabledContent : undefined,
          )}>
          {endContent}
        </span>
      ) : null}
    </>
  );

  const content = hasParentRole ? (
    <span
      className={cx(
        styles.content,
        isDisabled ? styles.disabledContent : undefined,
      )}>
      {innerSlots}
    </span>
  ) : href != null ? (
    <LinkComponent
      aria-current={ariaCurrent ?? undefined}
      aria-disabled={isDisabled || undefined}
      className={cx(
        styles.interactiveContent,
        isDisabled ? styles.disabledContent : undefined,
      )}
      href={href}
      onClick={(e: MouseEvent<HTMLElement>) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      ref={undefined}
      rel={linkRel}
      tabIndex={isDisabled ? -1 : undefined}
      target={target}
      to={LinkComponent === 'a' ? undefined : href}>
      {innerSlots}
    </LinkComponent>
  ) : onClick != null ? (
    <button
      aria-current={ariaCurrent ?? undefined}
      className={cx(
        styles.interactiveContent,
        isDisabled ? styles.disabledContent : undefined,
      )}
      disabled={isDisabled}
      onClick={onClick}
      type="button">
      {innerSlots}
    </button>
  ) : (
    <span
      className={cx(
        styles.content,
        isDisabled ? styles.disabledContent : undefined,
      )}>
      {innerSlots}
    </span>
  );

  return (
    <Component
      aria-disabled={isDisabled || undefined}
      aria-selected={
        isSelected && role != null && SELECTABLE_ROLES.has(role)
          ? true
          : undefined
      }
      className={cx(
        styles.root,
        width === 'full' ? styles.widthFull : undefined,
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
      {leadingContent}
      {content}
      {trailingContent != null ? (
        <span className={styles.trailingContent}>{trailingContent}</span>
      ) : null}
    </Component>
  );
}

Item.displayName = 'Item';
