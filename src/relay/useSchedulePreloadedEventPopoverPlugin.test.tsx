import {Temporal} from '@js-temporal/polyfill';
import {act, fireEvent, render, screen} from '@testing-library/react';
import type {ReactElement} from 'react';
import {RelayEnvironmentProvider, type EntryPointProps} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  createEventFromISO,
  type CalendarEvent,
} from 'components/Schedule/CalendarEvent';
import {createScheduleMonthlyView} from 'components/Schedule/MonthlyView';
import {Schedule} from 'components/Schedule/Schedule';
import {createJSResourceReference} from 'relay/createJSResourceReference';
import {
  scheduleEventEntryPoint,
  useSchedulePreloadedEventPopoverPlugin,
} from 'relay/useSchedulePreloadedEventPopoverPlugin';

type TestEntryPointProps = EntryPointProps<
  Record<string, never>,
  Record<string, never>,
  {close: () => void; label: string},
  {id: string; kind: string; loadCount: number}
>;

function TestEntryPointRoot({
  extraProps,
  props,
}: TestEntryPointProps): React.JSX.Element {
  return (
    <div>
      <span>{`${extraProps.kind}:${extraProps.id}:${props.label}`}</span>
      <span>{`Load ${extraProps.loadCount}`}</span>
      <button onClick={props.close} type="button">
        Close loaded content
      </button>
    </div>
  );
}

function createTestEntryPoint(
  kind: string,
  importModule = vi.fn(async () => {
    await Promise.resolve();
    return {default: TestEntryPointRoot};
  }),
) {
  let loadCount = 0;
  const getPreloadProps = vi.fn((params: {id: string}) => ({
    extraProps: {id: params.id, kind, loadCount: ++loadCount},
  }));
  return {
    entryPoint: {
      getPreloadProps,
      root: createJSResourceReference(`${kind}EntryPointRoot`, importModule),
    },
    getPreloadProps,
  };
}

type TestEntryPoint = ReturnType<typeof createTestEntryPoint>['entryPoint'];

const events: CalendarEvent[] = [
  createEventFromISO({
    end: '2026-05-13T16:30:00.000Z',
    id: 'appointment',
    start: '2026-05-13T16:00:00.000Z',
    title: 'Appointment',
  }),
  createEventFromISO({
    end: '2026-05-14T16:30:00.000Z',
    id: 'meeting',
    start: '2026-05-14T16:00:00.000Z',
    title: 'Meeting',
  }),
  createEventFromISO({
    end: '2026-05-15T16:30:00.000Z',
    id: 'holiday',
    start: '2026-05-15T16:00:00.000Z',
    title: 'Holiday',
  }),
];

const viewDate = Temporal.Instant.from(
  '2026-05-13T00:00:00Z',
).epochMilliseconds;

function ScheduleFixture({
  appointmentEntryPoint,
  hoverIntentMs = 0,
  label = 'runtime',
  meetingEntryPoint,
}: {
  appointmentEntryPoint: TestEntryPoint;
  hoverIntentMs?: number;
  label?: string;
  meetingEntryPoint: TestEntryPoint;
}): ReactElement {
  const plugin = useSchedulePreloadedEventPopoverPlugin({
    hoverIntentMs,
    resolve: event =>
      event.id === 'holiday'
        ? null
        : scheduleEventEntryPoint(
            event.id === 'meeting' ? meetingEntryPoint : appointmentEntryPoint,
            {id: event.id},
            {label},
          ),
  });
  return (
    <Schedule
      events={events}
      plugins={[plugin]}
      timezoneID="UTC"
      view={createScheduleMonthlyView()}
      viewDate={viewDate}
    />
  );
}

function renderFixture(props: Parameters<typeof ScheduleFixture>[0]): {
  rerender: (nextProps: Parameters<typeof ScheduleFixture>[0]) => void;
} {
  const environment = new Environment({
    network: Network.create(async () => {
      await Promise.resolve();
      return {data: {}};
    }),
    store: new Store(new RecordSource()),
  });
  const renderTree = (
    treeProps: Parameters<typeof ScheduleFixture>[0],
  ): ReactElement => (
    <RelayEnvironmentProvider environment={environment}>
      <ScheduleFixture {...treeProps} />
    </RelayEnvironmentProvider>
  );
  const {rerender} = render(renderTree(props));
  return {rerender: nextProps => rerender(renderTree(nextProps))};
}

async function createLoadedEntryPoints() {
  const appointment = createTestEntryPoint('appointment');
  const meeting = createTestEntryPoint('meeting');
  await appointment.entryPoint.root.load();
  await meeting.entryPoint.root.load();
  return {appointment, meeting};
}

