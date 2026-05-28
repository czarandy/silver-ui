# Collapsible Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Collapsible/Collapsible.tsx`
- `src/components/Collapsible/index.ts`
- `src/components/Accordion/AccordionItem.tsx` (underlying implementation)
- `src/components/Accordion/useCollapsible.ts` (underlying hook)
- `src/components/Accordion/AccordionContext.tsx` (context used by hook)
- `src/components/Accordion/Accordion.tsx` (group coordinator)
- `src/components/Accordion/Accordion.test.tsx` (tests for AccordionItem/Accordion, none for Collapsible)

**Missing files:**

- No `Collapsible.test.tsx` exists
- No `Collapsible.stories.tsx` exists
- No `Collapsible.recipe.ts` exists (component delegates styling to AccordionItem)

---

## Performance Problems

**No significant performance issues found.**

- The Collapsible component is a thin wrapper around AccordionItem -- it destructures a few props and forwards the rest via spread. There is no state, no effects, no memoization, and no allocations beyond the props object.
- The underlying `useCollapsible` hook (useCollapsible.ts) creates a new `toggle` closure on every render (line 54). This closure captures `isOpen` via the outer scope, so it is re-created whenever props or state change. This is standard React practice and not a real concern for a disclosure widget, but consumers who pass `toggle` as a prop to memoized children may see unnecessary re-renders. If this ever becomes a concern, wrapping `toggle` in `useCallback` would stabilize the reference.
- The `config` object (AccordionItem.tsx, lines 80-83) is re-created every render. This is a plain object used only within the same render cycle, so it is harmless.

---

## Accessibility Concerns

1. **Missing `aria-controls` linking trigger to content panel (AccordionItem.tsx, lines 96-113):**
   The trigger button has `aria-expanded` (line 97) but does not have `aria-controls` pointing to the content region's `id`. The WAI-ARIA Accordion Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) requires `aria-controls` on the trigger to programmatically associate it with the panel it controls. The content `<div>` (line 110) also lacks an `id` and a `role="region"` with `aria-labelledby` pointing back to the trigger.

2. **No `id` attributes generated for trigger or content (AccordionItem.tsx):**
   Neither the trigger `<button>` nor the content `<div>` has an `id`. Without IDs, it is impossible to establish the `aria-controls` / `aria-labelledby` relationship. The XDS reference implementation also omits this, but it is a deviation from the WAI-ARIA specification.

3. **Content is hidden via the `hidden` HTML attribute (AccordionItem.tsx, line 110):**
   Using `hidden` is semantically correct and removes content from the accessibility tree when collapsed. This is good. However, there is no transition or animation on expand/collapse, which means the content appears/disappears abruptly. This is not an accessibility violation but could be a usability concern for users who benefit from motion cues. (The XDS reference uses `display: none` via a CSS class, which is functionally equivalent.)

4. **No keyboard navigation between multiple Collapsible items:**
   When multiple Collapsible components are used together (standalone, not inside an Accordion), there is no arrow-key navigation between triggers. The WAI-ARIA Accordion Pattern recommends Up/Down arrow keys to move focus between triggers. This is acceptable for a standalone Collapsible (which is not an accordion), but worth noting since the component is built on AccordionItem.

5. **No `role` on the root container (AccordionItem.tsx, line 91):**
   The root `<div>` has no semantic role. For a standalone disclosure widget, this is acceptable (the `<button>` with `aria-expanded` is sufficient). For grouped accordion usage, the Accordion component (Accordion.tsx, line 89) also renders a plain `<div>` without `role` -- no `role="region"` or heading structure is enforced.

---

## Logic Bugs

1. **`isDefaultOpen` defaults to `true` when unspecified -- potentially surprising (AccordionItem.tsx, line 83):**
   When `Collapsible` is rendered without `isDefaultOpen` or `isOpen`, the config is `{defaultIsOpen: isDefaultOpen ?? true}`, meaning all Collapsible components start open by default. This matches the XDS reference (useXDSCollapsible.ts, line 101: `config?.defaultIsOpen ?? true`), but it contradicts the common expectation that a "collapsible" component starts collapsed. The prop name `isDefaultOpen` makes the behavior clear, but omitting the prop entirely yields an always-open component, which may confuse consumers who expect opt-in expansion.

