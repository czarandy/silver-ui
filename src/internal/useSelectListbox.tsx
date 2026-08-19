'use client';

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from 'react';
import type {InputStatus} from 'components/Field';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import useTypeahead from 'hooks/useTypeahead';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {useListboxNavigation} from 'internal/useListboxNavigation';

export interface SelectListboxOptionData {
  isDisabled?: boolean;
  label?: string;
  value: string;
}

export interface SelectListboxDivider {
  type: 'divider';
}

export interface SelectListboxSection<TOption extends SelectListboxOptionData> {
  options: ReadonlyArray<TOption>;
  title?: string;
  type: 'section';
}

export type SelectListboxOption<TOption extends SelectListboxOptionData> =
  SelectListboxDivider | SelectListboxSection<TOption> | TOption | string;

function normalizeSelectListboxOption<TOption extends SelectListboxOptionData>(
  option: string | TOption,
): TOption {
  return (
    typeof option === 'string'
      ? {label: option, value: option}
      : {...option, label: option.label ?? option.value}
  ) as TOption;
}

function getSelectListboxOptions<TOption extends SelectListboxOptionData>(
  options: ReadonlyArray<SelectListboxOption<TOption>>,
): TOption[] {
  return options.flatMap(option => {
    if (typeof option === 'string') {
      return [normalizeSelectListboxOption<TOption>(option)];
    }
    if ('type' in option) {
      return option.type === 'section'
        ? option.options.map(normalizeSelectListboxOption<TOption>)
        : [];
    }
    return [normalizeSelectListboxOption<TOption>(option)];
  });
}

export type UseSelectListboxOptions<TOption extends SelectListboxOptionData> = {
  description: ReactNode;
  hasEntriesOnFocus?: boolean;
  isDefaultOpen?: boolean;
  isDisabled?: boolean;
  isHighlightClearedOnCommit?: boolean;
  isLoading?: boolean;
  isListboxClosedOnCommit?: boolean;
  isQueryClearedOnCommit?: boolean;
  isReadOnly?: boolean;
  isTypeaheadEnabled?: boolean;
  onCommitOption: (option: TOption) => unknown;
  options: ReadonlyArray<SelectListboxOption<TOption>>;
  selectedValues: ReadonlySet<string>;
  status: InputStatus | undefined;
};

export type UseSelectListboxResult<TOption extends SelectListboxOptionData> = {
  activeDescendantId: string | undefined;
  describedBy: string | undefined;
  descriptionID: string | undefined;
  filteredValues: ReadonlySet<string>;
  getOptionId: (optionValue: string) => string;
  handleKeyboardNavigation: (
    event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
  ) => void;
  handleOptionClick: (event: MouseEvent<HTMLElement>) => void;
  handleOptionMouseEnter: (event: MouseEvent<HTMLElement>) => void;
  handleTriggerBlur: () => void;
  handleTriggerClick: () => void;
  handleTriggerFocus: () => void;
  handleTriggerPointerDown: () => void;
  highlightedValue: string | null;
  inputId: string;
  isInteractionDisabled: boolean;
  isOpen: boolean;
  listboxId: string;
  optionByValue: ReadonlyMap<string, TOption>;
  query: string;
  selectableOptions: ReadonlyArray<TOption>;
  setHighlightedValue: Dispatch<SetStateAction<string | null>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setQuery: Dispatch<SetStateAction<string>>;
  statusMessageID: string | undefined;
  triggerRef: RefObject<HTMLDivElement | null>;
  visibleSelectableOptions: ReadonlyArray<TOption>;
};

