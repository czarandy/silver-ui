# Accordion Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Accordion/Accordion.tsx`
- `src/components/Accordion/AccordionContext.tsx`
- `src/components/Accordion/AccordionItem.tsx`
- `src/components/Accordion/useCollapsible.ts`
- `src/components/Accordion/Accordion.test.tsx`
- `src/components/Accordion/index.ts`

**Files missing:**

- No `.stories.tsx` file exists
- No `.recipe.ts` file exists

---

## Performance Problems

1. **`isOpen` callback re-created on every state change (Accordion.tsx, line 50-53):**
   The `isOpen` callback depends on `openValues`, which is a new array reference on every render (produced by `normalizeToArray` on line 46-48). This means `isOpen` is re-created every render, which cascades: `contextValue` (line 82-85) gets a new object reference every render, causing all context consumers (`AccordionItem` components) to re-render even when the open state has not actually changed. For accordions with many items, this is unnecessary work. Consider storing `openValues` as a `Set` in a ref or memoizing the array identity with `useMemo`.

2. **`toggle` callback re-created on every render (Accordion.tsx, line 55-79):**
   The `toggle` callback closes over `openValues`, which changes reference every render (see above). This contributes to the context value changing every render. Using a ref for `openValues` inside the callback would allow `toggle` to have a stable identity.

3. **`normalizeToArray` called unconditionally on every render (Accordion.tsx, line 46-48):**
   Even in controlled mode, `normalizeToArray(controlledValue)` creates a new array on each render. This is cheap but contributes to the cascading re-render issue described above.

4. **Content is always mounted in the DOM (AccordionItem.tsx, line 110):**
   Collapsed content is hidden via the `hidden` attribute but remains in the DOM. For accordions with heavy content (e.g., large forms, images), this means all content is rendered upfront. A `lazy` or `unmountOnHide` prop would let consumers opt into deferred/conditional rendering.

---

## Accessibility Concerns

1. **Missing `aria-controls` on trigger button (AccordionItem.tsx, line 96-100):**
   The WAI-ARIA Accordion pattern requires the trigger button to have `aria-controls` pointing to the `id` of the associated content panel. Currently, the trigger has `aria-expanded` but no `aria-controls`, and the content `<div>` (line 110) has no `id`. Use `useId()` to generate a stable ID for the content region and wire `aria-controls` accordingly.

2. **Missing `role="region"` and `aria-labelledby` on content panel (AccordionItem.tsx, line 110):**
   Per the WAI-ARIA Accordion pattern, each content panel should have `role="region"` and `aria-labelledby` referencing the trigger button's `id`. Neither is present. The trigger button also lacks an `id`.

3. **No keyboard navigation between items (Accordion.tsx):**
   The WAI-ARIA Accordion pattern recommends Arrow Up/Down to move focus between accordion triggers, Home/End to jump to the first/last trigger. Currently, each trigger is a standalone `<button>`, so the only navigation is Tab, which cycles through all focusable elements on the page. For a small accordion this is acceptable; for a large one, arrow-key navigation is expected by screen reader users.

4. **No `disabled` prop support (AccordionItem.tsx):**
   There is no way to disable an individual accordion item. A disabled item should have `aria-disabled="true"` (or `disabled` on the button) and should not toggle on click. This is a common pattern in accordion APIs (Radix, Chakra).

5. **Wrapper `<div>` on Accordion has no semantic role (Accordion.tsx, line 89-96):**
   The outer container is a plain `<div>`. While not strictly required, adding an `id` or an accessible label (`aria-label` or `aria-labelledby`) would help screen reader users understand the accordion as a group.

---

## Logic Bugs

1. **`useCollapsible` toggle skips `onOpenChange` when using internal state (useCollapsible.ts, lines 54-61):**
   When an `AccordionItem` is standalone (no group, no controlled `isOpen`) and has an `onOpenChange` callback but no explicit `isOpen`, the toggle function (line 57-58) checks `config?.onOpenChange` _before_ falling through to `setInternalIsOpen`. However, the condition on line 57 is `else if (config?.onOpenChange)` -- if `onOpenChange` is provided, internal state is _never_ updated. This means a standalone `AccordionItem` with only `onOpenChange` (no `isOpen`) becomes stuck: it calls the callback but never updates its own state. The consumer would need to provide `isOpen` to make it work, but the types suggest `onOpenChange` alone should be valid.

2. **`isDefaultOpen` defaults to `true` for accordion group items (AccordionItem.tsx, line 83):**
   When `controlledIsOpen` is undefined, the config fallback is `{defaultIsOpen: isDefaultOpen ?? true}`. This means an `AccordionItem` inside an `Accordion` group (with a `value` prop) will initialize its _internal_ state to `true` via `useCollapsible` line 42-43. However, when `isControlledByGroup` is true (line 36-38), the initial state is also hardcoded to `true`, which is correct since the group controls visibility. The real issue is: if an `AccordionItem` is used standalone _without_ explicitly passing `isDefaultOpen={false}`, it starts open. This may surprise consumers who expect a closed default.

