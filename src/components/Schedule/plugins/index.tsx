import type {SchedulePlugin} from '../types';

export {useSchedulePaginationPlugin} from './PaginationPlugin';
export {useScheduleViewSelectorPlugin} from './ViewSelectorPlugin';

export const defaultSchedulePlugins: ReadonlyArray<SchedulePlugin> = [];
