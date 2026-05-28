# TextArea Audit

Audited:

- `src/components/TextArea/TextArea.tsx`
- `src/components/TextArea/TextArea.stories.tsx`
- `src/components/TextArea/TextArea.test.tsx`
- `XDS_src/TextArea/XDSTextArea.tsx`
- `XDS_src/TextArea/XDSTextArea.test.tsx`
- `XDS_src/TextArea/TextArea.doc.mjs`

## Findings

### Medium: `isOptional` + `isRequired` can create conflicting visual and accessibility states

`TextArea` allows both props at once. `Field` renders the label indicator as `Optional` when both are true (`src/components/Field/Field.tsx:191`), but `TextArea` still sets `aria-required` from `isRequired` alone (`src/components/TextArea/TextArea.tsx:131-132`). That means assistive tech can announce the textarea as required while the visible label says optional. The XDS implementation avoids this by using `isRequired && !isOptional` for `aria-required` (`XDS_src/TextArea/XDSTextArea.tsx:410-412`) and warns in `XDSField` (`XDS_src/Field/XDSField.tsx:180-184`).

Missing test coverage: no public `TextArea` test covers required/optional interaction.

### Medium: `maxLength` is an unclear API and is not behaviorally covered

The public `TextArea` exposes a `maxLength` prop but does not pass it to the native `<textarea>` (`src/components/TextArea/TextArea.tsx:128-149`). It is only used for a counter and over-limit `aria-invalid` (`src/components/TextArea/TextArea.tsx:97-99`, `src/components/TextArea/TextArea.tsx:157-165`). That may be intentional, but the public component has no docs explaining that the prop is advisory only. Consumers will reasonably expect a prop named `maxLength` to enforce the browser limit.

The XDS docs are explicit that the limit is not natively enforced (`XDS_src/TextArea/TextArea.doc.mjs:91-95`), but those docs are not the Storybook docs for the exported public component. The public test only asserts the initial counter text and does not cover over-limit state, native `maxlength` absence, or counter updates after controlled rerender (`src/components/TextArea/TextArea.test.tsx:7-18`).

### Medium: Public counter is weak for screen reader users

The public counter is linked via `aria-describedby`, but it only exposes terse visible text like `5/120` (`src/components/TextArea/TextArea.tsx:157-165`). There is no `aria-live` remaining/over-limit announcement. The XDS implementation has a visually hidden polite live region that announces remaining or over-limit characters (`XDS_src/TextArea/XDSTextArea.tsx:443-449`), so the public component is behind the intended accessibility behavior.

### Medium: `XDS_src` TextArea tests are not collected by the repo test config

`XDS_src/TextArea/XDSTextArea.test.tsx` has broad coverage, but `vitest.config.ts` only includes `src/**/*.test.{ts,tsx}` and `eslint/**/*.test.{js,ts}` (`vitest.config.ts:17`). A targeted run of both TextArea test paths only executed the public `src` test file. If `XDS_src` is intended to be maintained in this repo, its TextArea tests are effectively dead until the config includes them.

### Low: Public Storybook coverage is too sparse for the prop surface

Storybook only has `Default` and `WithCounter` (`src/components/TextArea/TextArea.stories.tsx:13-16`). Important props with no story include `description`, `status` states/messages, `isDisabled`, `isLoading`, `isRequired`, `isOptional`, `isLabelHidden`, `startIcon`, `size`, `rows`, `hasSpellCheck`, `htmlName`, focus/blur/paste callbacks, and over-limit counter state.

### Low: Public unit coverage is too shallow

The public test file has one test (`src/components/TextArea/TextArea.test.tsx:7-18`). It does not cover label/description wiring, status messages and `aria-describedby`, disabled behavior, loading state, focus/blur/paste callbacks, `rows`, `htmlName`, spellcheck, autofocus, ref forwarding, start icon rendering, hidden labels, over-limit `aria-invalid`, or the required/optional conflict above. The XDS test file covers many of these behaviors, but it is outside the configured test include.

## Category Notes

- Performance: no meaningful performance issue found in the public component. The XDS status icon maps are recreated per render (`XDS_src/TextArea/XDSTextArea.tsx:308-321`), but the cost is negligible.
- Accessibility: issues found around required/optional conflict and counter announcements.
- Logic bugs: required/optional conflict is the clearest logic bug.
- API clarity: `maxLength` needs public docs or a stricter implementation.
- Missing tests: public coverage is insufficient; XDS tests are not collected.
- Missing stories/docs: public Storybook is missing most important prop states; XDS docs exist but are not wired into the configured Storybook source.

Verification:

- `pnpm vitest run src/components/TextArea/TextArea.test.tsx XDS_src/TextArea/XDSTextArea.test.tsx` passed, but Vitest collected only `src/components/TextArea/TextArea.test.tsx`.
- `pnpm vitest run --include 'XDS_src/TextArea/XDSTextArea.test.tsx'` failed because this Vitest version does not support `--include`.
