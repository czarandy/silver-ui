# ButtonGroup Audit

Audited files:

- `src/components/ButtonGroup/ButtonGroup.tsx`
- `src/components/ButtonGroup/ButtonGroup.recipe.ts`
- `src/components/ButtonGroup/ButtonGroupContext.ts`
- `src/components/ButtonGroup/ButtonGroup.stories.tsx`
- `src/components/ButtonGroup/ButtonGroup.test.tsx`
- `src/components/ButtonGroup/index.ts`
- `src/components/Button/Button.tsx`
- `src/components/Tooltip/Tooltip.tsx`
- `ButtonGroup.doc.mjs`
- `XDS_src/ButtonGroup/*`

## Findings

### Medium: Tooltip-wrapped buttons lose connected group styling

`src/components/ButtonGroup/ButtonGroup.recipe.ts:8-13` and `src/components/ButtonGroup/ButtonGroup.recipe.ts:19-37` only target immediate `button` and `a` children. `Button` wraps itself in `Tooltip` when `tooltip` is set (`src/components/Button/Button.tsx:330-331`), and `Tooltip` inserts a wrapper `div` (`src/components/Tooltip/Tooltip.tsx:188-197`). Even though that wrapper uses `display: contents` (`src/components/Tooltip/Tooltip.tsx:36-39`), it is still the DOM child, so the direct-child selectors no longer match the actual button.

Impact: any grouped button with a tooltip keeps its full border radius and does not receive the focus z-index rule, so common cases like icon-only actions or disabled buttons with explanatory tooltips can visually break the connected group.

### Medium: Root API does not allow normal div or ARIA passthrough

`ButtonGroupProps` only exposes a narrow set of props (`src/components/ButtonGroup/ButtonGroup.tsx:15-52`), and the root `div` does not spread additional props (`src/components/ButtonGroup/ButtonGroup.tsx:72-80`). Consumers cannot pass `id`, `aria-labelledby`, `aria-describedby`, `title`, or event handlers to the group.

Impact: the required `label` covers the basic accessible-name case, but consumers cannot bind the group to a visible heading or add descriptive ARIA text without wrapping the component.

### Low: Docs are stale for the primary component API

`ButtonGroup.doc.mjs:21-31` documents `XDSButtonGroup`, `XDSButton`/`XDSIconButton` children, `xstyle`, and an `xds-button-group` theming target. The primary exported implementation is `ButtonGroup`, accepts `className`/`style` instead of `xstyle` (`src/components/ButtonGroup/ButtonGroup.tsx:21-51`), and is styled through Panda recipe classes. The docs also describe an automatic `Divider` anatomy item (`ButtonGroup.doc.mjs:46-49`), but the implementation only removes inner border radii and does not render dividers.

### Low: Supported link-button path is not covered

The recipe explicitly styles both direct `button` and `a` children (`src/components/ButtonGroup/ButtonGroup.recipe.ts:8`), and `Button` renders an anchor when `href` is present and the button is enabled (`src/components/Button/Button.tsx:225` and `src/components/Button/Button.tsx:293-308`). There is no ButtonGroup story or test covering link buttons, so regressions in the `a` path would be easy to miss.

## Tests

Existing tests cover labelled group rendering, explicit vertical orientation via `data-orientation`, group size inheritance, child size override, disabled propagation, and `className`/`style`/`data-testid`/`ref` on the root (`src/components/ButtonGroup/ButtonGroup.test.tsx:7-90`).

Missing or weak coverage:

- No test for tooltip-wrapped child buttons, which would catch the direct-child selector bug.
- No test for link-button children even though anchors are part of the recipe selector.
- No test for default `orientation="horizontal"` / default `size="md"` behavior.
- No test for `aria-disabled` being omitted when `isDisabled` is false.
- No test for multiple ButtonGroups with different context values on the same page.

Focused run: `pnpm test src/components/ButtonGroup/ButtonGroup.test.tsx` passed, 6 tests.

## Stories And Docs

Existing stories demonstrate horizontal icon-only buttons, vertical layout, group-level sizes, and disabled state (`src/components/ButtonGroup/ButtonGroup.stories.tsx:29-81`). Important top-level props `orientation`, `size`, `isDisabled`, and `label` are represented through stories/controls.

Missing stories:

- No story for a child `Button` overriding the group `size`, although that behavior is documented and tested.
- No story for `href` buttons in a group.
- No story for tooltip-bearing or disabled-with-tooltip buttons in a group.
- No story for vertical icon-only groups.

Docs need alignment with the primary `src/components/ButtonGroup` API as noted above.

## Category Notes

- Performance: no significant issues found. The context value is memoized with the right dependencies (`src/components/ButtonGroup/ButtonGroup.tsx:65-68`), and the component does not clone children.
- Accessibility: the required `label` and `role="group"` are good for the base case. The main accessibility/API gap is lack of ARIA/native prop passthrough.
- Logic bugs: the concrete behavior issue is tooltip-wrapped children losing group styling. Size and disabled propagation through `Button` context are otherwise coherent (`src/components/Button/Button.tsx:220-223`).
- API clarity: valid children should be documented more explicitly as direct `Button` children, because wrappers break the current styling selectors.
