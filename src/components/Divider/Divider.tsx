import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import {dividerRecipe} from './Divider.recipe';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'subtle' | 'strong';

/**
 * Visual separator for grouping content.
 */
export interface DividerProps {
  /**
   * Accessible label for the separator. Use when the divider conveys
   * meaning beyond a visual break (e.g., separating named sections).
   */
  'aria-label'?: string;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Length of a vertical divider. Numbers are treated as pixels. Ignored for
   * horizontal dividers, which size to their container width.
   */
  height?: number | string;
  /**
   * Whether the divider should escape container padding.
   */
  isFullBleed?: boolean;
  /**
   * Optional label rendered in the divider.
   */
  label?: ReactNode;
  /**
   * Divider orientation. Default is `horizontal`.
   */
  orientation?: DividerOrientation;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Visual weight of the divider. Default is `subtle`.
   */
  variant?: DividerVariant;
  /**
   * Length of a horizontal divider. Numbers are treated as pixels. Ignored for
   * vertical dividers, which size to their container height.
   */
  width?: number | string;
}

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Divider({
  'aria-label': ariaLabel,
  className,
  'data-testid': dataTestId,
  height,
  isFullBleed = false,
  label,
  orientation = 'horizontal',
  ref,
  style,
  variant = 'subtle',
  width,
}: DividerProps): React.JSX.Element {
  const labelId = useId();
  const isHorizontal = orientation === 'horizontal';
  const classes = dividerRecipe({orientation, variant, isFullBleed});
  // Only the along-axis length applies: width for horizontal, height for
  // vertical. Consumer `style` still wins via the spread below.
  const dimensionStyle: CSSProperties = {
    width: isHorizontal && width != null ? formatSize(width) : undefined,
    height: !isHorizontal && height != null ? formatSize(height) : undefined,
  };

  return (
    <div
      aria-label={ariaLabel}
      aria-labelledby={
        isReactNode(label) && ariaLabel == null ? labelId : undefined
      }
      aria-orientation={orientation}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role="separator"
      style={{...dimensionStyle, ...style}}>
      <div className={classes.line} />
      {isReactNode(label) ? (
        <>
          <div className={classes.label} id={labelId}>
            {label}
          </div>
          <div className={classes.line} />
        </>
      ) : null}
    </div>
  );
}

Divider.displayName = 'Divider';
