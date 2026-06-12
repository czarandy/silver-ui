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
import {useScheduleEventPopoverPlugin} from 'components/Schedule/plugins/EventPopoverPlugin';
import {useSchedulePaginationPlugin} from 'components/Schedule/plugins/PaginationPlugin';
import {ScheduleEventPopoverContent} from 'components/Schedule/plugins/ScheduleEventPopoverContent';
import {useScheduleViewSelectorPlugin} from 'components/Schedule/plugins/ViewSelectorPlugin';
import type {
  Instant,
  ScheduleCategory,
  ScheduleEventSource,
  SchedulePlugin,
  ScheduleView,
} from 'components/Schedule/types';
import {ToastViewport, useToast} from 'components/Toast';

const events = [
  createEventFromISO({
    category: 'Planning',
    end: '2026-05-13',
    id: 'offsite',
    start: '2026-05-13',
    title: 'Planning offsite',
  }),
  createEventFromISO({
    category: 'Operations',
    end: '2026-05-13',
    id: 'release-freeze',
    start: '2026-05-13',
    title: 'Release freeze',
  }),
  createEventFromISO({
    category: 'Customer',
    end: '2026-05-13T15:00:00.000Z',
    id: 'customer-escalation',
    start: '2026-05-13T14:00:00.000Z',
    title: 'Customer escalation review',
  }),
  createEventFromISO({
    category: 'Design',
    end: '2026-05-13T15:30:00.000Z',
    id: 'prototype-critique',
    start: '2026-05-13T14:30:00.000Z',
    title: 'Prototype critique',
  }),
  createEventFromISO({
    category: 'Planning',
    end: '2026-05-13T16:00:00.000Z',
    id: 'launch-checklist',
    start: '2026-05-13T15:30:00.000Z',
    title: 'Launch checklist',
  }),
  createEventFromISO({
    category: 'Sync',
    end: '2026-05-13T16:30:00.000Z',
    id: 'sync',
    start: '2026-05-13T16:00:00.000Z',
    title: 'Team sync',
  }),
  createEventFromISO({
    category: 'Research',
    end: '2026-05-13T17:30:00.000Z',
    id: 'study-readout',
    start: '2026-05-13T16:45:00.000Z',
    title: 'Study readout',
  }),
  createEventFromISO({
    category: 'Operations',
    end: '2026-05-14',
    id: 'qa-window',
    start: '2026-05-14',
    title: 'QA window',
  }),
  createEventFromISO({
    category: 'Operations',
    end: '2026-05-17',
    id: 'launch-window-default',
    start: '2026-05-15',
    title: 'Launch window',
  }),
  createEventFromISO({
    category: 'Planning',
    end: '2026-05-21',
    id: 'research-summit',
    start: '2026-05-19',
    title: 'Research summit',
  }),
  createEventFromISO({
    category: 'Planning',
    end: '2026-05-14T13:00:00.000Z',
    id: 'roadmap-triage',
    start: '2026-05-14T12:00:00.000Z',
    title: 'Roadmap triage',
  }),
  createEventFromISO({
    category: 'Design',
    end: '2026-05-14T18:00:00.000Z',
    id: 'design',
    start: '2026-05-14T17:00:00.000Z',
    title: 'Design review',
  }),
  createEventFromISO({
    category: 'Sync',
    end: '2026-05-15T10:45:00.000Z',
    id: 'partner-handoff',
    start: '2026-05-15T09:30:00.000Z',
    title: 'Partner handoff',
  }),
  createEventFromISO({
    category: 'Customer',
    end: '2026-05-15T16:30:00.000Z',
    id: 'account-planning',
    start: '2026-05-15T15:00:00.000Z',
    title: 'Account planning',
  }),
  createEventFromISO({
    category: 'Research',
    end: '2026-05-18T12:00:00.000Z',
    id: 'survey-results',
    start: '2026-05-18T11:00:00.000Z',
    title: 'Survey results review',
  }),
];

const eventsWithoutCategories = [
  createEventFromISO({
    end: '2026-05-13T16:30:00.000Z',
    id: 'open-sync',
    start: '2026-05-13T16:00:00.000Z',
    title: 'Open sync',
  }),
  createEventFromISO({
    end: '2026-05-13T17:30:00.000Z',
    id: 'notes-review',
    start: '2026-05-13T16:45:00.000Z',
    title: 'Notes review',
  }),
  createEventFromISO({
    end: '2026-05-14',
    id: 'maintenance',
    start: '2026-05-14',
    title: 'Maintenance window',
  }),
  createEventFromISO({
    end: '2026-05-15T11:30:00.000Z',
    id: 'open-retro',
    start: '2026-05-15T10:30:00.000Z',
    title: 'Open retro',
  }),
  createEventFromISO({
    end: '2026-05-15T15:15:00.000Z',
    id: 'release-checklist',
    start: '2026-05-15T14:00:00.000Z',
    title: 'Release checklist',
  }),
];

