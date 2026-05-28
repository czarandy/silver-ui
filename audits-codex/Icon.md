# Icon Audit

Audited the public `src/components/Icon` implementation exported from `src/index.ts`, plus its stories and tests. `XDS_src/Icon` exists, but it is a separate unexported implementation with a different API.

## Findings

### Medium

- `aria-labelledby` icons are hidden from assistive tech. `Icon` only checks `props['aria-label']` when deciding whether to set `aria-hidden` and `role="img"` ([src/components/Icon/Icon.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.tsx:120), [src/components/Icon/Icon.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.tsx:131)). A consumer using `<Icon aria-labelledby="some-id" ... />` gets `aria-hidden="true"`, so the referenced label is ignored. The accessibility test only covers `aria-label`, not `aria-labelledby` ([src/components/Icon/Icon.test.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.test.tsx:19)).

### Low

- Size/color tests do not verify the behavior they are named after. The tests iterate every `size` and `color` value, but only assert that the SVG remains in the document ([src/components/Icon/Icon.test.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.test.tsx:26), [src/components/Icon/Icon.test.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.test.tsx:38)). A missing or wrong token class for a variant would pass. Add assertions for generated class names or computed style/custom property output, following the pattern used by other tokenized components.

- Stories do not demonstrate accessible/non-decorative usage. Storybook covers default rendering, sizes, and colors ([src/components/Icon/Icon.stories.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.stories.tsx:73), [src/components/Icon/Icon.stories.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.stories.tsx:75), [src/components/Icon/Icon.stories.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.stories.tsx:85)), but there is no story for `aria-label`/`role="img"` behavior. Since the component has explicit accessibility branching, a labelled icon story would make the supported pattern visible.

- The API is slightly unclear about non-Lucide SVG components. `IconComponent` accepts `LucideProps | SVGProps<SVGSVGElement>` ([src/components/Icon/Icon.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.tsx:28)), but the prop comment says "Lucide icon component" ([src/components/Icon/Icon.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.tsx:49)) and the implementation always injects `strokeWidth={2}` by default ([src/components/Icon/Icon.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.tsx:114), [src/components/Icon/Icon.tsx](/Users/agoder/silver-ui/src/components/Icon/Icon.tsx:132)). That is fine for Lucide, but can unexpectedly alter custom outline SVGs if the public API intends to support any SVG component.

## Category Notes

- Performance: no issues found. The component has module-scoped style generation and a single SVG render.
- Logic bugs: only the `aria-labelledby` accessibility logic issue above.
- Accessibility: decorative default and `aria-label` behavior are covered; `aria-labelledby` is not handled.
- Missing docs/stories: no dedicated docs file was found for the public `src/components/Icon`; Storybook exists but lacks a labelled/icon-as-image example.
- Missing tests: add coverage for `aria-labelledby`, token class/style application for each `size`/`color`, and the default `strokeWidth` contract.

## Verification

- `pnpm vitest run src/components/Icon/Icon.test.tsx` passed: 1 file, 6 tests.
