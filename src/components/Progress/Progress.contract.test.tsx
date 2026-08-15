import {render, screen} from '@testing-library/react';
import type {ComponentType} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CircularProgress} from 'components/CircularProgress/CircularProgress';
import {Progress} from 'components/Progress/Progress';

interface ProgressContractProps {
  formatValueLabel?: (value: number, max: number) => string;
  hasValueLabel?: boolean;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
  isLabelHidden?: boolean;
  label: string;
  max?: number;
  role?: 'meter' | 'progressbar';
  value?: number;
}

const components: {
  Component: ComponentType<ProgressContractProps>;
  name: 'CircularProgress' | 'Progress';
}[] = [
  {Component: Progress, name: 'Progress'},
  {Component: CircularProgress, name: 'CircularProgress'},
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each(components)('$name progress contract', ({Component, name}) => {
  it('exposes determinate value semantics', () => {
    render(<Component label="Upload progress" value={50} />);

    const progressbar = screen.getByRole('progressbar', {
      name: 'Upload progress',
    });
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuetext', '50%');
  });

  it('supports meter semantics for static gauges', () => {
    render(<Component label="Storage used" role="meter" value={60} />);
    expect(screen.getByRole('meter', {name: 'Storage used'})).toHaveAttribute(
      'aria-valuenow',
      '60',
    );
  });

  it('shares formatted value text between the UI and accessibility tree', () => {
    render(
      <Component
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

  it('clamps values and treats NaN as zero', () => {
    const {rerender} = render(
      <Component label="Progress" max={100} value={150} />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );

    rerender(<Component label="Progress" max={100} value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );

    rerender(<Component label="Progress" value={Number.NaN} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '0%',
    );
  });

  it('forces progressbar semantics and hides values when indeterminate', () => {
    render(
      <Component
        hasValueLabel
        isIndeterminate
        label="Loading"
        role="meter"
        value={50}
      />,
    );

    const progressbar = screen.getByRole('progressbar', {name: 'Loading'});
    expect(progressbar).not.toHaveAttribute('aria-valuemin');
    expect(progressbar).not.toHaveAttribute('aria-valuemax');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar).not.toHaveAttribute('aria-valuetext');
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('exposes disabled state', () => {
    render(<Component isDisabled label="Progress" value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('keeps a visually hidden label as the accessible name', () => {
    render(<Component isLabelHidden label="Storage used" value={50} />);
    expect(
      screen.getByRole('progressbar', {name: 'Storage used'}),
    ).toBeInTheDocument();
  });

  it('warns and falls back to zero percent when max is invalid', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<Component hasValueLabel label="Progress" max={0} value={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      `${name}: \`max\` must be greater than 0.`,
    );
  });
});
