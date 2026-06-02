import type {CSSProperties, ReactNode, Ref} from 'react';
import {LayoutFooter} from '../Layout';

export interface DialogFooterProps {
  /**
   * Additional CSS class names applied to the footer.
   */
  className?: string;
  /**
   * Test ID applied to the footer.
   */
  'data-testid'?: string;
  /**
   * Primary action button, rendered rightmost.
   */
  primaryButton: ReactNode;
  /**
   * Ref forwarded to the footer element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Secondary action button, rendered left of the primary button.
   */
  secondaryButton?: ReactNode;
  /**
   * Content rendered at the start (left) of the footer.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the footer.
   */
  style?: CSSProperties;
}

/**
 * A standard footer for Dialog, with primary, secondary, and start content slots.
 * Composes LayoutFooter internally.
 */
export function DialogFooter({
  className,
  'data-testid': dataTestId,
  primaryButton,
  ref,
  secondaryButton,
  startContent,
  style,
}: DialogFooterProps): React.JSX.Element {
  return (
    <LayoutFooter
      className={className}
      data-testid={dataTestId}
      padding={4}
      primaryButton={primaryButton}
      ref={ref}
      secondaryButton={secondaryButton}
      startContent={startContent}
      style={style}
    />
  );
}

DialogFooter.displayName = 'DialogFooter';
