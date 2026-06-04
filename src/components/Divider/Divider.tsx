import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {cx} from '../../internal/cx';
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
}

export function Divider({
  'aria-label': ariaLabel,
  className,
  'data-testid': dataTestId,
  isFullBleed = false,
  label,
  orientation = 'horizontal',
  ref,
  style,
  variant = 'subtle',
}: DividerProps): React.JSX.Element {
  const labelId = useId();
  const classes = dividerRecipe({orientation, variant, isFullBleed});

  return (
    <div
      aria-label={ariaLabel}
      aria-labelledby={label != null && ariaLabel == null ? labelId : undefined}
      aria-orientation={orientation}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role="separator"
      style={style}>
      <div className={classes.line} />
      {label != null ? (
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
