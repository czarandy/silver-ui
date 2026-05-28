# Stack Component Audit

Audited files:

- `src/components/Stack/Stack.tsx`
- `src/components/Stack/HStack.tsx`
- `src/components/Stack/VStack.tsx`
- `src/components/Stack/Stack.recipe.ts`
- `src/components/Stack/Stack.stories.tsx`
- `src/components/Stack/Stack.test.tsx`
- `src/components/Stack/index.ts`

## Findings

### Medium: Polymorphic `element` cannot receive native/accessibility props

`Stack` exposes `element?: ElementType` (`src/components/Stack/Stack.tsx:31`) and tests rendering as `nav` (`src/components/Stack/Stack.test.tsx:20`), but `StackProps` only includes a small hand-picked prop set (`src/components/Stack/Stack.tsx:25`) and the rendered element only receives `className`, `data-testid`, `ref`, and `style` (`src/components/Stack/Stack.tsx:117`). Consumers cannot pass `aria-label`, `aria-labelledby`, `role`, `id`, `onClick`, `tabIndex`, or native props required by many semantic elements. For example, `<Stack element="nav" aria-label="Primary">` is neither typed nor forwarded, leaving landmark navigation unnamed.

This affects `HStack` and `VStack` too because their rest props are still based on `StackProps` (`src/components/Stack/HStack.tsx:9`, `src/components/Stack/VStack.tsx:9`).

### Medium: Base `Stack` alignment API permits values that silently do nothing

`hAlign` and `vAlign` both accept `StackAlignment`, the union of main-axis and cross-axis values (`src/components/Stack/Stack.tsx:20`, `src/components/Stack/Stack.tsx:33`, `src/components/Stack/Stack.tsx:38`). At runtime, unsupported values are dropped by `in` checks before assigning `justifyContent` or `alignItems` (`src/components/Stack/Stack.tsx:104`, `src/components/Stack/Stack.tsx:108`). That means valid TypeScript such as horizontal `<Stack hAlign="stretch">` or vertical `<Stack vAlign="stretch">` produces no main-axis alignment. Likewise, main-axis-only values like `between` can be accepted for a cross-axis slot and then omitted.

`HStackProps` and `VStackProps` narrow these props correctly (`src/components/Stack/HStack.tsx:13`, `src/components/Stack/VStack.tsx:13`), so the ambiguity is concentrated in the exported base `Stack` API.

### Low: Stories cover only the two simplest layouts

The Stack stories define only `Horizontal` and `Vertical` (`src/components/Stack/Stack.stories.tsx:14`, `src/components/Stack/Stack.stories.tsx:24`). Important props and behaviors are missing from Storybook coverage: base `Stack` with `direction`, `wrap`/`wrap-reverse`, alignment variants (`justify`, `align`, `hAlign`, `vAlign`), sizing (`width`, `height`), and polymorphic `element`. The story meta also uses `component: HStack` for `Components/Stack` (`src/components/Stack/Stack.stories.tsx:6`), so generated docs/controls emphasize only `HStackProps` rather than the broader Stack API.

### Low: Tests miss key behavior and regressions

Existing tests verify children, polymorphic tag name, HStack/VStack alignment aliases, and HStack root prop/ref forwarding (`src/components/Stack/Stack.test.tsx:7`). Missing tests for important props include:

- `gap` mapping to the supported spacing steps (`src/components/Stack/Stack.tsx:43`).
- `wrap` and `direction` class behavior from `stackRecipe` (`src/components/Stack/Stack.recipe.ts:8`).
- `width`/`height` number-to-pixel and string passthrough (`src/components/Stack/Stack.tsx:73`).
- Base `Stack` alignment behavior and `hAlign`/`vAlign` precedence over `align`/`justify` (`src/components/Stack/Stack.tsx:94`).
- Root prop/ref forwarding for `Stack` and `VStack`, not just `HStack` (`src/components/Stack/Stack.test.tsx:56`).
- Native/ARIA prop forwarding, if the polymorphic API is kept.

## Categories With No Issues Found

- Performance: no material performance issue found. The component creates a small inline style object and calls the recipe per render (`src/components/Stack/Stack.tsx:102`, `src/components/Stack/Stack.tsx:120`), which is normal for this layout primitive.
- Logic, aside from the alignment API issue above: `HStack` and `VStack` map `align`/`justify` to the expected axes, and the current tests cover the basic mappings (`src/components/Stack/Stack.test.tsx:30`, `src/components/Stack/Stack.test.tsx:43`).

## Verification

- `pnpm vitest run src/components/Stack/Stack.test.tsx` passed: 1 file, 5 tests.
- `pnpm test src/components/Stack/Stack.test.tsx --runInBand` was attempted first but failed because this Vitest version does not support `--runInBand`.
