import {describe, expect, it} from 'vitest';
import {computeInputHeight} from 'internal/useAutoGrowTextArea';

describe('computeInputHeight', () => {
  it('clamps to the minimum row height', () => {
    expect(computeInputHeight(0, 24, 2, 8)).toBe(48);
  });

  it('uses the content height between the bounds', () => {
    expect(computeInputHeight(100, 24, 1, 8)).toBe(100);
  });

  it('clamps to the maximum row height', () => {
    expect(computeInputHeight(500, 24, 1, 8)).toBe(192);
  });

  it('never clamps when maxRows is unbounded', () => {
    expect(computeInputHeight(5000, 24, 1, Infinity)).toBe(5000);
  });
});
