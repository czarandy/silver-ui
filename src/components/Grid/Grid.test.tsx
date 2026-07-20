import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
// Avoid Panda treating silver-ui's Grid JSX as its built-in grid pattern.
import {Grid as SilverGrid, type GridGap} from 'components/Grid/Grid';

const breakpointNames = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

function columnVariable(breakpoint: (typeof breakpointNames)[number]): string {
  return `--silver-grid-columns-${breakpoint}`;
}

describe('Grid', () => {
  it('renders children in a grid', () => {
    render(
      <SilverGrid data-testid="grid">
        <div>One</div>
        <div>Two</div>
      </SilverGrid>,
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toHaveClass('silver-d_grid');
  });

  it('applies a scalar column count at every breakpoint', () => {
    render(
      <SilverGrid columns={3} data-testid="grid">
        Content
      </SilverGrid>,
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
      <SilverGrid columns={{base: 1, sm: 2, lg: 4}} data-testid="grid">
        Content
      </SilverGrid>,
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
      <SilverGrid columns={{md: 3}} data-testid="grid">
        Content
      </SilverGrid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid.style.getPropertyValue(columnVariable('base'))).toBe('1');
    expect(grid.style.getPropertyValue(columnVariable('sm'))).toBe('1');
    expect(grid.style.getPropertyValue(columnVariable('md'))).toBe('3');
    expect(grid.style.getPropertyValue(columnVariable('lg'))).toBe('3');
    expect(grid.style.getPropertyValue(columnVariable('xl'))).toBe('3');
    expect(grid.style.getPropertyValue(columnVariable('2xl'))).toBe('3');
  });

  it('uses equal-width minmax tracks for column mode', () => {
    render(
      <SilverGrid columns={2} data-testid="grid">
        Content
      </SilverGrid>,
    );

    expect(screen.getByTestId('grid')).toHaveClass(
      'silver-grid-tc_repeat(var(--silver-grid-columns-base),_minmax(0,_1fr))',
    );
  });

  it('converts numeric minimum child widths to pixels and uses auto-fit', () => {
    render(
      <SilverGrid data-testid="grid" minChildWidth={220}>
        Content
      </SilverGrid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid.style.getPropertyValue('--silver-grid-min-child-width')).toBe(
      '220px',
    );
    expect(grid).toHaveClass(
      'silver-grid-tc_repeat(auto-fit,_minmax(var(--silver-grid-min-child-width),_1fr))',
    );
  });

  it('preserves string minimum child widths', () => {
    render(
      <SilverGrid data-testid="grid" minChildWidth="20rem">
        Content
      </SilverGrid>,
    );

    expect(
      screen
        .getByTestId('grid')
        .style.getPropertyValue('--silver-grid-min-child-width'),
    ).toBe('20rem');
  });

  it.each([
    [0, '0'],
    [0.5, '0.5'],
    [1, '1'],
    [1.5, '1.5'],
    [2, '2'],
    [3, '3'],
    [4, '4'],
    [5, '5'],
    [6, '6'],
    [8, '8'],
    [10, '10'],
  ] satisfies ReadonlyArray<readonly [GridGap, string]>)(
    'applies gap=%s',
    (gap, classValue) => {
      render(
        <SilverGrid data-testid="grid" gap={gap}>
          Content
        </SilverGrid>,
      );

      expect(screen.getByTestId('grid')).toHaveClass(
        `silver-gap_${classValue}`,
      );
    },
  );

  it('does not apply a gap class when gap is omitted', () => {
    render(<SilverGrid data-testid="grid">Content</SilverGrid>);

    const classList = Array.from(screen.getByTestId('grid').classList);
    expect(classList.some(className => className.includes('gap'))).toBe(false);
  });

  it('forwards className, style, native attributes, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <SilverGrid
        aria-label="Results"
        className="custom-grid"
        data-testid="grid"
        ref={ref}
        role="region"
        style={{color: 'red'}}>
        Content
      </SilverGrid>,
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('custom-grid');
    expect(grid).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(grid).toHaveAttribute('aria-label', 'Results');
    expect(grid).toHaveAttribute('role', 'region');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('leaves a bare grid without an explicit template mode', () => {
    render(<SilverGrid data-testid="grid">Content</SilverGrid>);

    const grid = screen.getByTestId('grid');
    expect(
      Array.from(grid.classList).some(className =>
        className.includes('grid-tc'),
      ),
    ).toBe(false);
    expect(grid).not.toHaveAttribute('style');
  });
});
