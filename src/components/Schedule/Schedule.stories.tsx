/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */
import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useMemo, useState} from 'react';
import {Badge} from 'components/Badge';
import {Button} from 'components/Button';
import {createEventFromISO} from 'components/Schedule/CalendarEvent';
import {createScheduleDayView} from 'components/Schedule/DayView';
import {createScheduleListView} from 'components/Schedule/ListView';
import {createScheduleMonthlyView} from 'components/Schedule/MonthlyView';
import {Schedule} from 'components/Schedule/Schedule';
import {createScheduleWeeklyView} from 'components/Schedule/WeeklyView';
import {
  useScheduleEventCreatePlugin,
  type ScheduleEventDraft,
} from 'components/Schedule/plugins/EventCreatePlugin';
import {useScheduleEventMovePlugin} from 'components/Schedule/plugins/EventMovePlugin';
import {useScheduleEventPopoverPlugin} from 'components/Schedule/plugins/EventPopoverPlugin';
import {useScheduleEventResizePlugin} from 'components/Schedule/plugins/EventResizePlugin';
import {useSchedulePaginationPlugin} from 'components/Schedule/plugins/PaginationPlugin';
import {ScheduleEventPopoverContent} from 'components/Schedule/plugins/ScheduleEventPopoverContent';
import {useScheduleViewSelectorPlugin} from 'components/Schedule/plugins/ViewSelectorPlugin';
import type {
  CalendarEvent,
  Instant,
  ScheduleCategory,
  ScheduleEventSource,
  SchedulePlugin,
  ScheduleView,
} from 'components/Schedule/types';
import {Text} from 'components/Text';
import {TextInput} from 'components/TextInput';
import {ToastViewport, useToast} from 'components/Toast';

// Anchor every story to the current date in the viewer's local timezone so the
// seeded events fall in the visible range and their displayed times match the
// reader's wall clock (so the past/future styling lines up with "now"). Offsets
// are whole days from "today".
const localTimezoneID = Temporal.Now.timeZoneId();
const today = Temporal.Now.plainDateISO(localTimezoneID);

function allDayISO(dayOffset: number): string {
  return today.add({days: dayOffset}).toString();
}

function timedISO(dayOffset: number, hour: number, minute = 0): string {
  return today
    .add({days: dayOffset})
    .toZonedDateTime({
      plainTime: Temporal.PlainTime.from({hour, minute}),
      timeZone: localTimezoneID,
    })
    .toInstant()
    .toString();
}

function dayInstant(dayOffset: number): Instant {
  return today.add({days: dayOffset}).toZonedDateTime(localTimezoneID)
    .epochMilliseconds;
}

const events = [
  createEventFromISO({
    category: 'Planning',
    end: allDayISO(0),
    id: 'offsite',
    start: allDayISO(0),
    title: 'Planning offsite',
  }),
  createEventFromISO({
    category: 'Operations',
    end: allDayISO(0),
    id: 'release-freeze',
    start: allDayISO(0),
    title: 'Release freeze',
  }),
  createEventFromISO({
    category: 'Customer',
    end: timedISO(0, 15),
    id: 'customer-escalation',
    start: timedISO(0, 14),
    title: 'Customer escalation review',
  }),
  createEventFromISO({
    category: 'Design',
    end: timedISO(0, 15, 30),
    id: 'prototype-critique',
    start: timedISO(0, 14, 30),
    title: 'Prototype critique',
  }),
  createEventFromISO({
    category: 'Planning',
    end: timedISO(0, 16),
    id: 'launch-checklist',
    start: timedISO(0, 15, 30),
    title: 'Launch checklist',
  }),
  createEventFromISO({
    category: 'Sync',
    end: timedISO(0, 16, 30),
    id: 'sync',
    start: timedISO(0, 16),
    title: 'Team sync',
  }),
  createEventFromISO({
    category: 'Research',
    end: timedISO(0, 17, 30),
    id: 'study-readout',
    start: timedISO(0, 16, 45),
    title: 'Study readout',
  }),
  createEventFromISO({
    category: 'Operations',
    end: allDayISO(1),
    id: 'qa-window',
    start: allDayISO(1),
    title: 'QA window',
  }),
  createEventFromISO({
    category: 'Operations',
    end: allDayISO(4),
    id: 'launch-window-default',
    start: allDayISO(2),
    title: 'Launch window',
  }),
  createEventFromISO({
    category: 'Planning',
    end: allDayISO(8),
    id: 'research-summit',
    start: allDayISO(6),
    title: 'Research summit',
  }),
  createEventFromISO({
    category: 'Planning',
    end: timedISO(1, 13),
    id: 'roadmap-triage',
    start: timedISO(1, 12),
    title: 'Roadmap triage',
  }),
  createEventFromISO({
    category: 'Design',
    end: timedISO(1, 18),
    id: 'design',
    start: timedISO(1, 17),
    title: 'Design review',
  }),
  createEventFromISO({
    category: 'Sync',
    end: timedISO(2, 10, 45),
    id: 'partner-handoff',
    start: timedISO(2, 9, 30),
    title: 'Partner handoff',
  }),
  createEventFromISO({
    category: 'Customer',
    end: timedISO(2, 16, 30),
    id: 'account-planning',
    start: timedISO(2, 15),
    title: 'Account planning',
  }),
  createEventFromISO({
    category: 'Research',
    end: timedISO(5, 12),
    id: 'survey-results',
    start: timedISO(5, 11),
    title: 'Survey results review',
  }),
];

