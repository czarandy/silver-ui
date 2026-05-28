# Field Audit

Reviewed:

- `src/components/Field/Field.tsx`
- `src/components/Field/Field.stories.tsx`
- `src/components/Field/Field.test.tsx`
- `src/components/Field/index.ts`
- `src/components/Field/inputStyles.ts`
- `src/components/Field/inputUtils.tsx`
- `src/components/Field/types.ts`
- Reference/parity files in `XDS_src/Field/`

## Findings

### High: label tooltip is not keyboard reachable

`Field.tsx:211-216` renders `labelTooltip` on a plain `<span>` containing an info icon. `Tooltip` only adds `tabIndex={0}` for text-only children (`src/components/Tooltip/Tooltip.tsx:165-180`); for element children it attaches hover/focus handlers to the first child without making that child focusable (`src/components/Tooltip/Tooltip.tsx:133-159`, `src/components/Tooltip/Tooltip.tsx:188-197`). Keyboard-only users cannot tab to the info icon, so tooltip-only label help is unavailable unless they happen to focus the associated input and the tooltip content is duplicated elsewhere.

### Medium: description/status association is easy to miss for direct Field usage

`Field.tsx:185-190` auto-generates description and status IDs, but `Field` cannot apply those IDs to arbitrary `children`; callers must add `aria-describedby` themselves. The only Storybook example renders a description with `<input id="field-story" />` and no `aria-describedby` (`Field.stories.tsx:13-17`), so the documented example demonstrates inaccessible helper text. The main test also only asserts that text renders (`Field.test.tsx:6-20`), not that the control is associated with the generated or supplied IDs.

### Medium: mutually exclusive required/optional props are silently accepted

`Field.tsx:191` resolves `statusText` with `isOptional` taking precedence over `isRequired`, but the public props do not document the conflict (`Field.tsx:63-72`) and no warning is emitted. The XDS reference explicitly treats these props as mutually exclusive and warns when both are set (`XDS_src/Field/XDSField.tsx:100-108`, `XDS_src/Field/XDSField.tsx:180-184`). Silent precedence can produce forms whose visible label says "Optional" while the child control still has `required`/`aria-required` from a parent component.

### Medium: tests miss most Field behavior and accessibility contracts

`Field.test.tsx:5-42` only covers basic rendering and root props. Missing coverage includes label-to-control association via `getByLabelText`, generated/custom `descriptionID` and `status.messageID`, `aria-live`/role behavior for warning and success statuses, `isLabelHidden`, optional/required indicators including the both-true case, `isDisabled` label styling, `labelIcon`, `labelTooltip`, and `statusVariant="detached"`. The reference XDS test covers many of these behaviors in `XDS_src/Field/XDSField.test.tsx:18-265`.

### Medium: stories do not demonstrate important props

`Field.stories.tsx:13-18` only exports `Default`. There are no stories for `isLabelHidden`, `descriptionID`/`aria-describedby`, `status` types, `statusVariant="detached"`, `isOptional`, `isRequired`, `isDisabled`, `labelIcon`, or `labelTooltip`. Those are core Field responsibilities and need visual/interaction examples, especially because Field is the wrapper used by most input components.

### Low: local docs are missing or mismatched with the exported component

There is no `src/components/Field/*.doc.*` file. The only Field docs found are under `XDS_src/Field/Field.doc.mjs`, and they describe XDS names/types such as `inputID`, `XDSIconType`, and `xstyle` (`XDS_src/Field/Field.doc.mjs:43-48`, `XDS_src/Field/Field.doc.mjs:96-129`) rather than the exported `src` API, which uses `inputId`, `ReactNode` label icons/tooltips, `className`, and `style` (`Field.tsx:50-101`).

### Low: `isDisabled` API can be misunderstood

`Field.tsx:54-57` says "Whether the associated control is disabled," but the implementation only changes label styling (`Field.tsx:193-198`) and does not disable, annotate, or clone the child control. That is reasonable for a generic wrapper, but the prop description should say it is visual/contextual only and callers must disable the actual control.

## Categories With No Issues Found

- Performance: no material performance issue found. Field builds a small fixed tree and does not do expensive work per render.
- Core rendering logic: label, description, children, attached/detached status placement, root `className`/`style`/`data-testid`, and ref forwarding are straightforward and covered at least minimally (`Field.tsx:248-277`, `Field.test.tsx:22-41`).
- Exports: `src/components/Field/index.ts:1-8` exports the component, Field types, input styles, and shared input types.
