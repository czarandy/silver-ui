import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Card} from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies sizing props as inline styles', () => {
    render(
      <Card data-testid="card" height={200} maxWidth={400} width={300}>
        Content
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveStyle({
      height: '200px',
      maxWidth: '400px',
      width: '300px',
    });
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
});
