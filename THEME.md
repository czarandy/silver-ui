# Theming

silver-ui uses CSS custom properties (variables) prefixed with `--silver-` for
all visual tokens. Override any variable at `:root` to change the default theme,
or scope overrides to a container for branded areas.

All library styles use CSS `@layer`, so your custom CSS always takes precedence
without specificity battles.

## Quick start

```css
:root {
  --silver-colors-primary: #2563eb;
  --silver-colors-primary-hover: #1d4ed8;
  --silver-colors-primary-active: #1e40af;
  --silver-radii-component-md: 0.5rem;
  --silver-fonts-body: Inter, system-ui, sans-serif;
}
```

## Dark mode

Dark-mode tokens activate under `[data-theme="dark"]` or
`@media (prefers-color-scheme: dark)`. Set `data-theme="dark"` on a parent
element and override dark values there:

```css
[data-theme='dark'] {
  --silver-colors-primary: #93c5fd;
  --silver-colors-bg: #0f172a;
  --silver-colors-fg: #f8fafc;
}
```

## Scoped themes

CSS variables can be scoped to any container:

```css
.acme-theme {
  --silver-colors-primary: #2563eb;
  --silver-colors-bg: #ffffff;
  --silver-colors-bg-subtle: #f8fafc;
}
```

```tsx
<div className="acme-theme">
  <Button label="Save" />
</div>
```

## Per-instance overrides

Every component accepts `className` and `style` props:

```tsx
<Button
  className="danger-action"
  label="Delete"
  style={{'--silver-radii-component-md': '9999px'}}
/>
```

---

## CSS variable reference

All variables below are emitted by the Panda CSS build. The authoritative source
is `panda.config.ts`. Variables marked with light/dark values respond
automatically to theme mode.

### Primary colors

The main brand color used for buttons, links, focus rings, and selected states.

| Variable                         | Light                              | Dark |
| -------------------------------- | ---------------------------------- | ---- |
| `--silver-colors-primary`        | ![](swatches/547a95.svg) `#547A95` | same |
| `--silver-colors-primary-hover`  | ![](swatches/45647a.svg) `#45647a` | same |
| `--silver-colors-primary-active` | ![](swatches/374f61.svg) `#374f61` | same |
| `--silver-colors-primary-subtle` | ![](swatches/d0dbe3.svg) `#d0dbe3` | same |

### Destructive colors

Used for destructive actions (delete buttons, error confirmations).

| Variable                             | Light                              | Dark                               |
| ------------------------------------ | ---------------------------------- | ---------------------------------- |
| `--silver-colors-destructive`        | ![](swatches/e31a3b.svg) `#e31a3b` | ![](swatches/d92644.svg) `#d92644` |
| `--silver-colors-destructive-hover`  | ![](swatches/842e3d.svg) `#842e3d` | ![](swatches/da4e65.svg) `#da4e65` |
| `--silver-colors-destructive-active` | ![](swatches/6b2e38.svg) `#6b2e38` | ![](swatches/e28d9b.svg) `#e28d9b` |
| `--silver-colors-destructive-fg`     | ![](swatches/fff.svg) `#fff`       | same                               |

### Foreground colors

Text and icon colors.

| Variable                        | Light                              | Dark                               |
| ------------------------------- | ---------------------------------- | ---------------------------------- |
| `--silver-colors-fg`            | ![](swatches/22272d.svg) `#22272d` | ![](swatches/e9ebee.svg) `#e9ebee` |
| `--silver-colors-fg-muted`      | ![](swatches/576573.svg) `#576573` | ![](swatches/b1bac3.svg) `#b1bac3` |
| `--silver-colors-fg-disabled`   | ![](swatches/b1bac3.svg) `#b1bac3` | ![](swatches/576573.svg) `#576573` |
| `--silver-colors-fg-on-primary` | ![](swatches/fff.svg) `#fff`       | same                               |

### Background colors

Surface and container backgrounds.

