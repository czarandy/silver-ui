import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState, type ComponentProps} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TimePickerPanel} from 'internal/TimePickerPanel';
import {Temporal} from 'internal/temporal';

const T = (value: string): Temporal.PlainTime => Temporal.PlainTime.from(value);
const resolved = new Intl.DateTimeFormat().resolvedOptions();

beforeEach(() => {
  vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
    ...resolved,
    hour12: true,
  });
});
afterEach(() => vi.restoreAllMocks());

function Panel({
  initial,
  onChange,
  ...props
}: Omit<ComponentProps<typeof TimePickerPanel>, 'value'> & {
  initial: Temporal.PlainTime | null;
}): React.JSX.Element {
  const [value, setValue] = useState(initial);
  return (
    <TimePickerPanel
      {...props}
      onChange={time => {
        setValue(time);
        onChange(time);
      }}
      value={value}
    />
  );
}

function column(label: string) {
  return within(screen.getByRole('listbox', {name: label}));
}

describe('TimePickerPanel', () => {
  it('applies each selection immediately, including AM/PM', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <Panel
        hasSeconds={false}
        initial={T('08:00')}
        onChange={onChange}
        onDone={vi.fn()}
        step={900}
      />,
    );
    expect(column('Minutes').getAllByRole('option')).toHaveLength(4);
    expect(screen.queryByText('Hours')).not.toBeInTheDocument();
    expect(screen.queryByText('Minutes')).not.toBeInTheDocument();
    expect(screen.queryByText('Period')).not.toBeInTheDocument();
    await user.click(column('Hours').getByRole('option', {name: '09'}));
    expect(onChange.mock.lastCall?.[0].toString()).toBe('09:00:00');
    await user.click(column('Minutes').getByRole('option', {name: '15'}));
    expect(onChange.mock.lastCall?.[0].toString()).toBe('09:15:00');
    await user.click(column('Period').getByRole('option', {name: 'PM'}));
    expect(onChange.mock.lastCall?.[0].toString()).toBe('21:15:00');
  });

  it('handles noon and midnight without confusing 12 AM and 12 PM', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <Panel
        hasSeconds={false}
        initial={T('00:00')}
        onChange={onChange}
        onDone={vi.fn()}
      />,
    );
    expect(
      column('Hours').getByRole('option', {name: '12', selected: true}),
    ).toBeInTheDocument();
    await user.click(column('Period').getByRole('option', {name: 'PM'}));
    expect(onChange.mock.lastCall?.[0].toString()).toBe('12:00:00');
  });

  it('disables unavailable times and moves to a valid minute when the hour changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <Panel
        hasSeconds={false}
        initial={T('09:45')}
        max={T('10:15')}
        min={T('09:30')}
        onChange={onChange}
        onDone={vi.fn()}
        step={900}
      />,
    );
    expect(column('Hours').getByRole('option', {name: '08'})).toBeDisabled();
    expect(column('Minutes').getByRole('option', {name: '00'})).toBeDisabled();
    expect(column('Period').getByRole('option', {name: 'PM'})).toBeDisabled();
    await user.click(column('Hours').getByRole('option', {name: '10'}));
    expect(
      column('Minutes').getByRole('option', {name: '15', selected: true}),
    ).toBeInTheDocument();
    expect(onChange.mock.lastCall?.[0].toString()).toBe('10:15:00');
  });

  it('supports overnight limits and step increments based on min', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <Panel
        hasSeconds={false}
        initial={T('23:10')}
        max={T('02:10')}
        min={T('22:10')}
        onChange={onChange}
        onDone={vi.fn()}
        step={900}
      />,
    );
    expect(
      column('Minutes')
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['10', '25', '40', '55']);
    await user.click(column('Period').getByRole('option', {name: 'AM'}));
    expect(column('Hours').getByRole('option', {name: '03'})).toBeDisabled();
    expect(onChange.mock.lastCall?.[0].toString()).toBe('02:10:00');
  });

  it('supports arrow, Home and End navigation with one tab stop per column', async () => {
    const user = userEvent.setup();
    render(
      <Panel
        hasSeconds={false}
        initial={T('09:15')}
        onChange={vi.fn()}
        onDone={vi.fn()}
        step={900}
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
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    render(
      <Panel
        hasSeconds
        initial={T('23:59:15')}
        onChange={onChange}
        onDone={vi.fn()}
        step={15}
      />,
    );
    expect(
      screen.queryByRole('listbox', {name: 'Period'}),
    ).not.toBeInTheDocument();
    expect(column('Hours').getAllByRole('option')).toHaveLength(24);
    expect(column('Seconds').getAllByRole('option')).toHaveLength(4);
    await user.click(column('Seconds').getByRole('option', {name: '45'}));
    expect(onChange.mock.lastCall?.[0].toString()).toBe('23:59:45');
  });

  it('applies the highlighted time on Done only when it differs from the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    const onDone = vi.fn();
    const {unmount} = render(
      <Panel
        hasSeconds={false}
        initial={T('09:15')}
        onChange={onChange}
        onDone={onDone}
        step={900}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onDone).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
    unmount();
    render(
      <Panel
        hasSeconds={false}
        initial={null}
        max={T('09:00')}
        min={T('09:00')}
        onChange={onChange}
        onDone={onDone}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onDone).toHaveBeenCalledTimes(2);
    expect(onChange.mock.lastCall?.[0].toString()).toBe('09:00:00');
  });

  it('follows its value rather than keeping its own selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    const {rerender} = render(
      <TimePickerPanel
        hasSeconds={false}
        onChange={onChange}
        onDone={vi.fn()}
        step={900}
        value={T('09:00')}
      />,
    );
    await user.click(column('Minutes').getByRole('option', {name: '15'}));
    expect(onChange.mock.lastCall?.[0].toString()).toBe('09:15:00');
    expect(
      column('Minutes').getByRole('option', {name: '00', selected: true}),
    ).toBeInTheDocument();
    rerender(
      <TimePickerPanel
        hasSeconds={false}
        onChange={onChange}
        onDone={vi.fn()}
        step={900}
        value={T('10:30')}
      />,
    );
    expect(
      column('Minutes').getByRole('option', {name: '30', selected: true}),
    ).toBeInTheDocument();
  });

  it('closes without a change when there is no representable time', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(time: Temporal.PlainTime) => void>();
    const onDone = vi.fn();
    render(
      <Panel
        hasSeconds={false}
        initial={null}
        max={T('09:00:02')}
        min={T('09:00:01')}
        onChange={onChange}
        onDone={onDone}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(onDone).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });
});
