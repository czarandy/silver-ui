import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {DateInput, type PlainDate} from 'components/DateInput/DateInput';
import {
  DATE_FORMAT_LONG,
  plainDateCreate,
  plainDateFormat,
  plainDateToday,
} from 'internal/plainDate';
import {getBrowserTimezoneID} from 'internal/time';

beforeAll(() => {
  // jsdom has no native popover support. Toggle display so opened content is
  // rendered (and therefore focusable) the way a real popover would be.
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.style.display = 'block';
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.style.display = 'none';
  });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
  Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
});

/**
 * Wraps DateInput with local state so that typed input, Enter, and blur
 * behave the way they do for a real controlled consumer.
 */
function ControlledDateInput({
  getIsDateDisabled,
  initialValue,
  label = 'Due date',
  max,
  min,
  onChange,
}: {
  getIsDateDisabled?: (date: PlainDate) => boolean;
  initialValue?: PlainDate;
  label?: string;
  max?: PlainDate;
  min?: PlainDate;
  onChange?: (value: PlainDate | null) => void;
}): React.JSX.Element {
  const [value, setValue] = useState<PlainDate | null>(initialValue ?? null);
  return (
    <DateInput
      getIsDateDisabled={getIsDateDisabled}
      label={label}
      max={max}
      min={min}
      onChange={next => {
        setValue(next);
        onChange?.(next);
      }}
      value={value}
    />
  );
}