const eventsWithoutCategories = [
  createEventFromISO({
    end: timedISO(0, 16, 30),
    id: 'open-sync',
    start: timedISO(0, 16),
    title: 'Open sync',
  }),
  createEventFromISO({
    end: timedISO(0, 17, 30),
    id: 'notes-review',
    start: timedISO(0, 16, 45),
    title: 'Notes review',
  }),
  createEventFromISO({
    end: allDayISO(1),
    id: 'maintenance',
    start: allDayISO(1),
    title: 'Maintenance window',
  }),
  createEventFromISO({
    end: timedISO(2, 11, 30),
    id: 'open-retro',
    start: timedISO(2, 10, 30),
    title: 'Open retro',
  }),
  createEventFromISO({
    end: timedISO(2, 15, 15),
    id: 'release-checklist',
    start: timedISO(2, 14),
    title: 'Release checklist',
  }),
];

const multiDayEvents = [
  createEventFromISO({
    category: 'Planning',
    end: allDayISO(2),
    id: 'launch-window',
    start: allDayISO(0),
    title: 'Launch window',
  }),
  createEventFromISO({
    category: 'Operations',
    end: allDayISO(3),
    id: 'staged-rollout',
    start: allDayISO(1),
    title: 'Staged rollout',
  }),
  createEventFromISO({
    category: 'Sync',
    end: timedISO(1, 2),
    id: 'overnight-handoff',
    start: timedISO(0, 23),
    title: 'Overnight handoff',
  }),
  createEventFromISO({
    category: 'Customer',
    end: timedISO(2, 1, 30),
    id: 'regional-briefing',
    start: timedISO(1, 22),
    title: 'Regional briefing',
  }),
  createEventFromISO({
    category: 'Design',
    end: timedISO(2, 18),
    id: 'design-sprint',
    start: timedISO(2, 9),
    title: 'Design sprint',
  }),
];

const categories = [
  {color: 'blue' as const, label: 'Sync'},
  {color: 'purple' as const, label: 'Design'},
  {color: 'pink' as const, label: 'Planning'},
  {color: 'green' as const, label: 'Operations'},
  {color: 'orange' as const, label: 'Customer'},
  {color: 'teal' as const, label: 'Research'},
];

const colorFallbackCategories: ScheduleCategory[] = [
  {color: 'blue', label: 'Blue'},
  {color: 'cyan', label: 'Cyan'},
  {color: 'gray', label: 'Gray'},
  {color: 'green', label: 'Green'},
  {color: 'orange', label: 'Orange'},
  {color: 'pink', label: 'Pink'},
  {color: 'purple', label: 'Purple'},
  {color: 'red', label: 'Red'},
  {color: 'teal', label: 'Teal'},
  {color: 'yellow', label: 'Yellow'},
];

const defaultHighlightDate: Instant = dayInstant(0);
const defaultViewDate: Instant = dayInstant(0);

const meta: Meta<typeof Schedule> = {
  title: 'Components/Schedule',
  component: Schedule,
};

export default meta;
type Story = StoryObj<typeof meta>;

