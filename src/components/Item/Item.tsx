import {
  useCallback,
  useRef,
  type AriaAttributes,
  type CSSProperties,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import {itemRecipe} from 'components/Item/Item.recipe';
import type {LinkComponent as LinkComponentType} from 'components/Link';
import {Text} from 'components/Text';
import {ActionElement} from 'internal/ActionElement';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import {useRel} from 'internal/linkAccessibility';

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

// Native and ARIA interactive elements that own their own click, plus anything
// explicitly placed in the tab order or made editable. Used as a safety net so
// the row action does not also fire when a consumer-provided control in a slot
// is clicked.
const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="tab"]',
  '[role="radio"]',
  '[role="option"]',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function isInteractiveTarget(element: HTMLElement): boolean {
  return element.closest(INTERACTIVE_SELECTOR) != null;
}

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
  const linkRel = useRel({target, rel});
  const isInteractive = href != null || onClick != null;
  const hasParentRole = role != null;
  // The item renders its own interactive control (link/button) only when it is
  // interactive and no parent widget owns the role. Otherwise it renders a
  // plain content wrapper and any interaction is handled by the parent.
  const ownsInteraction = isInteractive && !hasParentRole;
  // Tracks the inner interactive control (button/link) so the row handler can
  // tell, precisely, when a click already fired on our own element.
  const interactiveRef = useRef<HTMLElement | null>(null);
  const setInteractiveRef = useCallback((node: HTMLElement | null) => {
    interactiveRef.current = node;
  }, []);
  const classes = itemRecipe({
    align,
    width,
    isInteractive,
    isHighlighted,
    isSelected,
    isDisabled,
    hasParentRole,
  });

  const inlineEndContent =
    isReactNode(endContent) && endContentPosition === 'inline' ? (
      <span className={classes.endContentInline}>{endContent}</span>
    ) : null;

  const labelAndDescription = (
    <>
      {inlineEndContent != null ? (
        <span className={classes.labelRow}>
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
      {isReactNode(description) ? (
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
    // Our own interactive control already fired its onClick; don't double-fire.
    if (interactiveRef.current?.contains(targetElement)) {
      return;
    }
    // A consumer-provided interactive control in a slot owns its own click, so
    // the row action should not also fire.
    if (isInteractiveTarget(targetElement)) {
      return;
    }

    onClick?.(event);
  };

  const innerSlots = (
    <>
      {isReactNode(startContent) ? (
        <span className={classes.startContent}>{startContent}</span>
      ) : null}
      <span className={classes.textContent}>{labelAndDescription}</span>
      {isReactNode(endContent) && endContentPosition !== 'inline' ? (
        <span className={classes.endContent}>{endContent}</span>
      ) : null}
    </>
  );

  const content = !ownsInteraction ? (
    <span className={classes.content}>{innerSlots}</span>
  ) : (
    <ActionElement
      aria-current={ariaCurrent ?? undefined}
      aria-disabled={href != null && isDisabled ? true : undefined}
      as={linkComponent}
      className={classes.interactiveContent}
      href={href}
      isDisabled={href == null ? isDisabled : undefined}
      isLink={href != null}
      onClick={(e: MouseEvent<HTMLElement>) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      ref={setInteractiveRef}
      rel={href != null ? linkRel : undefined}
      tabIndex={href != null && isDisabled ? -1 : undefined}
      target={href != null ? target : undefined}>
      {innerSlots}
    </ActionElement>
  );

  return (
    <Component
      aria-disabled={isDisabled || undefined}
      aria-selected={
        isSelected && role != null && SELECTABLE_ROLES.has(role)
          ? true
          : undefined
      }
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      onClick={
        hasParentRole
          ? onClick
          : ownsInteraction
            ? handleContainerClick
            : undefined
      }
      ref={ref as Ref<never>}
      role={role}
      style={style}>
      {leadingContent}
      {content}
      {isReactNode(trailingContent) ? (
        <span className={classes.trailingContent}>{trailingContent}</span>
      ) : null}
    </Component>
  );
}

Item.displayName = 'Item';
