import {act, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {plainDateCreate} from '../../internal/plainDate';
import {Calendar, type CalendarHandle} from './Calendar';

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
});
