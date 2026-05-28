# Kbd Audit

Audited 2026-05-28.

Files reviewed:

- `src/components/Kbd/Kbd.tsx`
- `src/components/Kbd/Kbd.stories.tsx`
- `src/components/Kbd/Kbd.test.tsx`
- `src/components/Kbd/index.ts`
- `src/index.ts`
- `XDS_src/Kbd/XDSKbd.tsx`
- `XDS_src/Kbd/Kbd.doc.mjs`
- `XDS_src/Kbd/XDSKbd.test.tsx`

Context: `src/index.ts:175` exports the public `src/components/Kbd` implementation. `XDS_src/Kbd` also exists with docs metadata, but it is a separate XDS surface and describes `XDSKbd`/`xstyle`, not the exported `Kbd` API.

## Findings

### Medium: Shortcuts are always hidden from assistive technology

`Kbd` sets `aria-hidden="true"` on the root wrapper in `src/components/Kbd/Kbd.tsx:132-140`, and `KbdProps` does not accept `aria-label`, `aria-labelledby`, or other span attributes in `src/components/Kbd/Kbd.tsx:5-29`. That makes every shortcut inaccessible to screen readers, even for valid inline help such as "Press <Kbd keys=\"mod+k\" /> to search" or for the standalone `Default` story in `src/components/Kbd/Kbd.stories.tsx:21-32`.

Recommendation: either expose an accessible labeling path and allow `aria-hidden` to be overridden, or document and test that `Kbd` is decorative-only and must be paired with equivalent accessible text elsewhere.

### Medium: Standard span props are not forwarded

The public props are limited to `className`, `data-testid`, `keys`, `ref`, and `style` in `src/components/Kbd/Kbd.tsx:5-29`, and the component destructures only those props in `src/components/Kbd/Kbd.tsx:109-115`. Consumers cannot pass normal span attributes such as `id`, `title`, `aria-describedby`, `aria-label`, `role`, or event handlers.

This makes the accessibility issue above harder to work around and keeps the component API narrower than expected for a small presentational inline element.

Recommendation: extend `React.HTMLAttributes<HTMLSpanElement>` or `ComponentPropsWithoutRef<'span'>`, omit conflicting props as needed, and spread the remaining props onto the root.

### Low: `keys` cannot represent a literal plus key and malformed input is silent

The parser splits on every `+`, trims, lowercases, and drops empty segments in `src/components/Kbd/Kbd.tsx:121-124`. Because `+` is only a delimiter, a shortcut involving the literal plus key cannot be represented. Inputs such as `""`, `"+"`, `"mod+"`, or `"mod++k"` also silently render an empty or normalized shortcut rather than surfacing a consumer mistake.

Recommendation: document the delimiter limitation, add an escape/token for the plus key, and consider a development warning for empty or malformed `keys` values.

### Low: Exported component has stories but no matching component docs metadata

The public component has Storybook stories in `src/components/Kbd/Kbd.stories.tsx`, but there is no colocated docs metadata file under `src/components/Kbd/`. The only Kbd docs file found is `XDS_src/Kbd/Kbd.doc.mjs`, which documents the XDS API including `xstyle` in `XDS_src/Kbd/Kbd.doc.mjs:17-34`; that prop is not part of the exported `KbdProps`.

Recommendation: add docs for `src/components/Kbd`, or make the docs ownership clear so consumers do not read XDS-only props as part of the public API.

### Low: Tests miss several parser and display edge cases

Current tests cover single keys, `mod`, several modifiers/special keys, whitespace, and root prop/ref forwarding in `src/components/Kbd/Kbd.test.tsx:15-74`.

Missing useful coverage:

- `backspace` and `tab`, which are mapped in `src/components/Kbd/Kbd.tsx:61` and `src/components/Kbd/Kbd.tsx:69`.
- All arrow mappings, especially `left` and `right`, from `src/components/Kbd/Kbd.tsx:63-70`.
- Unknown-key fallback through `key.toUpperCase()` in `src/components/Kbd/Kbd.tsx:103`.
- Empty and malformed `keys` strings that exercise `filter(Boolean)` in `src/components/Kbd/Kbd.tsx:121-124`.
- Duplicate keys, which rely on the `keyCounts` logic in `src/components/Kbd/Kbd.tsx:125-130`.

### Low: Stories do not show the full important `keys` surface

Stories include a default `mod+k` and a small shortcuts list in `src/components/Kbd/Kbd.stories.tsx:21-57`. They do not provide a visual reference for the full set of documented special keys from `src/components/Kbd/Kbd.tsx:16-18`, such as `backspace`, `tab`, `left`, and `right`, and they do not explain the platform-adaptive `mod` behavior.

Recommendation: add a special-key catalog story and a short `mod` example/note so the most important `keys` values are visible in Storybook.

## Category Notes

- Performance: no material issues found. Platform detection and key parsing happen during render, but the work is tiny and bounded by a short shortcut string.
- Accessibility: main issues are the unconditional `aria-hidden` and lack of standard ARIA prop forwarding.
- Logic/API clarity: main issue is the ambiguous `keys` grammar for literal `+`, empty input, and malformed delimiter use.
- Tests: present for the happy path and some props, but missing parser/display edge cases listed above.
- Stories/docs: stories exist but are thin; public docs metadata was not found.
