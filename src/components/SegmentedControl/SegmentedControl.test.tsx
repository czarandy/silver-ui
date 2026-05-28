import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {SegmentedControl} from './SegmentedControl';
import {SegmentedControlItem} from './SegmentedControlItem';

describe('SegmentedControl', () => {
  it('renders a labelled radiogroup', () => {
    render(
      <SegmentedControl label="View mode" onChange={() => {}} value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem label="List" value="list" />
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-label',
      'View mode',
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toBeChecked();
    expect(screen.getByRole('radio', {name: 'List'})).not.toBeChecked();
  });

  it('calls onChange when selecting a different item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="View mode" onChange={onChange} value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem label="List" value="list" />
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('does not call onChange for selected or disabled items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="View mode" onChange={onChange} value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem isDisabled label="List" value="list" />
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', {name: 'Grid'}));
    await user.click(screen.getByRole('radio', {name: 'List'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports roving keyboard navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="View mode" onChange={onChange} value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem isDisabled label="List" value="list" />
        <SegmentedControlItem label="Table" value="table" />
      </SegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });

  it('renders icon-only items with accessible labels', () => {
    render(
      <SegmentedControl label="View mode" onChange={() => {}} value="grid">
        <SegmentedControlItem
          icon={<span data-testid="grid-icon">G</span>}
          isLabelHidden
          label="Grid view"
          value="grid"
        />
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid view'})).toBeInTheDocument();
    expect(screen.getByTestId('grid-icon')).toBeInTheDocument();
  });
});
