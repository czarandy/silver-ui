import {act, fireEvent, render, screen} from '@testing-library/react';
import {useMemo} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createEventFromISO} from 'components/Schedule/CalendarEvent';
import {createScheduleMonthlyView} from 'components/Schedule/MonthlyView';
import {Schedule} from 'components/Schedule/Schedule';
import {createScheduleWeeklyView} from 'components/Schedule/WeeklyView';
import {
  useScheduleEventMovePlugin,
  type ScheduleEventMovePluginOptions,
} from 'components/Schedule/plugins/EventMovePlugin';
import type {
  CalendarEvent,
  SchedulePlugin,
  ScheduleView,
} from 'components/Schedule/types';
import {Temporal} from 'internal/temporal';

function instantUTC(iso: string): number {
  return Temporal.Instant.from(iso).epochMilliseconds;
}

const VIEW_DATE = instantUTC('2026-05-13T00:00:00Z');

const events: CalendarEvent[] = [
  createEventFromISO({
    category: 'Sync',
    end: '2026-05-13T16:30:00.000Z',
    id: 'sync',
    start: '2026-05-13T16:00:00.000Z',
    title: 'Sync',
  }),
  createEventFromISO({
    category: 'Sync',
    end: '2026-05-13T10:00:00.000Z',
    id: 'locked',
    start: '2026-05-13T09:00:00.000Z',
    title: 'Locked',
  }),
];

const weekView = createScheduleWeeklyView({
  hourHeight: 60,
  maxHour: 18,
  minHour: 8,
});

type OnMove = ScheduleEventMovePluginOptions['onMove'];

function noop(): void {}

function Fixture({
  getIsMovable,
  onClick = noop,
  onMove,
  view = weekView,
}: {
  getIsMovable?: (event: CalendarEvent) => boolean;
  onClick?: () => void;
  onMove: OnMove;
  view?: ScheduleView;
}): React.JSX.Element {
  const movePlugin = useScheduleEventMovePlugin({
    getIsMovable,
    onMove,
    snapMinutes: 5,
  });
  const clickPlugin = useMemo<SchedulePlugin>(
    () => ({getEventProps: () => ({onClick})}),
    [onClick],
  );
  return (
    <Schedule
      categories={[{color: 'blue', label: 'Sync'}]}
      events={events}
      plugins={[movePlugin, clickPlugin]}
      timezoneID="UTC"
      view={view}
      viewDate={VIEW_DATE}
    />
  );
}

function mockRect(
  element: HTMLElement,
  rect: {height: number; left?: number; top: number; width?: number},
): void {
  const {height, left = 0, top, width = 100} = rect;
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      bottom: top + height,
      height,
      left,
      right: left + width,
      top,
      width,
      x: left,
      y: top,
    }),
  });
}

/**
 * jsdom has no layout, so hit testing reports whichever element the test says
 * is under the pointer.
 */
function pointAt(element: Element | null): void {
  Object.defineProperty(document, 'elementsFromPoint', {
    configurable: true,
    value: () => (element == null ? [] : [element]),
  });
}

function getEvent(id: string): HTMLElement {
  return screen.getByTestId(`schedule-event-${id}`);
}

function getCell(date: string, hour: number): HTMLElement {
  return screen.getByTestId(`schedule-time-grid-cell-${date}-${hour}`);
}

/**
 * Presses the sync event 10px below its top edge (a 10 minute grip at 60px per
 * hour) and drags it over the 10:00 cell of May 14, 25px down.
 */
function dragSyncToMay14(): HTMLElement {
  const event = getEvent('sync');
  mockRect(event, {height: 30, top: 100});
  const cell = getCell('2026-05-14', 10);
  mockRect(cell, {height: 60, top: 200});

  fireEvent.pointerDown(event, {
    button: 0,
    clientX: 50,
    clientY: 110,
    pointerId: 1,
  });
  pointAt(cell);
  fireEvent.pointerMove(window, {clientX: 300, clientY: 225, pointerId: 1});
  return event;
}

beforeEach(() => {
  pointAt(null);
});

afterEach(async () => {
  Reflect.deleteProperty(document, 'elementsFromPoint');
  // A drop swallows its click until the next task; let that expire so it
  // cannot leak into the next test.
  await new Promise(resolve => setTimeout(resolve, 0));
});

