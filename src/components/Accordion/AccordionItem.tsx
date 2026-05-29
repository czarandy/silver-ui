import {ChevronDown} from 'lucide-react';
import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {useCollapsible} from './useCollapsible';

/**
 * A single expandable section within an `Accordion`, or a standalone
 * collapsible panel when used outside of an `Accordion` context. Prefer
 * the `Collapsible` wrapper for standalone usage.
 */
export interface AccordionItemProps {
  /**
   * Content revealed when the item is open.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether the item is open on initial render. Ignored when `isOpen` is
   * provided or the item is inside an `Accordion`. Defaults to `true`.
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the trigger is disabled. Prevents toggling and applies disabled
   * styling.
   */
  isDisabled?: boolean;
  /**
   * Controls the open state externally. When set, the component becomes
   * controlled and `onOpenChange` should be provided. Ignored when the
   * item is inside an `Accordion`.
   */
  isOpen?: boolean;
  /**
   * Called when the open state changes from user interaction.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Content rendered as the clickable trigger. Must be phrasing content
   * (text, `<span>`, `<strong>`, icons, etc.) since it is placed inside a
   * `<button>` element.
   */
  trigger: ReactNode;
  /**
   * Unique identifier used by a parent `Accordion` to track which items
   * are open. Required when used inside an `Accordion`, ignored otherwise.
   */
  value?: string;
}

const styles = {
  root: css({
    w: '100%',
  }),
  trigger: css({
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    w: '100%',
    cursor: 'pointer',
    fontFamily: 'body',
    fontSize: 'lg',
    fontWeight: 'semibold',
    color: 'fg',
    textAlign: 'start',
    py: 0,
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
      borderRadius: 'sm',
    },
  }),
  chevron: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    color: 'fg.muted',
  }),
  chevronOpen: css({
    transform: 'rotate(180deg)',
  }),
  content: css({
    pt: '1',
  }),
} as const;

export function AccordionItem({
  trigger,
  children,
  isDefaultOpen,
  isDisabled = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  value,
  ref,
  className,
  'data-testid': dataTestId,
  style,
}: AccordionItemProps): React.JSX.Element {
  const collapsibleConfig =
    controlledIsOpen !== undefined
      ? {isOpen: controlledIsOpen, onOpenChange}
      : {isDefaultOpen: isDefaultOpen ?? true, onOpenChange};

  const {isOpen, toggle} = useCollapsible({
    config: collapsibleConfig,
    value,
  });

  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={styles.trigger}
        disabled={isDisabled}
        id={triggerId}
        onClick={toggle}
        type="button">
        {trigger}
        <span
          className={cx(
            styles.chevron,
            isOpen ? styles.chevronOpen : undefined,
          )}>
          <Icon icon={ChevronDown} size="md" />
        </span>
      </button>
      <div
        aria-labelledby={triggerId}
        className={styles.content}
        hidden={!isOpen || undefined}
        id={panelId}
        role="region">
        {children}
      </div>
    </div>
  );
}

AccordionItem.displayName = 'AccordionItem';
