import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Divider} from './Divider';

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
