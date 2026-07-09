import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

/**
 * Panda emits the dark token overrides under an explicit `[data-theme=dark]`
 * selector only (see the `dark` condition in panda.config.ts). That means
 * `<Theme mode="system">`, which renders `data-theme="system"`, never picks up
 * dark tokens on its own — the shipped CSS has no `prefers-color-scheme` rule.
 *
 * This transform closes that gap purely in CSS, with no runtime JS and no
 * flash-of-wrong-theme: it mirrors the generated dark block into
 *
 *   1. `@media (prefers-color-scheme: dark) { [data-theme=system] { …dark… } }`
 *      so system mode follows the OS, and
 *   2. `[data-theme=light] { …light… }` so an explicit light theme nested
 *      inside a dark/system subtree still wins.
 *
 * Both are appended inside a trailing `@layer tokens { … }` block so they land
 * after Panda's base + dark declarations in the same cascade layer — later
 * source order within the layer lets them override the base light values while
 * still losing to nothing that matters (an element only ever carries one
 * `data-theme` value). Explicit `[data-theme=dark]` / `[data-theme=light]`
 * always win because a rule matching an element directly beats values
 * inherited from an ancestor, regardless of specificity.
 */

const ROOT_BLOCK = /:where\(:root,\s*:host\)\s*\{([^}]*)\}/;
const DARK_BLOCK = /:where\(\[data-theme=dark\]\)\s*\{([^}]*)\}/;

/**
 * Parse a run of `--name: value;` declarations into an ordered list of
 * `[name, value]` pairs. Tolerant of minified (no whitespace) and pretty CSS.
 */
function parseDeclarations(block) {
  const declarations = [];
  for (const rawStatement of block.split(';')) {
    const statement = rawStatement.trim();
    if (statement === '') {
      continue;
    }
    const separator = statement.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const name = statement.slice(0, separator).trim();
    const value = statement.slice(separator + 1).trim();
    declarations.push([name, value]);
  }
  return declarations;
}

function serializeDeclarations(declarations) {
  return declarations.map(([name, value]) => `${name}:${value}`).join(';');
}

/**
 * Given the full generated stylesheet, return it with the system/light theme
 * rules appended. Pure and idempotent. Throws if the expected Panda token
 * blocks are missing, so a future Panda upgrade that renames the selectors
 * fails the build loudly instead of silently shipping a broken `system` mode.
 */
export function injectSystemThemeCss(css) {
  if (css.includes('[data-theme=system]')) {
    return css;
  }

  const rootMatch = ROOT_BLOCK.exec(css);
  if (rootMatch == null) {
    throw new Error(
      'inject-system-theme: could not find the `:where(:root, :host)` token block.',
    );
  }
  const darkMatch = DARK_BLOCK.exec(css);
  if (darkMatch == null) {
    throw new Error(
      'inject-system-theme: could not find the `:where([data-theme=dark])` token block.',
    );
  }

  const baseValues = new Map(parseDeclarations(rootMatch[1]));
  const darkDeclarations = parseDeclarations(darkMatch[1]);

  if (darkDeclarations.length === 0) {
    throw new Error(
      'inject-system-theme: the dark token block is empty; nothing to mirror.',
    );
  }

  // Light values for exactly the tokens the dark theme overrides, so an
  // explicit light theme can reset them back to their base values.
  const lightDeclarations = darkDeclarations
    .filter(([name]) => baseValues.has(name))
    .map(([name]) => [name, baseValues.get(name)]);

  const systemBlock = `@media (prefers-color-scheme:dark){:where([data-theme=system]){${serializeDeclarations(
    darkDeclarations,
  )}}}`;
  const lightBlock = `:where([data-theme=light]){${serializeDeclarations(
    lightDeclarations,
  )}}`;

  return `${css}@layer tokens{${systemBlock}${lightBlock}}`;
}

async function main() {
  const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
  const cssPath = join(rootDir, 'dist', 'styles.css');
  const css = await readFile(cssPath, 'utf8');
  const transformed = injectSystemThemeCss(css);
  if (transformed === css) {
    return;
  }
  await writeFile(cssPath, transformed);
}

// Run the file transform only when invoked directly, not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
