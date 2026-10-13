import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeAll, expect, it, vi} from 'vitest';
import {createEventFromISO} from 'components/Schedule/CalendarEvent';
import {Schedule} from 'components/Schedule/Schedule';
import {createScheduleWeeklyView} from 'components/Schedule/WeeklyView';
import {
  useScheduleEventMovePlugin,
  type ScheduleEventMovePluginOptions,
} from 'components/Schedule/plugins/EventMovePlugin';
import {Temporal} from 'internal/temporal';

// Real-layout move tests: hit testing through `elementsFromPoint` and edge
// auto-scrolling need geometry jsdom cannot compute (see vitest.config.ts).

type OnMove = ScheduleEventMovePluginOptions['onMove'];

// The pointer events below reach React outside `act`, as real input does;
// without this, every update they cause logs an act warning.
beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
});

function instantUTC(iso: string): number {
  return Temporal.Instant.from(iso).epochMilliseconds;
}

const events = [
  createEventFromISO({
    end: '2026-05-13T09:30:00.000Z',
    id: 'sync',
    start: '2026-05-13T09:00:00.000Z',
    title: 'Sync',
  }),
];

function Fixture({onMove}: {onMove: OnMove}): React.JSX.Element {
  const movePlugin = useScheduleEventMovePlugin({onMove});
  return (
    <div style={{height: '100vh'}}>
      <Schedule
        events={events}
        height="fill"
        plugins={[movePlugin]}
        timezoneID="UTC"
        view={createScheduleWeeklyView({hourHeight: 60})}
        viewDate={instantUTC('2026-05-13T00:00:00Z')}
      />
    </div>
  );
}

// Chrome's mouse is always an active pointer with id 1, so the plugin can
// capture it even for dispatched events.
const MOUSE = {button: 0, pointerId: 1, pointerType: 'mouse'};

function getGrid(): HTMLElement {
  return screen.getByRole('grid', {name: 'Schedule time grid'});
}

/**
 * Presses the event 5px below its top edge, a 5 minute grip at 60px per hour.
 */
function pressSync(): void {
  const event = screen.getByTestId('schedule-event-sync');
  event.scrollIntoView({block: 'center'});
  const rect = event.getBoundingClientRect();
  fireEvent.pointerDown(event, {
    ...MOUSE,
    clientX: rect.left + 10,
    clientY: rect.top + 5,
  });
}

it('moves a dragged event to the snapped slot under the pointer', () => {
  const onMove = vi.fn<OnMove>();
  render(<Fixture onMove={onMove} />);

  pressSync();
  const cell = screen.getByTestId('schedule-time-grid-cell-2026-05-14-10');
  const rect = cell.getBoundingClientRect();
  // 20px into the 10:00 row less the 5 minute grip: 10:15.
  const point = {clientX: rect.left + 10, clientY: rect.top + 20};
  fireEvent.pointerMove(window, {...MOUSE, ...point});

  expect(
    screen.getByTestId('schedule-event-move-silhouette-sync'),
  ).toHaveTextContent(/10:15\s?AM - 10:45\s?AM/);

  fireEvent.pointerUp(window, {...MOUSE, ...point});

  expect(onMove).toHaveBeenCalledTimes(1);
  expect(onMove.mock.calls[0]?.[0].start).toBe(
    instantUTC('2026-05-14T10:15:00Z'),
  );
  expect(onMove.mock.calls[0]?.[0].end).toBe(
    instantUTC('2026-05-14T10:45:00Z'),
  );
});

it('scrolls the grid while the pointer rests near its bottom edge', async () => {
  const onMove = vi.fn<OnMove>();
  render(<Fixture onMove={onMove} />);

  pressSync();
  const grid = getGrid();
  const scrollTop = grid.scrollTop;
  const gridRect = grid.getBoundingClientRect();
  const point = {clientX: gridRect.left + 200, clientY: gridRect.bottom - 4};
  fireEvent.pointerMove(window, {...MOUSE, ...point});
  const silhouette = screen.getByTestId('schedule-event-move-silhouette-sync');
  const initialLabel = silhouette.textContent;

  await waitFor(() => {
    expect(grid.scrollTop).toBeGreaterThan(scrollTop + 100);
  });
  // The target follows the content scrolling under the resting pointer.
  expect(silhouette).not.toHaveTextContent(initialLabel);

  fireEvent.pointerUp(window, {...MOUSE, ...point});
  const scrolledTop = grid.scrollTop;
  await new Promise(resolve => setTimeout(resolve, 100));
  expect(grid.scrollTop).toBe(scrolledTop);
  expect(onMove).toHaveBeenCalledTimes(1);
});