| Variable                          | Light                              | Dark                               |
| --------------------------------- | ---------------------------------- | ---------------------------------- |
| `--silver-colors-bg`              | ![](swatches/ffffff.svg) `#ffffff` | ![](swatches/22272d.svg) `#22272d` |
| `--silver-colors-bg-subtle`       | ![](swatches/e9ebee.svg) `#e9ebee` | ![](swatches/333b43.svg) `#333b43` |
| `--silver-colors-bg-hover`        | ![](swatches/d5d9de.svg) `#d5d9de` | ![](swatches/45505b.svg) `#45505b` |
| `--silver-colors-bg-selected`     | primary subtle                     | same                               |
| `--silver-colors-bg-ghost-hover`  | `rgba(0,0,0,0.06)`                 | `rgba(255,255,255,0.08)`           |
| `--silver-colors-bg-ghost-active` | `rgba(0,0,0,0.1)`                  | `rgba(255,255,255,0.12)`           |

### Border colors

| Variable                            | Light                              | Dark                               |
| ----------------------------------- | ---------------------------------- | ---------------------------------- |
| `--silver-colors-border`            | ![](swatches/d5d9de.svg) `#d5d9de` | ![](swatches/45505b.svg) `#45505b` |
| `--silver-colors-border-emphasized` | ![](swatches/b1bac3.svg) `#b1bac3` | ![](swatches/576573.svg) `#576573` |

### Track colors

Slider tracks, progress bars, and similar range indicators.

| Variable                           | Light                              | Dark                               |
| ---------------------------------- | ---------------------------------- | ---------------------------------- |
| `--silver-colors-track`            | ![](swatches/b1bac3.svg) `#b1bac3` | ![](swatches/45505b.svg) `#45505b` |
| `--silver-colors-track-emphasized` | ![](swatches/8a97a4.svg) `#8a97a4` | ![](swatches/576573.svg) `#576573` |
| `--silver-colors-track-disabled`   | ![](swatches/8a97a4.svg) `#8a97a4` | ![](swatches/45505b.svg) `#45505b` |

### Overlay colors

Backdrops for modals, drawers, and dialogs.

| Variable                               | Value              |
| -------------------------------------- | ------------------ |
| `--silver-colors-overlay-scrim`        | `rgba(0,0,0,0.45)` |
| `--silver-colors-overlay-scrim-subtle` | `rgba(0,0,0,0.35)` |
| `--silver-colors-overlay-scrim-strong` | `rgba(0,0,0,0.76)` |

### Skeleton colors

Loading placeholder pulse animation.

| Variable                           | Light                              | Dark                               |
| ---------------------------------- | ---------------------------------- | ---------------------------------- |
| `--silver-colors-skeleton`         | ![](swatches/b1bac3.svg) `#b1bac3` | ![](swatches/45505b.svg) `#45505b` |
| `--silver-colors-skeleton-shimmer` | ![](swatches/d5d9de.svg) `#d5d9de` | ![](swatches/576573.svg) `#576573` |

### Status colors

Used by Alert, Badge, Toast, Stepper, and form validation states.

| Variable                                   | Light                              | Dark        |
| ------------------------------------------ | ---------------------------------- | ----------- |
| `--silver-colors-status-success-fg`        | ![](swatches/108627.svg) `#108627` | same        |
| `--silver-colors-status-success-border`    | green 600                          | green 400   |
| `--silver-colors-status-success-solid`     | green 600                          | green 500   |
| `--silver-colors-status-success-solid-fg`  | ![](swatches/fff.svg) `#fff`       | same        |
| `--silver-colors-status-error-fg`          | ![](swatches/d92644.svg) `#d92644` | same        |
| `--silver-colors-status-error-border`      | red 600                            | red 400     |
| `--silver-colors-status-error-solid`       | red 600                            | red 500     |
| `--silver-colors-status-error-solid-fg`    | ![](swatches/fff.svg) `#fff`       | same        |
| `--silver-colors-status-warning-fg`        | yellow 500                         | same        |
| `--silver-colors-status-warning-border`    | yellow 500                         | yellow 400  |
| `--silver-colors-status-warning-solid`     | yellow 500                         | yellow 400  |
| `--silver-colors-status-warning-solid-fg`  | ![](swatches/fff.svg) `#fff`       | same        |
| `--silver-colors-status-info-fg`           | ![](swatches/0164e0.svg) `#0164e0` | same        |
| `--silver-colors-status-info-solid`        | primary                            | same        |
| `--silver-colors-status-info-solid-fg`     | fg on-primary                      | same        |
| `--silver-colors-status-neutral-solid`     | neutral 500                        | neutral 400 |
| `--silver-colors-status-neutral-solid-fg`  | ![](swatches/fff.svg) `#fff`       | same        |
| `--silver-colors-status-disabled-solid`    | neutral 400                        | neutral 600 |
| `--silver-colors-status-disabled-solid-fg` | ![](swatches/fff.svg) `#fff`       | same        |

