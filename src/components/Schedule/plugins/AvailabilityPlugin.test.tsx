import {Temporal} from '@js-temporal/polyfill';
import {render, screen} from '@testing-library/react';
import {useMemo} from 'react';
import {expect, it, vi} from 'vitest';
import {createScheduleDayView} from 'components/Schedule/DayView';
import {Schedule} from 'components/Schedule/Schedule';
import {
  useScheduleAvailabilityPlugin,
  type ScheduleUnavailableRange,
} from 'components/Schedule/plugins/AvailabilityPlugin';
import type {
  SchedulePlugin,
  ScheduleTimeGridCellPropsRenderProps,
} from 'components/Schedule/types';

const VIEW_DATE = Temporal.Instant.from(
  '2026-08-12T12:00:00Z',
).epochMilliseconds;

function range(
  startMinute: number,
  endMinute: number,
): ScheduleUnavailableRange {
  return {endMinute, startMinute};
}

it('paints full and partial unavailable ranges while preserving cell geometry', () => {
  const getUnavailableRanges = vi.fn(
    ({hour}: ScheduleTimeGridCellPropsRenderProps) => {
      switch (hour) {
        case 8:
          return [range(0, 60)];
        case 9:
          return [range(0, 30)];
        case 11:
          return [
            range(-10, 15),
            range(10, 30),
            range(45, 90),
            range(20, 10),
            range(Number.NaN, 20),
          ];
        default:
          return [];
      }
    },
  );

  function Fixture(): React.JSX.Element {
    const availabilityPlugin = useScheduleAvailabilityPlugin({
      getUnavailableRanges,
    });
    const supplementalStylePlugin = useMemo<SchedulePlugin>(
      () => ({
        getTimeGridCellProps: () => ({style: {outline: '1px solid red'}}),
      }),
      [],
    );
    // Returning only a data-* attribute exercises the
    // SchedulePluginElementProps index signature, which plain
    // HTMLAttributes<HTMLElement> rejects without a co-present known key.
    const dataOnlyPlugin = useMemo<SchedulePlugin>(
      () => ({
        getTimeGridCellProps: () => ({'data-supplemental-cell': 'true'}),
      }),
      [],
    );
    return (
      <Schedule
        events={[]}
        plugins={[availabilityPlugin, supplementalStylePlugin, dataOnlyPlugin]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 12, minHour: 8})}
        viewDate={VIEW_DATE}
      />
    );
  }

  render(<Fixture />);

  const cell = (hour: number) =>
    screen.getByTestId(`schedule-time-grid-cell-2026-08-12-${hour}`);
  expect(cell(8)).toHaveAttribute('data-schedule-availability', 'unavailable');
  expect(cell(8)).toHaveAttribute('aria-description', 'Unavailable');
  expect(cell(8)).toHaveAttribute('data-supplemental-cell', 'true');
  expect(cell(8)).toHaveStyle({
    background: 'var(--silver-colors-bg-subtle)',
    height: '100px',
    minHeight: '100px',
    outline: '1px solid red',
  });
  expect(cell(9)).toHaveAttribute('data-schedule-availability', 'partial');
  expect(cell(9)).toHaveAttribute('aria-description', 'Partially unavailable');
  expect(cell(9)).toHaveStyle({
    background:
      'linear-gradient(to bottom, var(--silver-colors-bg-subtle) 0%, var(--silver-colors-bg-subtle) 50%, transparent 50%, transparent 100%)',
  });
  expect(cell(10)).toHaveAttribute('data-schedule-availability', 'available');
  expect(cell(10)).not.toHaveAttribute('aria-description');
  expect(cell(10)).toHaveStyle({
    background: '',
    height: '100px',
    minHeight: '100px',
    outline: '1px solid red',
  });
  expect(cell(11)).toHaveAttribute('data-schedule-availability', 'partial');
  expect(cell(11)).toHaveStyle({
    background:
      'linear-gradient(to bottom, var(--silver-colors-bg-subtle) 0%, var(--silver-colors-bg-subtle) 50%, transparent 50%, transparent 75%, var(--silver-colors-bg-subtle) 75%, var(--silver-colors-bg-subtle) 100%)',
  });
  const hourNineProps = getUnavailableRanges.mock.calls.find(
    ([props]) => props.hour === 9,
  )?.[0];
  expect(hourNineProps).toMatchObject({
    date: {day: 12, month: 8, year: 2026},
    hour: 9,
    hourHeight: 100,
    maxHour: 12,
    minHour: 8,
    timezoneID: 'UTC',
  });
});

it('supports a custom unavailable color', () => {
  function Fixture(): React.JSX.Element {
    const availabilityPlugin = useScheduleAvailabilityPlugin({
      getUnavailableRanges: () => [range(15, 45)],
      unavailableColor: 'rebeccapurple',
    });
    return (
      <Schedule
        events={[]}
        plugins={[availabilityPlugin]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 9, minHour: 8})}
        viewDate={VIEW_DATE}
      />
    );
  }

  render(<Fixture />);

  const background = screen.getByTestId('schedule-time-grid-cell-2026-08-12-8')
    .style.background;
  expect(background).toContain('transparent 25%');
  expect(background).toContain('rebeccapurple 25%');
  expect(background).toContain('rebeccapurple 75%');
});

it('caches cell props between re-renders while availability data is stable', () => {
  const getUnavailableRanges = vi.fn(() => [range(0, 60)]);

  function Fixture(): React.JSX.Element {
    const availabilityPlugin = useScheduleAvailabilityPlugin({
      getUnavailableRanges,
    });
    return (
      <Schedule
        events={[]}
        plugins={[availabilityPlugin]}
        timezoneID="UTC"
        view={createScheduleDayView({maxHour: 10, minHour: 8})}
        viewDate={VIEW_DATE}
      />
    );
  }

  const {rerender} = render(<Fixture />);
  const callsAfterInitialRender = getUnavailableRanges.mock.calls.length;
  expect(callsAfterInitialRender).toBeGreaterThan(0);

  rerender(<Fixture />);

  expect(getUnavailableRanges).toHaveBeenCalledTimes(callsAfterInitialRender);
  expect(
    screen.getByTestId('schedule-time-grid-cell-2026-08-12-8'),
  ).toHaveAttribute('data-schedule-availability', 'unavailable');
});
