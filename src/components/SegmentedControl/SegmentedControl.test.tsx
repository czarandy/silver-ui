import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LayoutGrid} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {SegmentedControl} from 'components/SegmentedControl/SegmentedControl';
import {SegmentedControlItem} from 'components/SegmentedControl/SegmentedControlItem';

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
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
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

  it('does not call onChange when keyboard-activating disabled items', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="View mode" onChange={onChange} value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem isDisabled label="List" value="list" />
      </SegmentedControl>,
    );

    screen.getByRole('radio', {name: 'List'}).focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

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

  it('supports Home and End keyboard navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="View mode" onChange={onChange} value="list">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem label="List" value="list" />
        <SegmentedControlItem label="Table" value="table" />
      </SegmentedControl>,
    );

    screen.getByRole('radio', {name: 'List'}).focus();
    await user.keyboard('{Home}');

    expect(onChange).toHaveBeenLastCalledWith('grid');
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveFocus();

    await user.keyboard('{End}');

    expect(onChange).toHaveBeenLastCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();
  });

  it('supports reverse and wrapping keyboard navigation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="View mode" onChange={onChange} value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem label="List" value="list" />
        <SegmentedControlItem label="Table" value="table" />
      </SegmentedControl>,
    );

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowLeft}');

    expect(onChange).toHaveBeenLastCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();

    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith('table');
    expect(screen.getByRole('radio', {name: 'Table'})).toHaveFocus();

    screen.getByRole('radio', {name: 'Table'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenLastCalledWith('grid');
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveFocus();
  });

  it('applies fill layout styling to the root and items', () => {
    render(
      <>
        <SegmentedControl
          data-testid="hug-control"
          label="Hug layout"
          onChange={() => {}}
          value="grid">
          <SegmentedControlItem
            data-testid="hug-item"
            label="Grid"
            value="grid"
          />
        </SegmentedControl>
        <SegmentedControl
          data-testid="fill-control"
          label="Fill layout"
          layout="fill"
          onChange={() => {}}
          value="grid">
          <SegmentedControlItem
            data-testid="fill-item"
            label="Grid"
            value="grid"
          />
        </SegmentedControl>
      </>,
    );

    expect(screen.getByTestId('fill-control')).not.toHaveAttribute(
      'class',
      screen.getByTestId('hug-control').getAttribute('class') ?? '',
    );
    expect(screen.getByTestId('fill-item')).not.toHaveAttribute(
      'class',
      screen.getByTestId('hug-item').getAttribute('class') ?? '',
    );
  });

  it('applies size styling to items', () => {
    render(
      <>
        <SegmentedControl label="Small" onChange={() => {}} size="sm" value="a">
          <SegmentedControlItem data-testid="sm-item" label="A" value="a" />
        </SegmentedControl>
        <SegmentedControl
          label="Medium"
          onChange={() => {}}
          size="md"
          value="a">
          <SegmentedControlItem data-testid="md-item" label="A" value="a" />
        </SegmentedControl>
        <SegmentedControl label="Large" onChange={() => {}} size="lg" value="a">
          <SegmentedControlItem data-testid="lg-item" label="A" value="a" />
        </SegmentedControl>
      </>,
    );

    expect(screen.getByTestId('sm-item')).not.toHaveAttribute(
      'class',
      screen.getByTestId('md-item').getAttribute('class') ?? '',
    );
    expect(screen.getByTestId('lg-item')).not.toHaveAttribute(
      'class',
      screen.getByTestId('md-item').getAttribute('class') ?? '',
    );
  });

  it('blocks interactions when the root is disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl
        isDisabled
        label="View mode"
        onChange={onChange}
        value="grid">
        <SegmentedControlItem label="Grid" value="grid" />
        <SegmentedControlItem label="List" value="list" />
      </SegmentedControl>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('radio', {name: 'List'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    fireEvent.click(screen.getByRole('radio', {name: 'List'}));
    screen.getByRole('radio', {name: 'Grid'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', {name: 'Grid'})).toHaveFocus();
  });

  it('forwards refs to the root and items', () => {
    let controlRef: HTMLDivElement | null = null;
    let itemRef: HTMLButtonElement | null = null;

    render(
      <SegmentedControl
        label="View mode"
        onChange={() => {}}
        ref={node => {
          controlRef = node;
        }}
        value="grid">
        <SegmentedControlItem
          label="Grid"
          ref={node => {
            itemRef = node;
          }}
          value="grid"
        />
      </SegmentedControl>,
    );

    expect(controlRef).toBe(screen.getByRole('radiogroup'));
    expect(itemRef).toBe(screen.getByRole('radio', {name: 'Grid'}));
  });

  it('passes className, style, and data-testid through to the root and items', () => {
    render(
      <SegmentedControl
        className="custom-control"
        data-testid="view-mode"
        label="View mode"
        onChange={() => {}}
        style={{marginTop: 8}}
        value="grid">
        <SegmentedControlItem
          className="custom-item"
          data-testid="grid-item"
          label="Grid"
          style={{minWidth: 120}}
          value="grid"
        />
      </SegmentedControl>,
    );

    expect(screen.getByTestId('view-mode')).toBe(
      screen.getByRole('radiogroup'),
    );
    expect(screen.getByTestId('view-mode')).toHaveClass('custom-control');
    expect(screen.getByTestId('view-mode')).toHaveStyle({marginTop: '8px'});
    expect(screen.getByTestId('grid-item')).toBe(
      screen.getByRole('radio', {name: 'Grid'}),
    );
    expect(screen.getByTestId('grid-item')).toHaveClass('custom-item');
    expect(screen.getByTestId('grid-item')).toHaveStyle({minWidth: '120px'});
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState('grid');
      return (
        <SegmentedControl label="View mode" onChange={setValue} value={value}>
          <SegmentedControlItem label="Grid" value="grid" />
          <SegmentedControlItem label="List" value="list" />
        </SegmentedControl>
      );
    }

    render(<Example />);

    await user.click(screen.getByRole('radio', {name: 'List'}));

    expect(screen.getByRole('radio', {name: 'Grid'})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: 'List'})).toBeChecked();
  });

  it('renders icon-only items with accessible labels', () => {
    render(
      <SegmentedControl label="View mode" onChange={() => {}} value="grid">
        <SegmentedControlItem
          icon={LayoutGrid}
          isLabelHidden
          label="Grid view"
          value="grid"
        />
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', {name: 'Grid view'})).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- verifying icon SVG presence
    expect(screen.getByRole('radio').querySelector('svg')).toBeInTheDocument();
  });

  it('throws when SegmentedControlItem is used outside SegmentedControl', () => {
    expect(() =>
      render(<SegmentedControlItem label="Orphan" value="orphan" />),
    ).toThrow('SegmentedControlItem must be used within a SegmentedControl.');
  });
});
