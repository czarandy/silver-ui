import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Divider} from 'components/Divider/Divider';

/**
 * Class tokens present in `withFlag` but not in `base`.
 */
function addedClasses(base: string, withFlag: string): string[] {
  const baseTokens = new Set(base.split(/\s+/).filter(Boolean));
  return withFlag.split(/\s+/).filter(token => token && !baseTokens.has(token));
}

describe('Divider', () => {
  it('defaults to horizontal orientation', () => {
    render(<Divider />);

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  });

  it('renders as a vertical separator', () => {
    render(<Divider orientation="vertical" />);

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('renders an optional label with aria-labelledby', () => {
    render(<Divider label="Section 2" />);

    const separator = screen.getByRole('separator', {name: 'Section 2'});
    expect(separator).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('prefers aria-label over aria-labelledby when both are possible', () => {
    render(<Divider aria-label="Custom name" label="Visible text" />);

    const separator = screen.getByRole('separator', {name: 'Custom name'});
    expect(separator).not.toHaveAttribute('aria-labelledby');
  });

  it('forwards aria-label without a visible label', () => {
    render(<Divider aria-label="Section break" />);

    expect(
      screen.getByRole('separator', {name: 'Section break'}),
    ).toBeInTheDocument();
  });

  it('renders with strong variant', () => {
    render(<Divider data-testid="divider" variant="strong" />);

    expect(screen.getByTestId('divider')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies full-bleed styles when isFullBleed is true', () => {
    const {rerender} = render(<Divider data-testid="divider" />);

    const divider = screen.getByTestId('divider');
    const classesWithout = divider.className;

    rerender(<Divider data-testid="divider" isFullBleed />);
    const classesWith = divider.className;

    expect(classesWith).not.toBe(classesWithout);
  });

  it('applies a distinct full-bleed style for vertical orientation', () => {
    const {rerender} = render(
      <Divider data-testid="divider" orientation="vertical" />,
    );
    const divider = screen.getByTestId('divider');

    const verticalBase = divider.className;
    rerender(
      <Divider data-testid="divider" isFullBleed orientation="vertical" />,
    );
    const verticalAdded = addedClasses(verticalBase, divider.className);

    // Enabling full-bleed on a vertical divider adds a style class.
    expect(verticalAdded.length).toBeGreaterThan(0);

    // That class must differ from the horizontal full-bleed class, otherwise the
    // orientation branch (fullBleedVertical vs fullBleedHorizontal) is wrong.
    rerender(<Divider data-testid="divider" orientation="horizontal" />);
    const horizontalBase = divider.className;
    rerender(
      <Divider data-testid="divider" isFullBleed orientation="horizontal" />,
    );
    const horizontalAdded = addedClasses(horizontalBase, divider.className);

    expect(verticalAdded).not.toEqual(horizontalAdded);
  });

  it('applies width to a horizontal divider and ignores height', () => {
    render(<Divider data-testid="divider" height={50} width={200} />);

    const divider = screen.getByTestId('divider');
    expect(divider).toHaveStyle({width: '200px'});
    // height is the cross axis for a horizontal divider, so it is not applied.
    expect(divider).not.toHaveStyle({height: '50px'});
  });

  it('applies height to a vertical divider and ignores width', () => {
    render(
      <Divider
        data-testid="divider"
        height={120}
        orientation="vertical"
        width={200}
      />,
    );

    const divider = screen.getByTestId('divider');
    expect(divider).toHaveStyle({height: '120px'});
    expect(divider).not.toHaveStyle({width: '200px'});
  });

  it('accepts string dimension values verbatim', () => {
    render(<Divider data-testid="divider" width="50%" />);

    expect(screen.getByTestId('divider')).toHaveStyle({width: '50%'});
  });

  it('lets consumer style override the dimension', () => {
    render(
      <Divider data-testid="divider" style={{width: '10px'}} width={200} />,
    );

    expect(screen.getByTestId('divider')).toHaveStyle({width: '10px'});
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Divider
        className="custom-divider"
        data-testid="divider"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const divider = screen.getByTestId('divider');
    expect(divider).toHaveClass('custom-divider');
    expect(divider).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
