# Button Audit

## Summary

The Button component is a well-architected, versatile action element that renders as a `<button>` or link depending on props. It supports loading states, icon-only modes, tooltips, link rendering with custom router components, and integrates with ButtonGroup for shared sizing/disabled state. The component is thoroughly documented with JSDoc, has comprehensive test coverage, and good story variety.

## Issues

### Critical

- None.

### High

- None.

### Medium

- **Icon-only loading state shows no spinner.** When `isIconOnly` is true and `isLoading` is true, the spinner is not rendered (lines 347-350: the spinner is gated by `!isIconOnly`). The button becomes disabled and sets `aria-busy`, but there is no visual loading indicator. This is inconsistent -- users see a static icon-only button with no indication that work is in progress. The `VisuallyHidden` "Loading" status is announced to screen readers, but sighted users get no feedback.
- **`onSolid` variant missing from stories argTypes.** The `argTypes.variant.options` array in the stories file lists `['primary', 'secondary', 'ghost', 'destructive']` but omits `'onSolid'`, which is a valid variant in the recipe. There is no story demonstrating this variant at all.

### Low

- **No story for `target="_blank"` link behavior.** The `LinkButton` story navigates to `/docs` but does not demonstrate external link behavior with `target="_blank"`, which triggers `rel="noopener noreferrer"` defaults and the "(opens in new tab)" suffix on aria-label. Tests cover this, but a visual story would help.
- **No story for `type="submit"` form integration.** The component supports `form`, `name`, `value`, and `type="submit"` props for native form submission, but no story demonstrates this pattern.
- **`endContent` type is not constrained.** The `endContent` prop accepts any `ReactNode`, which could lead to layout issues if consumers pass block-level elements or large content. This is a documentation/guidance gap rather than a code bug.
- **`aria-label` is set when `endContent` is present** even without `isIconOnly`. The logic at line 282-287 sets `aria-label` to just the `label` text whenever `endContent != null`. This means screen readers only hear the label and not the endContent text, which may or may not be desired depending on whether endContent is decorative. The behavior is reasonable but could be surprising.

## Recommendations

1. Add a visual spinner or overlay for icon-only loading buttons, or at minimum document the limitation.
2. Add `'onSolid'` to the stories argTypes and create an `OnSolid` story (ideally on a dark background to demonstrate the variant).
3. Consider adding stories for external links (`target="_blank"`), form submission (`type="submit"`), and `aria-pressed` toggle patterns.
