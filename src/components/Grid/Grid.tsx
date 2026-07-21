import type {ComponentPropsWithRef, CSSProperties} from 'react';
import {gridRecipe} from 'components/Grid/Grid.recipe';
import type {SpacingToken} from 'internal/spacingTokens';
import {toPixelSize, type SizeValue} from 'internal/toPixelSize';
import {cx} from 'utils/cx';

export interface GridResponsiveColumns {
  '2xl'?: number;
  base?: number;
  lg?: number;
  md?: number;
  sm?: number;
  xl?: number;
}

export type GridColumns = GridResponsiveColumns | number;
export type GridGap = SpacingToken;

interface GridBaseProps extends ComponentPropsWithRef<'div'> {
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Gap between children.
   */
  gap?: GridGap;
}

interface GridColumnsProps {
  /**
   * Number of equal-width columns, optionally by breakpoint.
   */
  columns?: GridColumns;
  minChildWidth?: never;
}

interface GridMinChildWidthProps {
  columns?: never;
  /**
   * Minimum child width used to automatically fit as many columns as possible.
   * Numbers are treated as pixels.
   */
  minChildWidth?: SizeValue;
}

export type GridProps = GridBaseProps &
  (GridColumnsProps | GridMinChildWidthProps);

type NormalizedGridColumns = Required<GridResponsiveColumns>;

type GridStyle = CSSProperties & {
  '--silver-grid-columns-2xl'?: number;
  '--silver-grid-columns-base'?: number;
  '--silver-grid-columns-lg'?: number;
  '--silver-grid-columns-md'?: number;
  '--silver-grid-columns-sm'?: number;
  '--silver-grid-columns-xl'?: number;
  '--silver-grid-min-child-width'?: number | string;
};

/**
 * CSS `repeat()` requires a positive integer; anything else invalidates the
 * whole `grid-template-columns` declaration and silently collapses the grid
 * to a single column, so invalid counts are clamped with a dev-only warning.
 */
function toColumnCount(value: number): number {
  if (Number.isInteger(value) && value >= 1) {
    return value;
  }
  const clamped = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `Grid: \`columns\` values must be positive integers but received ` +
        `${value}; using ${clamped}.`,
    );
  }
  return clamped;
}

function normalizeColumns(columns: GridColumns): NormalizedGridColumns {
  if (typeof columns === 'number') {
    const count = toColumnCount(columns);
    return {
      '2xl': count,
      base: count,
      lg: count,
      md: count,
      sm: count,
      xl: count,
    };
  }

  const base = columns.base === undefined ? 1 : toColumnCount(columns.base);
  const sm = columns.sm === undefined ? base : toColumnCount(columns.sm);
  const md = columns.md === undefined ? sm : toColumnCount(columns.md);
  const lg = columns.lg === undefined ? md : toColumnCount(columns.lg);
  const xl = columns.xl === undefined ? lg : toColumnCount(columns.xl);

  return {
    '2xl': columns['2xl'] === undefined ? xl : toColumnCount(columns['2xl']),
    base,
    lg,
    md,
    sm,
    xl,
  };
}

/**
 * Two-dimensional layout with equal-width or automatically fitting columns.
 */
export function Grid({
  children,
  className,
  columns,
  'data-testid': dataTestId,
  gap,
  minChildWidth,
  ref,
  style,
  ...htmlProps
}: GridProps): React.JSX.Element {
  const normalizedColumns =
    columns === undefined ? undefined : normalizeColumns(columns);
  const gridStyle: GridStyle = {
    ...style,
    ...(normalizedColumns === undefined
      ? undefined
      : {
          '--silver-grid-columns-2xl': normalizedColumns['2xl'],
          '--silver-grid-columns-base': normalizedColumns.base,
          '--silver-grid-columns-lg': normalizedColumns.lg,
          '--silver-grid-columns-md': normalizedColumns.md,
          '--silver-grid-columns-sm': normalizedColumns.sm,
          '--silver-grid-columns-xl': normalizedColumns.xl,
        }),
    ...(minChildWidth === undefined
      ? undefined
      : {
          '--silver-grid-min-child-width': toPixelSize(minChildWidth),
        }),
  };
  const layout =
    columns !== undefined
      ? 'columns'
      : minChildWidth !== undefined
        ? 'minChildWidth'
        : undefined;

  return (
    <div
      {...htmlProps}
      className={cx(gridRecipe({gap, layout}), className)}
      data-testid={dataTestId}
      ref={ref}
      style={gridStyle}>
      {children}
    </div>
  );
}

Grid.displayName = 'Grid';
