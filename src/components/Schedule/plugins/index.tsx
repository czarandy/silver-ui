import type {SchedulePlugin} from 'components/Schedule/types';

export {useSchedulePaginationPlugin} from 'components/Schedule/plugins/PaginationPlugin';
export {useScheduleViewSelectorPlugin} from 'components/Schedule/plugins/ViewSelectorPlugin';

export const defaultSchedulePlugins: ReadonlyArray<SchedulePlugin> = [];
