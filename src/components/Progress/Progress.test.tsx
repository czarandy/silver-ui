import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Progress} from 'components/Progress/Progress';

describe('Progress', () => {
  it('renders determinate progress with progressbar role by default', () => {
    render(<Progress label="Progress" value={50} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '50%');
  });

  it('supports meter role for gauge use cases', () => {
    render(<Progress label="Disk usage" role="meter" value={60} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '60');
  });

  it('renders visible label by default', () => {
    render(<Progress label="Storage used" value={50} />);
    expect(screen.getByText('Storage used')).toBeInTheDocument();
  });

  it('shows formatted value label', () => {
    render(
      <Progress
        formatValueLabel={(value, max) => `${value} GB / ${max} GB`}
        hasValueLabel
        label="Disk"
        max={5}
        value={3}
      />,
    );
    expect(screen.getByText('3 GB / 5 GB')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '3 GB / 5 GB',
    );
  });

  it('formats default percentage for non-trivial values', () => {
    render(<Progress hasValueLabel label="Progress" max={3} value={1} />);
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '33%',
    );
  });

  it('clamps value to the valid range', () => {
    const {rerender} = render(<Progress label="Over" max={100} value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );

    rerender(<Progress label="Under" max={100} value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('renders indeterminate progress as a progressbar', () => {
    render(<Progress isIndeterminate label="Loading" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar).not.toHaveAttribute('aria-valuetext');
  });

  it('hides value label in indeterminate mode', () => {
    render(
      <Progress hasValueLabel isIndeterminate label="Loading" value={50} />,
    );
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('keeps label accessible when isLabelHidden is true', () => {
    render(<Progress isLabelHidden label="Storage used" value={50} />);

    expect(screen.getByText('Storage used')).toBeInTheDocument();
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <Progress
        className="custom-progress"
        data-testid="my-progress"
        label="Progress"
        ref={ref}
        style={{maxWidth: 300}}
        value={50}
      />,
    );

    const root = screen.getByTestId('my-progress');
    expect(root).toHaveClass('custom-progress');
    expect(root).toHaveStyle({maxWidth: '300px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('degrades gracefully when max is 0', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Progress hasValueLabel label="Progress" max={0} value={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();

    // An invalid `max` warns once and falls back to a 0% rendering.
    expect(warn).toHaveBeenCalledWith(
      'Progress: `max` must be greater than 0.',
    );
    warn.mockRestore();
  });

  it('applies variant classes to the fill', () => {
    const {rerender} = render(
      <Progress label="Progress" value={50} variant="success" />,
    );
    // eslint-disable-next-line testing-library/no-node-access -- verifying fill element class
    const fill = screen.getByRole('progressbar').firstElementChild;
    if (fill == null) {
      throw new Error('Expected progress fill to render');
    }
    expect(fill).toHaveClass('silver-bg_status.success.solid');

    rerender(<Progress label="Progress" value={50} variant="error" />);
    expect(fill).toHaveClass('silver-bg_status.error.solid');

    rerender(<Progress label="Progress" value={50} variant="warning" />);
    expect(fill).toHaveClass('silver-bg_status.warning.solid');

    rerender(<Progress label="Progress" value={50} variant="neutral" />);
    expect(fill).toHaveClass('silver-bg_status.neutral.solid');

    rerender(<Progress label="Progress" value={50} />);
    expect(fill).toHaveClass('silver-bg_status.info.solid');
  });

  it('applies disabled styling and aria-disabled', () => {
    render(<Progress hasValueLabel isDisabled label="Progress" value={50} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-disabled', 'true');

    // eslint-disable-next-line testing-library/no-node-access -- verifying fill element class
    const fill = bar.firstElementChild;
    if (fill == null) {
      throw new Error('Expected progress fill to render');
    }
    expect(fill).toHaveClass('silver-bg_status.disabled.solid');

    expect(screen.getByText('Progress')).toHaveClass('silver-c_fg.disabled');
    expect(screen.getByText('50%')).toHaveClass('silver-c_fg.disabled');
  });
});
