import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Skeleton} from 'components/Skeleton/Skeleton';

describe('Skeleton', () => {
  it('applies numeric dimensions as pixels', () => {
    render(<Skeleton data-testid="skeleton" height={20} width={120} />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      width: '120px',
      height: '20px',
    });
  });

  it('defaults to 100% width and height when omitted', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      width: '100%',
      height: '100%',
    });
  });

  it('passes through string dimensions without px suffix', () => {
    render(<Skeleton data-testid="skeleton" height="2rem" width="50%" />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      width: '50%',
      height: '2rem',
    });
  });

  it('applies animation delay based on staggerIndex', () => {
    render(<Skeleton data-testid="skeleton" staggerIndex={2} />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      animationDelay: '1200ms',
    });
  });

  it('applies default animation delay when staggerIndex is 0', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      animationDelay: '1000ms',
    });
  });

  it('clamps negative staggerIndex to 0', () => {
    render(<Skeleton data-testid="skeleton" staggerIndex={-5} />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({
      animationDelay: '1000ms',
    });
  });

  it('width and height props take precedence over style', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        height={20}
        style={{width: '50%', height: '50%', opacity: 0.5}}
        width={120}
      />,
    );

    const el = screen.getByTestId('skeleton');
    expect(el).toHaveStyle({
      width: '120px',
      height: '20px',
      opacity: '0.5',
    });
  });

  it('passes through style when width and height are not set', () => {
    render(
      <Skeleton
        data-testid="skeleton"
        style={{width: '50%', height: '2rem', opacity: 0.5}}
      />,
    );

    const el = screen.getByTestId('skeleton');
    expect(el).toHaveStyle({
      width: '100%',
      height: '100%',
      opacity: '0.5',
    });
  });

  it('has role="status" and default aria-label', () => {
    render(<Skeleton data-testid="skeleton" />);

    const el = screen.getByTestId('skeleton');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts a custom aria-label', () => {
    render(<Skeleton aria-label="Loading avatar" data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute(
      'aria-label',
      'Loading avatar',
    );
  });

  it('forwards className, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <Skeleton className="custom-skeleton" data-testid="skeleton" ref={ref} />,
    );

    expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
