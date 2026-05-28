# ToggleButton Audit

Scope reviewed:

- `src/components/ToggleButton/ToggleButton.tsx`
- `src/components/ToggleButton/ToggleButtonGroup.tsx`
- `src/components/ToggleButton/ToggleButton.test.tsx`
- `XDS_src/ToggleButton/XDSToggleButton.tsx`
- `XDS_src/ToggleButton/XDSToggleButtonGroup.tsx`
- `XDS_src/ToggleButton/XDSToggleButton.test.tsx`
- `XDS_src/ToggleButton/ToggleButton.doc.mjs`

## Findings

### High: loading state can remove the button's accessible name

In `src/components/ToggleButton/ToggleButton.tsx:199-230`, non-icon-only buttons do not set `aria-label`; their accessible name comes from visible content. When `isBusy` is true, the wrapper around that content gets `aria-hidden` at line 214, and the spinner is also `aria-hidden` at lines 226-230. That can leave a loading ToggleButton with no accessible name while disabled/busy.

Recommendation: keep a stable accessible name during loading, for example by setting `aria-label={label}` when busy or by not hiding the label from assistive tech.

### Medium: child `isDisabled` is ignored inside an enabled group

In `src/components/ToggleButton/ToggleButton.tsx:170`, `const isDisabled = group?.isDisabled ?? isDisabledProp;` means any button inside a group uses the group disabled state whenever a group exists. If the group is enabled (`false`) but an individual child passes `isDisabled`, the child remains enabled. The same behavior exists in `XDS_src/ToggleButton/XDSToggleButton.tsx:229`.

This is either a logic bug or an unclear API. A group-level disabled prop usually disables all children, but should not prevent individual children from being disabled. If the intended API is "group fully overrides child disabled", document it prominently and test it.

### Medium: decorative icons may be included in accessible names

In `src/components/ToggleButton/ToggleButton.tsx:215-217`, the icon wrapper is not `aria-hidden`. Because `label` is required and supplies the action name, decorative text/icon content can be announced as part of the button name when consumers pass text glyphs or non-hidden icon components. The XDS version delegates icon rendering to `XDSButton` at `XDS_src/ToggleButton/XDSToggleButton.tsx:294`; verify that wrapper hides decorative icons there.

Recommendation: hide the icon wrapper from assistive tech unless the API explicitly supports semantic icon content.

### Low: group context is recreated on every render in `src`

`src/components/ToggleButton/ToggleButtonGroup.tsx:138-160` wraps `toggle` in `useCallback`, but the dependency list includes the rest object `props` at line 155. That object is new for every render, so `toggle` and then `contextValue` are also new every render, forcing all consuming ToggleButtons to re-render even when relevant inputs did not change. The XDS version avoids this by depending on `props.value` and `props.onChange` directly at `XDS_src/ToggleButton/XDSToggleButtonGroup.tsx:201-219`.

Recommendation: mirror the XDS dependency pattern in `src`.

### Low: rejected `pressedChangeAction` promises are not handled

`src/components/ToggleButton/ToggleButton.tsx:189-193` uses `Promise.resolve(pressedChangeAction(nextPressed)).finally(...)` and discards the returned promise. If the action rejects, the pending state is cleared, but the rejection still propagates to an unhandled promise. The XDS implementation calls `pressedChangeAction` without pending/error handling at `XDS_src/ToggleButton/XDSToggleButton.tsx:245-247`, despite docs saying it shows a loading spinner.

Recommendation: catch and route errors intentionally, or document that callers must handle rejections internally.

### Low: grouped buttons without `value` silently fall back to standalone behavior

`src/components/ToggleButton/ToggleButton.tsx:165-168` and `:181-184` only use group state when both a group and `value` exist. A ToggleButton rendered inside a ToggleButtonGroup without `value` behaves like a standalone toggle and will not update group selection. The docs say `value` is required in groups (`XDS_src/ToggleButton/ToggleButton.doc.mjs:42`), but the implementation does not warn or fail loudly.

Recommendation: add a development warning for grouped buttons missing `value`, or provide a stricter child API.

## Tests

Existing `src` tests cover visible labels, children, `aria-pressed`, standalone `onPressedChange`, `pressedIcon`, disabled standalone behavior, labelled groups, single selection/deselection, and multiple selection.

Missing important tests:

- Loading and `pressedChangeAction`: pending state, disabled state, `aria-busy`, accessible name while loading, and rejection behavior.
- Icon-only accessibility in `src`: `aria-label` and hidden visible label behavior.
- Group disabled behavior, including the current child-disabled-inside-enabled-group edge case.
- Exact `onChange` payloads for single and multiple groups.
- `orientation`, group `size` inheritance, child `size` override, tooltip wrapping, `data-testid`, `className`, `style`, and `ref` forwarding.
- Grouped button missing `value` behavior.

The XDS tests are broader for basic button/group behavior, but still do not cover async loading, group disabled, orientation, size inheritance, child disabled override semantics, or docs/API mismatches.

## Stories / Docs

No `src/components/ToggleButton/ToggleButton.stories.tsx` file exists, while most components in `src/components` have Storybook stories. `XDS_src/ToggleButton/ToggleButton.doc.mjs` documents props, but it is not a substitute for visible stories demonstrating key states.

Missing stories should cover at least: standalone pressed/unpressed, icon-only, icon plus label, `pressedIcon`, `isLoading`, `pressedChangeAction`, disabled, sizes, tooltip, single-selection group, multiple-selection group, vertical orientation, and group disabled.

## Categories With No Issues Found

- Basic ARIA toggle semantics: `aria-pressed` is set on buttons, and groups use a labelled `role="group"`.
- Major logic for controlled single and multiple selection is covered and appears correct when every grouped button has a `value`.