3. **`onChange` emits empty string for single mode when closing (Accordion.tsx, line 73):**
   When closing the only open item in single mode, `nextValues` is `[]`, so `nextValues[0] ?? ''` produces an empty string. The `onChange` type signature is `(value: string | string[]) => void`, so the consumer receives `''`. This is inconsistent -- the consumer might expect `undefined` or `null` to indicate "nothing selected." The empty string is a valid `value` prop, so this could cause confusion.

4. **Controlled `value` of `''` (empty string) is treated as controlled mode (Accordion.tsx, line 41):**
   `isControlled` is `controlledValue !== undefined`. If a consumer passes `value=""`, the accordion enters controlled mode with an empty string, which `normalizeToArray` converts to `['']`. Any `AccordionItem` with `value=""` would then be open. This edge case is subtle and could be a source of bugs.

---

## Unclear API

1. **Dual control surfaces for open state (AccordionItem.tsx):**
   `AccordionItem` accepts both `isOpen`/`onOpenChange`/`isDefaultOpen` (standalone control) and `value` (group control via `Accordion`). When both are provided, the group wins (useCollapsible.ts line 46-47). This precedence is implicit and not documented. Consumers may be confused about which props to use when.

2. **`type` prop defaults to `'single'` but `defaultValue` accepts `string[]` (Accordion.tsx, lines 15-19):**
   Passing `defaultValue={['a', 'b']}` with the default `type="single"` will open only the items matching those values, but clicking any item will switch to single-item behavior (only one open at a time). The initial state allows multiple open items while the interaction model enforces single. This inconsistency could confuse consumers.

3. **`useCollapsible` is exported from the component directory but not from `index.ts`:**
   The hook is an internal implementation detail but lives alongside public components. If it is intentionally internal, its filename could be prefixed (e.g., `_useCollapsible.ts`) or moved to an `internal/` directory. If it is intended for public use, it should be exported from `index.ts`.

4. **`isCollapsible` option name is confusing (useCollapsible.ts, line 13):**
   The `isCollapsible` option can be `boolean | CollapsibleConfig`. When `true`, it means "use default collapsible behavior." When `false` or `null`, it means "not collapsible." When an object, it configures the behavior. The overloaded semantics of a single prop being both a boolean flag and a configuration object is unusual. In practice, `AccordionItem` always passes a `CollapsibleConfig` object, so the `boolean` variants may be dead code within this component.

---

## Missing Tests

1. **No test for `onChange` callback values in single mode when closing:**
   The test at line 180-213 verifies `onChange` is called with `'b'` when opening Item B, but does not verify what `onChange` receives when closing the last open item (should be `''` per current implementation). This is important to test given the empty-string behavior noted under Logic Bugs.

2. **No test for `onChange` callback values in multiple mode:**
   There is no test verifying the shape of the value passed to `onChange` in multiple mode (should be an array).

3. **No test for `disabled` behavior:**
   Since the component lacks a `disabled` prop, there is naturally no test -- but this is a gap in functionality.

4. **No test for `data-testid` prop:**
   Both `Accordion` and `AccordionItem` accept `data-testid` but it is never tested.

5. **No test for `className` and `style` prop forwarding:**
   Both components accept `className` and `style` but these are never tested.

6. **No test for `ref` forwarding:**
   Both components accept `ref` but ref forwarding is never tested.

7. **No test for `useCollapsible` with `isCollapsible: true` or `isCollapsible: false`:**
   The boolean paths of `isCollapsible` in the hook are untested. While these may be dead code within the Accordion component, they are part of the hook's public interface.

8. **No test for standalone `AccordionItem` with `onOpenChange` but without `isOpen`:**
   This exercises the logic bug described above where internal state is never updated.

9. **No test for edge case: `AccordionItem` inside `Accordion` but without a `value` prop:**
   When `value` is undefined, `isControlledByGroup` is false (useCollapsible.ts line 26), so the item behaves as standalone even though it is inside an `Accordion`. This interaction is untested.

---

## Missing Stories

**There is no stories file at all for the Accordion component.** Every other major component in the project has a `.stories.tsx` file. The following stories should be created:

1. **Basic / Default:** Single-mode accordion with a few items, one open by default.
2. **Multiple mode:** Demonstrates `type="multiple"` with multiple items open.
3. **Controlled:** Demonstrates `value` and `onChange` for controlled behavior.
4. **Default value:** Shows `defaultValue` with a pre-selected item.
5. **Standalone AccordionItem:** An `AccordionItem` used outside of an `Accordion` wrapper.
6. **Default closed:** Standalone item with `isDefaultOpen={false}`.
7. **Nested content:** Accordion items containing rich content (forms, images, other components).
8. **Many items:** Accordion with 10+ items to demonstrate scroll and performance behavior.
9. **Custom trigger content:** Trigger prop receiving JSX (not just a string).
10. **Controlled standalone item:** Demonstrates `isOpen`/`onOpenChange` on a standalone item.
