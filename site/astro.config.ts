import {fileURLToPath} from 'node:url';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import {defineConfig} from 'astro/config';
import {componentSidebarGroups} from './src/component-categories';

/**
 * Resolve a path relative to the repository root. The docs pages and the
 * landing island both compile the library from source (`../src`), mirroring
 * the aliases in `.storybook/main.ts` and the root `vitest.config.ts`, so
 * building the site never requires a prior library build.
 */
const fromRepoRoot = (path: string): string =>
  fileURLToPath(new URL(`../${path}`, import.meta.url));

export default defineConfig({
  site: 'https://www.silver-ui.com',
  integrations: [
    react(),
    starlight({
      title: 'silver-ui',
      description:
        'A comprehensive, themeable React component library built with Panda CSS.',
      favicon: '/favicon.ico',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/czarandy/silver-ui',
        },
      ],
      sidebar: [
        {label: 'Getting started', slug: 'getting-started'},
        {label: 'Theming', slug: 'theming'},
        {label: 'Components', slug: 'components'},
        ...componentSidebarGroups(),
      ],
      // panda.css is generated with preflight scoped to the demo boxes, so
      // it layers cleanly on top of Starlight's styles — do NOT add a global
      // @layer order statement promoting Panda's layers above `starlight`;
      // that outranks Starlight's own page styles and unstyles the docs.
      customCss: ['./src/styles/panda.css', './src/styles/docs.css'],
      head: [
        {
          tag: 'link',
          attrs: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
        },
        {tag: 'link', attrs: {rel: 'manifest', href: '/site.webmanifest'}},
        {tag: 'meta', attrs: {name: 'theme-color', content: '#1ca49e'}},
        // Vercel Web Analytics + Speed Insights for the docs pages (the
        // landing island mounts the React components instead). The scripts
        // 404 harmlessly outside Vercel deployments.
        {
          tag: 'script',
          attrs: {defer: true, src: '/_vercel/insights/script.js'},
        },
        {
          tag: 'script',
          attrs: {defer: true, src: '/_vercel/speed-insights/script.js'},
        },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: [
        // Exact-match so the `silver-ui/styles.css` subpath still resolves
        // through the package's export map (to the cssgen output in dist/).
        {find: /^silver-ui$/, replacement: fromRepoRoot('src/index.ts')},
        {
          find: /^components\//,
          replacement: `${fromRepoRoot('src/components')}/`,
        },
        {find: /^hooks\//, replacement: `${fromRepoRoot('src/hooks')}/`},
        {find: /^internal$/, replacement: fromRepoRoot('src/internal/index')},
        {find: /^internal\//, replacement: `${fromRepoRoot('src/internal')}/`},
        {find: /^themes\//, replacement: `${fromRepoRoot('src/themes')}/`},
        {find: /^utils\//, replacement: `${fromRepoRoot('src/utils')}/`},
        {
          find: /^styled-system\//,
          replacement: `${fromRepoRoot('styled-system')}/`,
        },
      ],
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // The library source and styled-system live outside site/.
      fs: {allow: [fromRepoRoot('.')]},
    },
  },
});
