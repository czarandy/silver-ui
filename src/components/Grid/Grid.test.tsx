import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Grid} from 'components/Grid';

const breakpointNames = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

function columnVariable(breakpoint: (typeof breakpointNames)[number]): string {
  return `--silver-grid-columns-${breakpoint}`;
}

describe('Grid', () => {
  it('renders children in a grid', () => {
    render(
      <Grid data-testid="grid">
        <div>One</div>
        <div>Two</div>
      </Grid>,
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toHaveClass('silver-d_grid');
  });

  it('applies a scalar column count at every breakpoint', () => {
    render(
      <Grid columns={3} data-testid="grid">
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    for (const breakpoint of breakpointNames) {
      expect(grid.style.getPropertyValue(columnVariable(breakpoint))).toBe('3');
      const condition = breakpoint === 'base' ? '' : `${breakpoint}:`;
      expect(grid).toHaveClass(
        `${condition}silver-grid-tc_repeat(var(${columnVariable(breakpoint)}),_minmax(0,_1fr))`,
      );
    }
  });

  it('carries responsive column counts forward across omitted breakpoints', () => {
    render(
      <Grid columns={{base: 1, sm: 2, lg: 4}} data-testid="grid">
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid.style.getPropertyValue(columnVariable('base'))).toBe('1');
    expect(grid.style.getPropertyValue(columnVariable('sm'))).toBe('2');
    expect(grid.style.getPropertyValue(columnVariable('md'))).toBe('2');
    expect(grid.style.getPropertyValue(columnVariable('lg'))).toBe('4');
    expect(grid.style.getPropertyValue(columnVariable('xl'))).toBe('4');
    expect(grid.style.getPropertyValue(columnVariable('2xl'))).toBe('4');
  });

  it('uses one column below the first specified breakpoint', () => {
    render(
      <Grid columns={{md: 3}} data-testid="grid">
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid.style.getPropertyValue(columnVariable('base'))).toBe('1');
    expect(grid.style.getPropertyValue(columnVariable('sm'))).toBe('1');
    expect(grid.style.getPropertyValue(columnVariable('md'))).toBe('3');
    expect(grid.style.getPropertyValue(columnVariable('lg'))).toBe('3');
    expect(grid.style.getPropertyValue(columnVariable('xl'))).toBe('3');
    expect(grid.style.getPropertyValue(columnVariable('2xl'))).toBe('3');
  });

  it('clamps non-positive column counts to one column and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <Grid columns={0} data-testid="grid">
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    for (const breakpoint of breakpointNames) {
      expect(grid.style.getPropertyValue(columnVariable(breakpoint))).toBe('1');
    }
    expect(warn).toHaveBeenCalledWith(
      'Grid: `columns` values must be positive integers but received 0; using 1.',
    );
  });

  it('floors fractional column counts and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <Grid columns={{base: 2.5, md: 0}} data-testid="grid">
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid.style.getPropertyValue(columnVariable('base'))).toBe('2');
    expect(grid.style.getPropertyValue(columnVariable('sm'))).toBe('2');
    expect(grid.style.getPropertyValue(columnVariable('md'))).toBe('1');
    expect(grid.style.getPropertyValue(columnVariable('2xl'))).toBe('1');
    expect(warn).toHaveBeenCalledWith(
      'Grid: `columns` values must be positive integers but received 2.5; using 2.',
    );
    expect(warn).toHaveBeenCalledWith(
      'Grid: `columns` values must be positive integers but received 0; using 1.',
    );
  });

  it('converts numeric minimum child widths to pixels and uses auto-fit', () => {
    render(
      <Grid data-testid="grid" minChildWidth={220}>
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid.style.getPropertyValue('--silver-grid-min-child-width')).toBe(
      '220px',
    );
    expect(grid).toHaveClass(
      'silver-grid-tc_repeat(auto-fit,_minmax(min(100%,_var(--silver-grid-min-child-width)),_1fr))',
    );
  });

  it('preserves string minimum child widths', () => {
    render(
      <Grid data-testid="grid" minChildWidth="20rem">
        Content
      </Grid>,
    );

    expect(
      screen
        .getByTestId('grid')
        .style.getPropertyValue('--silver-grid-min-child-width'),
    ).toBe('20rem');
  });

  it('converts unit-less string minimum child widths to pixels and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <Grid data-testid="grid" minChildWidth="220">
        Content
      </Grid>,
    );

    expect(
      screen
        .getByTestId('grid')
        .style.getPropertyValue('--silver-grid-min-child-width'),
    ).toBe('220px');
    expect(warn).toHaveBeenCalledWith(
      "silver-ui: size string '220' has no unit and is not valid CSS; " +
        'treating it as 220px. Pass a number or include a unit.',
    );
  });

  it('applies gap class for the given gap value', () => {
    render(
      <Grid data-testid="grid" gap={4}>
        Content
      </Grid>,
    );

    expect(screen.getByTestId('grid')).toHaveClass('silver-gap_4');
  });

  it('applies gap={0} class', () => {
    render(
      <Grid data-testid="grid" gap={0}>
        Content
      </Grid>,
    );

    expect(screen.getByTestId('grid')).toHaveClass('silver-gap_0');
  });

  it('does not apply a gap class when gap is omitted', () => {
    render(<Grid data-testid="grid">Content</Grid>);

    const classList = Array.from(screen.getByTestId('grid').classList);
    expect(classList.some(className => className.includes('gap'))).toBe(false);
  });

  it('forwards className, style, native attributes, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Grid
        aria-label="Results"
        className="custom-grid"
        data-testid="grid"
        ref={ref}
        role="region"
        style={{color: 'red'}}>
        Content
      </Grid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('custom-grid');
    expect(grid).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(grid).toHaveAttribute('aria-label', 'Results');
    expect(grid).toHaveAttribute('role', 'region');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('leaves a bare grid without an explicit template mode', () => {
    render(<Grid data-testid="grid">Content</Grid>);

    const grid = screen.getByTestId('grid');
    expect(
      Array.from(grid.classList).some(className =>
        className.includes('grid-tc'),
      ),
    ).toBe(false);
    expect(grid).not.toHaveAttribute('style');
  });
});