### Presence colors

Online/offline/error indicators on avatars.

| Variable                           | Light       | Dark        |
| ---------------------------------- | ----------- | ----------- |
| `--silver-colors-presence-success` | green 500   | green 400   |
| `--silver-colors-presence-neutral` | neutral 500 | neutral 400 |
| `--silver-colors-presence-error`   | red 600     | red 400     |

### Surface colors

Tinted background surfaces used by Schedule events, tags, and badges.
Each color has four sub-tokens: default (background), `fg` (text), `hover`, and
`accent` (dot/indicator).

Available colors: `blue`, `cyan`, `gray`, `green`, `orange`, `pink`, `purple`,
`red`, `teal`, `yellow`.

Example variables for `blue`:

| Variable                              | Light    | Dark     |
| ------------------------------------- | -------- | -------- |
| `--silver-colors-surface-blue`        | blue 100 | blue 900 |
| `--silver-colors-surface-blue-fg`     | blue 800 | blue 200 |
| `--silver-colors-surface-blue-hover`  | blue 200 | blue 800 |
| `--silver-colors-surface-blue-accent` | blue 600 | blue 400 |

### Icon colors

Semantic icon color tokens. Components like Icon use these, but they resolve to
other semantic tokens so overriding the source token is usually sufficient.

| Variable                                                                         | Resolves to         |
| -------------------------------------------------------------------------------- | ------------------- |
| `--silver-colors-icon-primary`                                                   | `fg`                |
| `--silver-colors-icon-secondary`                                                 | `fg.muted`          |
| `--silver-colors-icon-tertiary`                                                  | neutral 500         |
| `--silver-colors-icon-disabled`                                                  | neutral 400 / 600   |
| `--silver-colors-icon-accent`                                                    | `primary`           |
| `--silver-colors-icon-success`                                                   | `status.success.fg` |
| `--silver-colors-icon-error`                                                     | `status.error.fg`   |
| `--silver-colors-icon-warning`                                                   | `status.warning.fg` |
| `--silver-colors-icon-info`                                                      | `status.info.fg`    |
| `--silver-colors-icon-{blue,red,green,gray,cyan,teal,yellow,orange,pink,purple}` | color 600           |

---

### Typography

#### Fonts

| Variable               | Default                                     |
| ---------------------- | ------------------------------------------- |
| `--silver-fonts-body`  | `system-ui, -apple-system, sans-serif`      |
| `--silver-fonts-mono`  | `ui-monospace, monospace`                   |
| `--silver-fonts-sans`  | `ui-sans-serif, system-ui, sans-serif, ...` |
| `--silver-fonts-serif` | `ui-serif, Georgia, Cambria, ...`           |

#### Font sizes

| Variable                  | Value      |
| ------------------------- | ---------- |
| `--silver-font-sizes-2xs` | `0.5rem`   |
| `--silver-font-sizes-xs`  | `0.75rem`  |
| `--silver-font-sizes-sm`  | `0.875rem` |
| `--silver-font-sizes-md`  | `1rem`     |
| `--silver-font-sizes-lg`  | `1.125rem` |
| `--silver-font-sizes-xl`  | `1.25rem`  |
| `--silver-font-sizes-2xl` | `1.5rem`   |
| `--silver-font-sizes-3xl` | `1.875rem` |
| `--silver-font-sizes-4xl` | `2.25rem`  |
| `--silver-font-sizes-5xl` | `3rem`     |
| `--silver-font-sizes-6xl` | `3.75rem`  |
| `--silver-font-sizes-7xl` | `4.5rem`   |
| `--silver-font-sizes-8xl` | `6rem`     |
| `--silver-font-sizes-9xl` | `8rem`     |

