# silver-ui

A React component library with CSS variable theming, built with [Panda CSS](https://panda-css.com/).

## Installation

```bash
npm install silver-ui
# or
pnpm add silver-ui
# or
yarn add silver-ui
```

## Usage

Import the stylesheet once in your app's entry point, then use components:

```tsx
import 'silver-ui/styles.css';
import {Button} from 'silver-ui';

function App() {
  return (
    <Button variant="solid" size="md">
      Click me
    </Button>
  );
}
```

## Theming

silver-ui uses CSS variables for theming. Override any `--silver-*` variable to customize the look:

```css
:root {
  --silver-colors-primary: #e11d48;
  --silver-colors-primary-hover: #be123c;
  --silver-colors-primary-active: #9f1239;
}
```

All library styles use CSS `@layer`, so your custom CSS always takes precedence without specificity battles.

### Per-instance overrides

Every component accepts `className` and `style` props:

```tsx
<Button className="my-custom-class" style={{marginTop: 8}}>
  Custom
</Button>
```

## Components

- **Button** — `variant`: `solid` | `outline` | `ghost`, `size`: `sm` | `md` | `lg`

More components coming soon.

---

## Contributing

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

### Setup

```bash
git clone <repo-url>
cd silver-ui
pnpm install
```

This runs `panda codegen` automatically via the `prepare` script.

### Development

Start Storybook for interactive component development:

```bash
pnpm dev
```

This launches Storybook at `http://localhost:6006`.

### Scripts

| Script                 | Description                  |
| ---------------------- | ---------------------------- |
| `pnpm storybook`       | Start Storybook dev server   |
| `pnpm build`           | Build the library (JS + CSS) |
| `pnpm build:storybook` | Build static Storybook site  |
| `pnpm test`            | Run tests                    |
| `pnpm test:watch`      | Run tests in watch mode      |
| `pnpm lint`            | Run ESLint                   |
| `pnpm lint:fix`        | Run ESLint with auto-fix     |
| `pnpm format`          | Format code with Prettier    |
| `pnpm format:check`    | Check formatting             |
| `pnpm typecheck`       | Type-check with TypeScript   |
| `pnpm clean`           | Remove build artifacts       |

### Adding a new component

1. Create a directory: `src/components/MyComponent/`
2. Add the recipe file (`MyComponent.recipe.ts`) using `cva` or `sva`
3. Add the component file (`MyComponent.tsx`) — must accept `className`, `style`, and `ref`
4. Add tests (`MyComponent.test.tsx`) and stories (`MyComponent.stories.tsx`)
5. Add a barrel export (`index.ts`) and re-export from `src/index.ts`

### Pre-commit hooks

Commits automatically run:

- **ESLint** on staged `.ts`/`.tsx` files
- **Prettier** on staged files
- **TypeScript** type-checking on the full project

### Build output

`pnpm build` produces:

- `dist/index.js` — ESM bundle
- `dist/index.cjs` — CJS bundle
- `dist/index.d.ts` — TypeScript declarations
- `dist/styles.css` — All component styles (import this in consuming apps)

## License

MIT
