# silver-ui

[![npm version](https://img.shields.io/npm/v/silver-ui.svg)](https://www.npmjs.com/package/silver-ui)
[![license](https://img.shields.io/npm/l/silver-ui.svg)](./LICENSE)

A complete, themeable React component library, built with [Panda CSS](https://panda-css.com/).

[Storybook](https://storybook.silver-ui.com/) — browse and interact with all components.

## Installation

```bash
npm install silver-ui
# or
pnpm add silver-ui
# or
yarn add silver-ui
```

silver-ui requires **React 19+** as a peer dependency. Its other runtime
dependencies (`lucide-react`, `@js-temporal/polyfill`) install automatically.

## Usage

Import the stylesheet once in your app's entry point, then use components:

```tsx
import 'silver-ui/styles.css';
import {Button} from 'silver-ui';

function App() {
  return (
    <Button variant="primary" size="md">
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

The easiest way to theme silver-ui is the `<Theme>` component. It maps friendly
token names to the underlying CSS variables and applies them app-wide or to a
scoped subtree. Wrap your app (or any branded area) and override the tokens you
care about:

```tsx
import {Button, Theme} from 'silver-ui';

export function App() {
  return (
    <Theme
      mode="light"
      tokens={{
        colors: {
          primary: 'teal-500',
          primaryHover: 'teal-600',
          primaryActive: 'teal-700',
        },
        radii: {componentMd: '0.5rem'},
        fonts: {body: 'Inter, system-ui, sans-serif'},
      }}>
      <Button label="Save" />
    </Theme>
  );
}
```

Palette references (`teal-500`) and custom CSS values (`#e11d48`, `oklch(...)`,
`var(...)`) are both supported, and multiple `<Theme>` regions can coexist on
one page.

Prefer plain CSS? Every component is driven by `--silver-*` variables, so you
can override them directly. All library styles use CSS `@layer`, so your
overrides always win without specificity battles.

```css
:root {
  --silver-colors-primary: #e11d48;
  --silver-colors-primary-hover: #be123c;
  --silver-colors-primary-active: #9f1239;
  --silver-radii-component-md: 0.5rem;
  --silver-fonts-body: Inter, system-ui, sans-serif;
}
```

Variables can be scoped to containers, dark mode (`[data-theme="dark"]`), or
individual instances via `className`/`style` props.

See [THEME.md](THEME.md) for the full `<Theme>` API, variable reference, dark
mode details, scoped theming examples, and per-instance overrides.

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
- **NavIcon** — circular accent-colored icon container for navigation headers
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
- **SplitButton** — primary action paired with a dropdown menu of related actions
- **ToggleButton** — button with pressed/unpressed state

### Data Display

- **Avatar** — user or entity avatar with status indicators
- **AvatarGroup** — stacked avatar collection with overflow count
- **Badge** — small status label with icon support
- **Blockquote** — styled quotation block
- **CodeBlock** — read-only code display with line numbers, line highlighting, and copy button
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
- **TreeView** — hierarchical expandable tree

### Forms

- **CheckboxInput** — checkbox with label and description
- **CheckboxGroup** — controlled checkbox group for multi-value selection
- **AutocompleteInput** — searchable autocomplete input (combobox)
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
- **Tooltip** — informational popup on hover or focus

### Composite

- **Calendar** — date picker calendar grid with single and range selection
- **Schedule** — event calendar with day, week, month, and list views

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, development scripts, and component contribution guidelines.

## License

MIT
