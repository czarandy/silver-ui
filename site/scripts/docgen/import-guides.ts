import {cpSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * THEME.md embeds the color-swatch SVGs from the repo's swatches/ directory.
 * Copy them into the site's public/ dir (gitignored) and serve them as plain
 * static URLs so Astro doesn't try to process them as content images.
 */
export function syncSwatches(): void {
  cpSync(join(repoRoot, 'swatches'), join(repoRoot, 'site/public/swatches'), {
    recursive: true,
  });
}

function frontmatter(title: string, description: string): string {
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    '---',
    '',
  ].join('\n');
}

/**
 * Extracts a `## Section` (heading included) through the start of the next
 * `## ` heading.
 */
function section(markdown: string, heading: string): string {
  const pattern = new RegExp(`^## ${heading}$([\\s\\S]*?)(?=^## )`, 'm');
  const match = markdown.match(pattern);
  if (match == null) {
    throw new Error(`docgen: README.md has no "## ${heading}" section`);
  }
  return `## ${heading}${match[1].trimEnd()}\n`;
}

function installationSection(markdown: string): string {
  const installation = section(markdown, 'Installation');
  const codeBlock = installation.match(/```bash\n([\s\S]*?)```/);
  if (codeBlock == null) {
    throw new Error('docgen: README Installation has no bash code block');
  }

  const commands = codeBlock[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '' && !line.startsWith('#'));
  const packageManagers = ['npm', 'pnpm', 'yarn'];
  if (
    commands.length !== packageManagers.length ||
    !packageManagers.every((manager, index) =>
      commands[index].startsWith(`${manager} `),
    )
  ) {
    throw new Error(
      'docgen: README Installation must list npm, pnpm, and yarn commands in that order',
    );
  }

  const tabs = commands
    .map(
      (command, index) =>
        `<TabItem label="${packageManagers[index]}">\n\n\`\`\`bash\n${command}\n\`\`\`\n\n</TabItem>`,
    )
    .join('\n');

  return installation.replace(
    codeBlock[0],
    `<Tabs syncKey="package-manager">\n${tabs}\n</Tabs>`,
  );
}

/**
 * The getting-started guide, single-sourced from the README's Installation
 * and Usage sections. The install commands become Starlight tabs, so the
 * generated page is MDX.
 */
export function gettingStartedPage(): string {
  const readme = readFileSync(join(repoRoot, 'README.md'), 'utf-8');
  return [
    frontmatter(
      'Getting started',
      'Install silver-ui and render your first components.',
    ),
    "import {TabItem, Tabs} from '@astrojs/starlight/components';",
    '',
    'silver-ui is a complete, themeable React component library, built with',
    '[Panda CSS](https://panda-css.com/).',
    '',
    installationSection(readme),
    '',
    section(readme, 'Usage'),
    '',
    'Next, browse the [components](/components/) or read the',
    '[theming guide](/theming/).',
    '',
  ].join('\n');
}

/**
 * The theming guide, single-sourced from THEME.md (its H1 becomes the page
 * title; in-repo links to THEME.md itself are unnecessary and absent).
 */
export function themingPage(): string {
  const theme = readFileSync(join(repoRoot, 'THEME.md'), 'utf-8');
  const withoutTitle = theme.replace(/^# Theming\s*\n/, '');
  if (withoutTitle === theme) {
    throw new Error('docgen: THEME.md no longer starts with "# Theming"');
  }
  // Swatch images resolve against the site's public/ copy (see syncSwatches).
  const withPublicSwatches = withoutTitle.replaceAll(
    '](swatches/',
    '](/swatches/',
  );
  return `${frontmatter(
    'Theming',
    'Theme silver-ui with the <Theme> component or CSS variables: colors, radii, fonts, dark mode, and scoped themes.',
  )}${withPublicSwatches}`;
}
