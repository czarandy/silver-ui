# Popover Audit

Files reviewed:

- `src/components/Popover/Popover.tsx`
- `src/components/Popover/usePopover.tsx`
- `src/components/Popover/Popover.stories.tsx`
- `src/components/Popover/Popover.test.tsx`
- `src/components/Popover/index.ts`
- `src/internal/useLayer.tsx`
- `src/internal/useFocusTrap.ts`

## Findings

### High: Popover marks a light-dismiss overlay as modal

`src/components/Popover/usePopover.tsx:125-130` renders the dialog with `aria-modal="true"`, while the backing layer defaults to `popover="auto"` through `useLayer({hasLightDismiss: true})` at `src/components/Popover/usePopover.tsx:88` and `src/internal/useLayer.tsx:178-184`. The rest of the page is not made inert, and pointer users can light-dismiss outside the popover. Screen readers may treat outside content as unavailable even though the UI is not a true modal. Remove `aria-modal` for this non-modal popover, or introduce a real modal mode that also enforces inertness.

### High: Dialog can be rendered without an accessible name

`label` is optional in `src/components/Popover/Popover.tsx:66-68` and `src/components/Popover/usePopover.tsx:21`, but `usePopover` only applies `aria-label={label}` at `src/components/Popover/usePopover.tsx:125-130`. Omitting `label` produces an unnamed `role="dialog"`, which is not a valid accessible dialog pattern. Make the label required, provide a safe default, or support an `aria-labelledby` API.

### Medium: Surface styles are applied to both the popover layer and inner dialog

`usePopover.render` applies `styles.surface` to the inner dialog at `src/components/Popover/usePopover.tsx:125-130`, then also merges the same class into the outer layer props at `src/components/Popover/usePopover.tsx:138-144`. This creates nested borders/shadows/backgrounds and extra paint work. It also makes sizing props less predictable because `Popover` applies `width` to the inner content div at `src/components/Popover/Popover.tsx:243-253`, while one visible surface is outside that div.

### Medium: Popover reattaches trigger listeners and ARIA attributes on every render

`Popover` stores the full `popover` return object and uses it in callback/effect dependencies at `src/components/Popover/Popover.tsx:141-163`, `src/components/Popover/Popover.tsx:175-229`, and `src/components/Popover/Popover.tsx:231-241`. `usePopover` returns a fresh object each render at `src/components/Popover/usePopover.tsx:150-165`, so the layout effect tears down and re-adds DOM listeners and ARIA attributes every render. This is avoidable churn for an interactive primitive; memoize the hook return or depend on stable destructured fields.

### Medium: Public controlled behavior is not covered by tests

`isOpen` and `onOpenChange` are public props in `src/components/Popover/Popover.tsx:61-72`, with synchronization logic at `src/components/Popover/Popover.tsx:231-241`. `src/components/Popover/Popover.test.tsx` only checks ARIA attachment, opening by click, external anchor attachment, and content props. There are no tests for initial `isOpen={true}`, closing via `isOpen={false}`, or whether controlled prop synchronization fires `onOpenChange` only when expected.

### Medium: Closing and focus behavior are undertested

The close paths are implemented across `src/components/Popover/usePopover.tsx:89-103`, `src/components/Popover/usePopover.tsx:132-135`, `src/internal/useFocusTrap.ts:43-82`, and `src/internal/useLayer.tsx:141-150`, but `src/components/Popover/Popover.test.tsx` has no coverage for Escape, close button click, clicking the trigger while open, light dismiss/toggle events, focus moving into the popover, `hasAutoFocus={false}`, or focus behavior after close. These are core behaviors for a dialog-like component.

### Low: Trigger cleanup discards pre-existing ARIA attributes

`attachTrigger` unconditionally sets `aria-haspopup`, `aria-expanded`, and `aria-controls` at `src/components/Popover/Popover.tsx:175-188`, then cleanup removes them at `src/components/Popover/Popover.tsx:197-200`. If a consumer-provided trigger already had any of these attributes, unmounting Popover or changing the attached trigger loses the original values. Store and restore prior values instead of blindly removing.

### Low: `anchorRef` and trigger-child modes are under-documented and under-tested

The component supports child trigger mode, external `anchorRef` mode, and the ambiguous combination of both at `src/components/Popover/Popover.tsx:21-28`, `src/components/Popover/Popover.tsx:210-229`, and `src/components/Popover/Popover.tsx:259-270`. Tests cover only that an external button receives `aria-haspopup` at `src/components/Popover/Popover.test.tsx:55-78`; they do not verify click behavior, positioning target precedence, or the both-props case. A story for `anchorRef` is also missing.

### Low: Story coverage misses several important props and states

`src/components/Popover/Popover.stories.tsx` has `Default`, `MatchTriggerWidth`, and `CustomWidth` only. Storybook controls expose `placement`, `alignment`, `isEnabled`, `label`, and `width` at `src/components/Popover/Popover.stories.tsx:9-21`, but no stories demonstrate placement/alignment variations, controlled `isOpen`, disabled `isEnabled={false}`, `anchorRef`, `hasCloseButton={false}`, `hasAutoFocus={false}`, or the exported `usePopover` hook.

### Low: Prop coverage tests are incomplete

Existing tests do not cover `width`, `placement`, `alignment`, `isEnabled`, `hasCloseButton`, `closeButtonLabel`, `hasAutoFocus`, forwarded `ref`, keyboard activation for a non-button `[role="button"]`, or the exported `usePopover` hook. `className`, `style`, and `data-testid` are covered at `src/components/Popover/Popover.test.tsx:80-95`.

## Category Notes

- Performance: one medium issue found around unstable hook return dependencies and repeated listener attachment.
- Accessibility: high issues found for modal semantics and missing dialog naming; focus behavior also needs test coverage.
- Logic bugs: duplicated surface styling and ARIA cleanup are concrete issues; no obvious data corruption or crash path found in the reviewed code.
- API clarity: `children` as trigger vs `content` as body is documented in prop comments, but `anchorRef` combinations and hook-only options are not demonstrated.
- Missing tests: key controlled, close, focus, disabled, positioning, width, and hook behaviors are missing.
- Missing stories: important props have controls but lack dedicated stories showing expected behavior.
