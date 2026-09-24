import {Temporal} from '@js-temporal/polyfill';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {useCallback, useEffect, type ReactElement} from 'react';
import {RelayEnvironmentProvider, type EntryPointProps} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  createEventFromISO,
  type CalendarEvent,
} from 'components/Schedule/CalendarEvent';
import {createScheduleMonthlyView} from 'components/Schedule/MonthlyView';
import {Schedule} from 'components/Schedule/Schedule';
import type {SchedulePlugin} from 'components/Schedule/types';
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
  label = 'runtime',
  meetingEntryPoint,
}: {
  appointmentEntryPoint: TestEntryPoint;
  label?: string;
  meetingEntryPoint: TestEntryPoint;
}): ReactElement {
  const plugin = useSchedulePreloadedEventPopoverPlugin({
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

function createEnvironment(): Environment {
  return new Environment({
    network: Network.create(async () => {
      await Promise.resolve();
      return {data: {}};
    }),
    store: new Store(new RecordSource()),
  });
}

function renderFixture(props: Parameters<typeof ScheduleFixture>[0]): {
  rerender: (nextProps: Parameters<typeof ScheduleFixture>[0]) => void;
  unmount: () => void;
} {
  const environment = createEnvironment();
  const renderTree = (
    treeProps: Parameters<typeof ScheduleFixture>[0],
  ): ReactElement => (
    <RelayEnvironmentProvider environment={environment}>
      <ScheduleFixture {...treeProps} />
    </RelayEnvironmentProvider>
  );
  const {rerender, unmount} = render(renderTree(props));
  return {rerender: nextProps => rerender(renderTree(nextProps)), unmount};
}

/**
 * Renders the plugin's popover content for fixed popover ids, so tests can
 * drive the show/hide callbacks in orders a browser produces.
 */
function PopoverSlotsHarness({
  entryPoint,
  onPlugin,
  popoverIds,
}: {
  entryPoint: TestEntryPoint;
  onPlugin: (plugin: SchedulePlugin) => void;
  popoverIds: ReadonlyArray<string>;
}): ReactElement {
  const resolve = useCallback(
    (event: CalendarEvent) =>
      scheduleEventEntryPoint(entryPoint, {id: event.id}, {label: 'slot'}),
    [entryPoint],
  );
  const plugin = useSchedulePreloadedEventPopoverPlugin({resolve});
  useEffect(() => onPlugin(plugin), [onPlugin, plugin]);
  return (
    <>
      {popoverIds.map(popoverId => (
        <div data-testid={`slot-${popoverId}`} key={popoverId}>
          {plugin.renderEventPopover?.(events[0], {
            close: () => {},
            popoverId,
          })}
        </div>
      ))}
    </>
  );
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

    fireEvent.focus(pill);
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
    fireEvent.focus(pill);
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

  it('keeps the newly opened popover when an earlier close arrives late', async () => {
    const {appointment} = await createLoadedEntryPoints();
    let plugin: SchedulePlugin | null = null;
    render(
      <RelayEnvironmentProvider environment={createEnvironment()}>
        <PopoverSlotsHarness
          entryPoint={appointment.entryPoint}
          onPlugin={nextPlugin => {
            plugin = nextPlugin;
          }}
          popoverIds={['first', 'second']}
        />
      </RelayEnvironmentProvider>,
    );
    // Two pills for one event (e.g. month-view week segments): the second
    // opens before the browser delivers the first one's close.
    act(() => {
      plugin?.onEventPopoverShow?.(events[0], 'first');
      plugin?.onEventPopoverShow?.(events[0], 'second');
      plugin?.onEventPopoverHide?.(events[0], 'first');
    });

    expect(
      await within(screen.getByTestId('slot-second')).findByText(
        'appointment:appointment:slot',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('slot-first')).toBeEmptyDOMElement();
  });

  it('cancels a pending hover preload when the schedule unmounts', async () => {
    vi.useFakeTimers();
    const {appointment, meeting} = await createLoadedEntryPoints();
    const {unmount} = renderFixture({
      appointmentEntryPoint: appointment.entryPoint,
      meetingEntryPoint: meeting.entryPoint,
    });

    fireEvent.pointerEnter(screen.getByTestId('schedule-event-appointment'));
    unmount();
    vi.advanceTimersByTime(100);

    expect(appointment.getPreloadProps).not.toHaveBeenCalled();
  });

  it('reloads a long-unused preload when the popover opens', async () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    try {
      const {appointment, meeting} = await createLoadedEntryPoints();
      renderFixture({
        appointmentEntryPoint: appointment.entryPoint,
        meetingEntryPoint: meeting.entryPoint,
      });
      const pill = screen.getByTestId('schedule-event-appointment');

      fireEvent.focus(pill);
      now.mockReturnValue(30_000);
      fireEvent.click(pill);

      expect(await screen.findByText('Load 2')).toBeInTheDocument();
    } finally {
      now.mockRestore();
    }
  });

  it('renders the error fallback for a failed render and retries with a new load', async () => {
    const onError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const failing = createTestEntryPoint(
        'failing',
        vi.fn(async () => {
          await Promise.resolve();
          return {
            default: (props: TestEntryPointProps) => {
              if (props.extraProps.loadCount === 1) {
                throw new Error('query failed');
              }
              return <TestEntryPointRoot {...props} />;
            },
          };
        }),
      );
      const meeting = createTestEntryPoint('meeting');
      await failing.entryPoint.root.load();
      renderFixture({
        appointmentEntryPoint: failing.entryPoint,
        meetingEntryPoint: meeting.entryPoint,
      });

      fireEvent.click(screen.getByTestId('schedule-event-appointment'));
      fireEvent.click(
        await screen.findByRole('button', {hidden: true, name: 'Try again'}),
      );

      expect(await screen.findByText('Load 2')).toBeInTheDocument();
      expect(failing.getPreloadProps).toHaveBeenCalledTimes(2);
    } finally {
      onError.mockRestore();
    }
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
