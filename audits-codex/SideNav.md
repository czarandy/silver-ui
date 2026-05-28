# SideNav Audit

Audited on 2026-05-28.

Files reviewed:

- `src/components/SideNav/SideNav.tsx`
- `src/components/SideNav/SideNavItem.tsx`
- `src/components/SideNav/SideNavSection.tsx`
- `src/components/SideNav/SideNavHeading.tsx`
- `src/components/SideNav/SideNavContext.ts`
- `src/components/SideNav/SideNav.recipe.ts`
- `src/components/SideNav/SideNav.stories.tsx`
- `src/components/SideNav/SideNav.test.tsx`
- `src/components/SideNav/index.ts`
- related AppShell/MobileNav integration and XDS reference files

## Findings

### High: `isCollapsible` exposes unusable built-in button options

`SideNavProps.isCollapsible` accepts `hasButton` and `buttonLabel` in the object form, but `SideNav` never reads them and no `SideNavCollapseButton` component is implemented or exported. See `src/components/SideNav/SideNav.tsx:16` and collapse state setup at `src/components/SideNav/SideNav.tsx:82`. Passing `isCollapsible` only provides context; it does not render a control for users to change the state. `defaultIsCollapsed` can therefore make the nav start collapsed with no built-in way to expand it, and `hasButton`/`buttonLabel` are dead API.

Recommendation: either implement/export a collapse button and wire these options, or remove/rename the options and document that consumers must provide their own context consumer.

### High: collapsed items without icons render as blank controls

When the nav is collapsed, `SideNavItem` hides the label and end content (`src/components/SideNav/SideNavItem.tsx:125`) but still renders the link/button even when `icon` is missing (`src/components/SideNav/SideNavItem.tsx:120`, `src/components/SideNav/SideNavItem.tsx:144`). This produces focusable blank controls with only an `aria-label`, which is confusing visually and for keyboard users.

Recommendation: in collapsed mode, either hide items without icons, keep the text visible, or require/enforce an icon when a collapsible nav is used.

### High: collapsed heading links can become empty accessible controls

`SideNavHeading` hides all text in collapsed mode (`src/components/SideNav/SideNavHeading.tsx:85`) but does not add an `aria-label` to the collapsed link/div. If a heading has `headingHref`/`href` and no logo, or a decorative logo, the rendered link can be empty or unnamed (`src/components/SideNav/SideNavHeading.tsx:73`, `src/components/SideNav/SideNavHeading.tsx:76`).

Recommendation: add an `aria-label` based on `heading` when collapsed, and avoid rendering an empty interactive heading when there is no logo or label.

### Medium: `SideNavSection` nests block markup inside `VisuallyHidden`'s `<span>`

Collapsed or hidden section headers render `<VisuallyHidden>{header}</VisuallyHidden>` (`src/components/SideNav/SideNavSection.tsx:99`). `VisuallyHidden` always renders a `<span>` (`src/internal/VisuallyHidden.tsx:28`), while `header` is a `<div>` (`src/components/SideNav/SideNavSection.tsx:67`). That creates invalid HTML (`span > div`) whenever section headers are visually hidden.

Recommendation: let `VisuallyHidden` choose an element via `as`, or render a hidden block wrapper for section headers.

### Medium: mobile drawer closes even if item click is prevented

`SideNavItem` always calls `closeMobileNav()` after invoking `onClick` (`src/components/SideNav/SideNavItem.tsx:140`). If a consumer calls `event.preventDefault()` in `onClick` because navigation/action should not proceed, the mobile drawer still closes. The item also calls `closeMobileNav` outside drawer render modes, relying on the default no-op context (`src/components/AppShell/AppShellMobileContext.tsx:13`).

Recommendation: close only when running in drawer/drawer-content mode and after checking `!event.defaultPrevented`.

### Medium: `SideNavHeading` has unclear duplicate URL props

`SideNavHeadingProps` exposes both `headingHref` and `href` (`src/components/SideNav/SideNavHeading.tsx:17`), with `headingHref` silently taking precedence (`src/components/SideNav/SideNavHeading.tsx:73`). There is no JSDoc or story explaining why both exist.

Recommendation: document the distinction, or deprecate one prop.

### Medium: tests cover only the default happy path

`src/components/SideNav/SideNav.test.tsx:9` has two tests: rendering one link in the default nav and setting `aria-current`. Missing key coverage:

- collapsible controlled/uncontrolled behavior and collapsed rendering
- `isCollapsible` object options, including currently ignored `hasButton`/`buttonLabel`
- button item path with no `href`, disabled items, `onClick`, and prevented clicks
- `SideNavHeading` link/logo/superheading/subheading/headerEndContent behavior
- `SideNavSection` `role="group"`, `aria-labelledby`, hidden header, subtitle, and endContent
- `topbar`, `drawer`, and `drawer-content` render modes through `SideNavRenderContext`
- `footer`, `footerIcons`, `topContent`, `className`, `style`, `ref`, and custom link component integration

### Medium: stories do not demonstrate important props or states

`src/components/SideNav/SideNav.stories.tsx:16` defines only `Basic`. It does not demonstrate `isCollapsible`, controlled collapse, `topContent`, `footer`, `footerIcons`, disabled items, item `endContent`, button items, section subtitles/end content/hidden headers, heading logo/link/superheading/headerEndContent, overflow behavior, or custom link components.

Recommendation: add focused stories for collapsible, collapsed/default states, footer/top content, rich heading, section variants, item states, and overflow.

## Category Notes

- Performance: no significant performance issue found. Styles are module scoped, the component tree is shallow, and context values are memoized. Collapse toggles will re-render context consumers by design.
- Accessibility: default nav landmark and selected item `aria-current` are present. The main accessibility concerns are collapsed blank/unnamed controls and invalid hidden section markup.
- Logic/API clarity: collapse API is the largest issue because it advertises button configuration without an implementation. Duplicate heading URL props and mobile close behavior are also unclear.
- Tests: insufficient for the component's behavioral surface.
- Stories/docs: the source package has only one Storybook story and no local SideNav doc file; important props are not discoverable by example.
