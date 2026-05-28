import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Progress} from './Progress';

describe('Progress', () => {
  it('renders determinate progress as a meter', () => {
    render(<Progress label="Progress" value={50} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-valuetext', '50%');
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
    expect(screen.getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      '3 GB / 5 GB',
    );
  });

  it('clamps value to the valid range', () => {
    const {rerender} = render(<Progress label="Over" max={100} value={150} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');

    rerender(<Progress label="Under" max={100} value={-10} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
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

  it('passes data-testid to the root', () => {
    render(<Progress data-testid="my-progress" label="Progress" value={50} />);
    expect(screen.getByTestId('my-progress')).toBeInTheDocument();
  });
});
