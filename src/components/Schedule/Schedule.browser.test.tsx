import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Schedule} from 'components/Schedule/Schedule';
import {createScheduleWeeklyView} from 'components/Schedule/WeeklyView';
import {useScheduleEventCreatePlugin} from 'components/Schedule/plugins/EventCreatePlugin';
import type {
  Instant,
  ScheduleInitialScrollTime,
} from 'components/Schedule/types';
import {Temporal} from 'internal/temporal';

// Real-layout placement tests for the create popover, reproducing a tall
// create form opened beside a drafted event. jsdom cannot resolve CSS anchor
// positioning, so these run in Chromium (see vitest.config.ts).

// Matches the create popover's `offsetX`.
const GAP = 8;
// Roughly the size of a real "New appointment" form: taller than the space
// above or below any afternoon event, and wider than the space beside the
// rightmost columns.
const FORM_SIZE = {height: 546, width: 392};

function ScheduleWithTallCreateForm() {
  const createPlugin = useScheduleEventCreatePlugin({
    renderContent: () => <div data-testid="create-form" style={FORM_SIZE} />,
  });
  return (
    <div style={{height: '100vh'}}>
      <Schedule
        events={[]}
        plugins={[createPlugin]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({
          hourHeight: 48,
          maxHour: 18,
          minHour: 8,
        })}
        viewDate={
          Temporal.Instant.from('2026-09-30T12:00:00Z').epochMilliseconds
        }
      />
    </div>
  );
}

function overlaps(a: DOMRect, b: DOMRect): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

// The week of Sep 27 – Oct 3, 2026: the first column, the middle one, and the
// two rightmost, whose right-hand space is narrower than the form.
const DAYS = ['2026-09-27', '2026-09-30', '2026-10-02', '2026-10-03'];
// Morning, midday, and late-afternoon rows. The form is taller than the space
// below the afternoon rows and above the morning ones.
const HOURS = [8, 12, 16];

describe('Schedule create popover placement (browser)', () => {
  beforeEach(() => {
    // The headless test page never has window focus, and the create plugin
    // ignores a press that only focuses the window.
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    return () => {
      vi.restoreAllMocks();
    };
  });

  it.each(DAYS.flatMap(day => HOURS.map(hour => ({day, hour}))))(
    'opens beside a draft on $day at $hour:00 without covering it',
    async ({day, hour}) => {
      render(<ScheduleWithTallCreateForm />);

      await userEvent.click(
        screen.getByTestId(`schedule-time-grid-cell-${day}-${hour}`),
      );

      const ghostElement = screen.getByTestId('schedule-event-create-ghost');
      // eslint-disable-next-line testing-library/no-node-access -- the native layer has no accessible role or test ID
      const layer = document.getElementById(
        ghostElement.getAttribute('aria-controls') ?? '',
      );
      await waitFor(() => {
        expect(layer?.matches(':popover-open')).toBe(true);
      });
      await screen.findByTestId('create-form');

      const ghost = ghostElement.getBoundingClientRect();
      const popover = screen
        .getByRole('dialog', {name: 'Create event'})
        .getBoundingClientRect();
      expect(popover.height).toBeGreaterThanOrEqual(FORM_SIZE.height);

      expect(overlaps(ghost, popover)).toBe(false);

      // `end` placement: to the right of the draft when the form fits there,
      // otherwise flipped to its left. Either way the gap stays on the edge
      // facing the draft.
      const fitsRight = window.innerWidth - ghost.right >= popover.width + GAP;
      expect(
        fitsRight ? popover.left - ghost.right : ghost.left - popover.right,
      ).toBe(GAP);

      expect(popover.left).toBeGreaterThanOrEqual(0);
      expect(popover.top).toBeGreaterThanOrEqual(0);
      expect(popover.right).toBeLessThanOrEqual(window.innerWidth);
      expect(popover.bottom).toBeLessThanOrEqual(window.innerHeight);
    },
  );
});

// A full-day grid in a short frame, so every case has room to scroll.
function ScrollingWeek({
  initialScrollTime,
  viewDate,
}: {
  initialScrollTime: ScheduleInitialScrollTime;
  viewDate: Instant;
}) {
  return (
    <div style={{height: 400}}>
      <Schedule
        events={[]}
        height="fill"
        timezoneID="UTC"
        view={createScheduleWeeklyView({hourHeight: 48, initialScrollTime})}
        viewDate={viewDate}
      />
    </div>
  );
}

const SEP_30 = Temporal.Instant.from('2026-09-30T12:00:00Z').epochMilliseconds;
const OCT_7 = Temporal.Instant.from('2026-10-07T12:00:00Z').epochMilliseconds;

function timeGrid(): HTMLElement {
  return screen.getByRole('grid', {name: 'Schedule time grid'});
}

// The top of the hours left visible below the sticky day headers.
function visibleHoursTop(): number {
  return screen
    .getByTestId('schedule-time-grid-fixed-rows')
    .getBoundingClientRect().bottom;
}

describe('Schedule initial scroll time (browser)', () => {
  beforeEach(() => {
    vi.spyOn(Temporal.Now, 'instant').mockReturnValue(
      Temporal.Instant.from('2026-09-30T15:30:00Z'),
    );
    return () => {
      vi.restoreAllMocks();
    };
  });

  it('places now a third of the way down the visible hours', () => {
    render(<ScrollingWeek initialScrollTime="now" viewDate={SEP_30} />);

    const visibleHoursHeight =
      timeGrid().getBoundingClientRect().bottom - visibleHoursTop();
    const line = screen.getByTestId('schedule-current-time-line');
    // The line is drawn a couple of pixels below the time it marks.
    expect(
      Math.abs(
        line.getBoundingClientRect().top -
          visibleHoursTop() -
          visibleHoursHeight / 3,
      ),
    ).toBeLessThanOrEqual(2);
  });

  it('stays at the first hour when the grid does not show today', () => {
    render(<ScrollingWeek initialScrollTime="now" viewDate={OCT_7} />);

    expect(timeGrid().scrollTop).toBe(0);
  });

  it('places a time of day at the top of the visible hours', () => {
    render(
      <ScrollingWeek
        initialScrollTime={{hour: 8, minute: 30}}
        viewDate={OCT_7}
      />,
    );

    const eightOClock = screen
      .getByTestId('schedule-time-grid-cell-2026-10-07-8')
      .getBoundingClientRect();
    expect(visibleHoursTop() - eightOClock.top).toBeCloseTo(24, 0);
  });

  it("keeps the user's scroll when paging", () => {
    const {rerender} = render(
      <ScrollingWeek initialScrollTime="now" viewDate={OCT_7} />,
    );
    timeGrid().scrollTop = 100;

    rerender(<ScrollingWeek initialScrollTime="now" viewDate={SEP_30} />);

    expect(timeGrid().scrollTop).toBe(100);
  });
});
