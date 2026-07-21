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
  isDefaultOpen?: boolean;
  isDisabled?: boolean;
  isHighlightClearedOnCommit?: boolean;
  isLoading?: boolean;
  isListboxClosedOnCommit?: boolean;
  isQueryClearedOnCommit?: boolean;
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
  isDefaultOpen = false,
  isDisabled = false,
  isHighlightClearedOnCommit = true,
  isLoading = false,
  isListboxClosedOnCommit = false,
  isQueryClearedOnCommit = false,
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
        setIsOpen(false);
      }
      if (isQueryClearedOnCommit) {
        setQuery('');
      }
    },
    onOpenChange: setIsOpen,
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
        setIsOpen(false);
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

  return {
    activeDescendantId,
    describedBy,
    descriptionID,
    filteredValues,
    getOptionId,
    handleKeyboardNavigation,
    handleOptionClick,
    handleOptionMouseEnter,
    highlightedValue,
    inputId,
    isInteractionDisabled,
    isOpen,
    listboxId,
    optionByValue,
    query,
    selectableOptions,
    setHighlightedValue,
    setIsOpen,
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
  const optionNodes: ReactNode[] = [];
  let dividerCount = 0;
  let sectionCount = 0;

  for (const option of options) {
    if (typeof option === 'string') {
      optionNodes.push(
        renderOption(normalizeSelectListboxOption<TOption>(option)),
      );
    } else if ('type' in option) {
      if (option.type === 'divider') {
        dividerCount += 1;
        optionNodes.push(
          <div
            className={dividerClassName}
            key={`divider-${dividerCount}`}
            role="separator"
          />,
        );
      } else {
        const sectionKey =
          option.title ??
          option.options.map(sectionOption => sectionOption.value).join('|');
        sectionCount += 1;
        const sectionHeadingId =
          option.title == null
            ? undefined
            : `${inputId}-section-${sectionKey.replace(
                /[^a-zA-Z0-9_-]/g,
                '-',
              )}-${sectionCount}`;
        const sectionOptionNodes: ReactNode[] = [];
        for (const sectionOption of option.options) {
          sectionOptionNodes.push(
            renderOption(normalizeSelectListboxOption<TOption>(sectionOption)),
          );
        }
        optionNodes.push(
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
          </div>,
        );
      }
    } else {
      optionNodes.push(
        renderOption(normalizeSelectListboxOption<TOption>(option)),
      );
    }
  }

  return optionNodes;
}
