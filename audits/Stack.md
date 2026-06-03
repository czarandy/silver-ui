# Stack Audit

## Summary

Stack is a flexbox layout utility component with three exports: `Stack` (base), `HStack` (horizontal preset), and `VStack` (vertical preset). It supports gap, alignment (main-axis and cross-axis), wrapping, polymorphic element rendering via `as`, and explicit width/height. The `hAlign`/`vAlign` props provide axis-aware alignment that works regardless of direction. HStack and VStack are thin wrappers that fix the direction and remap alignment props for ergonomic usage.

## Issues

### Critical

- None identified.

### High

- None identified.

### Medium

- **`Stack` is not exported from the component's index.ts**: The `index.ts` exports `HStack`, `VStack`, `StackVariants`, `stackRecipe`, and several type exports, but NOT the base `Stack` component or `StackProps` type. Consumers cannot import `Stack` directly and must use `HStack` or `VStack`. If this is intentional, the `Stack` component should be marked internal. If unintentional, it is a missing export.
- **`createElement` used instead of JSX**: `Stack.tsx` uses `createElement(Element, {...}, children)` instead of JSX `<Element {...}>`. This is functionally equivalent but inconsistent with every other component in the library which uses JSX syntax. Using `createElement` makes the code harder to read and review.
- **Alignment props have overlapping and confusing semantics**: The base `Stack` accepts `align`, `justify`, `hAlign`, and `vAlign`. HStack re-types `align` as `StackCrossAlignment` and `justify` as `StackMainAlignment`, then maps them through `hAlign`/`vAlign`. VStack does the same with inverted axes. The resolution logic (lines 117-133) is complex with multiple fallback layers. For example, in a VStack: `justify` maps to `vAlign`, `align` maps to `hAlign`, but users can also pass `hAlign` directly to override. This 4-prop system is powerful but confusing.
- **Style prop can silently override alignment styles**: The `style` prop is spread last in `stackStyle` (line 136), meaning `style={{justifyContent: 'center'}}` will silently override any `justify` or `hAlign` prop. This inconsistency (where some computed styles can be overridden and others from the recipe cannot) could confuse consumers.
- **Stories use `HStack` as the meta component instead of `Stack`**: The Storybook meta is `Meta<typeof HStack>`, meaning the ArgTable in docs will show HStack props rather than Stack props. There is no direct way to interact with Stack's `direction` prop through stories. A separate story for the base Stack component or `direction` toggle control would be helpful.
- **No story demonstrating the `as` prop with semantic elements**: The `PolymorphicElement` story shows `as="nav"` and `as="ul"` but these are in VStack. No story shows the `as` prop on HStack, and there is no interactive control for `as`.

### Low

- **`StackDirection` export is missing from index.ts**: The `StackDirection` type is defined in `Stack.tsx` but not exported from `index.ts`. Consumers who need this type cannot import it directly.
- **`StackProps` type is not exported from index.ts**: While `HStackProps` and `VStackProps` are exported, the base `StackProps` is not. This means consumers building wrappers around Stack cannot properly type their components.
- **`HStack` and `VStack` re-declare `ref` in their interfaces**: Both `HStackProps` and `VStackProps` add `ref?: Ref<HTMLElement>` even though this is already present in the inherited `StackProps` (via `Omit<StackProps, 'direction' | 'hAlign' | 'vAlign'>`). The re-declaration is redundant.
- **`minW: 0` in base recipe may cause unexpected text truncation**: The `minW: 0` on the Stack recipe base prevents flex children from overflowing their container, but it also means text content in a Stack can be truncated without any visual indication. This is a standard flexbox pattern but is not documented.
- **No test for `gap={0}` or missing gap prop**: Tests cover `gap={4}` but not the edge case of `gap={0}` or omitting `gap` entirely (which should apply no gap class).

## Recommendations

1. Either export `Stack` and `StackProps` from `index.ts`, or mark the base Stack as internal and document that consumers should use HStack/VStack.
2. Replace `createElement` with JSX for consistency with the rest of the library.
3. Add a story or storybook control for the `direction` prop on the base Stack component.
4. Export `StackDirection` and `StackProps` types from `index.ts`.
5. Add tests for `gap={0}` and no-gap scenarios.
6. Consider simplifying the alignment prop system or adding JSDoc examples showing common alignment patterns.
