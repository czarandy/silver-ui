# Blockquote Audit

## Summary

Blockquote is a simple styled wrapper around the native `<blockquote>` element. It renders a left border accent with optional citation content inside a `<footer><cite>` structure. The component is minimal and semantically correct.

## Issues

### Critical

- None.

### High

- None.

### Medium

- None.

### Low

- **`<cite>` element used for attribution, not source.** Per the HTML spec, `<cite>` is intended for the title of a cited work, not the author's name. The stories use `cite="— Alan Kay"`, which is an author attribution. Strictly speaking, the author name should be in plain text or a `<span>`, and `<cite>` should wrap the work title. However, this pattern is extremely common and widely accepted in practice.
- **No `variant` or `color` prop.** The blockquote always uses `border.emphasized` for the left border and `fg.muted` for text color. There is no way to customize the accent color to match a theme or status. This is fine for a simple component but limits design flexibility.
- **No story for long multi-paragraph content.** The `WithComplexChildren` story has two short paragraphs, but there is no story showing how the component handles very long quoted text.
- **No test for the `<blockquote>` role.** While the semantic `<blockquote>` element has an implicit `blockquote` role, no test verifies this via `getByRole('blockquote')`. (Note: ARIA does define a `blockquote` role, though browser support varies.)

## Recommendations

1. Consider whether the `<cite>` usage should be documented with a note about the HTML spec distinction between work titles and author attributions.
2. The component is clean, minimal, and well-tested for its scope. No urgent changes needed.
