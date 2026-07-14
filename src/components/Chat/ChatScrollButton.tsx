'use client';

import {ChevronDown} from 'lucide-react';
import type {ComponentPropsWithoutRef, CSSProperties, Ref} from 'react';
import {Button} from 'components/Button';
import {chatScrollButtonRecipe} from 'components/Chat/ChatScrollButton.recipe';
import {cx} from 'utils/cx';

export interface ChatScrollButtonProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'onClick'
> {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether the button is visible. The pill fades and collapses while
   * hidden so it can transition in place.
   */
  isVisible: boolean;
  /**
   * Label that expands the pill (e.g. "New messages"). When omitted, only
   * the chevron icon is shown.
   */
  label?: string;
  /**
   * Called when the button is clicked.
   */
  onClick: () => void;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Floating scroll-to-bottom pill shown above the composer in a ChatLayout.
 * Expands to show a label such as "New messages" when one is provided.
 */
export function ChatScrollButton({
  className,
  'data-testid': dataTestId,
  isVisible,
  label,
  onClick,
  ref,
  style,
  ...rest
}: ChatScrollButtonProps): React.JSX.Element {
  const classes = chatScrollButtonRecipe({
    isExpanded: label != null,
    isVisible,
  });

  return (
    <div
      {...rest}
      className={cx(classes.wrapper, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <div className={classes.pill}>
        <Button
          className={classes.button}
          icon={ChevronDown}
          isIconOnly={label == null}
          label={label ?? 'Scroll to bottom'}
          onClick={onClick}
          size="md"
          variant="ghost"
        />
      </div>
    </div>
  );
}

ChatScrollButton.displayName = 'ChatScrollButton';
