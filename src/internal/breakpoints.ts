/**
 * Panda's breakpoint conditions in ascending order, with `base` first. Recipes
 * must keep their conditional values as literals for static extraction, so pin
 * them to this list with a type-only check, e.g.
 * `satisfies Record<Breakpoint, string>`.
 */
export const breakpointNames = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export type Breakpoint = (typeof breakpointNames)[number];

export const viewportBreakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  none: 0,
} as const;

export type ViewportBreakpoint = keyof typeof viewportBreakpointValues;

export function getMaxWidthBreakpointQuery(
  breakpoint: ViewportBreakpoint,
): string {
  return `(max-width: ${viewportBreakpointValues[breakpoint]}px)`;
}
