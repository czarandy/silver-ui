# TagsInput Audit

Scope: `src/components/TagsInput/TagsInput.tsx`, `src/components/TagsInput/TagsInput.stories.tsx`, `src/components/TagsInput/TagsInput.test.tsx`, and export surface in `src/components/TagsInput/index.ts`.

## Findings

### High

- `tagOverflowBehavior` is a documented public prop but is never read or implemented. The type and prop docs define `'none' | 'unfocusedInline' | 'unfocusedLayer'` at `src/components/TagsInput/TagsInput.tsx:28` and `src/components/TagsInput/TagsInput.tsx:186`, and `SearchFilterInput` passes it through at `src/components/SearchFilterInput/SearchFilterInput.tsx:540`, but `TagsInput` does not destructure or use it in `src/components/TagsInput/TagsInput.tsx:231`. Consumers cannot get the advertised overflow behavior, and large selected sets always render inline.

### Medium

- Creatable duplicate detection ignores already-selected items and can create IDs that collide with real source item IDs. The search path filters selected IDs first at `src/components/TagsInput/TagsInput.tsx:287`, then checks only the remaining results for a matching label at `src/components/TagsInput/TagsInput.tsx:294`. With `hasCreate`, selecting "Ada Lovelace" and then typing "Ada Lovelace" can show `Create "Ada Lovelace"` because the real item was filtered out. Typing an existing item's ID, such as `ada`, can create `{id: 'ada', label: 'ada'}` at `src/components/TagsInput/TagsInput.tsx:407`, colliding with the real `{id: 'ada', label: 'Ada Lovelace'}`.

- Validation and required state are visual but not exposed on the actual combobox input. `TagsInput` passes `isRequired` and `status` to `Field` at `src/components/TagsInput/TagsInput.tsx:338` and `src/components/TagsInput/TagsInput.tsx:342`, and wires status text through `aria-describedby` at `src/components/TagsInput/TagsInput.tsx:387`, but `BaseCombobox` only renders `aria-describedby` and not `aria-required` or `aria-invalid` at `src/components/Combobox/BaseCombobox.tsx:412`. Other form controls set these attributes directly, so assistive tech may not receive required/error semantics for TagsInput.

- The clear button clears all values but reports a single remove change, which makes the `onChange` contract ambiguous. The prop docs say `hasClear` removes all tags at `src/components/TagsInput/TagsInput.tsx:81`, and the handler sends `onChange([], {item, type: 'remove'})` for only the first item because of the immediate `break` at `src/components/TagsInput/TagsInput.tsx:446`. Consumers that log changes or synchronize per-item removal cannot tell which full set was cleared except by diffing the old value themselves.

### Low

- The `Creatable` story's `args.value = []` is ineffective because `TagsInputStory` always initializes local state to `[people[0]]` and then overrides `value` after spreading args at `src/components/TagsInput/TagsInput.stories.tsx:23` and `src/components/TagsInput/TagsInput.stories.tsx:26`. The story does not demonstrate an empty creatable input as written.

- Clearing does not restore focus to the input. The clear handler stops propagation and updates state at `src/components/TagsInput/TagsInput.tsx:444`, but unlike `Combobox` clear behavior at `src/components/Combobox/Combobox.tsx:275`, it does not focus the input afterward. When the clear button unmounts, keyboard users may lose their position.

## Coverage Gaps

- Tests only cover adding a selected item and removing one selected tag (`src/components/TagsInput/TagsInput.test.tsx:28`, `src/components/TagsInput/TagsInput.test.tsx:51`). Missing key tests for `hasCreate`, duplicate prevention, `maxEntries`, `hasClear`, Backspace removal, disabled state, `onQueryChange`, `handleRef`, custom `renderItem`/`renderTag`, status/description ARIA wiring, and any eventual `tagOverflowBehavior` behavior.

- Stories only cover `Default` and `Creatable` (`src/components/TagsInput/TagsInput.stories.tsx:38`, `src/components/TagsInput/TagsInput.stories.tsx:41`). Important props without stories include `hasClear`, `maxEntries`, `tagOverflowBehavior`, `isDisabled`, `status`, `description`, `renderItem`, `renderTag`, `endContent`, and size variants.

- Docs beyond Storybook autodocs/stories were not found for TagsInput.

## Categories With No Issues Found

- Performance: no expensive render-time work stood out in the current implementation. Filtering and set creation scale with selected values/results and are memoized around `value`/source inputs, aside from the missing overflow behavior noted above.

- Exports: `src/components/TagsInput/index.ts:1` exports the component and its public types.

## Verification

- Ran `pnpm vitest run src/components/TagsInput/TagsInput.test.tsx`; 1 file / 2 tests passed.
