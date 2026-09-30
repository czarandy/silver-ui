/**
 * `@position-try` rules a layer falls back to when no flip of its preferred
 * position fits: the layer keeps its side of the anchor but gives up its
 * alignment along the anchor's edge, so it may span the whole viewport along
 * that edge.
 *
 * Without these, a layer that is tall (for `start`/`end`) or wide (for
 * `above`/`below`) relative to the space beside its anchor fits none of the
 * `flip-*` fallbacks. The browser then keeps the base position and shifts the
 * layer back inside the viewport, directly over the anchor it describes.
 *
 * Each rule only sets `position-area`, so the layer's margins (the offset gap)
 * carry over, and a `flip-*` tactic applied to the rule moves both the area and
 * the gap to the opposite side of the anchor.
 *
 * Imported by `panda.config.ts` to emit the rules, so keep this module free of
 * path-alias imports.
 */
export const LAYER_SPAN_ALL_POSITION_TRY = {
  above: {
    flip: 'flip-block',
    name: '--silver-layer-above-span-all',
    positionArea: 'block-start span-all',
  },
  below: {
    flip: 'flip-block',
    name: '--silver-layer-below-span-all',
    positionArea: 'block-end span-all',
  },
  start: {
    flip: 'flip-inline',
    name: '--silver-layer-start-span-all',
    positionArea: 'inline-start span-all',
  },
  end: {
    flip: 'flip-inline',
    name: '--silver-layer-end-span-all',
    positionArea: 'inline-end span-all',
  },
} as const;

/**
 * The `@position-try` rules as Panda `globalCss` entries.
 */
export const layerPositionTryGlobalCss: Record<string, {positionArea: string}> =
  Object.fromEntries(
    Object.values(LAYER_SPAN_ALL_POSITION_TRY).map(({name, positionArea}) => [
      `@position-try ${name}`,
      {positionArea},
    ]),
  );
