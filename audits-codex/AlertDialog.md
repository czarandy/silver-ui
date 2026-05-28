# AlertDialog Audit

Reviewed:

- `src/components/AlertDialog/AlertDialog.tsx`
- `src/components/AlertDialog/useAlertDialog.tsx`
- `src/components/AlertDialog/AlertDialog.stories.tsx`
- `src/components/AlertDialog/AlertDialog.test.tsx`
- `src/components/AlertDialog/index.ts`
- `src/components/Dialog/Dialog.tsx` and `src/components/Button/Button.tsx` for inherited behavior

## Findings

### High: alertdialog description is not programmatically associated

`AlertDialog` renders the destructive-action consequence text at `src/components/AlertDialog/AlertDialog.tsx:117`, but the underlying dialog only receives `aria-label={label}` at `src/components/Dialog/Dialog.tsx:194` and has no `aria-describedby` support. For an `alertdialog`, the description is critical context and should be announced with the dialog, not only discoverable by reading through the contents.

Add a stable id to the description text and let `Dialog` accept/pass `aria-describedby`, or expose a description slot/id API from `Dialog`.

### Medium: inline mode drops alertdialog semantics

`AlertDialog` exposes `isInline` at `src/components/AlertDialog/AlertDialog.tsx:42` and forwards it at `src/components/AlertDialog/AlertDialog.tsx:106`. In that path, `Dialog` renders a plain `<div aria-label={label}>` at `src/components/Dialog/Dialog.tsx:161` instead of the modal `<dialog role="alertdialog">` path at `src/components/Dialog/Dialog.tsx:193` and `src/components/Dialog/Dialog.tsx:215`.

If inline AlertDialog is a supported API, it should preserve an appropriate role and semantics. If not, remove `isInline` from `AlertDialogProps` because alert dialogs are normally modal confirmation surfaces.

### Medium: no explicit initial focus target for the destructive confirmation

`Dialog` only explicitly focuses descendants matching `[data-autofocus="true"], [autofocus]` at `src/components/Dialog/Dialog.tsx:135`. `AlertDialog` renders Cancel and action buttons at `src/components/AlertDialog/AlertDialog.tsx:121` without marking either as the initial focus target, and `ButtonProps` does not expose `autoFocus`/`data-autofocus`.

For destructive confirmations, initial focus should generally land on the least destructive action, usually Cancel. This is also not tested in `src/components/AlertDialog/AlertDialog.test.tsx`.

### Low: action click behavior is easy to misuse

The action button only calls `onAction` at `src/components/AlertDialog/AlertDialog.tsx:130`; it does not close the dialog. The story demonstrates closing manually at `src/components/AlertDialog/AlertDialog.stories.tsx:29`, but the prop comment at `src/components/AlertDialog/AlertDialog.tsx:51` does not make this contract explicit.

Keeping the dialog open is useful for async loading, so this is not necessarily a bug. The API/docs should state that consumers must close the dialog themselves, or the component should offer an explicit auto-close option.

### Low: `description` API is more restrictive than the rendered content model

`description` is typed as `string` at `src/components/AlertDialog/AlertDialog.tsx:36` and rendered inside text at `src/components/AlertDialog/AlertDialog.tsx:117`. This blocks common confirmation copy such as linked policy text, emphasized object names, or short structured warnings. Consider `ReactNode` if rich descriptions are expected, or document that AlertDialog intentionally accepts plain text only.

## Tests

Existing tests cover basic rendering, action click, cancel click, and opening through `useAlertDialog` in `src/components/AlertDialog/AlertDialog.test.tsx:23`.

Missing important coverage:

- `isActionLoading` disables/prevents the action and exposes loading state (`src/components/AlertDialog/AlertDialog.tsx:127`, inherited from `Button` at `src/components/Button/Button.tsx:222`).
- `useAlertDialog.hide()` closes the dialog and updates `isOpen` (`src/components/AlertDialog/useAlertDialog.tsx:36`).
- Repeated `show()` calls replace the current options/content (`src/components/AlertDialog/useAlertDialog.tsx:32`).
- `cancelLabel`, `actionVariant`, `width`, `className`, `style`, `data-testid`, `ref`, and `isInline` forwarding.
- Accessibility assertions for description association and initial focus.

## Stories And Docs

Stories exist for Default, LoadingAction, and Imperative in `src/components/AlertDialog/AlertDialog.stories.tsx:58`. I did not find a separate `AlertDialog` doc metadata file under `src/components`; this repo appears to rely primarily on Storybook stories for component docs.

Missing useful stories:

- Custom `cancelLabel`.
- Dedicated `actionVariant` examples, especially destructive vs primary.
- `isInline` if it remains public.
- Custom `width`.
- Long title/description content to exercise wrapping and overflow.

## Performance

No significant performance problems found. The component is small, delegates modal behavior to `Dialog`, and `useAlertDialog` memoizes the rendered element at `src/components/AlertDialog/useAlertDialog.tsx:38`.

## Logic

No clear internal state logic bugs found beyond the API footgun around action clicks not closing automatically. The imperative hook keeps the latest options in state and renders from that state.