const multiDayEvents = [
  createEventFromISO({
    category: 'Planning',
    end: '2026-05-15',
    id: 'launch-window',
    start: '2026-05-13',
    title: 'Launch window',
  }),
  createEventFromISO({
    category: 'Operations',
    end: '2026-05-16',
    id: 'staged-rollout',
    start: '2026-05-14',
    title: 'Staged rollout',
  }),
  createEventFromISO({
    category: 'Sync',
    end: '2026-05-14T02:00:00.000Z',
    id: 'overnight-handoff',
    start: '2026-05-13T23:00:00.000Z',
    title: 'Overnight handoff',
  }),
  createEventFromISO({
    category: 'Customer',
    end: '2026-05-15T01:30:00.000Z',
    id: 'regional-briefing',
    start: '2026-05-14T22:00:00.000Z',
    title: 'Regional briefing',
  }),
  createEventFromISO({
    category: 'Design',
    end: '2026-05-15T18:00:00.000Z',
    id: 'design-sprint',
    start: '2026-05-15T09:00:00.000Z',
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

const defaultHighlightDate = instantUTC(2026, 4, 13);
const defaultViewDate = instantUTC(2026, 4, 13);

const meta: Meta<typeof Schedule> = {
  title: 'Components/Schedule',
  component: Schedule,
};

export default meta;
type Story = StoryObj<typeof meta>;

function instantUTC(year: number, monthIndex: number, day: number): Instant {
  return Temporal.PlainDateTime.from({
    day,
    month: monthIndex + 1,
    year,
  }).toZonedDateTime('UTC').epochMilliseconds;
}

function instantInTimezone(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  timezoneID: string,
): Instant {
  return Temporal.PlainDateTime.from({
    day,
    hour,
    month: monthIndex + 1,
    year,
  }).toZonedDateTime(timezoneID).epochMilliseconds;
}

function ScheduleStory({
  categories: storyCategories = categories,
  events: storyEvents = events,
  highlightDate = defaultHighlightDate,
  plugins,
  timezoneID = 'UTC',
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

export const Week: Story = {
  render: () => (
    <ScheduleStory view={createScheduleWeeklyView({maxHour: 18, minHour: 8})} />
  ),
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
                <Button label="Export" size="sm" />
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
  {
    ...createEventFromISO({
      category: 'Sync',
      end: '2026-05-13T16:30:00.000Z',
      id: 'team-sync',
      start: '2026-05-13T16:00:00.000Z',
      title: 'Team sync',
    }),
    description: 'Weekly status check-in and blockers review.',
    location: 'Room 4 · Zoom',
  },
  {
    ...createEventFromISO({
      category: 'Design',
      end: '2026-05-14',
      id: 'design-review',
      start: '2026-05-14',
      title: 'Design review',
    }),
    description: 'Critique the latest prototype flows.',
    location: 'Design Studio',
  },
  {
    ...createEventFromISO({
      category: 'Planning',
      end: '2026-05-15T15:00:00.000Z',
      id: 'roadmap',
      start: '2026-05-15T14:00:00.000Z',
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
      timezoneID="UTC"
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
        timezoneID="UTC"
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
          end: `2026-05-13T${String(index + 9).padStart(2, '0')}:30:00.000Z`,
          id: `color-${category.color}`,
          start: `2026-05-13T${String(index + 9).padStart(2, '0')}:00:00.000Z`,
          title: `${category.label} category`,
        }),
      ),
      createEventFromISO({
        category: 'Unmapped',
        end: '2026-05-14T15:30:00.000Z',
        id: 'unknown-category',
        start: '2026-05-14T15:00:00.000Z',
        title: 'Unknown category keeps label',
      }),
      createEventFromISO({
        end: '2026-05-14T16:30:00.000Z',
        id: 'missing-category',
        start: '2026-05-14T16:00:00.000Z',
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
    const sameInstantEvents = [
      createEventFromISO({
        category: 'Sync',
        end: '2026-05-13T19:00:00.000Z',
        id: 'global-sync',
        start: '2026-05-13T17:00:00.000Z',
        title: 'Global sync',
      }),
    ];

    return (
      <div style={{display: 'grid', gap: 24}}>
        <ScheduleStory
          events={sameInstantEvents}
          timezoneID="UTC"
          view={createScheduleDayView({maxHour: 20, minHour: 8})}
          viewDate={instantUTC(2026, 4, 13)}
        />
        <ScheduleStory
          events={sameInstantEvents}
          timezoneID="America/Los_Angeles"
          view={createScheduleDayView({maxHour: 20, minHour: 8})}
          viewDate={instantInTimezone(2026, 4, 13, 0, 'America/Los_Angeles')}
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
      highlightDate={instantUTC(2026, 4, 15)}
      view={createScheduleWeeklyView({maxHour: 18, minHour: 8})}
      viewDate={instantUTC(2026, 4, 13)}
    />
  ),
};

export const FiveWeekMonth: Story = {
  render: () => (
    <ScheduleStory view={createScheduleMonthlyView({weekCount: 5})} />
  ),
};
