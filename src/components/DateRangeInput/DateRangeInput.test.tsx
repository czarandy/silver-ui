import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {DateRangeInput} from 'components/DateRangeInput/DateRangeInput';
import {inputStyles} from 'components/Field/inputStyles';
import {plainDateCreate} from 'internal/plainDate';

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

const defaultRange = {
  start: plainDateCreate(2026, 5, 10),
  end: plainDateCreate(2026, 5, 12),
};

describe('DateRangeInput', () => {
  it('renders a formatted range and clears it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateRangeInput
        hasClear
        label="Window"
        onChange={onChange}
        value={defaultRange}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveTextContent(
      'May 10, 2026 - May 12, 2026',
    );
    const clearButton = screen.getByRole('button', {name: 'Clear Window'});
    expect(clearButton).toHaveClass(inputStyles.clearButton);
    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('formats both ends of the range with the format prop', () => {
    const januaryRange = {
      start: plainDateCreate(2026, 1, 5),
      end: plainDateCreate(2026, 1, 12),
    };

    const {rerender} = render(
      <DateRangeInput
        format="long"
        label="Window"
        onChange={() => {}}
        value={januaryRange}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveTextContent(
      'January 5, 2026 - January 12, 2026',
    );

    rerender(
      <DateRangeInput
        format="iso"
        label="Window"
        onChange={() => {}}
        value={januaryRange}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveTextContent(
      '2026-01-05 - 2026-01-12',
    );

    rerender(
      <DateRangeInput
        format={date => String(date.day)}
        label="Window"
        onChange={() => {}}
        value={januaryRange}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveTextContent(
      '5 - 12',
    );
  });

  it('renders a same-day range as a single date', () => {
    const date = plainDateCreate(2026, 8, 9);

    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        value={{start: date, end: date}}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveTextContent(
      'Aug 9, 2026',
    );
    expect(
      screen.getByRole('combobox', {name: 'Window'}),
    ).not.toHaveTextContent('Aug 9, 2026 - Aug 9, 2026');
  });

  it('renders placeholder when value is undefined', () => {
    render(<DateRangeInput label="Window" onChange={() => {}} value={null} />);

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveTextContent(
      'Select a date range',
    );
  });

  it('does not show clear button when hasClear is false', () => {
    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('does not show clear button when value is undefined', () => {
    render(
      <DateRangeInput
        hasClear
        label="Window"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('disables the trigger when isDisabled is true', () => {
    render(
      <DateRangeInput
        isDisabled
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toBeDisabled();
  });

  it('hides clear button when isDisabled is true', () => {
    render(
      <DateRangeInput
        hasClear
        isDisabled
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('does not disable the trigger when isLoading is true', () => {
    render(
      <DateRangeInput
        isLoading
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toBeEnabled();
  });

  it('hides clear button when isLoading is true', () => {
    render(
      <DateRangeInput
        hasClear
        isLoading
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('renders error status with aria-invalid', () => {
    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        status={{message: 'Range is required', type: 'error'}}
        value={null}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Window'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Range is required')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <DateRangeInput
        data-testid="range-input"
        isRequired
        label="Window"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByTestId('range-input')).toBeRequired();
  });

  it('renders optional indicator text', () => {
    render(
      <DateRangeInput
        isOptional
        label="Window"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <DateRangeInput
        description="Select check-in and check-out."
        label="Window"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(
      screen.getByText('Select check-in and check-out.'),
    ).toBeInTheDocument();
  });

  it('forwards data-testid to the trigger', () => {
    render(
      <DateRangeInput
        data-testid="range-field"
        label="Window"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByTestId('range-field')).toBeInTheDocument();
  });

  it('forwards ref to the trigger button', () => {
    let triggerElement: HTMLButtonElement | null = null;

    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        ref={node => {
          triggerElement = node;
        }}
        value={null}
      />,
    );

    expect(triggerElement).toBe(screen.getByRole('combobox', {name: 'Window'}));
    expect(triggerElement).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders the displayed range as the calendar trigger button', () => {
    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Window'});
    expect(trigger).toBeInTheDocument();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveTextContent('May 10, 2026 - May 12, 2026');
    expect(trigger).toBeEnabled();
  });

  describe('accessibility', () => {
    it('exposes combobox semantics that announce the calendar popover', () => {
      render(
        <DateRangeInput label="Window" onChange={() => {}} value={null} />,
      );

      const input = screen.getByRole('combobox', {name: 'Window'});
      expect(input).toHaveAttribute('aria-haspopup', 'dialog');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveAttribute('aria-controls', `${input.id}-calendar`);
    });

    it('reflects the open calendar with aria-expanded', async () => {
      const user = userEvent.setup();

      render(
        <DateRangeInput label="Window" onChange={() => {}} value={null} />,
      );

      const input = screen.getByRole('combobox', {name: 'Window'});
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('calendar popover', () => {
    it('falls back to one month for an invalid numberOfMonths', () => {
      render(
        <DateRangeInput
          label="Window"
          numberOfMonths={500 as 1 | 2}
          onChange={() => {}}
          value={defaultRange}
        />,
      );

      expect(screen.getAllByRole('grid', {hidden: true})).toHaveLength(1);
    });

    it('opens the calendar, commits a selected range, and closes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DateRangeInput
          label="Window"
          onChange={onChange}
          value={defaultRange}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Window'});
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.click(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      // Range mode commits after a start and an end click.
      fireEvent.click(
        screen.getByRole('gridcell', {hidden: true, name: /May 15, 2026/}),
      );
      fireEvent.click(
        screen.getByRole('gridcell', {hidden: true, name: /May 20, 2026/}),
      );

      expect(onChange).toHaveBeenCalledWith({
        start: plainDateCreate(2026, 5, 15),
        end: plainDateCreate(2026, 5, 20),
      });
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('opens the calendar when ArrowDown is pressed in the field', async () => {
      const user = userEvent.setup();

      render(
        <DateRangeInput label="Window" onChange={() => {}} value={null} />,
      );

      const input = screen.getByRole('combobox', {name: 'Window'});
      expect(input).toHaveAttribute('aria-expanded', 'false');

      input.focus();
      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('closes the calendar without changing the value when toggled shut', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <DateRangeInput
          label="Window"
          onChange={onChange}
          value={defaultRange}
        />,
      );

      const trigger = screen.getByRole('combobox', {name: 'Window'});

      await user.click(trigger);
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });

      await user.click(trigger);
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('disables calendar dates rejected by getIsDateDisabled', async () => {
      const user = userEvent.setup();

      render(
        <DateRangeInput
          getIsDateDisabled={date => date.day === 15}
          label="Window"
          onChange={() => {}}
          value={defaultRange}
        />,
      );

      await user.click(screen.getByRole('combobox', {name: 'Window'}));

      await waitFor(() => {
        expect(
          screen.getByRole('gridcell', {hidden: true, name: /May 15, 2026/}),
        ).toBeDisabled();
      });
      expect(
        screen.getByRole('gridcell', {hidden: true, name: /May 14, 2026/}),
      ).toBeEnabled();
    });
  });
});
