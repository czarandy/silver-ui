import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Divider} from './Divider';

describe('Divider', () => {
  it('renders as a separator with orientation', () => {
    render(<Divider data-testid="divider" orientation="vertical" />);

    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('renders an optional label', () => {
    render(<Divider label="or" />);

    expect(screen.getByText('or')).toBeInTheDocument();
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
