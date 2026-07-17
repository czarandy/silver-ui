import {act, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Calendar, type CalendarHandle} from 'components/Calendar/Calendar';
import {calendarRecipe} from 'components/Calendar/Calendar.recipe';
import {plainDateCreate} from 'internal/plainDate';
import {assertNonNull} from 'internal/testHelpers';

function getRangeBackground(day: HTMLElement): Element | null {
  return day.previousElementSibling;
}

function getAddedClasses(
  baseClasses: string | undefined,
  variantClasses: string | undefined,
): string[] {
  const baseClassSet = new Set(assertNonNull(baseClasses).split(' '));
  return assertNonNull(variantClasses)
    .split(' ')
    .filter(className => !baseClassSet.has(className));
}

describe('Calendar', () => {
  it('renders the selected month and selected day', () => {
    render(
      <Calendar onChange={() => {}} value={plainDateCreate(2026, 5, 21)} />,
    );

    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: /May 21, 2026/}),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('mirrors month navigation chevrons in RTL', () => {
    render(
      <div dir="rtl">
        <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />
      </div>,
    );

    const previousButton = screen.getByRole('button', {
      name: 'Previous month',
    });
    const nextButton = screen.getByRole('button', {name: 'Next month'});
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    const previousIcon = previousButton.querySelector('svg');
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    const nextIcon = nextButton.querySelector('svg');

    expect(previousIcon).toHaveClass(
      'lucide-chevron-left',
      'rtl:silver-trf_scaleX(-1)',
    );
    expect(nextIcon).toHaveClass(
      'lucide-chevron-right',
      'rtl:silver-trf_scaleX(-1)',
    );
  });

  it('calls onChange when a day is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Calendar onChange={onChange} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    await user.click(screen.getByRole('gridcell', {name: /May 22, 2026/}));

    expect(onChange).toHaveBeenCalledWith(plainDateCreate(2026, 5, 22));
  });

  it('selects a date range after two clicks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Calendar
        mode="range"
        onChange={onChange}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    await user.click(screen.getByRole('gridcell', {name: /May 10, 2026/}));
    await user.click(screen.getByRole('gridcell', {name: /May 12, 2026/}));

    expect(onChange).toHaveBeenCalledWith({
      start: plainDateCreate(2026, 5, 10),
      end: plainDateCreate(2026, 5, 12),
    });
  });

  it('disables dates outside min and max constraints', () => {
    render(
      <Calendar
        max={plainDateCreate(2026, 5, 20)}
        min={plainDateCreate(2026, 5, 10)}
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    expect(screen.getByRole('gridcell', {name: /May 9, 2026/})).toBeDisabled();
    expect(screen.getByRole('gridcell', {name: /May 21, 2026/})).toBeDisabled();
  });

  it('disables dates via getIsDateDisabled callback', () => {
    render(
      <Calendar
        getIsDateDisabled={date => date.day === 15}
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    expect(screen.getByRole('gridcell', {name: /May 15, 2026/})).toBeDisabled();
    expect(screen.getByRole('gridcell', {name: /May 14, 2026/})).toBeEnabled();
  });

  it('hides outside-month days when hasOutsideDays is false', () => {
    render(
      <Calendar
        hasOutsideDays={false}
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    expect(
      screen.queryByRole('gridcell', {name: /April/}),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: /May 1, 2026/}),
    ).toBeInTheDocument();
  });

  it('shows outside-month days by default', () => {
    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    expect(
      screen.getByRole('gridcell', {name: /April 26, 2026/}),
    ).toBeInTheDocument();
  });

  it('renders week numbers when hasWeekNumbers is true', () => {
    render(
      <Calendar
        hasWeekNumbers
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 10, 1)}
      />,
    );

    const grid = screen.getByRole('grid');
    const firstRow = within(grid).getAllByRole('row')[0];
    expect(firstRow.children.length).toBe(8);
  });

  it('renders fewer rows with hasVariableRowCount for a short month', () => {
    render(
      <Calendar
        hasVariableRowCount
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 2, 1)}
      />,
    );

    const rows = within(screen.getByRole('grid')).getAllByRole('row');
    expect(rows.length).toBeLessThan(6);
  });

  it('renders 6 rows by default', () => {
    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 2, 1)} />,
    );

    const rows = within(screen.getByRole('grid')).getAllByRole('row');
    expect(rows.length).toBe(6);
  });

  it('starts the week on Monday when weekStartsOn is 1', () => {
    render(
      <Calendar
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 5, 1)}
        weekStartsOn={1}
      />,
    );

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders[0]).toHaveTextContent('Mo');
    expect(columnHeaders[6]).toHaveTextContent('Su');
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(value: CalendarHandle | null) => void>();

    render(
      <Calendar
        className="custom-calendar"
        data-testid="calendar"
        onChange={() => {}}
        ref={ref}
        style={{color: 'red'}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    const calendar = screen.getByTestId('calendar');
    expect(calendar).toHaveClass('custom-calendar');
    expect(calendar).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref.mock.calls[0]?.[0]?.navigateTo).toEqual(expect.any(Function));
  });

  it('renders two months when numberOfMonths is 2', () => {
    render(
      <Calendar
        numberOfMonths={2}
        onChange={() => {}}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    expect(screen.getByText('May 2026 - June 2026')).toBeInTheDocument();
    const grids = screen.getAllByRole('grid');
    expect(grids).toHaveLength(2);
  });

  it.each([0, -1, 500, Number.NaN])(
    'falls back to one month when numberOfMonths is %s',
    numberOfMonths => {
      render(
        <Calendar
          numberOfMonths={numberOfMonths as 1 | 2}
          onChange={() => {}}
          viewDate={plainDateCreate(2026, 5, 1)}
        />,
      );

      expect(screen.getByText('May 2026')).toBeInTheDocument();
      expect(screen.getAllByRole('grid')).toHaveLength(1);
    },
  );

  it('highlights a date only in its own month in a two-month range', () => {
    render(
      <Calendar
        mode="range"
        numberOfMonths={2}
        onChange={() => {}}
        value={{
          start: plainDateCreate(2026, 5, 30),
          end: plainDateCreate(2026, 6, 1),
        }}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    const [mayGrid, juneGrid] = screen.getAllByRole('grid');
    const may31 = within(assertNonNull(mayGrid)).getByRole('gridcell', {
      name: /May 31, 2026/,
    });
    const outsideJune1 = within(assertNonNull(mayGrid)).getByRole('gridcell', {
      name: /June 1, 2026/,
    });
    const inMonthJune1 = within(assertNonNull(juneGrid)).getByRole('gridcell', {
      name: /June 1, 2026/,
    });
    const selectedDayClasses = getAddedClasses(
      calendarRecipe({isSelected: false}).day,
      calendarRecipe({isSelected: true}).day,
    );
    const roundedEnd = assertNonNull(
      calendarRecipe({roundedEnd: true}).rangeBackground,
    );

    expect(getRangeBackground(may31)).toHaveClass(roundedEnd);
    expect(getRangeBackground(outsideJune1)).toBeNull();
    expect(outsideJune1).not.toHaveAttribute('aria-selected');
    expect(selectedDayClasses).not.toHaveLength(0);
    for (const className of selectedDayClasses) {
      expect(outsideJune1).not.toHaveClass(className);
    }
    expect(getRangeBackground(inMonthJune1)).not.toBeNull();
    expect(inMonthJune1).toHaveAttribute('aria-selected', 'true');
  });

  it('clips range highlighting to min and max with rounded caps', () => {
    render(
      <Calendar
        max={plainDateCreate(2026, 5, 14)}
        min={plainDateCreate(2026, 5, 12)}
        mode="range"
        onChange={() => {}}
        value={{
          start: plainDateCreate(2026, 5, 10),
          end: plainDateCreate(2026, 5, 16),
        }}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    const may11 = screen.getByRole('gridcell', {name: /May 11, 2026/});
    const may12 = screen.getByRole('gridcell', {name: /May 12, 2026/});
    const may14 = screen.getByRole('gridcell', {name: /May 14, 2026/});
    const may15 = screen.getByRole('gridcell', {name: /May 15, 2026/});
    const roundedStart = assertNonNull(
      calendarRecipe({roundedStart: true}).rangeBackground,
    );
    const roundedEnd = assertNonNull(
      calendarRecipe({roundedEnd: true}).rangeBackground,
    );

    expect(getRangeBackground(may11)).toBeNull();
    expect(getRangeBackground(may12)).toHaveClass(roundedStart);
    expect(getRangeBackground(may14)).toHaveClass(roundedEnd);
    expect(getRangeBackground(may15)).toBeNull();
  });

  it('rounds a range clipped by hidden outside days', () => {
    render(
      <Calendar
        hasOutsideDays={false}
        mode="range"
        onChange={() => {}}
        value={{
          start: plainDateCreate(2026, 4, 29),
          end: plainDateCreate(2026, 5, 3),
        }}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    const may1 = screen.getByRole('gridcell', {name: /May 1, 2026/});
    const roundedStart = assertNonNull(
      calendarRecipe({roundedStart: true}).rangeBackground,
    );

    expect(getRangeBackground(may1)).toHaveClass(roundedStart);
  });

  it('calls onViewDateChange when navigating months', async () => {
    const user = userEvent.setup();
    const onViewDateChange = vi.fn();

    render(
      <Calendar
        onChange={() => {}}
        onViewDateChange={onViewDateChange}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Next month'}));
    expect(onViewDateChange).toHaveBeenCalledWith(plainDateCreate(2026, 6, 1));
  });

  it('navigates to a specific date via the imperative handle', () => {
    let handle: CalendarHandle | null = null;

    render(
      <Calendar
        defaultValue={plainDateCreate(2026, 5, 15)}
        onChange={() => {}}
        ref={h => {
          handle = h;
        }}
      />,
    );

    expect(screen.getByText('May 2026')).toBeInTheDocument();
    act(() => {
      handle?.navigateTo(plainDateCreate(2026, 12, 1));
    });
    expect(screen.getByText('December 2026')).toBeInTheDocument();
  });

  it('selects a range in reverse order', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Calendar
        mode="range"
        onChange={onChange}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    await user.click(screen.getByRole('gridcell', {name: /May 20, 2026/}));
    await user.click(screen.getByRole('gridcell', {name: /May 10, 2026/}));

    expect(onChange).toHaveBeenCalledWith({
      start: plainDateCreate(2026, 5, 10),
      end: plainDateCreate(2026, 5, 20),
    });
  });

  it('renders with defaultValue in single mode', () => {
    render(
      <Calendar
        defaultValue={plainDateCreate(2026, 5, 15)}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: /May 15, 2026/}),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('renders with defaultValue in range mode', () => {
    render(
      <Calendar
        defaultValue={{
          start: plainDateCreate(2026, 5, 10),
          end: plainDateCreate(2026, 5, 15),
        }}
        mode="range"
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('gridcell', {name: /May 10, 2026/}),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('gridcell', {name: /May 15, 2026/}),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('moves focus within the month with arrow keys', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /May 15, 2026/}).focus());

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('gridcell', {name: /May 16, 2026/})).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('gridcell', {name: /May 15, 2026/})).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('gridcell', {name: /May 22, 2026/})).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('gridcell', {name: /May 15, 2026/})).toHaveFocus();
  });

  it('moves to the start and end of the week with Home and End', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /May 14, 2026/}).focus());

    await user.keyboard('{Home}');
    expect(screen.getByRole('gridcell', {name: /May 10, 2026/})).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('gridcell', {name: /May 16, 2026/})).toHaveFocus();
  });

  it('jumps to the first and last day of the grid with Ctrl+Home and Ctrl+End', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /May 15, 2026/}).focus());

    await user.keyboard('{Control>}{Home}{/Control}');
    expect(
      screen.getByRole('gridcell', {name: /April 26, 2026/}),
    ).toHaveFocus();

    await user.keyboard('{Control>}{End}{/Control}');
    expect(screen.getByRole('gridcell', {name: /June 6, 2026/})).toHaveFocus();
  });

  it('navigates to the next month when arrowing past the last row', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /May 31, 2026/}).focus());

    await user.keyboard('{ArrowDown}');

    expect(screen.getByText('June 2026')).toBeInTheDocument();
    expect(screen.getByRole('gridcell', {name: /June 7, 2026/})).toHaveFocus();
  });

  it('navigates to the previous month when arrowing above the first row', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /May 1, 2026/}).focus());

    await user.keyboard('{ArrowUp}');

    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: /April 24, 2026/}),
    ).toHaveFocus();
  });

  it('keeps focus on the same day across months with PageDown and PageUp', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /May 15, 2026/}).focus());

    await user.keyboard('{PageDown}');
    expect(screen.getByText('June 2026')).toBeInTheDocument();
    expect(screen.getByRole('gridcell', {name: /June 15, 2026/})).toHaveFocus();

    await user.keyboard('{PageUp}');
    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(screen.getByRole('gridcell', {name: /May 15, 2026/})).toHaveFocus();
  });

  it('applies the not-allowed cursor to outside (non-selectable) days', () => {
    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 5, 1)} />,
    );

    // Outside days are aria-disabled but intentionally not natively `disabled`
    // (that would drop them from grid keyboard navigation), so the not-allowed
    // cursor comes from the recipe's isDisabled variant rather than `:disabled`.
    const recipe = calendarRecipe({isDisabled: true});
    const dayClass = assertNonNull(recipe.day);
    const cursorClass = dayClass
      .split(' ')
      .find(className => className.includes('cursor'));
    if (cursorClass == null) {
      throw new Error('expected a cursor class on the disabled day variant');
    }

    expect(screen.getByRole('gridcell', {name: /April 26, 2026/})).toHaveClass(
      cursorClass,
    );
    expect(
      screen.getByRole('gridcell', {name: /May 15, 2026/}),
    ).not.toHaveClass(cursorClass);
  });

  it('cancels a pending range selection when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Calendar
        mode="range"
        onChange={onChange}
        viewDate={plainDateCreate(2026, 5, 1)}
      />,
    );

    const may10 = screen.getByRole('gridcell', {name: /May 10, 2026/});
    await user.click(may10);
    expect(may10).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Escape}');
    expect(may10).not.toHaveAttribute('aria-selected');

    // The pending start is gone, so clicking another day begins a new range
    // rather than completing the cancelled one.
    await user.click(screen.getByRole('gridcell', {name: /May 20, 2026/}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clamps to the last day of a shorter month when paging', async () => {
    const user = userEvent.setup();

    render(
      <Calendar onChange={() => {}} viewDate={plainDateCreate(2026, 1, 1)} />,
    );

    act(() => screen.getByRole('gridcell', {name: /January 31, 2026/}).focus());

    // Feb 2026 has no 31st, so focus clamps to Feb 28.
    await user.keyboard('{PageDown}');
    expect(screen.getByText('February 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: /February 28, 2026/}),
    ).toHaveFocus();
  });
});
