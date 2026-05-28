# Kbd Component Audit

**Date:** 2026-05-28
**Files reviewed:**

- `src/components/Kbd/Kbd.tsx`
- `src/components/Kbd/Kbd.stories.tsx`
- `src/components/Kbd/Kbd.test.tsx`
- `src/components/Kbd/index.ts`

---

## Performance Problems

1. **`detectMac` is called on every render of every `Kbd` instance (Kbd.tsx, line 118):**
   `useSyncExternalStore` calls the `getSnapshot` function (`detectMac`) on every render to check whether the snapshot has changed. `detectMac` performs property lookups on `navigator`, type checks, and regex tests each time. Since the platform never changes during a browser session, this work is wasted. The result should be computed once and cached in a module-level variable (e.g., a lazy singleton). This matters if a page has many `Kbd` instances (e.g., a keyboard shortcuts panel).

2. **`keys` string is re-parsed on every render (Kbd.tsx, lines 121-129):**
   `split`, `map`, `filter`, plus the `Map`-based deduplication logic runs every render. For a presentational component that typically receives a static string prop, this is not a serious concern, but it could be avoided with `useMemo` if needed. Low severity.

3. **`subscribeToPlatformChanges` returns a new no-op function on every call (Kbd.tsx, lines 73-75):**
   Each call to `subscribeToPlatformChanges` creates a new `() => {}` arrow function. Since the platform never changes, the subscribe function could return a module-level constant no-op. This avoids allocating a new function object on every subscription. Very low severity.

---

## Accessibility Concerns

1. **`aria-hidden="true"` hides the shortcut from assistive technology entirely (Kbd.tsx, line 134):**
   The root `<span>` is marked `aria-hidden="true"`, which means screen reader users will never hear the keyboard shortcut. This is reasonable only if the shortcut is always paired with a visible text label that describes the action (and the shortcut is considered purely decorative). However, the component provides no mechanism for consumers to override this or to supply an accessible label. If a consumer renders `<Kbd keys="mod+k" />` standalone -- without adjacent descriptive text -- the shortcut is completely invisible to assistive technology.

   **Recommendation:** Consider accepting an optional `aria-label` prop so consumers can make standalone `Kbd` usage accessible when needed, or document that `Kbd` must always be used alongside visible descriptive text.

2. **No `<kbd>` semantics on the outer wrapper (Kbd.tsx, line 132-138):**
   The outer element is a plain `<span>` wrapping inner `<kbd>` elements. Semantically, a multi-key shortcut like `Ctrl+K` is a single keyboard input. Wrapping the entire shortcut in a single `<kbd>` element (or nesting `<kbd>` inside a parent `<kbd>`) would be more semantically correct per the HTML spec, which states that nested `<kbd>` elements represent a single input composed of multiple keystrokes.

3. **No separator between keys for assistive technology:**
   Even if `aria-hidden` were removed, the rendered output for `mod+k` would read as "Ctrl K" with no indication these are combined keys. A visually hidden "+" separator between `<kbd>` elements would improve the screen reader experience.

---

## Logic Bugs

1. **`useSyncExternalStore` is unnecessary and arguably misused (Kbd.tsx, lines 73-79, 116-119):**
   `useSyncExternalStore` is designed for subscribing to external stores that can change over time. The platform (Mac vs. non-Mac) never changes during a session. The `subscribe` function (`subscribeToPlatformChanges`) is a no-op that never notifies of changes, confirming the value is static. A simpler approach would be a module-level lazy constant or a one-time `useState` initializer. While the current code is not incorrect, it adds unnecessary complexity and cognitive overhead.

   The one benefit of the current approach is SSR safety via `getServerPlatformSnapshot` (line 78), which returns `false` on the server. This same SSR safety can be achieved with `useState(() => detectMac())` paired with a hydration-safe default -- or even more simply, since `detectMac` already returns `false` when `navigator` is undefined (line 82-83), the SSR case is already handled within `detectMac` itself.

2. **Empty `keys` string produces no output but no warning (Kbd.tsx, lines 121-124):**
   If `keys=""` or `keys="+"` is passed, the `filter(Boolean)` on line 124 removes all empty parts, and the component renders an empty `<span>`. This is not a crash, but it is a silent no-op that could indicate a consumer bug. A development-mode warning would be helpful.

3. **Keys containing `+` cannot be represented (Kbd.tsx, line 122):**
   The `+` character is used as the delimiter, so there is no way to display the literal `+` key (e.g., for `Shift++` on a number pad). The API documentation does not mention this limitation.

4. **`navigator.platform` is deprecated (Kbd.tsx, line 96):**
   The fallback in `detectMac` uses `navigator.platform`, which is deprecated in modern browsers. While the code correctly prefers `navigator.userAgentData` first (line 86-93), the fallback will eventually become unreliable. The `userAgentData` API is not available in Firefox or Safari as of the component's writing, so the deprecated fallback is still necessary for now, but this should be monitored.