function ResizableEventsStory(): React.JSX.Element {
  const [viewDate, setViewDate] = useState<Instant>(() => defaultViewDate);
  const [storyEvents, setStoryEvents] = useState(() => events);
  const paginationPlugin = useSchedulePaginationPlugin({
    onViewDateChange: setViewDate,
  });
  const resizePlugin = useScheduleEventResizePlugin({
    onResize: ({end, event, start}) => {
      setStoryEvents(currentEvents =>
        currentEvents.map(currentEvent => {
          if (
            currentEvent.id !== event.id ||
            typeof currentEvent.start !== 'number'
          ) {
            return currentEvent;
          }

          return {...currentEvent, end, start};
        }),
      );
    },
    snapMinutes: 5,
  });

  return (
    <Schedule
      categories={categories}
      events={storyEvents}
      highlightDate={defaultHighlightDate}
      plugins={[paginationPlugin, resizePlugin]}
      timezoneID={localTimezoneID}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
      viewDate={viewDate}
    />
  );
}

function CreateEventForm({
  draft,
  onCancel,
  onCreate,
}: {
  draft: ScheduleEventDraft;
  onCancel: () => void;
  onCreate: (title: string) => void;
}): React.JSX.Element {
  const [title, setTitle] = useState('');
  const timeLabel = `${Temporal.Instant.fromEpochMilliseconds(draft.start)
    .toZonedDateTimeISO(localTimezoneID)
    .toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      weekday: 'short',
    })} – ${Temporal.Instant.fromEpochMilliseconds(draft.end)
    .toZonedDateTimeISO(localTimezoneID)
    .toLocaleString(undefined, {hour: 'numeric', minute: '2-digit'})}`;

  return (
    <form
      onSubmit={submitEvent => {
        submitEvent.preventDefault();
        onCreate(title.trim() === '' ? 'Untitled event' : title.trim());
      }}
      style={{display: 'grid', gap: '0.75rem', padding: '0.75rem', width: 280}}>
      <TextInput
        hasAutoFocus
        label="Title"
        onChange={setTitle}
        placeholder="Add a title"
        value={title}
      />
      <Text color="secondary" type="supporting">
        {timeLabel}
      </Text>
      <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
        <Button label="Cancel" onClick={onCancel} size="sm" variant="ghost" />
        <Button label="Create" size="sm" type="submit" variant="primary" />
      </div>
    </form>
  );
}

function CreatableEventsStory(): React.JSX.Element {
  const [viewDate, setViewDate] = useState<Instant>(() => defaultViewDate);
  const [storyEvents, setStoryEvents] = useState<CalendarEvent[]>(() => events);
  const paginationPlugin = useSchedulePaginationPlugin({
    onViewDateChange: setViewDate,
  });
  const popoverPlugin = useScheduleEventPopoverPlugin();
  const createPlugin = useScheduleEventCreatePlugin({
    defaultDurationMinutes: 60,
    renderContent: ({close, draft}) => (
      <CreateEventForm
        draft={draft}
        onCancel={close}
        onCreate={title => {
          setStoryEvents(currentEvents => [
            ...currentEvents,
            {
              category: 'Sync',
              end: draft.end,
              id: `created-${draft.start}`,
              start: draft.start,
              title,
            },
          ]);
          close();
        }}
      />
    ),
    snapMinutes: 15,
  });

  return (
    <Schedule
      categories={categories}
      events={storyEvents}
      highlightDate={defaultHighlightDate}
      plugins={[paginationPlugin, createPlugin, popoverPlugin]}
      timezoneID={localTimezoneID}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
      viewDate={viewDate}
    />
  );
}

