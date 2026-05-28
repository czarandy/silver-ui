# Switch Audit

Reviewed:

- `src/components/Switch/Switch.tsx`
- `src/components/Switch/Switch.stories.tsx`
- `src/components/Switch/Switch.test.tsx`
- `src/components/Switch/index.ts`
- `src/index.ts`
- Reference/parity files in `XDS_src/Switch/`

## Findings

### Medium: `isRequired` and `isOptional` can contradict each other

`Switch.tsx:288-292` renders the requiredness text as `Optional` when both `isOptional` and `isRequired` are true, but `Switch.tsx:308` still sets the native `required` attribute. That creates a visible label saying optional while assistive tech/browser validation treats the switch as required. The props should be made mutually exclusive at the type/runtime level, or one state should consistently win in both UI and DOM. There is no test covering this combination.

### Medium: label tooltip content is not keyboard-accessible from the switch

`Switch.tsx:351-356` renders `labelTooltip` on an info icon inside the label. The local `Tooltip` implementation attaches `aria-describedby` to the wrapped icon element (`src/components/Tooltip/Tooltip.tsx:138-148`), not to the switch input, and the icon wrapper is not focusable. Keyboard and screen reader users focusing the switch get the label/description/status, but not the tooltip help text. If `labelTooltip` is intended as field help, it should be reachable from the input or the trigger should be focusable with an accessible name.

### Medium: important public behavior is not tested

`Switch.test.tsx:7-45` only covers `onChange`, controlled checked state, and disabled/loading rendering. Missing coverage includes label click, keyboard Space behavior, disabled/loading no-op behavior, `description` and `status` `aria-describedby`, `aria-invalid`, hidden-label accessibility, `isRequired`, `isOptional`, `labelPosition`, `labelSpacing`, `labelIcon`, `labelTooltip`, `onFocus`, `onBlur`, and ref forwarding. The XDS reference test has broader coverage (`XDS_src/Switch/XDSSwitch.test.tsx:17-338`), but it tests a different component/API (`value`, `changeAction`) and does not protect the exported `src/components/Switch` implementation.

### Medium: stories do not demonstrate several important props

`Switch.stories.tsx:24-40` provides Default, States, and Error only. There are no stories for `description` without validation, `isLabelHidden`, `isRequired`, `isOptional`, `labelIcon`, `labelTooltip`, `labelPosition="start"`, `labelSpacing="spread"`, warning/success statuses, or focus/controlled callback behavior. This leaves several layout and accessibility states unreviewed in Storybook.

### Low: hidden-label rendering uses invalid HTML nesting

When `isLabelHidden` is true, `Switch.tsx:381-392` wraps `labelNode` in `VisuallyHidden`; `labelNode` starts with a `<div>` at `Switch.tsx:331-364`, while `VisuallyHidden` always renders a `<span>` (`src/internal/VisuallyHidden.tsx:23-31`). A `div` inside a `span` is invalid HTML and can produce React nesting warnings. It probably still hides visually, but the component should avoid invalid markup by allowing `VisuallyHidden` to render a block element or by hiding the label wrapper directly.

### Low: local docs for the exported component are missing

The package root exports `Switch` from `src/components/Switch` (`src/index.ts:443-447`), but there is no local `src/components/Switch/*.doc.*` file. The only doc file found is `XDS_src/Switch/Switch.doc.mjs`, which documents `XDSSwitch` props such as `value` and `changeAction` (`XDS_src/Switch/Switch.doc.mjs:23-38`) rather than the exported `Switch` API using `isSelected` (`Switch.tsx:61-64`). If docs are generated from `src/components`, Switch currently relies on Storybook controls/JSDoc only.

## Categories With No Issues Found

- Performance: no material performance issue found. Styles are module-level and render work is small for a leaf input component.
- Core controlled logic: the input is controlled by `isSelected`, and `onChange` passes the next checked boolean (`Switch.tsx:299-305`).
- Status accessibility: status messages are associated through `aria-describedby`, and error status sets `aria-invalid` (`Switch.tsx:285-298`, `Switch.tsx:397-404`).
- Exports: `src/components/Switch/index.ts:1-6` and `src/index.ts:443-447` export the component and public types.

## Verification

- Ran `pnpm vitest run src/components/Switch/Switch.test.tsx XDS_src/Switch/XDSSwitch.test.tsx`; Vitest executed the public `src/components/Switch/Switch.test.tsx` file and all 3 tests passed. The `XDS_src` test file was not picked up by the current Vitest configuration in that command.