#### Font weights

| Variable                           | Value |
| ---------------------------------- | ----- |
| `--silver-font-weights-thin`       | `100` |
| `--silver-font-weights-extralight` | `200` |
| `--silver-font-weights-light`      | `300` |
| `--silver-font-weights-normal`     | `400` |
| `--silver-font-weights-medium`     | `500` |
| `--silver-font-weights-semibold`   | `600` |
| `--silver-font-weights-bold`       | `700` |
| `--silver-font-weights-extrabold`  | `800` |
| `--silver-font-weights-black`      | `900` |

#### Line heights

| Variable                        | Value   |
| ------------------------------- | ------- |
| `--silver-line-heights-none`    | `1`     |
| `--silver-line-heights-tight`   | `1.25`  |
| `--silver-line-heights-snug`    | `1.375` |
| `--silver-line-heights-normal`  | `1.5`   |
| `--silver-line-heights-relaxed` | `1.625` |
| `--silver-line-heights-loose`   | `2`     |

#### Letter spacings

| Variable                           | Value      |
| ---------------------------------- | ---------- |
| `--silver-letter-spacings-tighter` | `-0.05em`  |
| `--silver-letter-spacings-tight`   | `-0.025em` |
| `--silver-letter-spacings-normal`  | `0em`      |
| `--silver-letter-spacings-wide`    | `0.025em`  |
| `--silver-letter-spacings-wider`   | `0.05em`   |
| `--silver-letter-spacings-widest`  | `0.1em`    |

---

### Component sizing

Standardized sizes used across all interactive components (buttons, inputs,
selects, etc.). Override these to change the size system globally.

#### Heights

| Variable                      | Value           |
| ----------------------------- | --------------- |
| `--silver-sizes-component-sm` | `2rem` (32px)   |
| `--silver-sizes-component-md` | `2.5rem` (40px) |
| `--silver-sizes-component-lg` | `3rem` (48px)   |

#### Icon sizes

| Variable                 | Value            |
| ------------------------ | ---------------- |
| `--silver-sizes-icon-sm` | `1rem` (16px)    |
| `--silver-sizes-icon-md` | `1.25rem` (20px) |
| `--silver-sizes-icon-lg` | `1.5rem` (24px)  |

#### Horizontal padding

| Variable                        | Value            |
| ------------------------------- | ---------------- |
| `--silver-spacing-component-sm` | `0.75rem` (12px) |
| `--silver-spacing-component-md` | `1rem` (16px)    |
| `--silver-spacing-component-lg` | `1.25rem` (20px) |

#### Component font sizes

| Variable                           | Value             |
| ---------------------------------- | ----------------- |
| `--silver-font-sizes-component-sm` | `0.875rem` (14px) |
| `--silver-font-sizes-component-md` | `1rem` (16px)     |
| `--silver-font-sizes-component-lg` | `1rem` (16px)     |

---

### Border radii

| Variable              | Value      |
| --------------------- | ---------- |
| `--silver-radii-xs`   | `0.125rem` |
| `--silver-radii-sm`   | `0.25rem`  |
| `--silver-radii-md`   | `0.375rem` |
| `--silver-radii-lg`   | `0.5rem`   |
| `--silver-radii-xl`   | `0.75rem`  |
| `--silver-radii-2xl`  | `1rem`     |
| `--silver-radii-3xl`  | `1.5rem`   |
| `--silver-radii-full` | `9999px`   |

#### Component radii

| Variable                      | Value      |
| ----------------------------- | ---------- |
| `--silver-radii-component-sm` | `0.25rem`  |
| `--silver-radii-component-md` | `0.375rem` |
| `--silver-radii-component-lg` | `0.5rem`   |

---

### Border widths

