import type {LayoutRegionVariants} from './Layout.recipe';

export type {LayoutRegionVariants};
export type SpacingStep = NonNullable<
  NonNullable<LayoutRegionVariants>['padding']
>;
export type LayoutHeight = 'fill' | 'auto';
