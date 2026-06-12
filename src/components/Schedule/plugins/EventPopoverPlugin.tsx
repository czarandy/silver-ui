import {
  AlignLeft,
  CalendarDays,
  MapPin,
  Pencil,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {useMemo, useState, type ReactNode} from 'react';
import {Button} from 'components/Button';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from 'components/Layout';
import {MetadataList, MetadataListItem} from 'components/MetadataList';
import {scheduleEventRecipe} from 'components/Schedule/ScheduleEvent.recipe';
import {useScheduleContext} from 'components/Schedule/context';
import {isDayEvent} from 'components/Schedule/dateMath';
import {
  formatDate,
  getCategory,
  getEventTimeLabel,
} from 'components/Schedule/shared';
import type {
  CalendarEvent,
  ScheduleEventPopoverControls,
  SchedulePlugin,
} from 'components/Schedule/types';
import {Text} from 'components/Text';
import {ToggleButton, ToggleButtonGroup} from 'components/ToggleButton';
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
   * Called when the attendee response (Going / Not Going / Maybe) changes in the
   * default popover footer. The response is `null` when the selection is
   * cleared.
   */
  onRespond?: (
    event: CalendarEvent<TAuxiliaryData>,
    response: string | null,
  ) => void;
  /**
   * Renders fully custom popover content for an event, replacing the built-in
   * {@link ScheduleEventPopoverContent}. Receives `controls` (e.g. `close`) so
   * the content can dismiss the popover. Return `null`/`undefined` to fall back
   * to no popover for that event.
   */
  renderContent?: (
    event: CalendarEvent<TAuxiliaryData>,
    controls: ScheduleEventPopoverControls,
  ) => ReactNode;
}

const styles = {
  layout: css({
    minW: '80',
    maxW: '96',
  }),
  dot: css({
    w: '3',
    h: '3',
  }),
  dateValue: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  footerActions: css({
    display: 'flex',
    justifyContent: 'flex-end',
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
 * event color, title, date/time, and category in a {@link MetadataList} with
 * icon-only labels, plus optional `description` and `location` rows, an attendee
 * response footer, and optional edit/delete actions — each shown only when the
 * corresponding data or callback is present. A close button is always rendered.
 */
export function ScheduleEventPopoverContent<TAuxiliaryData = unknown>({
  event,
  onClose,
  onDelete,
  onEdit,
  onRespond,
}: {
  event: CalendarEvent<TAuxiliaryData>;
  onClose: () => void;
  onDelete?: (event: CalendarEvent<TAuxiliaryData>) => void;
  onEdit?: (event: CalendarEvent<TAuxiliaryData>) => void;
  onRespond?: (
    event: CalendarEvent<TAuxiliaryData>,
    response: string | null,
  ) => void;
}): React.JSX.Element {
  const {categoryMap, timezoneID} = useScheduleContext();
  const [response, setResponse] = useState<string | null>(null);
  const category = getCategory(categoryMap, event);
  const dotClass = scheduleEventRecipe({color: category.color}).dot;

  return (
    <Layout
      className={styles.layout}
      content={
        <LayoutContent isScrollable={false} padding={3}>
          <MetadataList>
            <MetadataListItem
              icon={CalendarDays}
              isIconOnly
              label="Date and time">
              <span className={styles.dateValue}>
                <Text>{getEventDateLabel(event, timezoneID)}</Text>
                <Text color="secondary" type="supporting">
                  {getEventTimeLabel(event, timezoneID)}
                </Text>
              </span>
            </MetadataListItem>
            {event.location != null && event.location !== '' ? (
              <MetadataListItem icon={MapPin} isIconOnly label="Location">
                {event.location}
              </MetadataListItem>
            ) : null}
            {event.description != null && event.description !== '' ? (
              <MetadataListItem icon={AlignLeft} isIconOnly label="Description">
                {event.description}
              </MetadataListItem>
            ) : null}
            <MetadataListItem icon={Tag} isIconOnly label="Category">
              {category.label}
            </MetadataListItem>
          </MetadataList>
        </LayoutContent>
      }
      data-testid="schedule-event-popover"
      footer={
        <LayoutFooter label="Your response" padding={3}>
          <div className={styles.footerActions}>
            <ToggleButtonGroup
              label="Your response"
              onChange={value => {
                setResponse(value);
                onRespond?.(event, value);
              }}
              type="single"
              value={response}>
              <ToggleButton
                data-testid="schedule-event-popover-response-going"
                label="Going"
                value="going"
              />
              <ToggleButton label="Not Going" value="not-going" />
              <ToggleButton label="Maybe" value="maybe" />
            </ToggleButtonGroup>
          </div>
        </LayoutFooter>
      }
      header={
        <LayoutHeader
          align="center"
          endContent={
            <>
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
              <Button
                data-testid="schedule-event-popover-close"
                icon={X}
                isIconOnly
                label="Close"
                onClick={onClose}
                size="sm"
                variant="ghost"
              />
            </>
          }
          padding={3}
          startContent={<span className={cx(dotClass, styles.dot)} />}
          title={event.title}
        />
      }
      height="auto"
    />
  );
}

function createScheduleEventPopoverPlugin<TAuxiliaryData>(
  options: ScheduleEventPopoverPluginOptions<TAuxiliaryData>,
): SchedulePlugin {
  const {onDelete, onEdit, onRespond, renderContent} = options;
  return {
    renderEventPopover(event, controls): ReactNode {
      const typedEvent = event as CalendarEvent<TAuxiliaryData>;
      if (renderContent != null) {
        return renderContent(typedEvent, controls);
      }
      return (
        <ScheduleEventPopoverContent
          event={typedEvent}
          onClose={controls.close}
          onDelete={onDelete}
          onEdit={onEdit}
          onRespond={onRespond}
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
  const {onDelete, onEdit, onRespond, renderContent} = options;
  return useMemo(
    () =>
      createScheduleEventPopoverPlugin<TAuxiliaryData>({
        onDelete,
        onEdit,
        onRespond,
        renderContent,
      }),
    [onDelete, onEdit, onRespond, renderContent],
  );
}
