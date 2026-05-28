# PasswordInput Audit

Scope:

- `src/components/PasswordInput/PasswordInput.tsx`
- `src/components/PasswordInput/PasswordInput.stories.tsx`
- `src/components/PasswordInput/PasswordInput.test.tsx`
- `src/components/PasswordInput/index.ts`
- Related wrappers/exports: `src/components/TextInput/TextInput.tsx`, `src/components/InputGroup/InputGroup.tsx`, `src/index.ts`

Verification: `pnpm vitest run src/components/PasswordInput/PasswordInput.test.tsx` passes, 4 tests.

## Findings

### High: Component is not exported from the package barrel

`src/components/PasswordInput/index.ts:1` exports `PasswordInput`, but `src/index.ts` never re-exports it. The package only exposes the root export in `package.json:13`, so consumers cannot import `PasswordInput` from the public package entrypoint even though it has implementation, stories, tests, and a component-local index. Nearby form controls are exported from the barrel, for example `TextInput` at `src/index.ts:526`, `TextArea` at `src/index.ts:648`, and `DateInput` at `src/index.ts:656`.

### High: Disabled InputGroup leaves the password toggle enabled

`InputGroup` publishes disabled state through context (`src/components/InputGroup/InputGroup.tsx:81`), and `TextInput` uses that context to disable the input (`src/components/TextInput/TextInput.tsx:161`, `src/components/TextInput/TextInput.tsx:187`). `PasswordInput` only disables the eye button from its own `isDisabled` prop (`src/components/PasswordInput/PasswordInput.tsx:20`, `src/components/PasswordInput/PasswordInput.tsx:36`). Inside `<InputGroup isDisabled>`, the password input is disabled, but the toggle button remains clickable and can still reveal/hide the password. No test covers this grouped-disabled path.

### Medium: Password manager/autofill metadata cannot be provided

`PasswordInputProps` inherits `TextInputProps`, and `TextInputProps` has no `autoComplete` prop (`src/components/TextInput/TextInput.tsx:23`). The rendered `<input>` does not set `autoComplete` (`src/components/TextInput/TextInput.tsx:177`). Password fields commonly need `autocomplete="current-password"` or `autocomplete="new-password"` for browser/password-manager behavior and WCAG 1.3.5 input purpose support. This is more acute here than on a generic text input because `PasswordInput` always renders a password credential field by default (`src/components/PasswordInput/PasswordInput.tsx:49`).

### Medium: A visible password can become locked visible when disabled

Visibility is stored internally (`src/components/PasswordInput/PasswordInput.tsx:25`) and still controls the input type after `isDisabled` becomes true (`src/components/PasswordInput/PasswordInput.tsx:49`). If a user reveals the password and the parent disables the form, the component remains `type="text"` while the toggle button is disabled (`src/components/PasswordInput/PasswordInput.tsx:36`). That can leave the secret exposed with no way for the user to hide it until the control is re-enabled.

### Low: `hasClear` is allowed even though PasswordInput owns end content

The props omit `endContent`, `startIcon`, and `type`, but not `hasClear` (`src/components/PasswordInput/PasswordInput.tsx:7`). `TextInput` renders its clear button before `endContent` (`src/components/TextInput/TextInput.tsx:202`, `src/components/TextInput/TextInput.tsx:211`), so `hasClear` with a non-empty password creates adjacent clear and reveal buttons. That may be intentional, but the API gives no guidance and there is no story/test showing how this combined control should look or behave.

### Low: Public input-event API is sparse for form integrations

Because `PasswordInput` is limited to `TextInputProps`, it also lacks common input props such as `onBlur`, `onFocus`, `id`, `inputMode`, and native `aria-*` passthrough. `NumberInput` exposes `autoComplete`, `onBlur`, and `onFocus` (`src/components/NumberInput/NumberInput.tsx:25`, `src/components/NumberInput/NumberInput.tsx:41`), while `TextInput`/`PasswordInput` do not (`src/components/TextInput/TextInput.tsx:23`). This makes touched-state validation, analytics, and some form-library integrations awkward.

## Tests

Existing tests cover default password type, mouse-click visibility toggling, `onChange`, and disabling the toggle via the direct `isDisabled` prop (`src/components/PasswordInput/PasswordInput.test.tsx:7`, `src/components/PasswordInput/PasswordInput.test.tsx:15`, `src/components/PasswordInput/PasswordInput.test.tsx:29`, `src/components/PasswordInput/PasswordInput.test.tsx:38`).

Missing important coverage:

- Disabled `InputGroup` propagation to the visibility toggle.
- Visibility reset or masking behavior when the component becomes disabled.
- `ref` forwarding to the underlying input (`src/components/PasswordInput/PasswordInput.tsx:14`).
- Field metadata/status wiring such as `description`, `status`, `isRequired`, and `isLabelHidden`.
- `hasClear` interaction with the reveal toggle, if that prop remains supported.
- Keyboard activation of the reveal toggle.

## Stories and Docs

Stories exist for default, value, disabled, and error status states (`src/components/PasswordInput/PasswordInput.stories.tsx:16`, `src/components/PasswordInput/PasswordInput.stories.tsx:18`, `src/components/PasswordInput/PasswordInput.stories.tsx:22`, `src/components/PasswordInput/PasswordInput.stories.tsx:26`).

Missing useful stories:

- Password requirements via `description`.
- Required/optional label states.
- Size variants.
- Hidden label.
- Loading state.
- InputGroup usage, especially disabled InputGroup behavior.
- `hasClear` plus reveal toggle, or removal/documentation of that combination.

No dedicated docs file was found for `PasswordInput`; local API documentation is currently limited to prop comments inherited from `TextInput` and Storybook stories.

## Category Notes

- Performance: no material performance issue found. The component creates a small button subtree per render (`src/components/PasswordInput/PasswordInput.tsx:32`), which is normal here.
- Accessibility: the main issues are disabled grouped behavior and missing password autocomplete metadata; the label, status, description, and button accessible names otherwise flow through existing `TextInput`/`Field` plumbing.
- Logic: no issue found in the basic show/hide state transition covered by tests.