function MovableEventsStory(): React.JSX.Element {
  const views = useMemo(
    (): {label: string; view: ScheduleView}[] => [
      {label: 'Month', view: createScheduleMonthlyView()},
      {
        label: 'Week',
        view: createScheduleWeeklyView({maxHour: 18, minHour: 8}),
      },
    ],
    [],
  );
  const [view, setView] = useState<ScheduleView>(views[1].view);
  const [viewDate, setViewDate] = useState<Instant>(() => defaultViewDate);
  const [storyEvents, setStoryEvents] = useState(() => events);
  const paginationPlugin = useSchedulePaginationPlugin({
    onViewDateChange: setViewDate,
  });
  const viewSelectorPlugin = useScheduleViewSelectorPlugin(views, {
    onChangeView: setView,
  });
  const movePlugin = useScheduleEventMovePlugin({
    onMove: ({end, event, start}) => {
      setStoryEvents(currentEvents =>
        currentEvents.map(currentEvent => {
          if (currentEvent.id !== event.id) {
            return currentEvent;
          }

          if (
            typeof currentEvent.start === 'number' &&
            typeof start === 'number' &&
            typeof end === 'number'
          ) {
            return {...currentEvent, end, start};
          }

          if (
            typeof currentEvent.start !== 'number' &&
            typeof start !== 'number' &&
            typeof end !== 'number'
          ) {
            return {...currentEvent, end, start};
          }

          return currentEvent;
        }),
      );
    },
    snapMinutes: 5,
  });

  return (
    <Schedule
      categories={categories}
      events={storyEvents}
      highlightDate={defaultHighlightDate}
      plugins={[paginationPlugin, viewSelectorPlugin, movePlugin]}
      timezoneID={localTimezoneID}
      view={view}
      viewDate={viewDate}
    />
  );
}

function ScheduleStory({
  categories: storyCategories = categories,
  events: storyEvents = events,
  highlightDate = defaultHighlightDate,
  plugins,
  timezoneID = localTimezoneID,
  view,
  viewDate: initialViewDate = defaultViewDate,
}: {
  categories?: ReadonlyArray<ScheduleCategory>;
  events?: ScheduleEventSource;
  highlightDate?: Instant;
  plugins?: SchedulePlugin[];
  timezoneID?: string;
  view: ScheduleView;
  viewDate?: Instant;
}) {
  const [viewDate, setViewDate] = useState<Instant>(() => initialViewDate);
  const paginationPlugin = useSchedulePaginationPlugin({
    onViewDateChange: setViewDate,
  });
  return (
    <Schedule
      categories={storyCategories}
      events={storyEvents}
      highlightDate={highlightDate}
      plugins={plugins ?? [paginationPlugin]}
      timezoneID={timezoneID}
      view={view}
      viewDate={viewDate}
    />
  );
}

function AsyncEventsWithToastStory(): React.JSX.Element {
  const toast = useToast();
  const loader = useMemo<ScheduleEventSource>(
    () => async () => {
      try {
        await new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Unable to load events')), 900);
        });
        return [];
      } catch {
        toast({
          body: 'Unable to load schedule events',
          type: 'error',
          uniqueID: 'schedule-events-load-error',
        });
        return [];
      }
    },
    [toast],
  );

  return (
    <ScheduleStory
      events={loader}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
    />
  );
}

export const Month: Story = {
  render: () => <ScheduleStory view={createScheduleMonthlyView()} />,
};

// Five all-day events on the base day to show a busy all-day section, plus a
// couple of timed events for context.
const weekEvents = [
  createEventFromISO({
    category: 'Planning',
    end: allDayISO(0),
    id: 'week-all-day-1',
    start: allDayISO(0),
    title: 'Planning offsite',
  }),
  createEventFromISO({
    category: 'Operations',
    end: allDayISO(0),
    id: 'week-all-day-2',
    start: allDayISO(0),
    title: 'Release freeze',
  }),
  createEventFromISO({
    category: 'Design',
    end: allDayISO(0),
    id: 'week-all-day-3',
    start: allDayISO(0),
    title: 'Design review',
  }),
  createEventFromISO({
    category: 'Customer',
    end: allDayISO(0),
    id: 'week-all-day-4',
    start: allDayISO(0),
    title: 'Customer summit',
  }),
  createEventFromISO({
    category: 'Research',
    end: allDayISO(0),
    id: 'week-all-day-5',
    start: allDayISO(0),
    title: 'Research sprint',
  }),
  createEventFromISO({
    category: 'Sync',
    end: timedISO(0, 11),
    id: 'week-timed-1',
    start: timedISO(0, 10),
    title: 'Team sync',
  }),
  createEventFromISO({
    category: 'Design',
    end: timedISO(2, 15),
    id: 'week-timed-2',
    start: timedISO(2, 14),
    title: 'Prototype critique',
  }),
];

export const Week: Story = {
  render: () => (
    <ScheduleStory
      events={weekEvents}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
    />
  ),
};

