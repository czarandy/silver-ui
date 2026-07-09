import {readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  componentPageLabel,
  componentSidebarGroups,
  componentSlug,
} from '../../src/component-categories';
import {validateCategories} from './validate-categories';

const componentsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../src/components',
);
const realDirs = readdirSync(componentsDir);

describe('validateCategories', () => {
  it('accepts the real component directories (map is in sync)', () => {
    expect(() => validateCategories(realDirs)).not.toThrow();
  });

  it('rejects an uncategorized component directory', () => {
    expect(() => validateCategories([...realDirs, 'BrandNewThing'])).toThrow(
      /BrandNewThing is not categorized/,
    );
  });

  it('rejects a mapped component with no directory', () => {
    const withoutButton = realDirs.filter(dir => dir !== 'Button');
    expect(() => validateCategories(withoutButton)).toThrow(
      /"Button" \(in "Buttons & Actions"\) has no src\/components\/Button\/ directory/,
    );
  });
});

describe('componentSlug', () => {
  it('kebab-cases PascalCase names', () => {
    expect(componentSlug('Button')).toBe('button');
    expect(componentSlug('DateRangeInput')).toBe('date-range-input');
    expect(componentSlug('TopNav')).toBe('top-nav');
  });
});

describe('componentSidebarGroups', () => {
  it('produces sorted slug links per category', () => {
    const groups = componentSidebarGroups();
    const forms = groups.find(group => group.label === 'Forms');
    expect(forms).toBeDefined();
    expect(forms?.items).toContain('components/text-input');
    expect(forms?.items).toEqual([...(forms?.items ?? [])].sort());
    const dates = groups.find(group => group.label === 'Dates & Time');
    expect(dates?.items).toContain('components/date-input');
    expect(dates?.items).toContain('components/calendar');
  });
});

describe('componentPageLabel', () => {
  it('labels multi-component pages and passes others through', () => {
    expect(componentPageLabel('Text')).toBe('Text & Heading');
    expect(componentPageLabel('Button')).toBe('Button');
  });
});
