import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {dividerRecipe} from './Divider.recipe';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'subtle' | 'strong';

/**
 * Visual separator for grouping content.
 */
export interface DividerProps {
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

const styles = {
  line: css({
    bg: 'silver-neutral.200',
    _dark: {bg: 'silver-neutral.700'},
  }),
  lineStrong: css({
    bg: 'silver-neutral.400',
    _dark: {bg: 'silver-neutral.500'},
  }),
  horizontalLine: css({
    h: '1px',
    flex: 1,
  }),
  verticalLine: css({
    w: '1px',
    flex: 1,
  }),
  label: css({
    flexShrink: 0,
    px: '3',
    fontFamily: 'body',
    fontSize: 'sm',
    color: 'fg.muted',
  }),
  verticalLabel: css({
    px: 0,
    py: '3',
  }),
  fullBleedHorizontal: css({
    mx: 'calc(-1 * var(--container-padding-inline-start, 0px))',
    w: 'calc(100% + var(--container-padding-inline-start, 0px) + var(--container-padding-inline-end, 0px))',
  }),
  fullBleedVertical: css({
    my: 'calc(-1 * var(--container-padding-block-start, 0px))',
    h: 'calc(100% + var(--container-padding-block-start, 0px) + var(--container-padding-block-end, 0px))',
  }),
};

export function Divider({
  className,
  'data-testid': dataTestId,
  isFullBleed = false,
  label,
  orientation = 'horizontal',
  ref,
  style,
  variant = 'subtle',
}: DividerProps): React.JSX.Element {
  const isHorizontal = orientation === 'horizontal';
  const lineClassName = cx(
    styles.line,
    variant === 'strong' && styles.lineStrong,
    isHorizontal ? styles.horizontalLine : styles.verticalLine,
  );

  return (
    <div
      aria-orientation={orientation}
      className={cx(
        dividerRecipe({orientation}),
        isFullBleed &&
          (isHorizontal
            ? styles.fullBleedHorizontal
            : styles.fullBleedVertical),
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role="separator"
      style={style}>
      <div className={lineClassName} />
      {label != null ? (
        <>
          <div
            className={cx(styles.label, !isHorizontal && styles.verticalLabel)}>
            {label}
          </div>
          <div className={lineClassName} />
        </>
      ) : null}
    </div>
  );
}

Divider.displayName = 'Divider';
