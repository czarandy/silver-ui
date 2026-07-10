import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
import {
  colorSwatchPickerRecipe,
  colorSwatchRecipe,
} from 'components/ColorSwatchPicker/ColorSwatchPicker.recipe';
import {COLOR_LABELS, COLOR_NAMES, type ColorName} from 'internal/colorNames';
import {assertNonNull, createPopoverFocusShim} from 'internal/testHelpers';

const shim = createPopoverFocusShim();

beforeAll(shim.install);
afterAll(shim.uninstall);
beforeEach(() => {
  shim.reset();
  shim.setFocusVisible(false);
});

/**
 * The tooltip anchored to `radio`, found by the color name it renders. Every
 * swatch renders its own tooltip popover, so the text is what tells them apart.
 */
function getTooltipFor(radio: HTMLElement): HTMLElement {
  const label = assertNonNull(radio.getAttribute('aria-label'));
  const content = screen.getByText(label);
  return assertNonNull(content.closest<HTMLElement>('[role="tooltip"]'));
}

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

  it('renders one tooltip per swatch naming its color', () => {
    render(
      <ColorSwatchPicker
        colors={['red', 'blue']}
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    expect(screen.getAllByRole('tooltip', {hidden: true})).toHaveLength(2);
    expect(
      getTooltipFor(screen.getByRole('radio', {name: 'Red'})),
    ).toBeInTheDocument();
    expect(
      getTooltipFor(screen.getByRole('radio', {name: 'Blue'})),
    ).toBeInTheDocument();
  });

  it('opens only the hovered swatch tooltip and closes it on mouse leave', async () => {
    render(
      <ColorSwatchPicker
        colors={['red', 'blue']}
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    const blue = screen.getByRole('radio', {name: 'Blue'});
    const blueTooltip = getTooltipFor(blue);
    const redTooltip = getTooltipFor(screen.getByRole('radio', {name: 'Red'}));

    fireEvent.mouseEnter(blue);

    await waitFor(() => {
      expect(shim.isPopoverOpen(blueTooltip)).toBe(true);
    });
    expect(shim.isPopoverOpen(redTooltip)).toBe(false);

    fireEvent.mouseLeave(blue);

    await waitFor(() => {
      expect(shim.isPopoverOpen(blueTooltip)).toBe(false);
    });
  });

  it('opens tooltips on hover only, never on keyboard focus', () => {
    shim.setFocusVisible(true);

    render(
      <ColorSwatchPicker
        colors={['red', 'blue']}
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    // The selected swatch is the group's tab stop, so it is the only one a
    // focus-triggered tooltip could ever attach to.
    const red = screen.getByRole('radio', {name: 'Red'});
    expect(red).toHaveAttribute('tabindex', '0');

    red.focus();
    fireEvent.focusIn(red);

    // The group's keyboard hint does open on focus, so assert on this swatch's
    // own tooltip rather than on `showPopover` as a whole.
    expect(shim.isPopoverOpen(getTooltipFor(red))).toBe(false);
  });

  it('does not describe swatches by their tooltip, which repeats the label', () => {
    render(
      <ColorSwatchPicker
        colors={['red']}
        label="Office color"
        onChange={() => {}}
        value="red"
      />,
    );

    const red = screen.getByRole('radio', {name: 'Red'});
    expect(red).not.toHaveAttribute('aria-describedby');
    expect(red).toHaveAccessibleName('Red');
  });

  it('does not open tooltips while disabled', () => {
    vi.useFakeTimers();

    try {
      render(
        <ColorSwatchPicker
          colors={['red', 'blue']}
          isDisabled
          label="Office color"
          onChange={() => {}}
          value="red"
        />,
      );

      fireEvent.mouseEnter(screen.getByRole('radio', {name: 'Blue'}));
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(shim.showPopover).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('colorSwatchRecipe', () => {
  const swatch = (
    overrides: Parameters<typeof colorSwatchRecipe>[0] = {},
  ): ReturnType<typeof colorSwatchRecipe> =>
    colorSwatchRecipe({color: 'blue', size: 'md', ...overrides});

  /**
   * Panda emits atomic class names whose suffix is the token, so `focusOffset`
   * is a prefix of `focusOffsetLoose`. Compare whole classes, never substrings.
   */
  const classesOf = (className: string | undefined): ReadonlyArray<string> =>
    assertNonNull(className).split(' ');

  /**
   * Whether any class applies `utility`, under any condition prefix — a
   * `_focusVisible` style lands on `focus-visible:silver-ring-o_…`, so matching
   * only the start of the class would miss it.
   */
  const hasUtility = (
    className: string | undefined,
    utility: string,
  ): boolean => classesOf(className).some(name => name.includes(utility));

  it('spaces swatches by spacing.1', () => {
    expect(classesOf(colorSwatchPickerRecipe())).toContain('silver-gap_1');
  });

  it('positions the check icon one pixel lower', () => {
    expect(classesOf(swatch().icon)).toContain('silver-mt_1px');
  });

  it('marks the selected swatch with an outer ring in its own color', () => {
    const selected = swatch({isSelected: true});
    const unselected = swatch({isSelected: false});

    expect(classesOf(selected.fill)).toContain(
      'silver---swatch-ring_token(colors.surface.blue.accent)',
    );
    expect(classesOf(selected.fill)).toContain(
      'silver-bx-sh_0_0_0_2px_token(colors.bg),_0_0_0_4px_var(--swatch-ring,_token(colors.border.emphasized))',
    );
    expect(hasUtility(unselected.fill, 'silver-bx-sh_')).toBe(false);
  });

  it('keeps the selected border width identical to the unselected one', () => {
    // The old design thickened an inner border when selected; the ring replaced it.
    expect(classesOf(swatch({isSelected: true}).fill)).toContain(
      'silver-bd-w_thin',
    );
    expect(classesOf(swatch({isSelected: false}).fill)).toContain(
      'silver-bd-w_thin',
    );
  });

  it('draws the focus ring around the circle rather than the padded button', () => {
    const {button, fill} = swatch();

    expect(classesOf(fill)).toContain(
      '[[role="radio"]:focus-visible_&]:silver-ring-o_focusOffset',
    );
    expect(classesOf(fill)).toContain(
      '[[role="radio"]:focus-visible_&]:silver-ring-c_primary',
    );
    expect(hasUtility(button, 'silver-ring-o_')).toBe(false);
  });

  it('grows the circle on hover, except when disabled', () => {
    expect(classesOf(swatch({isDisabled: false}).fill)).toContain(
      '[[role="radio"]:hover_&]:silver-trf_scale(1.12)',
    );
    expect(classesOf(swatch({isDisabled: true}).fill)).toContain(
      '[[role="radio"]:hover_&]:silver-trf_none',
    );
  });
});
