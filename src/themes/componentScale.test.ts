import {describe, expect, it} from 'vitest';
import {token} from 'styled-system/tokens';

/**
 * The `component.*` semantic tokens are the shared control scale: Button,
 * ToggleButton, SegmentedControl, TextInput, Select, MultiSelect, InputGroup,
 * FileInput, TagsInput, Tabs, Calendar, DropdownMenuItem and NavIcon all size
 * themselves from it. These assertions pin the scale so a change to it is a
 * deliberate, reviewed edit rather than an incidental one.
 *
 * `token()` resolves a semantic token one hop to the base token it aliases, so
 * comparing it against `token.var()` of the expected base pins the alias
 * without hardcoding Panda's variable-naming scheme.
 */
describe('component size scale', () => {
  it('steps heights 28 / 36 / 44px', () => {
    expect(token('sizes.component.sm')).toBe(token.var('sizes.7'));
    expect(token('sizes.component.md')).toBe(token.var('sizes.9'));
    expect(token('sizes.component.lg')).toBe(token.var('sizes.11'));
  });

  it('steps horizontal padding 12 / 16 / 20px', () => {
    expect(token('spacing.component.sm')).toBe(token.var('spacing.3'));
    expect(token('spacing.component.md')).toBe(token.var('spacing.4'));
    expect(token('spacing.component.lg')).toBe(token.var('spacing.5'));
  });

  it('shares one font size across sm and md, stepping up only at lg', () => {
    expect(token('fontSizes.component.sm')).toBe(token.var('fontSizes.sm'));
    expect(token('fontSizes.component.md')).toBe(token.var('fontSizes.sm'));
    expect(token('fontSizes.component.lg')).toBe(token.var('fontSizes.md'));
  });

  // Regression guard: `lg` once aliased `fontSizes.md` alongside `md`, so going
  // up a size bought height and padding but no larger text. The DOM class names
  // (`fs_component.md` vs `fs_component.lg`) derive from the token path and
  // differ either way, so only the resolved values catch this.
  it('gives lg a larger font size than md', () => {
    expect(token('fontSizes.component.lg')).not.toBe(
      token('fontSizes.component.md'),
    );
  });
});