export const ResizableEvents: Story = {
  render: () => <ResizableEventsStory />,
};

export const MovableEvents: Story = {
  render: () => <MovableEventsStory />,
};

export const CreatableEvents: Story = {
  render: () => <CreatableEventsStory />,
};

export const MondayStartWeek: Story = {
  render: () => (
    <ScheduleStory
      view={createScheduleWeeklyView({
        maxHour: 18,
        minHour: 8,
        weekStartsOn: 1,
      })}
    />
  ),
};

export const HiddenWeekendDays: Story = {
  render: () => (
    <ScheduleStory
      events={weekEvents}
      view={createScheduleWeeklyView({
        hiddenDays: [0, 6],
        maxHour: 18,
        minHour: 8,
      })}
    />
  ),
};

export const Day: Story = {
  render: () => (
    <ScheduleStory view={createScheduleDayView({maxHour: 18, minHour: 8})} />
  ),
};

export const ListView: Story = {
  render: () => {
    const now = Temporal.Now.instant();
    const timezoneID = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const listEvents = [
      createEventFromISO({
        category: 'Sync',
        end: now.subtract({minutes: 90}).toString(),
        id: 'list-past-sync',
        start: now.subtract({minutes: 150}).toString(),
        title: 'Past sync',
      }),
      createEventFromISO({
        category: 'Customer',
        end: now.subtract({minutes: 20}).toString(),
        id: 'list-past-escalation',
        start: now.subtract({minutes: 80}).toString(),
        title: 'Customer escalation review',
      }),
      createEventFromISO({
        category: 'Design',
        end: now.add({minutes: 45}).toString(),
        id: 'list-current-review',
        start: now.subtract({minutes: 15}).toString(),
        title: 'Current design review',
      }),
      createEventFromISO({
        category: 'Planning',
        end: now.add({minutes: 135}).toString(),
        id: 'list-future-planning',
        start: now.add({minutes: 75}).toString(),
        title: 'Future planning session',
      }),
      createEventFromISO({
        category: 'Operations',
        end: now.add({minutes: 240}).toString(),
        id: 'list-future-release',
        start: now.add({minutes: 180}).toString(),
        title: 'Release readiness',
      }),
    ];

    return (
      <ScheduleStory
        events={listEvents}
        highlightDate={now.epochMilliseconds}
        timezoneID={timezoneID}
        view={createScheduleListView({days: 7})}
        viewDate={now.epochMilliseconds}
      />
    );
  },
};

export const AsyncEvents: Story = {
  render: () => {
    const loader = useMemo<ScheduleEventSource>(
      () => async () =>
        new Promise(resolve => {
          setTimeout(() => resolve(events), 900);
        }),
      [],
    );

    return (
      <ScheduleStory
        events={loader}
        view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
      />
    );
  },
};

export const AsyncEventsWithToastError: Story = {
  render: () => (
    <ToastViewport>
      <AsyncEventsWithToastStory />
    </ToastViewport>
  ),
};

export const ViewSelector: Story = {
  render: () => {
    const views = useMemo(
      (): {label: string; view: ScheduleView}[] => [
        {label: 'Month', view: createScheduleMonthlyView()},
        {
          label: 'Week',
          view: createScheduleWeeklyView({maxHour: 18, minHour: 8}),
        },
        {label: 'Day', view: createScheduleDayView({maxHour: 18, minHour: 8})},
        {label: 'List', view: createScheduleListView({days: 7})},
      ],
      [],
    );
    const [view, setView] = useState<ScheduleView>(views[1].view);
    const viewSelectorPlugin = useScheduleViewSelectorPlugin(views, {
      onChangeView: setView,
    });

    return <ScheduleStory plugins={[viewSelectorPlugin]} view={view} />;
  },
};

export const CustomPlugin: Story = {
  render: () => {
    const customPlugin = useMemo<SchedulePlugin>(
      () => ({
        renderHeader(startContent, centerContent, endContent) {
          return {
            centerContent,
            endContent: (
              <>
                {endContent}
                <Button label="Export" />
              </>
            ),
            startContent: (
              <>
                {startContent}
                <Badge color="info" label="Draft" size="sm" />
              </>
            ),
          };
        },
      }),
      [],
    );

    return (
      <ScheduleStory
        plugins={[customPlugin]}
        view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
      />
    );
  },
};

