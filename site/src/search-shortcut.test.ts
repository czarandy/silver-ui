import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..');
const docsCss = readFileSync(resolve(siteRoot, 'src/styles/docs.css'), 'utf-8');
const kbdRecipe = readFileSync(
  resolve(repoRoot, 'src/components/Kbd/Kbd.recipe.ts'),
  'utf-8',
);

function ruleBody(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`).exec(docsCss);
  if (match?.[1] == null) {
    throw new Error(`No rule found for ${selector}`);
  }
  return match[1];
}

describe('docs search shortcut', () => {
  const rootRule = ruleBody('site-search button[data-open-modal] > kbd');
  const keyRule = ruleBody('site-search button[data-open-modal] > kbd > kbd');

  it('matches the Kbd medium-size geometry', () => {
    expect(kbdRecipe).toMatch(/root: \{gap: '1'\}/);
    expect(kbdRecipe).toMatch(
      /key: \{minW: '5', h: '5', px: '1', fontSize: 'xs'\}/,
    );

    expect(rootRule).toMatch(/gap:\s*0\.25rem/);
    expect(keyRule).toMatch(/min-width:\s*var\(--silver-sizes-5\)/);
    expect(keyRule).toMatch(/height:\s*var\(--silver-sizes-5\)/);
    expect(keyRule).toMatch(/padding-inline:\s*0\.25rem/);
    expect(keyRule).toMatch(/font-size:\s*var\(--silver-font-sizes-xs\)/);
  });

  it('matches the Kbd key surface and typography tokens', () => {
    expect(kbdRecipe).toMatch(/bg: 'bg\.subtle'/);
    expect(kbdRecipe).toMatch(/borderBottomWidth: 'emphasized'/);
    expect(kbdRecipe).toMatch(/borderBottomColor: 'border'/);
    expect(kbdRecipe).toMatch(/color: 'fg\.muted'/);
    expect(kbdRecipe).toMatch(/fontFamily: 'body'/);
    expect(kbdRecipe).toMatch(/fontWeight: 'medium'/);
    expect(kbdRecipe).toMatch(/lineHeight: 'none'/);

    expect(keyRule).toMatch(
      /background-color:\s*var\(--silver-colors-bg-subtle\)/,
    );
    expect(keyRule).toMatch(
      /border-bottom-width:\s*var\(--silver-border-widths-emphasized\)/,
    );
    expect(keyRule).toMatch(
      /border-bottom-color:\s*var\(--silver-colors-border\)/,
    );
    expect(keyRule).toMatch(/color:\s*var\(--silver-colors-fg-muted\)/);
    expect(keyRule).toMatch(/font-family:\s*var\(--silver-fonts-body\)/);
    expect(keyRule).toMatch(
      /font-weight:\s*var\(--silver-font-weights-medium\)/,
    );
    expect(keyRule).toMatch(/line-height:\s*var\(--silver-line-heights-none\)/);
  });

  it('leaves responsive visibility under Starlight control', () => {
    expect(rootRule).not.toMatch(/(^|\s)display\s*:/);
  });
});
