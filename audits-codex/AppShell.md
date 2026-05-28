# AppShell Audit

Audited source: `src/components/AppShell/AppShell.tsx`, `AppShellMobileContext.tsx`, `useSlotPresence.tsx`, `AppShell.recipe.ts`, `index.ts`, `AppShell.stories.tsx`, `AppShell.test.tsx`, related `Layout`/`TopNav`/`SideNav`/`MobileNav` collaborators, and the top-level `AppShell/AppShell.doc.mjs` docs copy.

Verification: `npm test -- src/components/AppShell/AppShell.test.tsx` passes, 3 tests. An initial `--runInBand` attempt failed because Vitest does not support that Jest flag.

## Findings

### High

1. `mobileNav={{content}}` renders outside the mobile breakpoint and disable guards. `mobileNavConfigContent` is rendered unconditionally after the custom ReactNode slot, so raw content can appear on desktop and even when the generated drawer is otherwise not being rendered. This also means config content is not gated by `mobileNavEnabled`, `isBelowBreakpoint`, or `isMobileNavDisabled`. See `src/components/AppShell/AppShell.tsx:251` and `src/components/AppShell/AppShell.tsx:461`.

### Medium

2. `MobileNavConfig.defaultIsMobile` is a dead prop. The interface documents it as the SSR initial mobile-layout hint, but `AppShell` never reads it and `useMediaQuery` always returns `false` for the server snapshot. Mobile SSR consumers cannot opt into the promised initial mobile layout. See `src/components/AppShell/AppShell.tsx:49`, `src/components/AppShell/AppShell.tsx:253`, and `src/internal/useMediaQuery.ts:3`.

3. The public docs describe props that the shipped component does not support, and miss props it does support. `AppShell/AppShell.doc.mjs` says `mobileNav` accepts `false`, documents `isSideNavCollapsed`, `defaultIsSideNavCollapsed`, `onSideNavCollapsedChange`, `xstyle`, `sideNavBreakpoint`, and `sideNavWidth`, but `AppShellProps` instead exposes `isMobileNavDisabled`, `className`, `style`, `ref`, and `data-testid`. This makes the API unclear and likely leads consumers to pass no-op props. See `AppShell/AppShell.doc.mjs:44`, `AppShell/AppShell.doc.mjs:65`, `AppShell/AppShell.doc.mjs:89`, `AppShell/AppShell.doc.mjs:168`, and `src/components/AppShell/AppShell.tsx:70`.

4. `mobileNav={false}` is ambiguous and behaves differently from the docs. The source type does not explicitly include `false`; at runtime `false` falls through both the config and ReactNode branches, so auto mobile nav remains enabled unless callers use `isMobileNavDisabled`. See `src/components/AppShell/AppShell.tsx:97`, `src/components/AppShell/AppShell.tsx:240`, and `AppShell/AppShell.doc.mjs:47`.

5. The skip link target is not focusable. The link points at `#silver-app-shell-main`, but the target is a `div role="main"` with no `tabIndex`; activating the skip link may scroll without moving keyboard focus into main content. Prefer a semantic `<main>` or a focusable target. See `src/components/AppShell/AppShell.tsx:133`, `src/components/AppShell/AppShell.tsx:443`, and `src/components/Layout/LayoutContent.tsx:68`.

### Low

6. `useSlotPresence` observes the full subtree even though it only checks direct child nodes. This can fire on unrelated descendant mutations in large or dynamic nav trees. See `src/components/AppShell/useSlotPresence.tsx:3` and `src/components/AppShell/useSlotPresence.tsx:38`.

7. The same callback presence refs are attached in multiple conditional render paths. `topNavPresenceRef` is used at `src/components/AppShell/AppShell.tsx:350` and `src/components/AppShell/AppShell.tsx:366`; `sideNavPresenceRef` is used at `src/components/AppShell/AppShell.tsx:330`, `src/components/AppShell/AppShell.tsx:385`, and `src/components/AppShell/AppShell.tsx:395`. During breakpoint transitions, the `null` ref callback can transiently mark content absent and drive layout/drawer decisions from stale presence state.

8. Performance is otherwise acceptable for the current component size. No expensive render-time loops or synchronous layout reads are present outside the auto-height `ResizeObserver` path; the main concern is the broad mutation observer above.

## Missing Tests

Current source tests cover only basic main/skip-link rendering, slot rendering, and a side-nav-only mobile affordance. Important missing coverage:

- `mobileNav` config behavior: `content`, `breakpoint`, `hasToggle`, controlled `isOpen`, `onOpenChange`, and `defaultIsMobile`.
- `mobileNav` as a custom ReactNode and `isMobileNavDisabled`.
- Combined `topNav` plus `sideNav` mobile drawer behavior.
- `height="auto"` sticky header/side-nav behavior and `height="fill"` scroll containment.
- `variant` behavior, especially `section` dividers and `elevated` conditional surface/backdrop.
- `contentPadding`, `className`, `style`, `data-testid`, and `ref` pass-through.
- `useSlotPresence` content detection and cleanup.

## Missing Stories

Current stories are `Basic` and `WithBanner`; controls expose `height` and `variant`, and `contentPadding` is set in args. Missing story coverage:

- Mobile/responsive drawer behavior, preferably with a mobile viewport.
- `mobileNav` config content, controlled open state, custom breakpoint, and disabled mobile nav.
- Side-nav-only shell, which exercises the generated mobile top bar.
- `height="auto"` with long content.
- Dedicated visual examples for `wash`, `surface`, `section`, and `elevated`.
- Content-only shell with no nav.

## Categories With No Additional Issues

Accessibility has the skip-link focus issue above; no other confirmed landmark or button-label defects were found in the audited paths. Logic bugs are covered by findings 1, 2, 4, and 7. API clarity concerns are covered by findings 3 and 4.
