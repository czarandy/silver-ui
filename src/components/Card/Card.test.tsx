import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Card} from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('forwards native HTML attributes', () => {
    render(
      <Card aria-label="Settings" data-testid="card" role="region">
        Content
      </Card>,
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Settings');
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Card
        className="custom-card"
        data-testid="card"
        ref={ref}
        style={{color: 'red'}}>
        Content
      </Card>,
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
    expect(card).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies the default variant class', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('silver-bg_bg');
  });

  it('applies the muted variant class', () => {
    render(
      <Card data-testid="card" variant="muted">
        Content
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveClass('silver-bg_bg.subtle');
  });

  it('defaults to padding 0', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('silver-p_0');
  });

  it('applies custom padding class', () => {
    render(
      <Card data-testid="card" padding={4}>
        Content
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveClass('silver-p_4');
  });
});
