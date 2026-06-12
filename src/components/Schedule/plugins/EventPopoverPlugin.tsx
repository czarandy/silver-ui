import {
  AlignLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react';
import {useMemo, type ReactNode} from 'react';
import {Button} from 'components/Button';
import {Icon} from 'components/Icon';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {useScheduleContext} from 'components/Schedule/context';
import {isDayEvent} from 'components/Schedule/dateMath';
import {
  formatDate,
  getCategory,
  getEventTimeLabel,
} from 'components/Schedule/shared';
import type {CalendarEvent, SchedulePlugin} from 'components/Schedule/types';
import {Heading, Text} from 'components/Text';
import {cx} from 'internal/cx';
import {plainDateFromInstant} from 'internal/plainDate';
import {css} from 'styled-system/css';

export interface ScheduleEventPopoverPluginOptions<TAuxiliaryData = unknown> {
  /**
   * Called when the delete action is triggered from the default popover. When
   * omitted, no delete button is rendered.
   */
  onDelete?: (event: CalendarEvent<TAuxiliaryData>) => void;
  /**
   * Called when the edit action is triggered from the default popover. When
   * omitted, no edit button is rendered.
   */
  onEdit?: (event: CalendarEvent<TAuxiliaryData>) => void;
  /**
   * Renders fully custom popover content for an event, replacing the built-in
   * {@link ScheduleEventPopoverContent}. Return `null`/`undefined` to fall back
   * to no popover for that event.
   */
  renderContent?: (event: CalendarEvent<TAuxiliaryData>) => ReactNode;
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    p: '4',
    minW: '64',
    maxW: '80',
  }),
  actions: css({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1',
    mb: '-2',
  }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
  }),
  dot: css({
    w: '3',
    h: '3',
  }),
  details: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
  }),
  row: css({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'start',
    gap: '2',
    color: 'fg.muted',
  }),
} as const;

function getEventDateLabel(event: CalendarEvent, timezoneID: string): string {
  const startDate = isDayEvent(event)
    ? event.start
    : plainDateFromInstant(event.start, timezoneID);
  return formatDate(startDate);
}

/**
 * Default Google-Calendar-style content for the event popover. Renders the
 * event color, title, date/time, and category, plus optional `description` and
 * `location` slots and optional edit/delete actions — each shown only when the
 * corresponding data or callback is present.
 */
export function ScheduleEventPopoverContent<TAuxiliaryData = unknown>({
  event,
  onDelete,
  onEdit,
}: {
  event: CalendarEvent<TAuxiliaryData>;
  onDelete?: (event: CalendarEvent<TAuxiliaryData>) => void;
  onEdit?: (event: CalendarEvent<TAuxiliaryData>) => void;
}): React.JSX.Element {
  const {categoryMap, timezoneID} = useScheduleContext();
  const category = getCategory(categoryMap, event);
  const dotClass = scheduleEventRecipe({color: category.color}).dot;

  return (
    <div className={styles.root} data-testid="schedule-event-popover">
      {onEdit != null || onDelete != null ? (
        <div className={styles.actions}>
          {onEdit != null ? (
            <Button
              data-testid="schedule-event-popover-edit"
              icon={Pencil}
              isIconOnly
              label="Edit event"
              onClick={() => onEdit(event)}
              size="sm"
              variant="ghost"
            />
          ) : null}
          {onDelete != null ? (
            <Button
              data-testid="schedule-event-popover-delete"
              icon={Trash2}
              isIconOnly
              label="Delete event"
              onClick={() => onDelete(event)}
              size="sm"
              variant="ghost"
            />
          ) : null}
        </div>
      ) : null}

      <div className={styles.header}>
        <span className={cx(dotClass, styles.dot)} />
        <Heading level={3}>{event.title}</Heading>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <Icon icon={CalendarDays} size="sm" />
          <div>
            <Text>{getEventDateLabel(event, timezoneID)}</Text>
            <Text color="secondary" type="supporting">
              {getEventTimeLabel(event, timezoneID)}
            </Text>
          </div>
        </div>
        {event.location != null && event.location !== '' ? (
          <div className={styles.row}>
            <Icon icon={MapPin} size="sm" />
            <Text>{event.location}</Text>
          </div>
        ) : null}
        {event.description != null && event.description !== '' ? (
          <div className={styles.row}>
            <Icon icon={AlignLeft} size="sm" />
            <Text>{event.description}</Text>
          </div>
        ) : null}
        <div className={styles.row}>
          <Icon icon={Tag} size="sm" />
          <Text>{category.label}</Text>
        </div>
      </div>
    </div>
  );
}

function createScheduleEventPopoverPlugin<TAuxiliaryData>(
  options: ScheduleEventPopoverPluginOptions<TAuxiliaryData>,
): SchedulePlugin {
  const {onDelete, onEdit, renderContent} = options;
  return {
    renderEventPopover(event): ReactNode {
      const typedEvent = event as CalendarEvent<TAuxiliaryData>;
      if (renderContent != null) {
        return renderContent(typedEvent);
      }
      return (
        <ScheduleEventPopoverContent
          event={typedEvent}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
    },
  };
}

/**
 * Plugin that opens a detail popover when an event pill is clicked, across every
 * Schedule view. Provide `renderContent` for fully custom content, or rely on
 * the built-in {@link ScheduleEventPopoverContent} and pass `onEdit`/`onDelete`
 * to surface action buttons.
 */
export function useScheduleEventPopoverPlugin<TAuxiliaryData = unknown>(
  options: ScheduleEventPopoverPluginOptions<TAuxiliaryData> = {},
): SchedulePlugin {
  const {onDelete, onEdit, renderContent} = options;
  return useMemo(
    () =>
      createScheduleEventPopoverPlugin<TAuxiliaryData>({
        onDelete,
        onEdit,
        renderContent,
      }),
    [onDelete, onEdit, renderContent],
  );
}
