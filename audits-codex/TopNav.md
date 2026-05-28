# TopNav Audit

Audited the exported Silver UI implementation in `src/components/TopNav/*`, its Storybook story, related AppShell/mobile integration, and the root `TopNav/TopNav.doc.mjs` / `TopNav/XDSTopNav*.test.tsx` files that appear to be an untracked XDS-style copy.

## Findings

### Medium: `TopNavItem` without `href` navigates to `#`

- `src/components/TopNav/TopNavItem.tsx:85` defaults `href` to `'#'`, and `src/components/TopNav/TopNavItem.tsx:114-122` only prevents default for disabled items. A consumer can render the documented optional-`href` item as `<TopNavItem label="Home" />`, but clicking it mutates the URL fragment / may scroll to top and closes the mobile nav. The shared `Link` component explicitly avoids this fallback navigation when `href` is omitted (`src/components/Link/Link.tsx:112-121`), so TopNavItem is inconsistent with the rest of the link API.
- Coverage gap: `src/components/TopNav/TopNav.test.tsx:7-27` never exercises an omitted `href` click.

### Medium: `TopNavItem` lacks an `onClick` API despite owning click handling

- `src/components/TopNav/TopNavItem.tsx:11-26` exposes link props but no `onClick`, while `src/components/TopNav/TopNavItem.tsx:115-122` installs an internal click handler that only handles disabled/mobile-close behavior. This prevents action-style nav items, analytics hooks, or consumer `preventDefault` logic. The neighboring `SideNavItem` supports this pattern (`src/components/SideNav/SideNavItem.tsx:22`, `src/components/SideNav/SideNavItem.tsx:134-142`).
- Coverage gap: no tests validate click behavior, disabled click suppression, or mobile drawer closing.

### Medium: Published docs appear mismatched to the exported component

- The exported package surface is `TopNav`, `TopNavHeading`, and `TopNavItem` from `src/index.ts:380-394`.
- The only TopNav doc file found is `TopNav/TopNav.doc.mjs`, which documents `XDSTopNav` and XDS-only APIs/classes such as `xstyle`, mega menus, and XDS class names (`TopNav/TopNav.doc.mjs:16-23`, `TopNav/TopNav.doc.mjs:28-80`). Those components are not exported by `src/components/TopNav/index.ts:1-10`.
- If this doc file feeds user-facing docs, it will describe props and subcomponents that do not exist on the Silver UI TopNav implementation.

### Low: External/new-tab link behavior is underspecified

- `TopNavItem` accepts `target` and `rel` (`src/components/TopNav/TopNavItem.tsx:23-25`, `src/components/TopNav/TopNavItem.tsx:124-127`) but does not default `rel="noopener noreferrer"` for `target="_blank"` or add an accessible "opens in new tab" cue. The shared `Link` component handles this (`src/components/Link/Link.tsx:114-116`, `src/components/Link/Link.tsx:145-155`).
- This is partly an API clarity issue: either TopNavItem should inherit Link's external-link behavior or docs/stories should show the required `rel`/label pattern.

### Low: Stories cover only the default happy path

- `src/components/TopNav/TopNav.stories.tsx:18-27` has a single `Basic` story.
- Missing important prop/state stories: `centerContent`, explicit `startContent` vs `children`, `endContent` without center content, heading `logo`/`superheading`/`subheading`/`headingHref`, `TopNavItem` `icon`, `isIconOnly`, `isDisabled`, custom `as`, and mobile/AppShell render modes.

### Low: Tests do not cover most public behavior

- The local test suite has one assertion path (`src/components/TopNav/TopNav.test.tsx:7-27`).
- Missing key tests: `centerContent` grid layout branch (`src/components/TopNav/TopNav.tsx:146-180`), `startContent` precedence over `children` (`src/components/TopNav/TopNav.tsx:95`), mobile-bar rendering/toggle conditions (`src/components/TopNav/TopNav.tsx:101-118`), drawer rendering/null behavior (`src/components/TopNav/TopNav.tsx:121-143`), `TopNavHeading` link rendering (`src/components/TopNav/TopNavHeading.tsx:65-76`), `TopNavItem` selected/disabled/icon-only/custom-link behavior (`src/components/TopNav/TopNavItem.tsx:100-135`), and AppShell mobile integration (`src/components/AppShell/AppShell.tsx:346-354`, `src/components/AppShell/AppShell.tsx:473-479`).

## Category Notes

- Performance: no material performance issue found in the TopNav implementation. The inline `TopNavItem` click handler is not a meaningful concern by itself.
- Accessibility: issues noted above for fallback `#` links, optional unlabeled nav landmarks, and new-tab/external-link behavior. Icon-only items do set `aria-label` when `isIconOnly` is true (`src/components/TopNav/TopNavItem.tsx:104`).
- Logic bugs: the omitted-`href` fallback navigation is the main logic concern.
- API clarity: `href` being optional while defaulting to a real `#` navigation, missing `onClick`, and the mismatch with `Link` external-link behavior are unclear.
- Missing stories/tests: significant gaps; only one TopNav story and one local TopNav test cover the exported component.
