import type {CSSProperties, ReactNode, Ref} from 'react';
import {AccordionItem} from './AccordionItem';

/**
 * A standalone disclosure widget that toggles the visibility of a content
 * panel. Use `Collapsible` for individual expand/collapse sections. For
 * coordinated groups where only one (or a subset) can be open at a time,
 * use `Accordion` with `AccordionItem` instead.
 */
export interface CollapsibleProps {
  /**
   * Content revealed when the collapsible is open.
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
   * Whether the collapsible is open on initial render. Ignored when `isOpen`
   * is provided. Defaults to `true`.
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the trigger is disabled. Prevents toggling and applies disabled
   * styling.
   */
  isDisabled?: boolean;
  /**
   * Controls the open state externally. When set, the component becomes
   * controlled and `onOpenChange` should be provided to handle toggling.
   */
  isOpen?: boolean;
  /**
   * Called when the open state changes, either from a user click on the
   * trigger or from a keyboard interaction.
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
   * Content rendered as the clickable trigger that toggles the panel. Must be
   * phrasing content (text, `<span>`, `<strong>`, icons, etc.) since it is
   * placed inside a `<button>` element.
   */
  trigger: ReactNode;
}

export function Collapsible({
  className,
  'data-testid': dataTestId,
  ref,
  style,
  ...props
}: CollapsibleProps): React.JSX.Element {
  return (
    <AccordionItem
      {...props}
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}
    />
  );
}

Collapsible.displayName = 'Collapsible';