describe('useSchedulePreloadedEventPopoverPlugin', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('preloads after hover intent and cancels when the pointer leaves', async () => {
    vi.useFakeTimers();
    const {appointment, meeting} = await createLoadedEntryPoints();
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      hoverIntentMs: 100,
      meetingEntryPoint: meeting.entryPoint,
    });
    const pill = screen.getByTestId('schedule-event-appointment');

    fireEvent.pointerEnter(pill);
    fireEvent.pointerLeave(pill);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(appointment.getPreloadProps).not.toHaveBeenCalled();

    fireEvent.pointerEnter(pill);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(appointment.getPreloadProps).toHaveBeenCalledOnce();
  });

  it('preloads immediately on focus', async () => {
    const {appointment, meeting} = await createLoadedEntryPoints();
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      hoverIntentMs: 100,
      meetingEntryPoint: meeting.entryPoint,
    });

    fireEvent.focus(screen.getByTestId('schedule-event-appointment'));

    expect(appointment.getPreloadProps).toHaveBeenCalledOnce();
  });

  it('opens with the preloaded EntryPoint and its runtime props', async () => {
    const {appointment, meeting} = await createLoadedEntryPoints();
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });
    const pill = screen.getByTestId('schedule-event-appointment');

    fireEvent.pointerEnter(pill);
    fireEvent.click(pill);

    expect(
      await screen.findByText('appointment:appointment:runtime'),
    ).toBeInTheDocument();
    expect(appointment.getPreloadProps).toHaveBeenCalledOnce();
    expect(meeting.getPreloadProps).not.toHaveBeenCalled();
  });

  it('chooses the EntryPoint per event', async () => {
    const {appointment, meeting} = await createLoadedEntryPoints();
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });

    fireEvent.click(screen.getByTestId('schedule-event-meeting'));

    expect(
      await screen.findByText('meeting:meeting:runtime'),
    ).toBeInTheDocument();
    expect(appointment.getPreloadProps).not.toHaveBeenCalled();
  });

  it('keeps events without an EntryPoint non-interactive', async () => {
    const {appointment, meeting} = await createLoadedEntryPoints();
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });

    const holiday = screen.getByTestId('schedule-event-holiday');
    expect(holiday.tagName).toBe('SPAN');
    fireEvent.pointerEnter(holiday);
    expect(appointment.getPreloadProps).not.toHaveBeenCalled();
  });

  it('does not reload the open EntryPoint on hover and reloads after close', async () => {
    const {appointment, meeting} = await createLoadedEntryPoints();
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });
    const pill = screen.getByTestId('schedule-event-appointment');

    fireEvent.click(pill);
    expect(await screen.findByText('Load 1')).toBeInTheDocument();
    fireEvent.pointerEnter(pill);
    expect(appointment.getPreloadProps).toHaveBeenCalledOnce();

    fireEvent.click(
      screen.getByRole('button', {hidden: true, name: 'Close loaded content'}),
    );
    expect(screen.queryByText('Load 1')).not.toBeInTheDocument();
    // The popover ignores clicks in the frame it closes (light-dismiss guard).
    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });
    fireEvent.click(pill);

    expect(await screen.findByText('Load 2')).toBeInTheDocument();
  });

  it('renders the latest runtime props while open', async () => {
    const {appointment, meeting} = await createLoadedEntryPoints();
    const {rerender} = renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });

    fireEvent.click(screen.getByTestId('schedule-event-appointment'));
    expect(
      await screen.findByText('appointment:appointment:runtime'),
    ).toBeInTheDocument();

    rerender({
      appointmentEntryPoint: appointment.entryPoint,
      label: 'updated',
      meetingEntryPoint: meeting.entryPoint,
    });

    expect(
      await screen.findByText('appointment:appointment:updated'),
    ).toBeInTheDocument();
    expect(appointment.getPreloadProps).toHaveBeenCalledOnce();
  });

  it('renders the error fallback and retries a failed module import', async () => {
    const importModule = vi
      .fn<() => Promise<{default: typeof TestEntryPointRoot}>>()
      .mockRejectedValueOnce(new Error('chunk failed'))
      .mockResolvedValueOnce({default: TestEntryPointRoot});
    const appointment = createTestEntryPoint('appointment', importModule);
    const meeting = createTestEntryPoint('meeting');
    renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });

    fireEvent.click(screen.getByTestId('schedule-event-appointment'));
    fireEvent.click(
      await screen.findByRole('button', {hidden: true, name: 'Try again'}),
    );

    expect(
      await screen.findByText('appointment:appointment:runtime'),
    ).toBeInTheDocument();
    expect(importModule).toHaveBeenCalledTimes(2);
  });
});
