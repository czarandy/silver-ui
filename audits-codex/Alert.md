# Alert Component Audit

Audited:

- `src/components/Alert/Alert.tsx`
- `src/components/Alert/Alert.recipe.ts`
- `src/components/Alert/Alert.test.tsx`
- `src/components/Alert/index.ts`

Related coverage checked:

- No `src/components/Alert/Alert.stories.*` found.
- No `src/components/Alert/Alert.doc.*` found.
- Public export exists in `src/index.ts:274-281`.

## Findings

### Medium: expand/collapse control does not expose disclosure state

`src/components/Alert/Alert.tsx:190-206` renders the collapsible-content toggle as an icon-only `Button` whose label changes between `Expand` and `Collapse`, but it does not set `aria-expanded` or connect the button to the controlled panel with `aria-controls`.

This is weaker than nearby disclosure patterns: `AccordionItem` sets `aria-expanded` on its trigger (`src/components/Accordion/AccordionItem.tsx:96-110`), and `MetadataList` uses both `aria-expanded` and `aria-controls` (`src/components/MetadataList/MetadataList.tsx:148-163`). Screen reader users can operate the Alert toggle, but they do not get a programmatic expanded/collapsed state or control relationship.

Recommended fix: add an id for the content panel and expose `aria-expanded={isExpanded}` and `aria-controls={contentId}` on the toggle. The shared `Button` API may need to accept these ARIA props first.

### Medium: no stories or component docs exist

There is no Alert Storybook file or doc file under `src/components/Alert`. Important props are therefore not demonstrated: `status`, `description`, `isDismissable`, `children` collapsible content, `isDefaultExpanded`, `endContent`, `container`, and custom `icon`.

Recommended stories: default, all statuses, with description, dismissable, collapsible, default expanded, with end content, section container, and custom icon.

### Low: dismiss and expand behavior is uncontrolled-only

`src/components/Alert/Alert.tsx:148-156` stores dismissal and expansion entirely inside the component. After clicking Dismiss (`src/components/Alert/Alert.tsx:208-219`), the Alert always returns `null`; `onDismiss` is notification-only and cannot prevent dismissal, animate it externally, or reset the Alert without remounting/changing a key.

This may be intentional for a simple alert, but the API should be documented as uncontrolled. If consumers need persistence, confirmations, or controlled disclosure, consider `isDismissed`/`onDismissChange` and `isExpanded`/`onExpandedChange` props.

### Low: `title` and `description` accept arbitrary ReactNode inside paragraph text

`title` and `description` are typed as `ReactNode` (`src/components/Alert/Alert.tsx:39-41`, `src/components/Alert/Alert.tsx:77-79`) but rendered through `<Text as="p">` (`src/components/Alert/Alert.tsx:177-185`). Passing block content such as headings, lists, or paragraphs can create invalid nested HTML or unexpected typography.

Recommended fix: document that these props should be plain text or inline content, or narrow the types if rich content is not intended.

## Missing Tests

Current tests pass and cover basic rendering, one urgent role, one non-urgent role, dismiss, collapse toggle, default expansion, and root passthrough props (`src/components/Alert/Alert.test.tsx:7-89`).

Gaps:

- No test for `aria-expanded`/`aria-controls` on the collapsible toggle; this currently would fail because the attributes are absent.
- No explicit all-status matrix for `error`, `warning`, `info`, and `success` role mapping/default rendering.
- No test for custom `icon`.
- No test for `endContent`.
- No test for `container="section"` versus default `card`.
- No test that the dismiss button is absent by default.
- No test that `isDismissable` works without `onDismiss`.

## Performance

No significant performance issues found. The component is small, keeps minimal local state, and renders no expensive loops or effects.

One tradeoff: collapsible children are mounted/unmounted when toggled (`src/components/Alert/Alert.tsx:224-232`). That is acceptable for typical alert details, but expensive child subtrees would lose state and remount on each toggle.

## Logic Bugs

No clear logic bugs found beyond the uncontrolled-dismiss limitation noted above. The existing Alert tests pass:

`npm test -- --run src/components/Alert/Alert.test.tsx`

Result: 1 test file passed, 6 tests passed.
