import {ChevronDown} from 'lucide-react';
import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {accordionItemRecipe} from './AccordionItem.recipe';
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

  const classes = accordionItemRecipe({isOpen});

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={classes.trigger}
        disabled={isDisabled}
        id={triggerId}
        onClick={toggle}
        type="button">
        {trigger}
        <span className={classes.chevron}>
          <Icon icon={ChevronDown} size="md" />
        </span>
      </button>
      <div
        aria-labelledby={triggerId}
        className={classes.panel}
        id={panelId}
        role="region"
        style={{visibility: isOpen ? undefined : 'hidden'}}>
        <div className={classes.panelInner}>{children}</div>
      </div>
    </div>
  );
}

AccordionItem.displayName = 'AccordionItem';