2. **Controlled mode with `onOpenChange` but no `isOpen` triggers internal state toggle (useCollapsible.ts, lines 54-62):**
   When a consumer passes `onOpenChange` without `isOpen`, the component is in uncontrolled mode. Clicking the trigger calls `config.onOpenChange(!isOpen)` (line 58) but does NOT call `setInternalIsOpen` (line 60 is in the `else` branch). This means the callback fires but the internal state does not change. The consumer would need to also provide `isOpen` to make the callback effective, but the API does not enforce this pairing. This is arguably correct for a controlled/uncontrolled pattern, but it creates a subtle trap: passing only `onOpenChange` results in a component that fires the callback but never actually toggles.

   **Reproduction:** `<Collapsible trigger="Test" onOpenChange={console.log}>content</Collapsible>` -- clicking the trigger logs `false` to the console but the content never collapses. Subsequent clicks continue to log `false` because `isOpen` remains the internal state value of `true`, which never updates.

3. **`value` prop from `CollapsibleProps` leaks into `AccordionItem` via rest spread (Collapsible.tsx, line 22):**
   `CollapsibleProps` does not declare a `value` prop, but `AccordionItemProps` does. Since Collapsible uses `...props` rest spread (line 26), any `value` prop passed by a consumer would be forwarded to AccordionItem. If an AccordionContext happens to be present in the tree (e.g., a Collapsible rendered inside an Accordion), the Collapsible would unexpectedly participate in the Accordion's group coordination. This is a minor concern since the `value` is not in `CollapsibleProps` and TypeScript would flag it, but the runtime behavior could still surprise consumers using `as any` or JSX spread.

4. **Collapsible inside an Accordion inherits group behavior silently (useCollapsible.ts, lines 26-27):**
   The `useCollapsible` hook unconditionally reads `AccordionContext`. If a Collapsible is rendered as a descendant of an Accordion (even unintentionally, e.g., inside a dialog that happens to be within an Accordion), and if it somehow receives a `value` prop, it would be controlled by the Accordion's group state. The Collapsible wrapper does not isolate itself from the AccordionContext. This is by design (Collapsible IS an AccordionItem), but the naming suggests independence.

---

## Unclear API

1. **Collapsible is a pure re-export of AccordionItem with no behavioral difference (Collapsible.tsx):**
   The entire component is a passthrough to AccordionItem. The only difference is the display name and the omission of the `value` prop from `CollapsibleProps`. The relationship between Collapsible and AccordionItem is not documented anywhere. A consumer might wonder: when should I use Collapsible vs. AccordionItem? The answer (Collapsible is for standalone use, AccordionItem is for use inside Accordion) is implicit but not stated.

2. **Neither Collapsible nor Accordion is exported from the library (src/index.ts):**
   The main barrel file does not export Collapsible, CollapsibleProps, Accordion, AccordionItem, or AccordionProps. Consumers cannot actually use either component without deep-importing from `src/components/Collapsible` or `src/components/Accordion`. This may be intentional (components may be in development), but it means the components are effectively internal/private despite having public-facing interfaces.

3. **No JSDoc comments on `CollapsibleProps` (Collapsible.tsx, lines 4-14):**
   The XDS reference has detailed JSDoc on every prop (XDSCollapsible.tsx, lines 91-131). The silver-ui version has none. Key details like "defaults to open" for `isDefaultOpen` and the controlled/uncontrolled pattern for `isOpen`/`onOpenChange` should be documented.

4. **`trigger` is typed as `ReactNode` but always wrapped in a `<span>` (AccordionItem.tsx, line 101):**
   This means block-level elements passed as `trigger` will be wrapped in an inline `<span>`, which produces invalid HTML (e.g., `<span><h2>Title</h2></span>`). The XDS reference has the same pattern (XDSCollapsible.tsx, line 211). If the intent is to allow any content, `<div>` would be safer, but that also has issues inside `<button>`. The trigger content should be limited to phrasing content, which the type does not enforce.

