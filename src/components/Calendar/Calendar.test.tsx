import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Calendar, type CalendarHandle} from './Calendar';

describe('Calendar', () => {
  it('renders the selected month and selected day', () => {
    render(<Calendar value="2026-05-21" />);

    expect(screen.getByText('May 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', {name: /May 21, 2026/}),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when a day is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Calendar focusDate="2026-05-01" onChange={onChange} />);

    await user.click(screen.getByRole('gridcell', {name: /May 22, 2026/}));

    expect(onChange).toHaveBeenCalledWith('2026-05-22', expect.any(Date));
  });

  it('selects a date range after two clicks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Calendar focusDate="2026-05-01" mode="range" onChange={onChange} />,
    );

    await user.click(screen.getByRole('gridcell', {name: /May 10, 2026/}));
    await user.click(screen.getByRole('gridcell', {name: /May 12, 2026/}));

    expect(onChange).toHaveBeenCalledWith({
      start: '2026-05-10',
      end: '2026-05-12',
    });
  });

  it('disables dates outside min and max constraints', () => {
    render(
      <Calendar focusDate="2026-05-01" max="2026-05-20" min="2026-05-10" />,
    );

    expect(screen.getByRole('gridcell', {name: /May 9, 2026/})).toBeDisabled();
    expect(screen.getByRole('gridcell', {name: /May 21, 2026/})).toBeDisabled();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(value: CalendarHandle | null) => void>();

    render(
      <Calendar
        className="custom-calendar"
        data-testid="calendar"
        ref={ref}
        style={{color: 'red'}}
        value="2026-05-21"
      />,
    );

    const calendar = screen.getByTestId('calendar');
    expect(calendar).toHaveClass('custom-calendar');
    expect(calendar).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref.mock.calls[0]?.[0]?.navigateTo).toEqual(expect.any(Function));
  });
});
