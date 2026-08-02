import {describe, expect, it, vi} from 'vitest';
import {toPixelSize, toWidthSize} from 'internal/toPixelSize';

describe('toPixelSize', () => {
  it('converts numbers to pixel lengths', () => {
    expect(toPixelSize(220)).toBe('220px');
    expect(toPixelSize(0)).toBe('0px');
  });

  it('passes through strings with units', () => {
    expect(toPixelSize('20rem')).toBe('20rem');
    expect(toPixelSize('50%')).toBe('50%');
  });

  it('passes through undefined', () => {
    expect(toPixelSize(undefined)).toBeUndefined();
  });

  it('converts unit-less numeric strings to pixels and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(toPixelSize('220')).toBe('220px');
    expect(warn).toHaveBeenCalledWith(
      "silver-ui: size string '220' has no unit and is not valid CSS; " +
        'treating it as 220px. Pass a number or include a unit.',
    );
  });

  it("passes through '0' without warning", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warn.mockClear();

    expect(toPixelSize('0')).toBe('0');
    expect(warn).not.toHaveBeenCalled();
  });

  it('ignores non-finite numbers and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(toPixelSize(Number.NaN)).toBeUndefined();
    expect(toPixelSize(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'silver-ui: ignoring non-finite size NaN.',
    );
    expect(warn).toHaveBeenCalledWith(
      'silver-ui: ignoring non-finite size Infinity.',
    );
  });
});

describe('toWidthSize', () => {
  it("resolves 'full' to 100%", () => {
    expect(toWidthSize('full')).toBe('100%');
  });

  it('defers every other value to toPixelSize', () => {
    expect(toWidthSize(220)).toBe('220px');
    expect(toWidthSize('18rem')).toBe('18rem');
    expect(toWidthSize('auto')).toBe('auto');
    expect(toWidthSize(undefined)).toBeUndefined();
  });

  it('warns on unit-less numeric strings like toPixelSize', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warn.mockClear();

    expect(toWidthSize('220')).toBe('220px');
    expect(warn).toHaveBeenCalledOnce();
  });
});