const eventPopoverEvents = [
  // Several events land on "today" so the month view overflows into the
  // "+N more" popover. Each remains an interactive event popover trigger.
  {
    ...createEventFromISO({
      category: 'Sync',
      end: timedISO(0, 9, 30),
      id: 'standup',
      start: timedISO(0, 9),
      title: 'Daily standup',
    }),
    location: 'Room 1',
  },
  {
    ...createEventFromISO({
      category: 'Design',
      end: timedISO(0, 11),
      id: 'design-sync',
      start: timedISO(0, 10),
      title: 'Design sync',
    }),
    description: 'Align on the week’s design priorities.',
    location: 'Design Studio',
  },
  {
    ...createEventFromISO({
      category: 'Customer',
      end: timedISO(0, 12),
      id: 'one-on-one',
      start: timedISO(0, 11, 30),
      title: '1:1 with Jordan',
    }),
  },
  {
    ...createEventFromISO({
      category: 'Research',
      end: timedISO(0, 13),
      id: 'lunch-learn',
      start: timedISO(0, 12),
      title: 'Lunch & learn',
    }),
    description: 'Guest talk on accessible color systems.',
    location: 'Cafeteria',
  },
  {
    ...createEventFromISO({
      category: 'Operations',
      end: timedISO(0, 14, 30),
      id: 'release-review',
      start: timedISO(0, 14),
      title: 'Release review',
    }),
    location: 'War room',
  },
  {
    ...createEventFromISO({
      category: 'Sync',
      end: timedISO(0, 16, 30),
      id: 'team-sync',
      start: timedISO(0, 16),
      title: 'Team sync',
    }),
    description: 'Weekly status check-in and blockers review.',
    location: 'Room 4 · Zoom',
  },
  {
    ...createEventFromISO({
      category: 'Planning',
      end: timedISO(0, 17, 30),
      id: 'retro',
      start: timedISO(0, 17),
      title: 'Sprint retro',
    }),
    description: 'What went well, what to improve.',
  },
  {
    ...createEventFromISO({
      category: 'Design',
      end: allDayISO(1),
      id: 'design-review',
      start: allDayISO(1),
      title: 'Design review',
    }),
    description: 'Critique the latest prototype flows.',
    location: 'Design Studio',
  },
  {
    ...createEventFromISO({
      category: 'Planning',
      end: timedISO(2, 15),
      id: 'roadmap',
      start: timedISO(2, 14),
      title: 'Roadmap planning',
    }),
  },
];

function EventPopoverStory(): React.JSX.Element {
  const views = useMemo(
    (): {label: string; view: ScheduleView}[] => [
      {label: 'Month', view: createScheduleMonthlyView()},
      {
        label: 'Week',
        view: createScheduleWeeklyView({maxHour: 18, minHour: 8}),
      },
      {label: 'Day', view: createScheduleDayView({maxHour: 18, minHour: 8})},
      {label: 'List', view: createScheduleListView({days: 7})},
    ],
    [],
  );
  const [view, setView] = useState<ScheduleView>(views[0].view);
  const [viewDate, setViewDate] = useState<Instant>(() => defaultViewDate);
  const paginationPlugin = useSchedulePaginationPlugin({
    onViewDateChange: setViewDate,
  });
  const viewSelectorPlugin = useScheduleViewSelectorPlugin(views, {
    onChangeView: setView,
  });
  const eventPopoverPlugin = useScheduleEventPopoverPlugin({
    renderContent: ({event, close}) => (
      <ScheduleEventPopoverContent
        event={event}
        onClose={close}
        onDelete={e => window.alert(`Delete ${e.title}`)}
        onEdit={e => window.alert(`Edit ${e.title}`)}
        onRespond={(e, response) => window.alert(`${response} for ${e.title}`)}
      />
    ),
  });
  return (
    <Schedule
      categories={categories}
      events={eventPopoverEvents}
      highlightDate={defaultHighlightDate}
      plugins={[paginationPlugin, viewSelectorPlugin, eventPopoverPlugin]}
      timezoneID={localTimezoneID}
      view={view}
      viewDate={viewDate}
    />
  );
}

export const EventPopover: Story = {
  render: () => <EventPopoverStory />,
};

