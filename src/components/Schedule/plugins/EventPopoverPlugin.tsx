import {useMemo, type ReactNode} from 'react';
import {ScheduleEventPopoverContent} from 'components/Schedule/plugins/ScheduleEventPopoverContent';
import type {
  CalendarEvent,
  ScheduleEventPopoverControls,
  SchedulePlugin,
} from 'components/Schedule/types';

/**
 * Arguments passed to the event popover `renderContent` callback. Modeled as an
 * object so new fields (beyond `event` and `close`) can be added without
 * breaking callers.
 */
export interface ScheduleEventPopoverRenderProps<
  TAuxiliaryData = unknown,
> extends ScheduleEventPopoverControls {
  event: CalendarEvent<TAuxiliaryData>;
}

export interface ScheduleEventPopoverPluginOptions<TAuxiliaryData = unknown> {
  /**
   * Renders the popover content for an event. Receives `{event, close}` so the
   * content can render the event and dismiss the popover. Return
   * `null`/`undefined` to opt out of a popover for that event.
   *
   * When omitted, the built-in {@link ScheduleEventPopoverContent} is rendered
   * with no actions. To customize the default — e.g. wire `onEdit`/`onDelete` —
   * pass `renderContent` that renders `ScheduleEventPopoverContent` with the
   * desired props. Custom popovers need not import the default at all.
   */
  renderContent?: (
    props: ScheduleEventPopoverRenderProps<TAuxiliaryData>,
  ) => ReactNode;
}

function createScheduleEventPopoverPlugin<TAuxiliaryData>(
  options: ScheduleEventPopoverPluginOptions<TAuxiliaryData>,
): SchedulePlugin {
  const {renderContent} = options;
  return {
    renderEventPopover(event, controls): ReactNode {
      const typedEvent = event as CalendarEvent<TAuxiliaryData>;
      if (renderContent != null) {
        return renderContent({event: typedEvent, ...controls});
      }
      return (
        <ScheduleEventPopoverContent
          event={typedEvent}
          onClose={controls.close}
        />
      );
    },
  };
}

/**
 * Plugin that opens a detail popover when an event pill is clicked, across every
 * Schedule view. By default it renders the built-in
 * {@link ScheduleEventPopoverContent}; pass `renderContent` for fully custom
 * content (and to wire the default popover's `onEdit`/`onDelete`/`onRespond`).
 */
export function useScheduleEventPopoverPlugin<TAuxiliaryData = unknown>(
  options: ScheduleEventPopoverPluginOptions<TAuxiliaryData> = {},
): SchedulePlugin {
  const {renderContent} = options;
  return useMemo(
    () => createScheduleEventPopoverPlugin<TAuxiliaryData>({renderContent}),
    [renderContent],
  );
}
