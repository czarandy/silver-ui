import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Spinner} from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders available sizes', () => {
    const {rerender} = render(<Spinner size="sm" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    rerender(<Spinner size="md" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    rerender(<Spinner size="lg" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    rerender(<Spinner size="xl" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders available shades', () => {
    const {rerender} = render(
      <Spinner shade="default" data-testid="spinner" />,
    );
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    rerender(<Spinner shade="subtle" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    rerender(<Spinner shade="onMedia" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
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

  it('uses explicit aria-label over string label', () => {
    render(<Spinner label="Loading..." aria-label="Please wait" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Please wait',
    );
  });

  it('renders ReactNode label', () => {
    render(
      <Spinner
        label={<span data-testid="custom-label">Custom content</span>}
        aria-label="Loading"
      />,
    );
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = vi.fn<(element: HTMLSpanElement | null) => void>();
    render(<Spinner ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});
