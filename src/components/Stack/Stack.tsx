import {
  createElement,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {toPixelSize, type SizeValue} from '../../internal/toPixelSize';
import {stackRecipe} from './Stack.recipe';

export type {SizeValue};
export type StackDirection = 'horizontal' | 'vertical';
export type StackMainAlignment =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';
export type StackCrossAlignment = 'start' | 'center' | 'end' | 'stretch';
export type StackAlignment = StackMainAlignment | StackCrossAlignment;
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type StackGap = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /**
   * Cross-axis alignment.
   */
  align?: StackCrossAlignment;
  /**
   * HTML element type to render.
   */
  as?: ElementType;
  /**
   * Stack content.
   */
  children?: ReactNode;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Layout direction.
   */
  direction?: StackDirection;
  /**
   * Gap between children.
   */
  gap?: StackGap;
  /**
   * Horizontal alignment (overrides align/justify for horizontal axis).
   */
  hAlign?: StackAlignment;
  /**
   * Fixed height. Numbers are treated as pixels.
   */
  height?: SizeValue;
  /**
   * Main-axis alignment.
   */
  justify?: StackMainAlignment;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Vertical alignment (overrides align/justify for vertical axis).
   */
  vAlign?: StackAlignment;
  /**
   * Fixed width. Numbers are treated as pixels.
   */
  width?: SizeValue;
  /**
   * Flex wrap behavior.
   */
  wrap?: StackWrap;
}

const gapByStep: Record<StackGap, string> = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
};

const mainAlignValues: Record<StackMainAlignment, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const crossAlignValues: Record<StackCrossAlignment, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

export function Stack({
  align,
  children,
  className,
  'data-testid': dataTestId,
  direction = 'vertical',
  as: Element = 'div',
  gap,
  hAlign,
  height,
  justify,
  ref,
  style,
  vAlign,
  width,
  wrap = 'nowrap',
  ...htmlProps
}: StackProps): React.JSX.Element {
  const resolvedHAlign =
    hAlign ?? (direction === 'horizontal' ? justify : align);
  const resolvedVAlign =
    vAlign ?? (direction === 'horizontal' ? align : justify);
  const mainAlign =
    direction === 'horizontal' ? resolvedHAlign : resolvedVAlign;
  const crossAlign =
    direction === 'horizontal' ? resolvedVAlign : resolvedHAlign;
  const stackStyle: CSSProperties = {
    gap: gap != null ? gapByStep[gap] : undefined,
    justifyContent:
      mainAlign != null && mainAlign in mainAlignValues
        ? mainAlignValues[mainAlign as StackMainAlignment]
        : undefined,
    alignItems:
      crossAlign != null && crossAlign in crossAlignValues
        ? crossAlignValues[crossAlign as StackCrossAlignment]
        : undefined,
    width: toPixelSize(width),
    height: toPixelSize(height),
    ...style,
  };

  return createElement(
    Element,
    {
      ...htmlProps,
      className: cx(stackRecipe({direction, wrap}), className),
      'data-testid': dataTestId,
      ref,
      style: stackStyle,
    },
    children,
  );
}

Stack.displayName = 'Stack';
