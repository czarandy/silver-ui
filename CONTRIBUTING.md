# Contributing

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 11 (`corepack enable` uses the version pinned in `package.json`)

## Setup

```bash
git clone <repo-url>
cd silver-ui
pnpm install
```

## Development

Start Storybook for interactive component development:

```bash
pnpm storybook
```

This launches Storybook at `http://localhost:6006`.

## Adding a new component

1. Create a directory: `src/components/MyComponent/`
2. Add the recipe file (`MyComponent.recipe.ts`) using `cva` or `sva`
3. Add the component file (`MyComponent.tsx`) — must accept `className`, `style`, and `ref`
4. Add tests (`MyComponent.test.tsx`) and stories (`MyComponent.stories.tsx`)
5. Add a barrel export (`index.ts`) and re-export from `src/index.ts`

Component subpath exports such as `silver-ui/MyComponent` are generated from
component directories that contain an `index.ts` file, so keep the barrel export
in the component directory even when the component is also exported from
`src/index.ts`.

## Lint rules

There are many lint rules enabled for this package. Generally you should NOT
disable lints, they are all there for a reason. If you do disable a lint you
must have a very good reason for doing so, such that the goals cannot be
achieved in another way.

## Pre-commit hooks

Commits automatically run:

- **ESLint with auto-fix** on staged `.ts`/`.tsx` files
- **Prettier** on staged `.ts`, `.tsx`, `.json`, `.css`, and `.md` files
- **TypeScript** type-checking on the full project

Before submitting a change, ensure you also run all tests and the smoke test:

```bash
pnpm test && pnpm smoke:package
```

## Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `pnpm storybook`       | Start Storybook dev server               |
| `pnpm build`           | Build the library (JS + CSS)             |
| `pnpm build:storybook` | Build static Storybook site              |
| `pnpm build:site`      | Build the marketing/docs site            |
| `pnpm test`            | Run tests                                |
| `pnpm test:watch`      | Run tests in watch mode                  |
| `pnpm smoke:package`   | Build and smoke-test package consumption |
| `pnpm lint`            | Run ESLint                               |
| `pnpm lint:fix`        | Run ESLint with auto-fix                 |
| `pnpm format`          | Format code with Prettier                |
| `pnpm format:check`    | Check formatting                         |
| `pnpm typecheck`       | Type-check with TypeScript               |
| `pnpm check:exports`   | Build and validate package exports       |
| `pnpm theme`           | Regenerate theme artifacts               |
| `pnpm clean`           | Remove build artifacts                   |
| `pnpm release`         | Run the release workflow                 |

## Build output

`pnpm build` produces:

- `dist/index.js` — ESM bundle
- `dist/index.cjs` — CJS bundle
- `dist/index.d.ts` — TypeScript declarations
- `dist/styles.css` — All component styles (import this in consuming apps)

To release, see PUBLISHING.md.