---

## Missing Tests

**The Collapsible component has zero tests.** There is no `Collapsible.test.tsx` file. All existing tests are in `Accordion.test.tsx` and test `AccordionItem` directly. While Collapsible is a thin wrapper, the following behaviors should be tested through the Collapsible interface:

1. **Basic rendering:** Collapsible renders trigger and children.
2. **Default open state:** Collapsible starts open when no props are provided.
3. **`isDefaultOpen={false}`:** Collapsible starts collapsed.
4. **Toggle on click:** Clicking the trigger toggles content visibility.
5. **Controlled mode (`isOpen` + `onOpenChange`):** Collapsible respects external state.
6. **Keyboard activation:** Enter and Space toggle the trigger.
7. **`ref` forwarding:** The `ref` prop reaches the root `<div>`.
8. **`className` and `style` forwarding:** These props are applied to the root element.
9. **`data-testid` forwarding:** The test ID is applied to the root element.
10. **`aria-expanded` attribute:** The trigger button reflects the current open state.

The XDS reference has a comprehensive test file (`XDS_src/Collapsible/XDSCollapsibleGroup.test.tsx`) covering standalone behavior, group coordination, controlled mode, keyboard activation, and accessibility attributes. The silver-ui Collapsible has none of this.

---

## Missing Stories

**The Collapsible component has zero stories.** There is no `Collapsible.stories.tsx` file. The following stories would be valuable:

1. **Default (open):** Basic Collapsible with trigger text and content, demonstrating the default open state.
2. **Initially collapsed (`isDefaultOpen={false}`):** Shows the component starting in a collapsed state.
3. **Controlled mode:** Demonstrates `isOpen` and `onOpenChange` with external state management.
4. **Custom trigger content:** Shows that `trigger` accepts arbitrary ReactNode (e.g., an icon + text layout).
5. **Long content:** Demonstrates behavior with a large amount of content to show there is no height animation.
6. **Multiple Collapsibles:** Shows several independent Collapsibles on a page (each managing its own state).
7. **Nested Collapsibles:** A Collapsible inside another Collapsible's content area.
8. **With className/style:** Demonstrates custom styling via the `className` and `style` props.

Additionally, there are no Accordion stories either (`Accordion.stories.tsx` does not exist), which means the underlying component that Collapsible delegates to also lacks visual documentation.

---

## Additional Observations

- **The component is extremely thin (34 lines including imports and types).** The entire implementation is a delegation to AccordionItem. This raises the question of whether a separate Collapsible component is justified, or whether AccordionItem should simply be used directly. The XDS reference supports this separation (XDSCollapsible exists independently of XDSCollapsibleGroup), so the architectural intent is sound, but the silver-ui implementation is so minimal that it adds a layer of indirection without adding any value (no additional props, no different styling, no isolation from AccordionContext).

- **`displayName` is correctly set** on both Collapsible (line 34) and AccordionItem (line 117), which helps with React DevTools debugging.

- **The `hidden` attribute approach for content visibility (AccordionItem.tsx, line 110)** uses `hidden={!isOpen || undefined}`, which is correct: when `isOpen` is `true`, `!isOpen` is `false`, and `false || undefined` yields `undefined`, so the attribute is omitted. When `isOpen` is `false`, `!isOpen` is `true`, and `true || undefined` yields `true`, so `hidden` is set. This is a clean pattern.

- **The chevron rotation animation (AccordionItem.tsx, lines 46-62)** uses CSS transitions via Panda CSS, with `transitionProperty: 'transform'`, `transitionDuration: 'fast'`, and `transitionTimingFunction: 'default'`. The chevron smoothly rotates 180 degrees when the content is open. However, the content area itself has no enter/exit animation.

- **The `all: 'unset'` on the trigger button (AccordionItem.tsx, line 27)** strips all default button styles, including the focus indicator. The `_focusVisible` style (lines 39-44) restores a visible focus ring with `outline: '2px solid'`, `outlineColor: 'primary'`, and `outlineOffset: '2px'`. This is good practice.
