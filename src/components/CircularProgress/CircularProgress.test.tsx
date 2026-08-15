import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {CircularProgress} from 'components/CircularProgress/CircularProgress';

function getIndicator(): SVGCircleElement {
  const progressbar = screen.getByRole('progressbar');
  // eslint-disable-next-line testing-library/no-node-access -- the SVG arc is decorative and has no accessible role
  const indicator = progressbar.querySelector('[data-progress-indicator]');
  if (indicator == null) {
    throw new Error('Expected circular progress indicator to render');
  }
  return indicator as SVGCircleElement;
}

describe('CircularProgress', () => {
  it('renders determinate progress as an SVG ring', () => {
    render(<CircularProgress label="Upload progress" value={40} />);

    const indicator = getIndicator();
    expect(indicator).toHaveAttribute('cx', '50');
    expect(indicator).toHaveAttribute('cy', '50');
    expect(indicator).toHaveAttribute('r', '46');
    expect(indicator).toHaveAttribute('pathLength', '100');
    expect(indicator).toHaveAttribute('stroke-dasharray', '100');
    expect(indicator).toHaveAttribute('stroke-linecap', 'round');
    expect(indicator).toHaveAttribute('stroke-width', '8');
    expect(indicator).toHaveStyle({strokeDashoffset: '60'});
  });

  it('starts empty without rendering a rounded-cap dot', () => {
    render(<CircularProgress label="Upload progress" />);

    expect(getIndicator()).toHaveStyle({
      opacity: '0',
      strokeDashoffset: '100',
    });
  });

  it('centers the formatted value and renders the label below the ring', () => {
    render(
      <CircularProgress
        formatValueLabel={(value, max) => `${value} / ${max}`}
        hasValueLabel
        label="Files uploaded"
        max={5}
        value={3}
      />,
    );

    const progressbar = screen.getByRole('progressbar');
    const valueLabel = screen.getByText('3 / 5');
    const label = screen.getByText('Files uploaded');
    expect(progressbar).toContainElement(valueLabel);
    expect(progressbar).not.toContainElement(label);
    expect(valueLabel).toHaveClass('silver-fs_sm');
    expect(label).toHaveClass('silver-fw_medium');
  });

  it('renders a rotating partial arc when indeterminate', () => {
    render(<CircularProgress isIndeterminate label="Uploading" />);

    const indicator = getIndicator();
    expect(indicator).toHaveAttribute('stroke-dasharray', '25 75');
    expect(indicator).not.toHaveStyle({strokeDashoffset: '100'});
    expect(indicator).toHaveAttribute(
      'class',
      expect.stringContaining('silver-anim_spin_1.5s_linear_infinite'),
    );
    expect(indicator).toHaveAttribute(
      'class',
      expect.stringContaining('prefers-reduced-motion'),
    );
    expect(indicator).toHaveAttribute(
      'class',
      expect.stringContaining('silver-anim_spin_3s_linear_infinite'),
    );
  });

  it('applies semantic variants to the indicator', () => {
    const {rerender} = render(
      <CircularProgress label="Progress" value={50} variant="success" />,
    );
    const indicator = getIndicator();
    expect(indicator).toHaveClass('silver-c_status.success.solid');

    rerender(<CircularProgress label="Progress" value={50} variant="error" />);
    expect(indicator).toHaveClass('silver-c_status.error.solid');

    rerender(
      <CircularProgress label="Progress" value={50} variant="warning" />,
    );
    expect(indicator).toHaveClass('silver-c_status.warning.solid');

    rerender(
      <CircularProgress label="Progress" value={50} variant="neutral" />,
    );
    expect(indicator).toHaveClass('silver-c_status.neutral.solid');

    rerender(<CircularProgress label="Progress" value={50} />);
    expect(indicator).toHaveClass('silver-c_status.info.solid');
  });

  it('applies disabled styling to the indicator and visible text', () => {
    render(
      <CircularProgress hasValueLabel isDisabled label="Progress" value={50} />,
    );

    expect(getIndicator()).toHaveClass('silver-c_status.disabled.solid');
    expect(screen.getByText('Progress')).toHaveClass('silver-c_fg.disabled');
    expect(screen.getByText('50%')).toHaveClass('silver-c_fg.disabled');
  });

  it('supports numeric and CSS length sizes', () => {
    const {rerender} = render(
      <CircularProgress data-testid="progress" label="Progress" size={80} />,
    );
    expect(screen.getByTestId('progress')).toHaveStyle({
      '--circular-progress-size': '80px',
    });

    rerender(
      <CircularProgress data-testid="progress" label="Progress" size="5rem" />,
    );
    expect(screen.getByTestId('progress')).toHaveStyle({
      '--circular-progress-size': '5rem',
    });
  });

  it('forwards className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <CircularProgress
        className="custom-progress"
        data-testid="progress"
        label="Progress"
        ref={ref}
        style={{maxWidth: 120}}
      />,
    );

    const root = screen.getByTestId('progress');
    expect(root).toHaveClass('custom-progress');
    expect(root).toHaveStyle({
      '--circular-progress-size': '64px',
      maxWidth: '120px',
    });
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