---

## Unclear API

1. **`keys` prop format is not self-documenting (Kbd.tsx, line 19):**
   The JSDoc mentions `"+"` as the separator and lists special keys, but a consumer must read the source to discover the full set of recognized keys and their display mappings. The prop accepts any arbitrary string, so typos like `"crtl+k"` will silently render `CRTL` instead of `⌃`. Consider validating keys in development mode or exporting the list of recognized key names as a type union.

2. **No `size` prop (Kbd.tsx):**
   The component renders at a fixed size (`minW: '5'`, `h: '5'`, `fontSize: 'xs'`). Other component libraries (e.g., Chakra UI's `Kbd`) offer a `size` prop. If `Kbd` is intended to be used alongside text of varying sizes (headings, body, captions), a size prop would be useful. This is a design decision rather than a bug.

3. **No variant or color scheme prop:**
   The component has a single visual style. Some use cases (e.g., light-on-dark contexts, selected/active shortcut highlighting) might benefit from a `variant` prop, consistent with other components in this library like `Badge`.

---

## Missing Tests

1. **No test for arrow keys (up, down, left, right):**
   The `keyDisplay` map includes entries for `up` (`↑`), `down` (`↓`), `left` (`←`), and `right` (`→`), but no test verifies these are rendered correctly.

2. **No test for `backspace` or `tab` keys:**
   `backspace` (`⌫`) and `tab` (`⇥`) are in the `keyDisplay` map (Kbd.tsx, lines 61, 69) but are never tested.

3. **No test for unknown/arbitrary keys:**
   The fallback behavior in `getKeyDisplay` (line 103) uppercases unrecognized keys (`key.toUpperCase()`). No test verifies this for arbitrary strings like `"space"`, `"delete"`, or `"f1"`.

4. **No test for empty or malformed `keys` string:**
   Edge cases like `keys=""`, `keys="+"`, `keys="mod+"`, or `keys="++k"` are not tested. These exercise the `filter(Boolean)` logic on line 124.

5. **No test for duplicate keys:**
   The `keyCounts` Map (line 125) generates unique React keys for duplicated key names (e.g., `keys="up+up"`). This deduplication logic is untested.

6. **No test for `mod` on non-Mac platforms:**
   The test at line 24 verifies `mod` renders as `Ctrl`, but it relies on the default test environment platform rather than explicitly setting a non-Mac platform. This makes the test environment-dependent. If tests ever run on a Mac CI machine, the test at line 24 would fail because `mod` would render as `⌘` instead of `Ctrl`.

7. **No test for SSR / server snapshot behavior:**
   The `getServerPlatformSnapshot` function (line 78) returns `false`, which means `mod` renders as `Ctrl` during SSR. This behavior is untested.

---

## Missing Stories

1. **No story for individual special keys:**
   The `keyDisplay` map contains 11 special key mappings (alt, backspace, ctrl, down, enter, escape, left, right, shift, tab, up), but the stories only demonstrate `mod+k`, `mod+s`, and `up+down+enter`. A story showing all special keys and their rendered symbols would serve as a visual reference.

2. **No story demonstrating the `mod` key's platform-adaptive behavior:**
   The `mod` key renders as `⌘` on Mac and `Ctrl` on other platforms. This is a core feature of the component but has no story demonstrating or documenting it. A story with a note explaining the platform-adaptive behavior would be valuable.

3. **No story for single-key usage:**
   All stories show multi-key combinations. A story for a single key (e.g., `<Kbd keys="escape" />`) is missing.

4. **No story demonstrating `className` or `style` customization:**
   The component accepts `className` and `style` for customization, but no story shows how to override the default appearance.

5. **No story demonstrating inline usage with text:**
   A common pattern is embedding `Kbd` inline within a sentence (e.g., "Press `Ctrl+K` to open the palette"). No story demonstrates this use case, which is important for verifying visual alignment with surrounding text.

---

## Additional Observations

- **No recipe file.** The project memory (`silver-ui-stack.md`) states that components should follow the pattern of having a recipe in `.recipe.ts` using `cva`. The `Kbd` component uses inline `css()` calls instead. Other simple components like `Badge` also skip the recipe file, so this may be acceptable for components without variants, but it diverges from the documented convention.
- **`displayName` is set (line 148)** -- good for React DevTools debugging.
- **Exports are clean.** The `index.ts` barrel file correctly exports both the component and its props type.
- **The `cx` utility is used correctly** for merging `className` (line 135).
- **The component is well-structured overall.** It is small, focused, and handles the core use case (displaying keyboard shortcuts) effectively.
