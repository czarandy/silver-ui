import {Temporal} from '@js-temporal/polyfill';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TimePickerPanel} from 'internal/TimePickerPanel';

const T = (value: string): Temporal.PlainTime => Temporal.PlainTime.from(value);
const resolved = new Intl.DateTimeFormat().resolvedOptions();

beforeEach(() => {
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    ...resolved,
    hour12: true,
  });
});
afterEach(() => vi.restoreAllMocks());

function column(label: string) {
  return within(screen.getByRole('listbox', {name: label}));
}

describe('TimePickerPanel', () => {
  it('edits a draft, switches AM/PM, and commits only on Done', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <TimePickerPanel
        hasSeconds={false}
        onConfirm={onConfirm}
        step={900}
        value={T('08:00')}
      />,
    );
    expect(column('Minutes').getAllByRole('option')).toHaveLength(4);
    expect(screen.queryByText('Hours')).not.toBeInTheDocument();
    expect(screen.queryByText('Minutes')).not.toBeInTheDocument();
    expect(screen.queryByText('Period')).not.toBeInTheDocument();
    await user.click(column('Hours').getByRole('option', {name: '09'}));
    await user.click(column('Minutes').getByRole('option', {name: '15'}));
    await user.click(column('Period').getByRole('option', {name: 'PM'}));
    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onConfirm.mock.calls[0]?.[0].toString()).toBe('21:15:00');
  });

  it('handles noon and midnight without confusing 12 AM and 12 PM', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <TimePickerPanel
        hasSeconds={false}
        onConfirm={onConfirm}
        value={T('00:00')}
      />,
    );
    expect(
      column('Hours').getByRole('option', {name: '12', selected: true}),
    ).toBeInTheDocument();
    await user.click(column('Period').getByRole('option', {name: 'PM'}));
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onConfirm.mock.calls[0]?.[0].toString()).toBe('12:00:00');
  });

  it('disables unavailable times and moves to a valid minute when the hour changes', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <TimePickerPanel
        hasSeconds={false}
        max={T('10:15')}
        min={T('09:30')}
        onConfirm={onConfirm}
        step={900}
        value={T('09:45')}
      />,
    );
    expect(column('Hours').getByRole('option', {name: '08'})).toBeDisabled();
    expect(column('Minutes').getByRole('option', {name: '00'})).toBeDisabled();
    expect(column('Period').getByRole('option', {name: 'PM'})).toBeDisabled();
    await user.click(column('Hours').getByRole('option', {name: '10'}));
    expect(
      column('Minutes').getByRole('option', {name: '15', selected: true}),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onConfirm.mock.calls[0]?.[0].toString()).toBe('10:15:00');
  });

  it('supports overnight limits and step increments based on min', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <TimePickerPanel
        hasSeconds={false}
        max={T('02:10')}
        min={T('22:10')}
        onConfirm={onConfirm}
        step={900}
        value={T('23:10')}
      />,
    );
    expect(
      column('Minutes')
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['10', '25', '40', '55']);
    await user.click(column('Period').getByRole('option', {name: 'AM'}));
    expect(column('Hours').getByRole('option', {name: '03'})).toBeDisabled();
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onConfirm.mock.calls[0]?.[0].toString()).toBe('02:10:00');
  });

  it('supports arrow, Home and End navigation with one tab stop per column', async () => {
    const user = userEvent.setup();
    render(
      <TimePickerPanel
        hasSeconds={false}
        onConfirm={vi.fn()}
        step={900}
        value={T('09:15')}
      />,
    );
    await user.click(column('Minutes').getByRole('option', {name: '15'}));
    await user.keyboard('{ArrowDown}');
    expect(
      column('Minutes').getByRole('option', {name: '30', selected: true}),
    ).toHaveFocus();
    await user.keyboard('{End}');
    expect(column('Minutes').getByRole('option', {name: '45'})).toHaveFocus();
    await user.keyboard('{Home}');
    expect(column('Minutes').getByRole('option', {name: '00'})).toHaveFocus();
    await user.tab();
    expect(column('Period').getByRole('option', {name: 'AM'})).toHaveFocus();
  });

  it('supports seconds and 24-hour locales', async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      ...resolved,
      hour12: false,
    });
    const user = userEvent.setup();
    const onConfirm = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <TimePickerPanel
        hasSeconds
        onConfirm={onConfirm}
        step={15}
        value={T('23:59:15')}
      />,
    );
    expect(
      screen.queryByRole('listbox', {name: 'Period'}),
    ).not.toBeInTheDocument();
    expect(column('Hours').getAllByRole('option')).toHaveLength(24);
    expect(column('Seconds').getAllByRole('option')).toHaveLength(4);
    await user.click(column('Seconds').getByRole('option', {name: '45'}));
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onConfirm.mock.calls[0]?.[0].toString()).toBe('23:59:45');
  });

  it('initializes empty values within bounds and prevents confirmation when there is no representable time', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn<(time: Temporal.PlainTime) => void>();
    const {rerender} = render(
      <TimePickerPanel
        hasSeconds={false}
        max={T('09:00')}
        min={T('09:00')}
        onConfirm={onConfirm}
        value={null}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onConfirm.mock.calls[0]?.[0].toString()).toBe('09:00:00');
    rerender(
      <TimePickerPanel
        hasSeconds={false}
        max={T('09:00:02')}
        min={T('09:00:01')}
        onConfirm={onConfirm}
        value={null}
      />,
    );
    expect(screen.getByRole('button', {name: 'Done'})).toBeDisabled();
  });
});
