import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Spinner} from 'components/Spinner/Spinner';

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

  it('forwards native DOM props and allows overriding the default role', () => {
    const handleClick = vi.fn();

    render(
      <Spinner
        aria-live="assertive"
        data-source="upload"
        data-testid="spinner"
        onClick={handleClick}
        role="alert"
      />,
    );

    const root = screen.getByTestId('spinner');
    expect(root).toHaveAttribute('aria-live', 'assertive');
    expect(root).toHaveAttribute('data-source', 'upload');
    expect(root).toHaveAttribute('role', 'alert');

    root.click();
    expect(handleClick).toHaveBeenCalledOnce();
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

    rerender(<Spinner data-testid="spinner" size={28} />);
    expect(screen.getByTestId('spinner')).toHaveClass(
      'silver---spinner-size_28px',
    );

    rerender(<Spinner data-testid="spinner" size={32} />);
    expect(screen.getByTestId('spinner')).toHaveClass(
      'silver---spinner-size_32px',
    );

    rerender(<Spinner data-testid="spinner" size={36} />);
    expect(screen.getByTestId('spinner')).toHaveClass(
      'silver---spinner-size_36px',
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
    expect(screen.getByText('Fetching data')).toHaveClass(
      'silver-c_var(--silver-text-color,_var(--silver-colors-fg))',
    );
  });

  it('renders the visible label in bold', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByText('Fetching data')).toHaveClass('silver-fw_bold');
  });

  it('scales the label with the spinner size', () => {
    // Numeric sizes use the larger 16px label (silver-fs_md).
    const {rerender} = render(<Spinner label="Loading" size={36} />);
    expect(screen.getByText('Loading')).toHaveClass('silver-fs_md');

    // Token sizes keep the 14px label (silver-fs_sm).
    rerender(<Spinner label="Loading" size="lg" />);
    expect(screen.getByText('Loading')).toHaveClass('silver-fs_sm');
  });

  it('scales the description with the spinner size', () => {
    // Numeric sizes use the 14px description (silver-fs_sm).
    const {rerender} = render(
      <Spinner description="Details" label="Loading" size={36} />,
    );
    expect(screen.getByText('Details')).toHaveClass('silver-fs_sm');

    // Token sizes use the 12px description (silver-fs_xs).
    rerender(<Spinner description="Details" label="Loading" size="lg" />);
    expect(screen.getByText('Details')).toHaveClass('silver-fs_xs');
  });

  it('renders a secondary description below the label', () => {
    render(<Spinner description="This may take a moment" label="Uploading" />);
    const description = screen.getByText('This may take a moment');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass(
      'silver-c_var(--silver-text-color-muted,_var(--silver-colors-fg-muted))',
    );
  });

  it('renders a description without a label', () => {
    render(<Spinner description="Almost done" />);
    expect(screen.getByText('Almost done')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('uses inherited color for the on media description', () => {
    render(
      <Spinner description="Buffering" label="Loading" variant="onMedia" />,
    );
    expect(screen.getByText('Buffering')).toHaveClass('silver-c_inherit');
  });

  it('treats an empty description like no description', () => {
    render(<Spinner data-testid="spinner" description="" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveTextContent(/^$/);
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
