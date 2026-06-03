# Kbd Audit

## Summary

Kbd displays keyboard shortcuts as styled key badges. It parses a `+`-delimited string of key names, maps them to display symbols (with Mac/non-Mac platform adaptation for `mod`), and renders each key in a styled `<kbd>` element. The component includes a module-level platform detection cache and comprehensive ARIA labeling.

## Issues

### Critical

- None.

### High

None

### Medium

- **`detectMac()` called during render, not in an effect.** The `isMac` value is computed synchronously during render (line 143). While this works in CSR, it causes an SSR hydration mismatch because the server sees `navigator` as undefined (returns `false`) while the client may detect Mac (`true`). This would cause the key labels to differ between server and client HTML, triggering React hydration warnings.
- **`navigator.platform` is deprecated.** Line 110 uses `navigator.platform` as a fallback when `navigator.userAgentData` is unavailable. `navigator.platform` is deprecated and may be removed from browsers. The `userAgentData` API is the preferred replacement, but it is also not universally available. Consider adding a fallback that checks `navigator.userAgent` as a third option.
- **No support for key sequences (e.g., "g then h").** The component only supports simultaneous key combinations (all keys pressed together). Key sequences common in applications like Vim or GitHub (`g` then `h`) are not representable. This is a feature gap, not a bug, but worth noting.

### Low

- **`plus` as a literal key is ambiguous.** Using `+` as both the separator and a key name requires the special `plus` keyword. The component handles this correctly, but the parsing approach means `"+"` alone resolves to zero keys and throws. The `keys="shift+plus"` pattern is tested and documented, but the ambiguity could confuse consumers.
- **No `size` or `variant` prop.** The key badges have a fixed visual style. There's no way to render larger or smaller kbd elements inline with different text sizes without using `className` overrides.
- **`resetPlatformCache` is exported from the component module.** This is a test utility that leaks into the public API. It could be moved to a test-only export or a separate test-utils file.
- **Missing story for non-Mac platform.** The `PlatformAdaptive` story mentions platform differences in its description but doesn't demonstrate both renderings side by side. A story that shows "mod" as both command and Ctrl would be more informative.

## Recommendations

1. Address the SSR hydration mismatch by either making platform detection happen in a `useEffect` with a safe default, or by accepting `platform` as a prop.
2. Move `resetPlatformCache` to a test-only export path.
3. Add `navigator.userAgent` as a tertiary fallback for platform detection.
4. Consider a `size` prop for visual flexibility when Kbd is used inline with different text sizes.