| Variable                            | Value |
| ----------------------------------- | ----- |
| `--silver-border-widths-default`    | `1px` |
| `--silver-border-widths-emphasized` | `2px` |
| `--silver-border-widths-focus`      | `2px` |

---

### Shadows

#### Elevation

| Variable               | Value                                    |
| ---------------------- | ---------------------------------------- |
| `--silver-shadows-2xs` | `0 1px rgb(0 0 0 / 0.05)`                |
| `--silver-shadows-xs`  | `0 1px 2px 0 rgb(0 0 0 / 0.05)`          |
| `--silver-shadows-sm`  | `0 1px 3px 0 rgb(0 0 0 / 0.1), ...`      |
| `--silver-shadows-md`  | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...`   |
| `--silver-shadows-lg`  | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` |
| `--silver-shadows-xl`  | `0 20px 25px -5px rgb(0 0 0 / 0.1), ...` |
| `--silver-shadows-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)`    |

#### Focus rings

| Variable                         | Description                                  |
| -------------------------------- | -------------------------------------------- |
| `--silver-shadows-focus`         | Primary focus ring (uses `primary.subtle`)   |
| `--silver-shadows-focus-error`   | Error-state focus ring (uses `red.100`)      |
| `--silver-shadows-focus-warning` | Warning-state focus ring (uses `yellow.100`) |
| `--silver-shadows-focus-success` | Success-state focus ring (uses `green.100`)  |

---

### Focus offset

Controls the gap between a focused element and its focus ring.

| Variable                              | Value |
| ------------------------------------- | ----- |
| `--silver-spacing-focus-offset`       | `2px` |
| `--silver-spacing-focus-offset-tight` | `1px` |
| `--silver-spacing-focus-offset-loose` | `3px` |

---

### Motion

#### Durations

| Variable                     | Value   |
| ---------------------------- | ------- |
| `--silver-durations-fastest` | `50ms`  |
| `--silver-durations-faster`  | `100ms` |
| `--silver-durations-fast`    | `150ms` |
| `--silver-durations-normal`  | `200ms` |
| `--silver-durations-slow`    | `300ms` |
| `--silver-durations-slower`  | `400ms` |
| `--silver-durations-slowest` | `500ms` |

#### Easings

| Variable                   | Value                          |
| -------------------------- | ------------------------------ |
| `--silver-easings-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--silver-easings-linear`  | `linear`                       |
| `--silver-easings-in`      | `cubic-bezier(0.4, 0, 1, 1)`   |
| `--silver-easings-out`     | `cubic-bezier(0, 0, 0.2, 1)`   |
| `--silver-easings-in-out`  | `cubic-bezier(0.4, 0, 0.2, 1)` |

---

### Spacing scale

The full spacing scale used for margins, padding, and gaps. Only custom values
from `panda.config.ts` are listed above in component sizing; the rest follow the
default Panda CSS spacing scale (`--silver-spacing-0` through
`--silver-spacing-96`).

---

### Base color scales

These are the raw color palettes that semantic tokens reference. Override
semantic tokens (above) rather than these unless you need to change the entire
palette.

Each scale has steps `50` through `900`.

| Scale          | Variable prefix                    | Base color                         |
| -------------- | ---------------------------------- | ---------------------------------- |
| silver-primary | `--silver-colors-silver-primary-*` | ![](swatches/547a95.svg) `#547A95` |
| silver-neutral | `--silver-colors-silver-neutral-*` | ![](swatches/6a7b8c.svg) `#6A7B8C` |
| green          | `--silver-colors-green-*`          | ![](swatches/65c37e.svg) `#65c37e` |
| red            | `--silver-colors-red-*`            | ![](swatches/d92644.svg) `#d92644` |
| yellow         | `--silver-colors-yellow-*`         | ![](swatches/d9a626.svg) `#d9a626` |
| blue           | `--silver-colors-blue-*`           | ![](swatches/267dd9.svg) `#267dd9` |

Additionally, all default Panda CSS color palettes are available (rose, pink,
fuchsia, purple, violet, indigo, cyan, teal, orange, etc.) with steps
`50`--`950`.