export function useSelectListbox<TOption extends SelectListboxOptionData>({
  description,
  hasEntriesOnFocus = false,
  isDefaultOpen = false,
  isDisabled = false,
  isHighlightClearedOnCommit = true,
  isLoading = false,
  isListboxClosedOnCommit = false,
  isQueryClearedOnCommit = false,
  isReadOnly = false,
  isTypeaheadEnabled = false,
  onCommitOption,
  options,
  selectedValues,
  status,
}: UseSelectListboxOptions<TOption>): UseSelectListboxResult<TOption> {
  const inputId = useId();
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const [query, setQuery] = useState('');
  // `hasEntriesOnFocus` opens the listbox as soon as the trigger takes focus,
  // which two kinds of focus have to be kept out of:
  //
  // - The focus a pointer press puts on the trigger on its way to clicking it.
  //   Opening there fights the browser: the press already opened the listbox by
  //   the time the pointer is released, so the native popover light-dismisses
  //   itself and the click appears to do nothing. The press keeps its ordinary
  //   click-to-toggle behaviour instead.
  // - The focus a close hands straight back to the trigger -- the popover
  //   restores focus when it had taken it for an in-popover search field --
  //   which would immediately re-open the listbox. Closing therefore disarms
  //   focus-to-open, and `handleTriggerBlur` re-arms it once focus has settled
  //   outside the field.
  const isPointerPressRef = useRef(false);
  const isFocusOpenAllowedRef = useRef(true);

  // Every close goes through here, so focus-to-open is disarmed while the
  // closing update renders -- before the popover restores focus from its layout
  // effect, which is too early for an effect here to have run.
  const updateIsOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    nextIsOpen => {
      setIsOpen(currentIsOpen => {
        const resolvedIsOpen =
          typeof nextIsOpen === 'function'
            ? nextIsOpen(currentIsOpen)
            : nextIsOpen;
        if (!resolvedIsOpen) {
          isFocusOpenAllowedRef.current = false;
        }
        return resolvedIsOpen;
      });
    },
    [],
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${inputId}-listbox`;
  const selectableOptions = useMemo(
    () => getSelectListboxOptions(options),
    [options],
  );
  const optionByValue = useMemo(
    () => new Map(selectableOptions.map(option => [option.value, option])),
    [selectableOptions],
  );
  const filteredValues = useMemo(() => {
    if (query.trim() === '') {
      return new Set(selectableOptions.map(option => option.value));
    }
    const lowerQuery = query.toLowerCase();
    return new Set(
      selectableOptions
        .filter(option =>
          (option.label ?? option.value).toLowerCase().includes(lowerQuery),
        )
        .map(option => option.value),
    );
  }, [query, selectableOptions]);
  const visibleSelectableOptions = useMemo(
    () => selectableOptions.filter(option => filteredValues.has(option.value)),
    [filteredValues, selectableOptions],
  );
  const enabledSelectableOptions = useMemo(
    () => selectableOptions.filter(option => !option.isDisabled),
    [selectableOptions],
  );
  const isInteractionDisabled = isDisabled || isLoading;

  const {
    activeDescendantId,
    getOptionId,
    handleKeyboardNavigation: handleListboxKeyboardNavigation,
    highlightedValue,
    setHighlightedValue,
  } = useListboxNavigation({
    inputId,
    isDisabled: isInteractionDisabled,
    isOpen,
    onCommit: optionValue => {
      const option = optionByValue.get(optionValue);
      if (option == null) {
        return;
      }

      if (onCommitOption(option) === false) {
        return;
      }

      if (isListboxClosedOnCommit) {
        updateIsOpen(false);
      }
      if (isQueryClearedOnCommit) {
        setQuery('');
      }
    },
    onOpenChange: updateIsOpen,
    options: visibleSelectableOptions,
    selectedValues,
    shouldClearOnCommit: isHighlightClearedOnCommit,
  });

  const handleTypeahead = useTypeahead<TOption>({
    getActiveIndex: () =>
      enabledSelectableOptions.findIndex(option =>
        selectedValues.has(option.value),
      ),
    getItems: () => enabledSelectableOptions,
    getLabel: option => option.label ?? option.value,
    onMatch: onCommitOption,
  });

  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>): void => {
      handleListboxKeyboardNavigation(event);

      if (
        event.defaultPrevented ||
        isInteractionDisabled ||
        !isTypeaheadEnabled ||
        isOpen ||
        event.currentTarget instanceof HTMLInputElement
      ) {
        return;
      }

      handleTypeahead(event);
    },
    [
      handleListboxKeyboardNavigation,
      handleTypeahead,
      isInteractionDisabled,
      isOpen,
      isTypeaheadEnabled,
    ],
  );

  const handleOptionClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const optionValue = event.currentTarget.dataset.value;
      const option =
        optionValue == null ? undefined : optionByValue.get(optionValue);
      if (option == null || onCommitOption(option) === false) {
        return;
      }

      if (isListboxClosedOnCommit) {
        updateIsOpen(false);
      }
      if (isQueryClearedOnCommit) {
        setQuery('');
      }
    },
    [
      isListboxClosedOnCommit,
      isQueryClearedOnCommit,
      onCommitOption,
      optionByValue,
      updateIsOpen,
    ],
  );

  const handleOptionMouseEnter = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const optionValue = event.currentTarget.dataset.value;
      const option =
        optionValue == null ? undefined : optionByValue.get(optionValue);
      if (option != null && !option.isDisabled) {
        setHighlightedValue(option.value);
      }
    },
    [optionByValue, setHighlightedValue],
  );

  const handleTriggerPointerDown = useCallback((): void => {
    // The focus that belongs to this press lands before the frame is out; by
    // the next one the click has had its say and the flag is spent, whether or
    // not the press ever became a click.
    isPointerPressRef.current = true;
    requestAnimationFrame(() => {
      isPointerPressRef.current = false;
    });
  }, []);

  const handleTriggerClick = useCallback((): void => {
    if (isInteractionDisabled || isReadOnly) {
      return;
    }

    updateIsOpen(currentIsOpen => !currentIsOpen);
  }, [isInteractionDisabled, isReadOnly, updateIsOpen]);

  const handleTriggerFocus = useCallback((): void => {
    if (
      !hasEntriesOnFocus ||
      isInteractionDisabled ||
      isReadOnly ||
      isOpen ||
      isPointerPressRef.current ||
      !isFocusOpenAllowedRef.current
    ) {
      return;
    }

    updateIsOpen(true);
  }, [
    hasEntriesOnFocus,
    isInteractionDisabled,
    isOpen,
    isReadOnly,
    updateIsOpen,
  ]);

  const handleTriggerBlur = useCallback((): void => {
    // Focus moving into the popover -- or being handed straight back by a close
    // -- is not focus leaving the field. Waiting a frame lets the whole gesture
    // settle (a click outside dismisses the listbox after the blur), so this
    // only re-arms once focus really is somewhere else.
    requestAnimationFrame(() => {
      const {activeElement} = document;
      if (
        triggerRef.current?.contains(activeElement) !== true &&
        activeElement?.closest('[popover]') == null
      ) {
        isFocusOpenAllowedRef.current = true;
      }
    });
  }, []);

  return {
    activeDescendantId,
    describedBy,
    descriptionID,
    filteredValues,
    getOptionId,
    handleKeyboardNavigation,
    handleOptionClick,
    handleOptionMouseEnter,
    handleTriggerBlur,
    handleTriggerClick,
    handleTriggerFocus,
    handleTriggerPointerDown,
    highlightedValue,
    inputId,
    isInteractionDisabled,
    isOpen,
    listboxId,
    optionByValue,
    query,
    selectableOptions,
    setHighlightedValue,
    setIsOpen: updateIsOpen,
    setQuery,
    statusMessageID,
    triggerRef,
    visibleSelectableOptions,
  };
}

export type RenderSelectListboxOptionsConfig<
  TOption extends SelectListboxOptionData,
> = {
  dividerClassName: string;
  inputId: string;
  options: ReadonlyArray<SelectListboxOption<TOption>>;
  renderOption: (option: TOption) => ReactNode;
  sectionHeadingClassName: string;
};

export function renderSelectListboxOptions<
  TOption extends SelectListboxOptionData,
>({
  dividerClassName,
  inputId,
  options,
  renderOption,
  sectionHeadingClassName,
}: RenderSelectListboxOptionsConfig<TOption>): ReactNode[] {
  // `renderOption` returns null for options filtered out by the current query,
  // so entries are collected with their visibility first and the dividers are
  // resolved afterwards -- a divider only earns its place between two entries
  // that survived the filter.
  const entries: {isDivider: boolean; node: ReactNode}[] = [];
  let dividerCount = 0;
  let sectionCount = 0;

  const pushOption = (option: string | TOption): void => {
    const node = renderOption(normalizeSelectListboxOption<TOption>(option));
    if (isNonEmptyReactNode(node)) {
      entries.push({isDivider: false, node});
    }
  };

  for (const option of options) {
    if (typeof option === 'string' || !('type' in option)) {
      pushOption(option);
    } else if (option.type === 'divider') {
      dividerCount += 1;
      entries.push({
        isDivider: true,
        node: (
          <div
            className={dividerClassName}
            key={`divider-${dividerCount}`}
            role="separator"
          />
        ),
      });
    } else {
      const sectionKey =
        option.title ??
        option.options.map(sectionOption => sectionOption.value).join('|');
      // Counted even when the section is dropped so that keys stay stable as
      // the query changes.
      sectionCount += 1;
      const sectionHeadingId =
        option.title == null
          ? undefined
          : `${inputId}-section-${sectionKey.replace(
              /[^a-zA-Z0-9_-]/g,
              '-',
            )}-${sectionCount}`;
      const sectionOptionNodes = option.options
        .map((sectionOption): ReactNode =>
          renderOption(normalizeSelectListboxOption<TOption>(sectionOption)),
        )
        .filter(isNonEmptyReactNode);
      if (sectionOptionNodes.length === 0) {
        continue;
      }
      entries.push({
        isDivider: false,
        node: (
          <div
            aria-labelledby={sectionHeadingId}
            key={`section-${sectionKey}-${sectionCount}`}
            role="group">
            {option.title != null ? (
              <div className={sectionHeadingClassName} id={sectionHeadingId}>
                {option.title}
              </div>
            ) : null}
            {sectionOptionNodes}
          </div>
        ),
      });
    }
  }

  const optionNodes: ReactNode[] = [];
  let pendingDivider: ReactNode = null;
  for (const entry of entries) {
    if (entry.isDivider) {
      // Nothing rendered yet means a leading divider; otherwise hold it until
      // something follows. Overwriting collapses runs of adjacent dividers.
      if (optionNodes.length > 0) {
        pendingDivider = entry.node;
      }
      continue;
    }
    if (isNonEmptyReactNode(pendingDivider)) {
      optionNodes.push(pendingDivider);
      pendingDivider = null;
    }
    optionNodes.push(entry.node);
  }

  return optionNodes;
}
