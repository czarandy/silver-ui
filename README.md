# silver-ui

A React component library with CSS variable theming, built with [Panda CSS](https://panda-css.com/).

[Storybook](https://silver-ui-eight.vercel.app/) — browse and interact with all components.

## Installation

silver-ui is not published to npm yet. Until it is, consume a local build by
copying the full build output into your app:

```bash
pnpm build
rm -rf path/to/app/src/vendor/silver-ui
mkdir -p path/to/app/src/vendor/silver-ui
cp -R dist/* path/to/app/src/vendor/silver-ui/
```

Copy the whole `dist/` directory, not only `index.js`; component entry points
share generated chunks.

The vendored build expects your app to install silver-ui's runtime
dependencies:

```bash
npm install lucide-react
# or
pnpm add lucide-react
# or
yarn add lucide-react
```

Then import from the vendored ESM files. Use component subpaths for smaller JS
bundles:

```tsx
import './vendor/silver-ui/styles.css';
import {Button} from './vendor/silver-ui/components/Button/index.js';

function App() {
  return <Button label="Click me" />;
}
```

The root vendored entry is also available when convenience matters more than
bundle size:

```tsx
import './vendor/silver-ui/styles.css';
import {Button} from './vendor/silver-ui/index.js';
```

The JS bundle uses the standard React ecosystem pattern
`process.env.NODE_ENV` for development-only validation. Most app bundlers
(Vite, Webpack, Next.js, Remix, etc.) replace this automatically. If you copy
the file into a setup that does not perform that replacement, configure your
bundler to define it. For example:

```ts
import {defineConfig} from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV ?? 'development',
    ),
  },
});
```

Once silver-ui is published, install it from npm:

```bash
npm install silver-ui
# or
pnpm add silver-ui
# or
yarn add silver-ui
```

The npm package exposes the same tree-shakeable component subpaths:

```tsx
import 'silver-ui/styles.css';
import {Button} from 'silver-ui/Button';
import {SideNav, SideNavItem} from 'silver-ui/SideNav';
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

For smaller JS bundles, import component subpaths:

```tsx
import 'silver-ui/styles.css';
import {Button} from 'silver-ui/Button';
import {SideNav, SideNavItem} from 'silver-ui/SideNav';
```

## Theming

silver-ui uses CSS variables for theming. Import `styles.css` first, then define
your overrides in your app CSS.

### Global theme overrides

Override any `--silver-*` variable at `:root` to change the default theme:

```css
:root {
  --silver-colors-primary: #e11d48;
  --silver-colors-primary-hover: #be123c;
  --silver-colors-primary-active: #9f1239;
  --silver-radii-component-md: 0.5rem;
  --silver-fonts-body: Inter, system-ui, sans-serif;
}
```

All library styles use CSS `@layer`, so your custom CSS always takes precedence without specificity battles.

### Scoped themes

CSS variables can be scoped to any container. This is useful for branded areas,
previews, or embedded tools:

```css
.acme-theme {
  --silver-colors-primary: #2563eb;
  --silver-colors-primary-hover: #1d4ed8;
  --silver-colors-primary-active: #1e40af;
  --silver-colors-bg: #ffffff;
  --silver-colors-bg-subtle: #f8fafc;
}
```

```tsx
<div className="acme-theme">
  <Button label="Save" />
</div>
```

### Dark theme overrides

The built styles include dark-mode tokens for `[data-theme="dark"]`. Set that
attribute on a parent element and override dark values there:

```css
[data-theme='dark'] {
  --silver-colors-primary: #93c5fd;
  --silver-colors-primary-hover: #bfdbfe;
  --silver-colors-bg: #0f172a;
  --silver-colors-bg-subtle: #1e293b;
  --silver-colors-fg: #f8fafc;
  --silver-colors-fg-muted: #cbd5e1;
  --silver-colors-border: #334155;
}
```

### Per-instance overrides

Every component accepts `className` and `style` props:

```tsx
<Button className="danger-action" label="Delete" />
```

```css
.danger-action {
  --silver-colors-primary: #dc2626;
  --silver-colors-primary-hover: #b91c1c;
  --silver-colors-primary-active: #991b1b;
}
```

Use `style` for one-off layout or variable overrides:

```tsx
<Button
  label="Custom"
  style={{
    marginTop: 8,
    '--silver-radii-component-md': '9999px',
  }}
/>
```

## Components

### Layout & Structure

- **Accordion** — collapsible content sections
- **AppShell** — application-level layout shell with responsive mobile navigation
- **AspectRatio** — constrains children to a fixed aspect ratio
- **Card** — rounded container surface for grouping content
- **Center** — centers content horizontally, vertically, or both
- **Divider** — visual separator between sections
- **Layout** — page shell with header, footer, side panels, and content slots
- **HStack / VStack** — horizontal and vertical flex containers with gap

### Navigation

- **Breadcrumbs** — hierarchical page location trail
- **Link** — polymorphic link with external link handling and router integration
- **MobileNav** — slide-out drawer for mobile navigation
- **Pagination** — page navigation controls
- **SideNav** — vertical side navigation panel with collapsing support
- **Tabs** — tabbed content switching
- **TopNav** — horizontal top navigation bar

### Buttons & Actions

- **Button** — versatile action element supporting links, loading states, and icon-only mode
- **ButtonGroup** — connected group of related buttons
- **ContextMenu** — right-click context menu
- **DropdownMenu** — button-triggered dropdown menu
- **SegmentedControl** — mutually exclusive option selector
- **ToggleButton** — button with pressed/unpressed state

### Data Display

- **Avatar** — user or entity avatar with status indicators
- **AvatarGroup** — stacked avatar collection with overflow count
- **Badge** — small status label with icon support
- **Blockquote** — styled quotation block
- **Icon** — renders Lucide icons with size and color tokens
- **Item** — generic list item with icon, label, and description
- **Kbd** — keyboard shortcut display with accessible labels
- **Lightbox** — full-screen media viewer
- **List** — ordered or unordered list with dividers
- **MetadataList** — key-value metadata display
- **Table** — data table with sorting, filtering, and column resize plugins
- **Tag** — removable label for categories or filters
- **Text / Heading** — typography primitives with size, color, and truncation
- **Thumbnail** — image preview with fallback and remove action
- **Tooltip** — informational popup on hover or focus
- **TreeView** — hierarchical expandable tree

### Forms

- **CheckboxInput** — checkbox with label and description
- **Combobox** — searchable autocomplete input
- **DateInput** — date picker field
- **DateRangeInput** — date range picker field
- **DateTimeInput** — combined date and time picker
- **Field** — form field wrapper with label, description, and validation
- **FileInput** — file upload with drag-and-drop support
- **InputGroup** — groups related form inputs with shared label
- **MultiSelect** — multi-value dropdown selector
- **NumberInput** — numeric input with increment/decrement
- **PasswordInput** — text input with show/hide toggle
- **RadioGroup** — radio button group
- **Rating** — star rating input
- **SearchFilterInput** — search input with structured filter tags
- **Select** — single-value dropdown selector
- **Slider** — range slider with marks and labels
- **Switch** — toggle switch
- **TagsInput** — free-form tag entry field
- **TextArea** — multi-line text input
- **TextInput** — single-line text input
- **TimeInput** — time picker field

### Feedback & Status

- **Alert** — dismissable notification banner
- **EmptyState** — placeholder for empty content areas
- **Progress** — determinate progress bar
- **Skeleton** — loading placeholder with pulse animation
- **Spinner** — indeterminate loading indicator
- **Stepper** — multi-step progress indicator
- **Toast** — temporary notification popup

### Overlays

- **AlertDialog** — confirmation dialog requiring explicit action
- **Dialog** — modal dialog with header and content
- **Drawer** — slide-in panel from screen edge
- **HoverCard** — rich content popup on hover
- **Popover** — anchored popup with arbitrary content

### Composite

- **Calendar** — date picker calendar grid with single and range selection
- **Schedule** — event calendar with day, week, month, and list views

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
