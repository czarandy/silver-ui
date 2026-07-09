import type {SchedulePlugin} from 'components/Schedule/types';

export {useScheduleEventCreatePlugin} from 'components/Schedule/plugins/EventCreatePlugin';
export {useScheduleEventMovePlugin} from 'components/Schedule/plugins/EventMovePlugin';
export {useScheduleEventResizePlugin} from 'components/Schedule/plugins/EventResizePlugin';
export {useScheduleEventPopoverPlugin} from 'components/Schedule/plugins/EventPopoverPlugin';
export {
  ScheduleEventPopoverContent,
  type ScheduleEventPopoverContentProps,
} from 'components/Schedule/plugins/ScheduleEventPopoverContent';
export {useSchedulePaginationPlugin} from 'components/Schedule/plugins/PaginationPlugin';
export {useScheduleViewSelectorPlugin} from 'components/Schedule/plugins/ViewSelectorPlugin';

export const defaultSchedulePlugins: ReadonlyArray<SchedulePlugin> = [];
