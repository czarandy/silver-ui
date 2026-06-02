import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Spinner} from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies custom className to the root element', () => {
    render(<Spinner className="custom-spinner" />);
    expect(screen.getByRole('status')).toHaveClass('custom-spinner');
  });

  it('applies custom style to the root element', () => {
    render(<Spinner style={{color: 'red'}} />);
    expect(screen.getByRole('status')).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('renders available sizes', () => {
    const {rerender} = render(<Spinner data-testid="spinner" size="sm" />);
    expect(screen.getByTestId('spinner')).toHaveClass(
      'silver---spinner-size_var(--silver-sizes-icon-sm)',
    );

    rerender(<Spinner data-testid="spinner" size="md" />);
    expect(screen.getByTestId('spinner')).toHaveClass(
      'silver---spinner-size_var(--silver-sizes-icon-md)',
    );

    rerender(<Spinner data-testid="spinner" size="lg" />);
    expect(screen.getByTestId('spinner')).toHaveClass(
      'silver---spinner-size_var(--silver-sizes-icon-lg)',
    );
  });

  it('renders available variants', () => {
    const {rerender} = render(
      <Spinner data-testid="spinner" variant="default" />,
    );
    expect(screen.getByTestId('spinner')).toHaveClass('silver-c_primary');

    rerender(<Spinner data-testid="spinner" variant="onMedia" />);
    expect(screen.getByTestId('spinner')).toHaveClass('silver-c_fg.onPrimary');
  });

  it('uses normal text color for the default visible label', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByText('Fetching data')).toHaveClass('silver-c_fg');
  });

  it('uses inherited color for the on media visible label', () => {
    render(<Spinner label="Loading media" variant="onMedia" />);
    expect(screen.getByText('Loading media')).toHaveClass('silver-c_inherit');
  });

  it('uses status semantics and default accessible name', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('uses string label as accessible name', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Fetching data',
    );
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });

  it('treats an empty label like no label', () => {
    render(<Spinner label="" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveTextContent(/^$/);
  });

  it('treats non-string labels like no label at runtime', () => {
    render(<Spinner label={false as never} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveTextContent(/^$/);
  });

  it('uses explicit aria-label over string label', () => {
    render(<Spinner aria-label="Please wait" label="Loading..." />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Please wait',
    );
  });

  it('treats an empty aria-label like no aria-label', () => {
    render(<Spinner aria-label="" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('disables animation for reduced motion preferences', () => {
    render(<Spinner />);

    // eslint-disable-next-line testing-library/no-node-access -- visual spinner span is intentionally hidden from accessibility queries
    const visual = screen.getByRole('status').querySelector('[aria-hidden]');
    expect(visual?.className).toContain('prefers-reduced-motion');
    expect(visual?.className).toContain('silver-anim_none');
  });

  it('forwards ref', () => {
    const ref = vi.fn<(element: HTMLSpanElement | null) => void>();
    render(<Spinner ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});
