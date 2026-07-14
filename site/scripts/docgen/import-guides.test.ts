import {describe, expect, it} from 'vitest';
import {componentsIndexMd} from './generate-index';
import {gettingStartedPage, themingPage} from './import-guides';

describe('gettingStartedPage', () => {
  it('single-sources the README Installation and Usage sections', () => {
    const page = gettingStartedPage();
    expect(page).toContain('title: "Getting started"');
    expect(page).toContain('## Key features');
    expect(page).toContain('**70+ accessible components.**');
    expect(page).toContain('**Flexible theming.**');
    expect(page).toContain('**Zero-runtime styling.**');
    expect(page).toContain('**Modern React support.**');
    expect(page).toContain('**Tree-shakeable imports.**');
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
    expect(page).not.toContain('takes its text via the `label` prop');
    expect(page).not.toContain('install automatically');
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
        sourceName: 'Button',
        label: 'Button',
        slug: 'button',
        category: 'Buttons & Actions',
        description: 'Versatile action element.',
        exports: [],
      },
      {
        name: 'Card',
        sourceName: 'Card',
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

  it('lists each focused page from a split component directory', () => {
    const page = componentsIndexMd([
      {
        name: 'ChatComposer',
        sourceName: 'Chat',
        label: 'Chat Composer',
        slug: 'chat-composer',
        category: 'Chat & Messaging',
        description: 'Chat input shell.',
        exports: [],
      },
      {
        name: 'ChatLayout',
        sourceName: 'Chat',
        label: 'Chat Layout',
        slug: 'chat-layout',
        category: 'Chat & Messaging',
        description: 'Full-page chat shell.',
        exports: [],
      },
      {
        name: 'ChatMessage',
        sourceName: 'Chat',
        label: 'Chat Message',
        slug: 'chat-message',
        category: 'Chat & Messaging',
        description: 'Sender-aware chat message.',
        exports: [],
      },
    ]);

    expect(page).toContain(
      '- [Chat Composer](/components/chat-composer/) — Chat input shell',
    );
    expect(page).toContain(
      '- [Chat Layout](/components/chat-layout/) — Full-page chat shell',
    );
    expect(page).toContain(
      '- [Chat Message](/components/chat-message/) — Sender-aware chat message',
    );
    expect(page).toContain('silver-ui ships 1 components');
    expect(page).not.toContain('/components/chat/');
  });
});
