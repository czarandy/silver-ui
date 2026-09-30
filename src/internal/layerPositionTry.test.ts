import {describe, expect, it} from 'vitest';
import {
  LAYER_SPAN_ALL_POSITION_TRY,
  layerPositionTryGlobalCss,
} from 'internal/layerPositionTry';
import {getPositionTryFallbacks} from 'internal/useLayer';

describe('layerPositionTry', () => {
  it('emits one span-all @position-try rule per placement', () => {
    expect(layerPositionTryGlobalCss).toEqual({
      '@position-try --silver-layer-above-span-all': {
        positionArea: 'block-start span-all',
      },
      '@position-try --silver-layer-below-span-all': {
        positionArea: 'block-end span-all',
      },
      '@position-try --silver-layer-start-span-all': {
        positionArea: 'inline-start span-all',
      },
      '@position-try --silver-layer-end-span-all': {
        positionArea: 'inline-end span-all',
      },
    });
  });

  it('flips each rule along its placement axis', () => {
    expect(LAYER_SPAN_ALL_POSITION_TRY.above.flip).toBe('flip-block');
    expect(LAYER_SPAN_ALL_POSITION_TRY.below.flip).toBe('flip-block');
    expect(LAYER_SPAN_ALL_POSITION_TRY.start.flip).toBe('flip-inline');
    expect(LAYER_SPAN_ALL_POSITION_TRY.end.flip).toBe('flip-inline');
  });
});

describe('getPositionTryFallbacks', () => {
  it.each([
    ['above', '--silver-layer-above-span-all', 'flip-block'],
    ['below', '--silver-layer-below-span-all', 'flip-block'],
    ['start', '--silver-layer-start-span-all', 'flip-inline'],
    ['end', '--silver-layer-end-span-all', 'flip-inline'],
  ] as const)(
    'tries the flips before relaxing %s alignment, same side first',
    (placement, rule, flip) => {
      expect(getPositionTryFallbacks(placement)).toBe(
        `flip-block, flip-inline, flip-block flip-inline, ${rule}, ${rule} ${flip}`,
      );
    },
  );
});