export const EventPopoverCustomContent: Story = {
  render: () => {
    const [viewDate, setViewDate] = useState<Instant>(() => defaultViewDate);
    const paginationPlugin = useSchedulePaginationPlugin({
      onViewDateChange: setViewDate,
    });
    const eventPopoverPlugin = useScheduleEventPopoverPlugin({
      renderContent: ({event}) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxWidth: 260,
            padding: 16,
          }}>
          <strong>{event.title}</strong>
          <Badge color="info" label={event.category ?? 'Event'} size="sm" />
        </div>
      ),
    });
    return (
      <Schedule
        categories={categories}
        events={eventPopoverEvents}
        highlightDate={defaultHighlightDate}
        plugins={[paginationPlugin, eventPopoverPlugin]}
        timezoneID={localTimezoneID}
        view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
        viewDate={viewDate}
      />
    );
  },
};

export const WithoutCategories: Story = {
  render: () => (
    <ScheduleStory
      categories={[]}
      events={eventsWithoutCategories}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
    />
  ),
};

export const ColorAndCategoryFallbacks: Story = {
  render: () => {
    const fallbackEvents = [
      ...colorFallbackCategories.map((category, index) =>
        createEventFromISO({
          category: category.label,
          end: timedISO(0, index + 9, 30),
          id: `color-${category.color}`,
          start: timedISO(0, index + 9),
          title: `${category.label} category`,
        }),
      ),
      createEventFromISO({
        category: 'Unmapped',
        end: timedISO(1, 15, 30),
        id: 'unknown-category',
        start: timedISO(1, 15),
        title: 'Unknown category keeps label',
      }),
      createEventFromISO({
        end: timedISO(1, 16, 30),
        id: 'missing-category',
        start: timedISO(1, 16),
        title: 'Missing category uses default',
      }),
    ];

    return (
      <ScheduleStory
        categories={colorFallbackCategories}
        events={fallbackEvents}
        view={createScheduleWeeklyView({maxHour: 20, minHour: 8})}
      />
    );
  },
};

export const Empty: Story = {
  render: () => (
    <ScheduleStory events={[]} view={createScheduleListView({days: 7})} />
  ),
};

export const MultiDayEvents: Story = {
  render: () => (
    <ScheduleStory
      events={multiDayEvents}
      view={createScheduleWeeklyView({maxHour: 24, minHour: 0})}
    />
  ),
};

export const Timezones: Story = {
  render: () => {
    // Anchored to a fixed UTC time-of-day (not the viewer's local zone) so the
    // same instant is shown side by side in two zones deterministically.
    const utcToday = Temporal.Now.plainDateISO('UTC');
    const utcInstant = (hour: number): string =>
      utcToday
        .toZonedDateTime({
          plainTime: Temporal.PlainTime.from({hour}),
          timeZone: 'UTC',
        })
        .toInstant()
        .toString();
    const sameInstantEvents = [
      createEventFromISO({
        category: 'Sync',
        end: utcInstant(19),
        id: 'global-sync',
        start: utcInstant(17),
        title: 'Global sync',
      }),
    ];

    return (
      <div style={{display: 'grid', gap: 24}}>
        <ScheduleStory
          events={sameInstantEvents}
          timezoneID="UTC"
          view={createScheduleDayView({maxHour: 20, minHour: 8})}
          viewDate={utcToday.toZonedDateTime('UTC').epochMilliseconds}
        />
        <ScheduleStory
          events={sameInstantEvents}
          timezoneID="America/Los_Angeles"
          view={createScheduleDayView({maxHour: 20, minHour: 8})}
          viewDate={
            utcToday.toZonedDateTime('America/Los_Angeles').epochMilliseconds
          }
        />
      </div>
    );
  },
};

export const HourRangeEdgeCases: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 24}}>
      <ScheduleStory view={createScheduleDayView({maxHour: 24, minHour: 0})} />
      <ScheduleStory view={createScheduleDayView({maxHour: 24, minHour: 20})} />
    </div>
  ),
};

export const HourHeights: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 24}}>
      <ScheduleStory
        view={createScheduleDayView({
          hourHeight: 48,
          maxHour: 18,
          minHour: 8,
        })}
      />
      <ScheduleStory
        view={createScheduleWeeklyView({
          hourHeight: 132,
          maxHour: 18,
          minHour: 8,
        })}
      />
    </div>
  ),
};

