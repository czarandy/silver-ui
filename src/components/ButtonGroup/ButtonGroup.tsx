'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import type {ButtonSize} from 'components/Button/Button';
import {buttonGroupRecipe} from 'components/ButtonGroup/ButtonGroup.recipe';
import {
  ButtonGroupContext,
  type ButtonGroupOrientation,
} from 'components/ButtonGroup/ButtonGroupContext';
import {useResolvedSize} from 'internal/SizeContext';
import {cx} from 'utils/cx';

/**
 * Groups related Buttons and propagates shared size, disabled state, and
 * orientation to child Buttons.
 */
export interface ButtonGroupProps {
  /**
   * Direct children should be `<Button>` elements.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether all buttons in the group are disabled.
   */
  isDisabled?: boolean;
  /**
   * Accessible label for the group.
   */
  label: string;
  /**
   * Orientation for layout. Default is `horizontal`.
   */
  orientation?: ButtonGroupOrientation;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Default size for Buttons in the group. Individual Buttons can override it.
   */
  size?: ButtonSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Groups related Buttons and propagates shared size, disabled state, and
 * orientation to child Buttons.
 */
export function ButtonGroup({
  children,
  className,
  'data-testid': dataTestId,
  isDisabled = false,
  label,
  orientation = 'horizontal',
  ref,
  size: sizeProp,
  style,
}: ButtonGroupProps): React.JSX.Element {
  const size = useResolvedSize(sizeProp);
  const contextValue = useMemo(
    () => ({isDisabled, orientation, size}),
    [isDisabled, orientation, size],
  );

  return (
    <ButtonGroupContext value={contextValue}>
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        className={cx(buttonGroupRecipe({orientation}), className)}
        data-orientation={orientation}
        data-testid={dataTestId}
        ref={ref}
        role="group"
        style={style}>
        {children}
      </div>
    </ButtonGroupContext>
  );
}

ButtonGroup.displayName = 'ButtonGroup';