describe('DateInput', () => {
  it('renders a formatted date and clears it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateInput
        hasClear
        label="Due date"
        onChange={onChange}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Due date'})).toHaveValue(
      'May 21, 2026',
    );
    await user.click(screen.getByRole('button', {name: 'Clear Due date'}));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders the default placeholder when no value is set', () => {
    render(<DateInput label="Due date" onChange={() => {}} value={null} />);

    expect(screen.getByRole('combobox', {name: 'Due date'})).toHaveAttribute(
      'placeholder',
      'e.g. May 21, 2026',
    );
  });

  it('renders a calendar trigger button', () => {
    render(
      <DateInput
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    const trigger = screen.getByRole('button', {name: 'Choose Due date'});
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeEnabled();
  });

  it('disables the calendar trigger when disabled', () => {
    render(
      <DateInput
        isDisabled
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(
      screen.getByRole('button', {name: 'Choose Due date'}),
    ).toBeDisabled();
  });

  it('disables the input and hides the clear button when disabled', () => {
    render(
      <DateInput
        hasClear
        isDisabled
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Due date'})).toBeDisabled();
    expect(
      screen.queryByRole('button', {name: 'Clear Due date'}),
    ).not.toBeInTheDocument();
  });

  it('hides the clear button when isLoading is true', () => {
    render(
      <DateInput
        hasClear
        isLoading
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Due date'}),
    ).not.toBeInTheDocument();
  });

  it('renders error status with aria-invalid', () => {
    render(
      <DateInput
        label="Due date"
        onChange={() => {}}
        status={{message: 'Date is required', type: 'error'}}
        value={null}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Due date'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <DateInput
        data-testid="date-field"
        isRequired
        label="Due date"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByTestId('date-field')).toBeRequired();
  });

  it('renders optional indicator text', () => {
    render(
      <DateInput
        isOptional
        label="Due date"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('visually hides the label when isLabelHidden is true', () => {
    render(
      <DateInput
        isLabelHidden
        label="Due date"
        onChange={() => {}}
        value={null}
      />,
    );

    const label = screen.getByText('Due date');
    expect(label).toBeInTheDocument();
  });

  it('forwards data-testid to the input', () => {
    render(
      <DateInput
        data-testid="date-field"
        label="Due date"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByTestId('date-field')).toBeInTheDocument();
  });

  it('forwards ref to the input element', () => {
    let inputEl: HTMLInputElement | null = null;

    render(
      <DateInput
        label="Due date"
        onChange={() => {}}
        ref={node => {
          inputEl = node;
        }}
        value={null}
      />,
    );

    expect(inputEl).toBe(screen.getByRole('combobox', {name: 'Due date'}));
    expect(inputEl).toBeInstanceOf(HTMLInputElement);
  });

  describe('keyboard interaction', () => {
    it('commits a typed ISO date on Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ControlledDateInput onChange={onChange} />);

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.click(input);
      await user.type(input, '2026-05-21{Enter}');

      expect(onChange).toHaveBeenLastCalledWith(plainDateCreate(2026, 5, 21));
      expect(input).toHaveValue('May 21, 2026');
    });

    it('commits a typed US-format date on Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ControlledDateInput onChange={onChange} />);

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.click(input);
      await user.type(input, '05/21/2026{Enter}');

      expect(onChange).toHaveBeenLastCalledWith(plainDateCreate(2026, 5, 21));
      expect(input).toHaveValue('May 21, 2026');
    });

    it('reverts to the previous value when an invalid date is committed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ControlledDateInput
          initialValue={plainDateCreate(2026, 5, 21)}
          onChange={onChange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.clear(input);
      await user.type(input, 'not a date{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('May 21, 2026');
    });

    it('clears the value when the field is emptied and Enter is pressed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ControlledDateInput
          initialValue={plainDateCreate(2026, 5, 21)}
          onChange={onChange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenLastCalledWith(null);
      expect(input).toHaveValue('');
    });

    it('does not commit a date outside the allowed range on Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ControlledDateInput
          max={plainDateCreate(2026, 5, 21)}
          onChange={onChange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.click(input);
      await user.type(input, '2026-12-31{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });

    it('does nothing when Enter is pressed without any typed input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<ControlledDateInput onChange={onChange} />);

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.click(input);
      await user.keyboard('{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('commits pending input on blur', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <ControlledDateInput
          initialValue={plainDateCreate(2026, 5, 21)}
          onChange={onChange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.clear(input);
      await user.tab();

      expect(onChange).toHaveBeenLastCalledWith(null);
      expect(input).toHaveValue('');
    });

    it('does not commit a typed date rejected by getIsDateDisabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const disabledDate = plainDateCreate(2026, 5, 21);
      const getIsDateDisabled = vi.fn((date: PlainDate) =>
        date.equals(disabledDate),
      );

      render(
        <ControlledDateInput
          getIsDateDisabled={getIsDateDisabled}
          onChange={onChange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.click(input);
      // A named-month format has no valid intermediate prefix, so the only
      // parse attempt is the complete (disabled) date.
      await user.type(input, 'May 21, 2026{Enter}');

      expect(getIsDateDisabled).toHaveBeenCalledWith(disabledDate);
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });

    it('commits a typed date allowed by getIsDateDisabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const disabledDate = plainDateCreate(2026, 5, 21);
      const getIsDateDisabled = (date: PlainDate): boolean =>
        date.equals(disabledDate);

      render(
        <ControlledDateInput
          getIsDateDisabled={getIsDateDisabled}
          onChange={onChange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      await user.click(input);
      await user.type(input, 'May 22, 2026{Enter}');

      expect(onChange).toHaveBeenLastCalledWith(plainDateCreate(2026, 5, 22));
      expect(input).toHaveValue('May 22, 2026');
    });
  });

  describe('accessibility', () => {
    it('exposes combobox semantics that announce the calendar popover', () => {
      render(
        <DateInput
          htmlId="due"
          label="Due date"
          onChange={() => {}}
          value={null}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      expect(input).toHaveAttribute('aria-haspopup', 'dialog');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-controls', 'due-calendar');
    });

    it('reflects the open calendar with aria-expanded', async () => {
      const user = userEvent.setup();

      render(<DateInput label="Due date" onChange={() => {}} value={null} />);

      const input = screen.getByRole('combobox', {name: 'Due date'});
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(screen.getByRole('button', {name: 'Choose Due date'}));

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('calendar popover', () => {
    it('opens the calendar, commits a selected date, and closes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DateInput
          label="Due date"
          onChange={onChange}
          value={plainDateCreate(2026, 5, 21)}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(screen.getByRole('button', {name: 'Choose Due date'}));
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      fireEvent.click(
        screen.getByRole('gridcell', {hidden: true, name: /May 22, 2026/}),
      );

      expect(onChange).toHaveBeenCalledWith(plainDateCreate(2026, 5, 22));
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('closes the calendar without changing the value when toggled shut', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DateInput
          label="Due date"
          onChange={onChange}
          value={plainDateCreate(2026, 5, 21)}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Due date'});
      const trigger = screen.getByRole('button', {name: 'Choose Due date'});

      await user.click(trigger);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      await user.click(trigger);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('opens the calendar when ArrowDown is pressed in the field', async () => {
      const user = userEvent.setup();

      render(<DateInput label="Due date" onChange={() => {}} value={null} />);

      const input = screen.getByRole('combobox', {name: 'Due date'});
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(input);
      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('focuses the selected date when opened', async () => {
      const user = userEvent.setup();

      render(
        <DateInput
          label="Due date"
          onChange={() => {}}
          value={plainDateCreate(2026, 5, 21)}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Choose Due date'}));

      await waitFor(() => {
        expect(
          screen.getByRole('gridcell', {name: /May 21, 2026/}),
        ).toHaveFocus();
      });
    });

    it('focuses today when opened without a value', async () => {
      const user = userEvent.setup();
      // With no selection, today's cell carries the roving tabindex. Match how
      // Calendar derives today (browser timezone) so the label lines up.
      const today = plainDateToday(getBrowserTimezoneID());
      const todayLabel = plainDateFormat(today, DATE_FORMAT_LONG);

      render(<DateInput label="Due date" onChange={() => {}} value={null} />);

      await user.click(screen.getByRole('button', {name: 'Choose Due date'}));

      await waitFor(() => {
        expect(
          screen.getByRole('gridcell', {name: new RegExp(todayLabel)}),
        ).toHaveFocus();
      });
    });
  });
});
