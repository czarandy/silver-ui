import type {ComponentPropsWithRef, CSSProperties} from 'react';
import {gridRecipe} from 'components/Grid/Grid.recipe';
import {breakpointNames, type Breakpoint} from 'internal/breakpoints';
import type {SpacingToken} from 'internal/spacingTokens';
import {toPixelSize, type SizeValue} from 'internal/toPixelSize';
import {cx} from 'utils/cx';

export type {SizeValue};

export type GridResponsiveColumns = Partial<Record<Breakpoint, number>>;

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
  [Name in Breakpoint as `--silver-grid-columns-${Name}`]?: number;
} & {
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

/**
 * Fills every breakpoint, carrying the last specified count forward and
 * defaulting to one column below the first specified breakpoint.
 */
function normalizeColumns(columns: GridColumns): NormalizedGridColumns {
  const byBreakpoint = typeof columns === 'number' ? {base: columns} : columns;
  const normalized: GridResponsiveColumns = {};
  let previous = 1;
  for (const breakpoint of breakpointNames) {
    const value = byBreakpoint[breakpoint];
    if (value !== undefined) {
      previous = toColumnCount(value);
    }
    normalized[breakpoint] = previous;
  }
  return normalized as NormalizedGridColumns;
}

function columnVariables(columns: NormalizedGridColumns): GridStyle {
  const variables: GridStyle = {};
  for (const breakpoint of breakpointNames) {
    variables[`--silver-grid-columns-${breakpoint}`] = columns[breakpoint];
  }
  return variables;
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
      : columnVariables(normalizedColumns)),
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
