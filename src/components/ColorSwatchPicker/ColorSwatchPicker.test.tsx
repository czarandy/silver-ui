import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef, useState} from 'react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {ColorSwatchPicker} from 'components/ColorSwatchPicker/ColorSwatchPicker';
import {COLOR_LABELS, COLOR_NAMES, type ColorName} from 'internal/colorNames';
import {createPopoverFocusShim} from 'internal/testHelpers';

const shim = createPopoverFocusShim();

beforeAll(shim.install);
afterAll(shim.uninstall);
beforeEach(() => {
  shim.reset();
  shim.setFocusVisible(false);
});

describe('ColorSwatchPicker', () => {
  it('renders a labelled radiogroup with one radio per color', () => {
    render(
      <ColorSwatchPicker
        label="Office color"
        onChange={() => {}}
        value="blue"
      />,
    );

    const group = screen.getByRole('radiogroup', {name: 'Office color'});
    expect(group).toHaveAttribute('aria-orientation', 'horizontal');

    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(COLOR_NAMES.length);
    for (const color of COLOR_NAMES) {
      expect(
        within(group).getByRole('radio', {name: COLOR_LABELS[color]}),
      ).toBeInTheDocument();
    }
  });

  it('renders controlled checked state and roving tabindex', () => {
    render(
      <ColorSwatchPicker
        label="Office color"
        onChange={() => {}}
        value="blue"
      />,
    );

    const selected = screen.getByRole('radio', {name: 'Blue'});
    expect(selected).toHaveAttribute('tabindex', '0');
    expect(selected).toBeChecked();

    for (const color of COLOR_NAMES.filter(color => color !== 'blue')) {
      const radio = screen.getByRole('radio', {name: COLOR_LABELS[color]});
      expect(radio).toHaveAttribute('tabindex', '-1');
      expect(radio).not.toBeChecked();
    }
  });

  it('updates controlled state when a swatch is clicked', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState<ColorName>('red');
      return (
        <ColorSwatchPicker
          label="Office color"
          onChange={setValue}
          value={value}
        />
      );
    }

    render(<Example />);

    await user.click(screen.getByRole('radio', {name: 'Blue'}));

    expect(screen.getByRole('radio', {name: 'Red'})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: 'Blue'})).toBeChecked();
  });

  it('calls onChange when clicking a different swatch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ColorSwatchPicker
        label="Office color"
        onChange={onChange}
        value="red"
      />,
    );

    await user.click(screen.getByRole('radio', {name: 'Blue'}));
    expect(onChange).toHaveBeenCalledWith('blue');
  });

  it('does not call onChange when clicking the selected swatch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ColorSwatchPicker
        label="Office color"
        onChange={onChange}
        value="red"
      />,
    );

    await user.click(screen.getByRole('radio', {name: 'Red'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports arrow key navigation with selection following focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ColorSwatchPicker
        colors={['red', 'blue', 'green']}
        label="Office color"
        onChange={onChange}
        value="red"
      />,
    );

    screen.getByRole('radio', {name: 'Red'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenLastCalledWith('blue');
    expect(screen.getByRole('radio', {name: 'Blue'})).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenLastCalledWith('green');
    expect(screen.getByRole('radio', {name: 'Green'})).toHaveFocus();

    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', {name: 'Red'})).toHaveFocus();
  });

  it('supports reverse navigation plus Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ColorSwatchPicker
        colors={['red', 'blue', 'green']}
        label="Office color"
        onChange={onChange}
        value="blue"
      />,
    );

    screen.getByRole('radio', {name: 'Blue'}).focus();
    await user.keyboard('{ArrowLeft}');

    expect(onChange).toHaveBeenLastCalledWith('red');
    expect(screen.getByRole('radio', {name: 'Red'})).toHaveFocus();

    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenLastCalledWith('green');
    expect(screen.getByRole('radio', {name: 'Green'})).toHaveFocus();

    await user.keyboard('{Home}');

    expect(onChange).toHaveBeenLastCalledWith('red');
    expect(screen.getByRole('radio', {name: 'Red'})).toHaveFocus();

    await user.keyboard('{End}');

    expect(onChange).toHaveBeenLastCalledWith('green');
    expect(screen.getByRole('radio', {name: 'Green'})).toHaveFocus();
  });

  it('renders a custom color subset in order', () => {
    render(
      <ColorSwatchPicker
        colors={['red', 'blue']}
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    expect(
      screen.getAllByRole('radio').map(radio => radio.dataset.value),
    ).toEqual(['red', 'blue']);
  });

  it('keeps one swatch tabbable when value is not in colors', () => {
    render(
      <ColorSwatchPicker
        colors={['red', 'blue']}
        label="Office color"
        onChange={() => {}}
        value="green"
      />,
    );

    const tabbable = screen
      .getAllByRole('radio')
      .filter(radio => radio.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName('Red');
  });

  it('does not change when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ColorSwatchPicker
        colors={['red', 'blue']}
        isDisabled
        label="Office color"
        onChange={onChange}
        value="red"
      />,
    );

    const blue = screen.getByRole('radio', {name: 'Blue'});
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    }

    fireEvent.click(blue);
    screen.getByRole('radio', {name: 'Red'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets aria-invalid and describes status messages', () => {
    render(
      <ColorSwatchPicker
        label="Office color"
        onChange={() => {}}
        status={{type: 'error', message: 'Choose a color'}}
        value="red"
      />,
    );

    const group = screen.getByRole('radiogroup');
    const message = screen.getByText('Choose a color');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(message).toHaveAttribute('id');
    expect(group).toHaveAttribute('aria-describedby', message.id);
  });

  it('wires description and label ids', () => {
    render(
      <ColorSwatchPicker
        description="Used for schedule events."
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    const group = screen.getByRole('radiogroup');
    const description = screen.getByText('Used for schedule events.');

    expect(group).toHaveAccessibleName('Office color');
    expect(description).toHaveAttribute('id');
    expect(group).toHaveAttribute('aria-describedby', description.id);
  });

  it('renders required and optional field indicators', () => {
    const {rerender} = render(
      <ColorSwatchPicker
        isRequired
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    expect(screen.getByRole('radiogroup')).toBeRequired();
    expect(screen.getByText('Required')).toBeInTheDocument();

    rerender(
      <ColorSwatchPicker
        isOptional
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('forwards className, style, data-testid, and ref to the field root', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <ColorSwatchPicker
        className="custom-picker"
        data-testid="picker"
        label="Office color"
        onChange={() => {}}
        ref={ref}
        style={{maxWidth: 320}}
        value="red"
      />,
    );

    const root = screen.getByTestId('picker');
    expect(root).toHaveClass('custom-picker');
    expect(root).toHaveStyle({maxWidth: '320px'});
    expect(ref.current).toBe(root);
    expect(within(root).getByRole('radiogroup')).toBeInTheDocument();
  });
});