export const CurrentTime: Story = {
  render: () => {
    const now = Temporal.Now.instant();
    const currentEvents = [
      createEventFromISO({
        category: 'Sync',
        end: now.subtract({minutes: 30}).toString(),
        id: 'past-sync',
        start: now.subtract({minutes: 90}).toString(),
        title: 'Past sync',
      }),
      createEventFromISO({
        category: 'Design',
        end: now.add({minutes: 90}).toString(),
        id: 'active-review',
        start: now.add({minutes: 30}).toString(),
        title: 'Design review',
      }),
    ];

    return (
      <ScheduleStory
        events={currentEvents}
        highlightDate={now.epochMilliseconds}
        view={createScheduleDayView({maxHour: 24, minHour: 0})}
        viewDate={now.epochMilliseconds}
      />
    );
  },
};

export const CurrentTime24HourMode: Story = {
  render: () => {
    const now = Temporal.Now.instant();
    const timezoneID = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentEvents = [
      createEventFromISO({
        category: 'Sync',
        end: now.subtract({minutes: 15}).toString(),
        id: 'current-24-past',
        start: now.subtract({minutes: 75}).toString(),
        title: 'Earlier sync',
      }),
      createEventFromISO({
        category: 'Design',
        end: now.add({minutes: 90}).toString(),
        id: 'current-24-next',
        start: now.add({minutes: 30}).toString(),
        title: 'Upcoming review',
      }),
    ];

    return (
      <ScheduleStory
        events={currentEvents}
        highlightDate={now.epochMilliseconds}
        timezoneID={timezoneID}
        view={createScheduleDayView({
          hourHeight: 56,
          maxHour: 24,
          minHour: 0,
        })}
        viewDate={now.epochMilliseconds}
      />
    );
  },
};

export const PastAndCurrentStates: Story = {
  render: () => {
    const now = Temporal.Now.instant();
    const stateEvents = [
      createEventFromISO({
        category: 'Sync',
        end: now.subtract({minutes: 45}).toString(),
        id: 'past-state',
        start: now.subtract({minutes: 105}).toString(),
        title: 'Past event',
      }),
      createEventFromISO({
        category: 'Design',
        end: now.add({minutes: 30}).toString(),
        id: 'current-state',
        start: now.subtract({minutes: 30}).toString(),
        title: 'Current event',
      }),
      createEventFromISO({
        category: 'Planning',
        end: now.add({minutes: 120}).toString(),
        id: 'future-state',
        start: now.add({minutes: 60}).toString(),
        title: 'Future event',
      }),
    ];

    return (
      <ScheduleStory
        events={stateEvents}
        highlightDate={now.epochMilliseconds}
        view={createScheduleDayView({maxHour: 24, minHour: 0})}
        viewDate={now.epochMilliseconds}
      />
    );
  },
};

export const HighlightDate: Story = {
  render: () => (
    <ScheduleStory
      highlightDate={dayInstant(2)}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
      viewDate={dayInstant(0)}
    />
  ),
};

export const FiveWeekMonth: Story = {
  render: () => (
    <ScheduleStory view={createScheduleMonthlyView({weekCount: 5})} />
  ),
};

// A single very busy day plus a multi-day span, to show how `monthRowHeight:
// 'auto'` grows the week row to fit every event instead of collapsing overflow
// into a "+N more" popover.
const busyDayEvents = [
  ...Array.from({length: 7}, (_, index) =>
    createEventFromISO({
      category: (
        [
          'Planning',
          'Operations',
          'Design',
          'Customer',
          'Research',
          'Sync',
        ] as const
      )[index % 6],
      end: allDayISO(0),
      id: `busy-day-${index + 1}`,
      start: allDayISO(0),
      title: `Busy day event ${index + 1}`,
    }),
  ),
  createEventFromISO({
    category: 'Operations',
    end: allDayISO(4),
    id: 'busy-launch-window',
    start: allDayISO(2),
    title: 'Launch window',
  }),
];

export const ShowAllMonthEvents: Story = {
  render: () => (
    <ScheduleStory
      events={busyDayEvents}
      view={createScheduleMonthlyView({monthRowHeight: 'auto'})}
    />
  ),
};
