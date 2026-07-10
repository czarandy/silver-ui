import {describe, expect, it} from 'vitest';
import {componentsIndexMd} from './generate-index';
import {gettingStartedPage, themingPage} from './import-guides';

describe('gettingStartedPage', () => {
  it('single-sources the README Installation and Usage sections', () => {
    const page = gettingStartedPage();
    expect(page).toContain('title: "Getting started"');
    expect(page).toContain('## Installation');
    expect(page).toContain(
      "import {TabItem, Tabs} from '@astrojs/starlight/components';",
    );
    expect(page).toContain('<Tabs syncKey="package-manager">');
    expect(page).toContain('<TabItem label="npm">');
    expect(page).toContain('<TabItem label="pnpm">');
    expect(page).toContain('<TabItem label="yarn">');
    expect(page).toContain('npm install silver-ui');
    expect(page).not.toContain('# or');
    expect(page).toContain('## Usage');
    expect(page).toContain("import 'silver-ui/styles.css';");
    // Only those sections — not the README's component list.
    expect(page).not.toContain('## Components');
  });
});

describe('themingPage', () => {
  it('single-sources THEME.md with its H1 replaced by frontmatter', () => {
    const page = themingPage();
    expect(page).toContain('title: "Theming"');
    expect(page).not.toMatch(/^# Theming$/m);
    expect(page).toContain('## Quick start');
    expect(page).toContain('--silver-colors-primary');
  });
});

describe('componentsIndexMd', () => {
  it('groups components by category with linked descriptions', () => {
    const page = componentsIndexMd([
      {
        name: 'Button',
        label: 'Button',
        slug: 'button',
        category: 'Buttons & Actions',
        description: 'Versatile action element.',
        exports: [],
      },
      {
        name: 'Card',
        label: 'Card',
        slug: 'card',
        category: 'Layout & Structure',
        description: 'Rounded container surface.',
        exports: [],
      },
    ]);
    expect(page).toContain('## Buttons & Actions');
    expect(page).toContain(
      '- [Button](/components/button/) — Versatile action element',
    );
    expect(page).toContain('## Layout & Structure');
    expect(page).toContain('- [Card](/components/card/)');
    // Categories with no generated components render no dangling entries.
    expect(page).not.toContain('undefined');
  });
});
