import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {AspectRatio} from './AspectRatio';

describe('AspectRatio', () => {
  it('renders with the provided aspect ratio', () => {
    render(
      <AspectRatio data-testid="ratio" ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>,
    );

    expect(screen.getByTestId('ratio')).toHaveStyle({
      aspectRatio: String(16 / 9),
    });
  });

  it('renders children inside the ratio container', () => {
    render(
      <AspectRatio ratio={1}>
        <img alt="Preview" src="/preview.png" />
      </AspectRatio>,
    );

    expect(screen.getByRole('img', {name: 'Preview'})).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <AspectRatio
        className="custom-ratio"
        data-testid="ratio"
        ratio={1}
        ref={ref}
        style={{color: 'red'}}>
        <div>Content</div>
      </AspectRatio>,
    );

    const ratio = screen.getByTestId('ratio');
    expect(ratio).toHaveClass('custom-ratio');
    expect(ratio).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
