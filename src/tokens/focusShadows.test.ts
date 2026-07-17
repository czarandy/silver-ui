import {describe, expect, it} from 'vitest';
import {token} from 'styled-system/tokens';

// panda.config.ts lives at the repo root (outside src) and has no path alias;
// this test intentionally reads the real token source of truth.
// eslint-disable-next-line no-restricted-imports
import config from '../../panda.config';

type ModeValue = {base?: string; _dark?: string};

const surfaceColors = (
  config.theme?.extend?.semanticTokens?.colors as unknown as {
    surface?: Record<string, {DEFAULT?: {value?: ModeValue}}>;
  }
).surface;

const STATUS_FOCUS_RINGS = [
  {
    color: 'colors.surface.red',
    shadow: 'shadows.focus.error',
    surface: 'red',
  },
  {
    color: 'colors.surface.yellow',
    shadow: 'shadows.focus.warning',
    surface: 'yellow',
  },
  {
    color: 'colors.surface.green',
    shadow: 'shadows.focus.success',
    surface: 'green',
  },
] as const;

describe('status focus shadows', () => {
  it.each(STATUS_FOCUS_RINGS)(
    '$shadow resolves through the mode-aware $color token',
    ({color, shadow, surface}) => {
      expect(token(shadow)).toContain(token.var(color));

      const value = surfaceColors?.[surface]?.DEFAULT?.value;
      expect(typeof value?.base).toBe('string');
      expect(typeof value?._dark).toBe('string');
      expect(value?.base).not.toBe(value?._dark);
    },
  );
});
