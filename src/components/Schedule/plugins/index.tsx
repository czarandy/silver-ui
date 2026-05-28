import type {SchedulePlugin} from '../types';
import {defaultSchedulePaginationPlugin} from './PaginationPlugin';

export {useSchedulePaginationPlugin} from './PaginationPlugin';
export {useScheduleViewSelectorPlugin} from './ViewSelectorPlugin';

export const defaultSchedulePlugins: ReadonlyArray<SchedulePlugin> = [
  defaultSchedulePaginationPlugin,
];
