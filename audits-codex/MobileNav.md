# MobileNav Audit

Scope:

- Implementation: `src/components/MobileNav/MobileNav.tsx`, `src/components/MobileNav/MobileNavToggle.tsx`, `src/components/MobileNav/MobileNav.recipe.ts`
- Stories/docs: `src/components/MobileNav/MobileNav.stories.tsx`; no dedicated docs file found for the `src` component.
- Tests: `src/components/MobileNav/MobileNav.test.tsx`; related AppShell smoke coverage in `src/components/AppShell/AppShell.test.tsx`.

## Findings

### High: Controlled-open usage can render an effectively unclosable drawer

`MobileNav` treats `isOpen` as the read source when provided, but if `onOpenChange` is omitted it falls back to `AppShellMobileContext` for writes (`MobileNav.tsx:94-105`). Outside AppShell the default context callbacks are no-ops, so the close button, Escape, and backdrop close paths all call a handler that cannot change the supplied `isOpen` prop (`MobileNav.tsx:139-167`). The current test suite even demonstrates `<MobileNav isOpen>` without `onOpenChange` (`MobileNav.test.tsx:22-30`), but does not try to close it.

Consider making `onOpenChange` required when `isOpen` is supplied, warning in development, or separating controlled and context-driven modes more explicitly.

### Medium: Mobile drawer does not lock page scrolling while open

The open/close effect only calls `dialog.showModal()` and `dialog.close()` (`MobileNav.tsx:109-121`), and `mobileNavRecipe` only hides overflow on the dialog itself (`MobileNav.recipe.ts:12-18`). There is no `documentElement`/`body` scroll lock while the modal drawer is open, so mobile users can still get background scroll or pull-to-refresh behavior behind the drawer in browsers where native dialog inertness does not stop page scroll.

### Medium: `MobileNavToggle` does not expose expanded/controlled state

The toggle reads only `isMobile`, `isMobileNavEnabled`, and `toggleMobileNav` from context (`MobileNavToggle.tsx:23-27`) and renders a button without `aria-expanded` or `aria-controls` (`MobileNavToggle.tsx:30-41`). `Button` also does not currently accept/pass those ARIA attributes (`Button.tsx:30-139`, `Button.tsx:310-325`), so consumers cannot fix this through `MobileNavToggle` props. Screen reader users get the button name but not whether the drawer is open.

### Low: Non-string headers are not reflected in the accessible dialog name

The dialog name is `label`, a string `header`, or the fallback `"Navigation"` (`MobileNav.tsx:135-137`). When `header` is a ReactNode, the visible header renders (`MobileNav.tsx:158-162`) but the accessible name becomes generic unless the consumer also remembers to pass `label`. This API is easy to misuse because `header` looks like the dialog title prop.

### Low: Close/open animation is unlikely to behave as intended

The drawer has transform transitions (`MobileNav.tsx:41-46`, `MobileNav.tsx:48-59`), but closing immediately calls `dialog.close()` when `isOpen` becomes false (`MobileNav.tsx:116-120`) and the recipe removes display for the false state (`MobileNav.recipe.ts:22-28`). That removes the dialog from view before a slide-out transition can play. Opening may also skip the slide-in transition because the element becomes visible with the open transform already applied.

### Low: `useMemo` around the fallback close handler has little value

`onOpenChange` is memoized with the entire `appShellMobile` object as a dependency (`MobileNav.tsx:95-105`). AppShell recreates that context value when open state changes (`AppShell.tsx:306-323`), so this memo will recompute during the main interaction it is meant to stabilize. This is not a functional bug, just unnecessary complexity.

## Tests

Existing tests cover only rendering an open dialog and close-button callback invocation (`MobileNav.test.tsx:21-45`). Missing key coverage:

- Backdrop click path (`MobileNav.tsx:143-147`).
- Native cancel/Escape path (`MobileNav.tsx:139-142`).
- Context-driven mode via `AppShellMobileContext` (`MobileNav.tsx:93-105`).
- `side`, `width`, `label`, and ReactNode `header` props (`MobileNav.tsx:86-91`, `MobileNav.tsx:135-156`, `MobileNav.tsx:158-162`).
- `MobileNavToggle` behavior: hidden when not mobile/disabled, visible when enabled, calls `toggleMobileNav`, and exposes open state once ARIA support exists (`MobileNavToggle.tsx:23-41`).

Targeted verification run: `pnpm vitest run src/components/MobileNav/MobileNav.test.tsx` passed, 2 tests.

## Stories / Docs

Only one story exists, `Controlled` (`MobileNav.stories.tsx:21-37`). Missing stories for important props and behavior:

- `side="start"` versus default `side="end"` (`MobileNav.tsx:89`, `MobileNav.stories.tsx:11-15`).
- Custom `width` (`MobileNav.tsx:91`, `MobileNav.stories.tsx:11-15`).
- Custom `label` and ReactNode `header` (`MobileNav.tsx:84-87`, `MobileNav.tsx:135-162`).
- Context/AppShell-driven usage and `MobileNavToggle` (`MobileNavToggle.tsx:16-41`).

## Categories With No Major Issues

- Performance: no material runtime performance problem found; only the low-value memoization noted above.
- Basic dialog semantics: the component uses native `<dialog>` with `showModal()` and an accessible label fallback (`MobileNav.tsx:109-137`).
