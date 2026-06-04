# CodeBlock Audit

## Summary

A read-only source code display component. It renders a `role="region"` root container with an optional header (title + copy button), a scrollable region, a flex body, an optional line-number gutter, and a `<pre><code>` block where every line is rendered as an individual `<span>`. It supports a `card`/`section` container style, `sm`/`md` size, line numbers, line highlighting, soft wrapping, a floating or header-anchored copy button (with copied state), and configurable padding/width/max-height.

## SVA Conversion

**Benefit: Strong**

CodeBlock renders roughly a dozen distinct styled DOM elements (root, header, headerTitle, scroll, body, gutter, gutterLine, pre, code, line, plus copy-button positioning) and currently styles all of them through a single standalone `const styles = {...}` object in `CodeBlock.tsx` containing ~20 `css()` blocks, applied via `cx()`. Variant-like logic is entirely runtime: `container === 'card' ? styles.card : styles.section`, `size === 'sm' ? styles.sizeSm : styles.sizeMd`, plus conditional `codeWithFloatingCopy`, `codeWrapped`, and `lineHighlighted` branches threaded through `cx()`. An `sva` slot recipe with slots like `root/header/title/scroll/body/gutter/gutterLine/pre/code/line` and `container` + `size` variants (and a compound/boolean variant for the floating copy and wrapped states) would consolidate all of this into one recipe and replace the ternaries with declarative variants, mirroring the Divider migration.