describe('time grid', () => {
  it('shows a silhouette at the snapped target and moves the event on drop', () => {
    const onMove = vi.fn<OnMove>();
    render(<Fixture onMove={onMove} />);

    const event = dragSyncToMay14();

    expect(event).toHaveAttribute('data-schedule-move-source');
    // 10:25 under the pointer less the 10 minute grip.
    const silhouette = screen.getByTestId(
      'schedule-event-move-silhouette-sync',
    );
    expect(silhouette).toHaveTextContent('Sync');
    expect(silhouette).toHaveTextContent(/10:15\s?AM - 10:45\s?AM/);
    expect(silhouette).toHaveAttribute('aria-hidden', 'true');
    // Mounted in the day's first hour cell, offset to 10:15.
    expect(getCell('2026-05-14', 8)).toContainElement(silhouette);
    expect(silhouette).toHaveStyle({top: '137px'});

    fireEvent.pointerUp(window, {clientX: 300, clientY: 225, pointerId: 1});

    expect(onMove).toHaveBeenCalledTimes(1);
    const change = onMove.mock.calls[0]?.[0];
    expect(change.event.id).toBe('sync');
    expect(change.start).toBe(instantUTC('2026-05-14T10:15:00Z'));
    expect(change.end).toBe(instantUTC('2026-05-14T10:45:00Z'));
    expect(
      screen.queryByTestId('schedule-event-move-silhouette-sync'),
    ).not.toBeInTheDocument();
    expect(event).not.toHaveAttribute('data-schedule-move-source');
  });

  it('follows the pointer between days and hours', () => {
    render(<Fixture onMove={vi.fn()} />);
    dragSyncToMay14();

    const cell = getCell('2026-05-15', 14);
    mockRect(cell, {height: 60, top: 600});
    pointAt(cell);
    fireEvent.pointerMove(window, {clientX: 400, clientY: 640, pointerId: 1});

    const silhouette = screen.getByTestId(
      'schedule-event-move-silhouette-sync',
    );
    expect(getCell('2026-05-15', 8)).toContainElement(silhouette);
    expect(silhouette).toHaveTextContent(/2:30\s?PM - 3:00\s?PM/);
  });

  it('keeps the moved event inside the visible hours', () => {
    const onMove = vi.fn<OnMove>();
    render(<Fixture onMove={onMove} />);
    dragSyncToMay14();

    const lastCell = getCell('2026-05-14', 17);
    mockRect(lastCell, {height: 60, top: 900});
    pointAt(lastCell);
    fireEvent.pointerMove(window, {clientX: 300, clientY: 959, pointerId: 1});
    fireEvent.pointerUp(window, {clientX: 300, clientY: 959, pointerId: 1});

    expect(onMove.mock.calls[0]?.[0].start).toBe(
      instantUTC('2026-05-14T17:30:00Z'),
    );
  });

  it('treats a press that barely moves as a click', () => {
    const onClick = vi.fn();
    const onMove = vi.fn<OnMove>();
    render(<Fixture onClick={onClick} onMove={onMove} />);

    const event = getEvent('sync');
    fireEvent.pointerDown(event, {button: 0, clientY: 110, pointerId: 1});
    fireEvent.pointerMove(window, {clientX: 2, clientY: 112, pointerId: 1});
    fireEvent.pointerUp(window, {clientX: 2, clientY: 112, pointerId: 1});
    fireEvent.click(event);

    expect(
      screen.queryByTestId('schedule-event-move-silhouette-sync'),
    ).not.toBeInTheDocument();
    expect(onMove).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('swallows the click that follows a drop', async () => {
    const onClick = vi.fn();
    render(<Fixture onClick={onClick} onMove={vi.fn()} />);

    const event = dragSyncToMay14();
    fireEvent.pointerUp(window, {clientX: 300, clientY: 225, pointerId: 1});
    fireEvent.click(event);
    expect(onClick).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    fireEvent.click(event);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape', () => {
    const onClick = vi.fn();
    const onMove = vi.fn<OnMove>();
    render(<Fixture onClick={onClick} onMove={onMove} />);

    const event = dragSyncToMay14();
    fireEvent.keyDown(window, {key: 'Escape'});

    expect(
      screen.queryByTestId('schedule-event-move-silhouette-sync'),
    ).not.toBeInTheDocument();
    expect(event).not.toHaveAttribute('data-schedule-move-source');

    fireEvent.pointerUp(window, {clientX: 300, clientY: 225, pointerId: 1});
    fireEvent.click(event);
    expect(onMove).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('ignores drops outside the grid and on the original slot', () => {
    const onMove = vi.fn<OnMove>();
    render(<Fixture onMove={onMove} />);

    dragSyncToMay14();
    pointAt(null);
    fireEvent.pointerMove(window, {clientX: 900, clientY: 900, pointerId: 1});
    expect(
      screen.queryByTestId('schedule-event-move-silhouette-sync'),
    ).not.toBeInTheDocument();
    fireEvent.pointerUp(window, {clientX: 900, clientY: 900, pointerId: 1});

    dragSyncToMay14();
    const originalCell = getCell('2026-05-13', 16);
    mockRect(originalCell, {height: 60, top: 100});
    pointAt(originalCell);
    fireEvent.pointerMove(window, {clientX: 50, clientY: 112, pointerId: 1});
    fireEvent.pointerUp(window, {clientX: 50, clientY: 112, pointerId: 1});

    expect(onMove).not.toHaveBeenCalled();
  });

  it('only moves events getIsMovable accepts', () => {
    render(
      <Fixture
        getIsMovable={event => event.id !== 'locked'}
        onMove={vi.fn()}
      />,
    );

    const locked = getEvent('locked');
    const cell = getCell('2026-05-14', 10);
    fireEvent.pointerDown(locked, {button: 0, clientY: 0, pointerId: 1});
    pointAt(cell);
    fireEvent.pointerMove(window, {clientX: 300, clientY: 225, pointerId: 1});

    expect(locked).not.toHaveAttribute('data-schedule-move-source');
    expect(
      screen.queryByTestId('schedule-event-move-silhouette-locked'),
    ).not.toBeInTheDocument();
  });

  it('ignores touch and secondary-button presses', () => {
    render(<Fixture onMove={vi.fn()} />);

    const event = getEvent('sync');
    const cell = getCell('2026-05-14', 10);
    pointAt(cell);
    fireEvent.pointerDown(event, {
      button: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: 'touch',
    });
    fireEvent.pointerMove(window, {clientX: 300, clientY: 225, pointerId: 1});
    fireEvent.pointerDown(event, {button: 2, clientY: 0, pointerId: 2});
    fireEvent.pointerMove(window, {clientX: 300, clientY: 225, pointerId: 2});

    expect(event).not.toHaveAttribute('data-schedule-move-source');
  });

  it('holds the silhouette while a returned promise is pending', async () => {
    let finishSave = (): void => {};
    const onMove = vi.fn<OnMove>(
      async () =>
        new Promise<void>(resolve => {
          finishSave = resolve;
        }),
    );
    render(<Fixture onMove={onMove} />);

    const event = dragSyncToMay14();
    fireEvent.pointerUp(window, {clientX: 300, clientY: 225, pointerId: 1});

    const silhouette = screen.getByTestId(
      'schedule-event-move-silhouette-sync',
    );
    expect(silhouette).toHaveAttribute('data-state', 'saving');
    expect(event).toHaveAttribute('data-schedule-move-source');

    // No second move starts while the first is saving.
    dragSyncToMay14();
    fireEvent.pointerUp(window, {clientX: 300, clientY: 225, pointerId: 1});
    expect(onMove).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishSave();
      await Promise.resolve();
    });
    expect(
      screen.queryByTestId('schedule-event-move-silhouette-sync'),
    ).not.toBeInTheDocument();
    expect(event).not.toHaveAttribute('data-schedule-move-source');
  });

  it('clears the silhouette when a returned promise rejects', async () => {
    let failSave = (): void => {};
    const onMove = vi.fn<OnMove>(
      async () =>
        new Promise<void>((_resolve, reject) => {
          failSave = () => reject(new Error('Save failed'));
        }),
    );
    render(<Fixture onMove={onMove} />);

    dragSyncToMay14();
    fireEvent.pointerUp(window, {clientX: 300, clientY: 225, pointerId: 1});
    await act(async () => {
      failSave();
      await Promise.resolve();
    });

    expect(
      screen.queryByTestId('schedule-event-move-silhouette-sync'),
    ).not.toBeInTheDocument();
  });
});

describe('month', () => {
  it('highlights the target day and keeps the local time on drop', () => {
    const onMove = vi.fn<OnMove>();
    render(<Fixture onMove={onMove} view={createScheduleMonthlyView()} />);

    const event = getEvent('sync');
    const targetCell = screen.getByTestId('schedule-month-cell-2026-05-14');
    fireEvent.pointerDown(event, {button: 0, clientY: 0, pointerId: 1});
    pointAt(targetCell);
    fireEvent.pointerMove(window, {clientX: 300, clientY: 300, pointerId: 1});

    expect(event).toHaveAttribute('data-schedule-move-source');
    expect(targetCell).toHaveAttribute('data-schedule-move-target');

    fireEvent.pointerUp(window, {clientX: 300, clientY: 300, pointerId: 1});

    expect(targetCell).not.toHaveAttribute('data-schedule-move-target');
    expect(onMove.mock.calls[0]?.[0].start).toBe(
      instantUTC('2026-05-14T16:00:00Z'),
    );
    expect(onMove.mock.calls[0]?.[0].end).toBe(
      instantUTC('2026-05-14T16:30:00Z'),
    );
  });
});
