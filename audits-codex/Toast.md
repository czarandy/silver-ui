# Toast Audit

Audited implementation, exports, stories, tests, and XDS reference files:
`src/components/Toast/Toast.tsx`, `ToastViewport.tsx`, `useToast.tsx`, `types.ts`, `Toast.stories.tsx`, `Toast.test.tsx`, and `XDS_src/Toast/*`.

## Findings

### High: dismiss button has low contrast on toast backgrounds

- `src/components/Toast/Toast.tsx:84-85` renders both toast variants with dark backgrounds and white text, but the dismiss control at `src/components/Toast/Toast.tsx:201-207` uses `Button variant="ghost"`.
- The shared ghost button sets `color: 'fg'` in `src/components/Button/Button.recipe.ts:56-58`, overriding the toast's inherited white text. On the dark neutral and red toast surfaces this can make the close icon/focus styling hard to see, and hover/active backgrounds are light-theme surface tokens (`Button.recipe.ts:59-60`).
- The XDS reference wraps toast contents in an inverted media theme before rendering the ghost button, but this port does not have an equivalent surface-context adjustment.

### Medium: `onHide` can fire multiple times for one toast

- `src/components/Toast/ToastViewport.tsx:169-180` calls `entry?.options.onHide?.(reason)` every time `removeToast` is called, then schedules removal 180 ms later.
- During that exit window, the same toast can be removed again by double-clicking the dismiss button, calling the returned dismiss function more than once, or racing an auto-dismiss with a manual dismiss. Because there is no `exitingIds.has(id)` guard before `onHide`, consumers can receive duplicate hide events for one toast.
- Tests currently do not cover idempotent dismiss behavior.

### Low: direct `Toast` API is awkward compared with the public hook API

- `ToastProps` requires `autoHideDuration`, `isAutoHide`, and `type` (`src/components/Toast/Toast.tsx:17-62`), while `ToastOptions` documents defaults for hook usage (`src/components/Toast/types.ts:8-43`) and `ToastViewport` applies those defaults at `src/components/Toast/ToastViewport.tsx:231-244`.
- Since `Toast` is exported publicly from `src/components/Toast/index.ts:1`, consumers can reasonably use it directly, but its required props duplicate internal viewport defaults. This makes the public API less clear than the docs/stories imply.

### Low: exit timeout is hard-coded and not cleaned up on unmount

- `src/components/Toast/ToastViewport.tsx:173-180` uses a fixed `180` ms timeout to remove exiting toasts. If the animation duration token changes, the removal timing can drift from the visual transition.
- Pending removal timeouts are not tracked or cleared if the viewport unmounts while a toast is exiting. This is not a major performance problem, but it is avoidable lifecycle work after unmount.

## Missing Tests

- Error toasts default to persistent (`type: 'error'` makes `isAutoHide` false) at `src/components/Toast/ToastViewport.tsx:231-233`.
- `isAutoHide={false}` and custom `autoHideDuration`.
- Pause/resume on hover and focus (`src/components/Toast/Toast.tsx:144-167`, `190-193`).
- Manual dismiss through the hook's returned dismiss function and `onHide` reasons (`auto` vs `manual`).
- Duplicate dismiss idempotency for `onHide`.
- `collisionBehavior: 'ignore'`; only overwrite is tested at `src/components/Toast/Toast.test.tsx:66-96`.
- `endContent` rendering.
- `maxVisible`, `position`, `inset`, `isTopLayer`, and forwarded refs on `ToastViewport`.
- `useToast` outside `ToastViewport` throwing the documented error (`src/components/Toast/useToast.tsx:21-24`).

Existing tests pass: `pnpm vitest run src/components/Toast/Toast.test.tsx` reports 4 passed.

## Missing Stories / Docs Coverage

- Current stories cover only default, error, and a basic viewport trigger (`src/components/Toast/Toast.stories.tsx:40-53`).
- Important props without stories: `endContent`, `isAutoHide`, `autoHideDuration`, `uniqueID`, `collisionBehavior`, `onHide`, viewport `position`, `maxVisible`, `inset`, and `isTopLayer`.
- There are no Silver-specific rich docs beyond Storybook args/comments. The XDS docs describe best practices and prop semantics, but those are not surfaced for this component.

## Categories With No Major Issues Found

- Performance: no expensive render path or obvious avoidable recomputation found; only the timeout lifecycle note above.
- Core accessibility semantics: live-region roles are present (`status`/`alert`, `aria-live`, `aria-atomic`) at `src/components/Toast/Toast.tsx:180-195`, and auto-hide pauses on hover/focus. The main accessibility issue is the close-button contrast defect.
- Basic logic: showing, default info auto-dismiss, and overwrite deduplication are implemented and covered by tests.
