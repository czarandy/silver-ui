'use client';

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';

export type ListboxNavigationOption = {
  isDisabled?: boolean;
  value: string;
};

export type UseListboxNavigationOptions = {
  shouldClearOnCommit?: boolean;
  inputId: string;
  isDisabled?: boolean;
  isOpen: boolean;
  onCommit: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  options: ReadonlyArray<ListboxNavigationOption>;
  selectedValues?: ReadonlySet<string>;
};

export type UseListboxNavigationResult = {
  activeDescendantId: string | undefined;
  getOptionId: (optionValue: string) => string;
  handleKeyboardNavigation: (
    event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
  ) => void;
  highlightedValue: string | null;
  setHighlightedValue: Dispatch<SetStateAction<string | null>>;
};

export function useListboxNavigation({
  inputId,
  isDisabled = false,
  isOpen,
  onCommit,
  onOpenChange,
  options,
  selectedValues,
  shouldClearOnCommit = true,
}: UseListboxNavigationOptions): UseListboxNavigationResult {
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const enabledOptions = useMemo(
    () => options.filter(option => !option.isDisabled),
    [options],
  );

  const getOptionId = useCallback(
    (optionValue: string): string =>
      `${inputId}-option-${optionValue.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    [inputId],
  );

  const activeDescendantId =
    isOpen && highlightedValue != null
      ? getOptionId(highlightedValue)
      : undefined;

  const getInitialHighlight = useCallback(
    (direction: 'first' | 'last' = 'first'): string | null => {
      if (enabledOptions.length === 0) {
        return null;
      }

      const selectedEnabledOption = enabledOptions.find(option =>
        selectedValues?.has(option.value),
      );
      if (selectedEnabledOption != null) {
        return selectedEnabledOption.value;
      }

      return direction === 'last'
        ? enabledOptions[enabledOptions.length - 1].value
        : enabledOptions[0].value;
    },
    [enabledOptions, selectedValues],
  );

  const moveHighlight = useCallback(
    (direction: 1 | -1): void => {
      if (enabledOptions.length === 0) {
        setHighlightedValue(null);
        return;
      }

      setHighlightedValue(currentValue => {
        const currentIndex = enabledOptions.findIndex(
          option => option.value === currentValue,
        );
        const nextIndex =
          currentIndex === -1
            ? direction === 1
              ? 0
              : enabledOptions.length - 1
            : (currentIndex + direction + enabledOptions.length) %
              enabledOptions.length;
        return enabledOptions[nextIndex].value;
      });
    },
    [enabledOptions],
  );

  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>): void => {
      if (isDisabled) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isOpen) {
          onOpenChange(true);
          setHighlightedValue(
            getInitialHighlight(event.key === 'ArrowUp' ? 'last' : 'first'),
          );
          return;
        }

        moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (event.key === 'Home' && isOpen) {
        event.preventDefault();
        setHighlightedValue(getInitialHighlight('first'));
        return;
      }

      if (event.key === 'End' && isOpen) {
        event.preventDefault();
        setHighlightedValue(getInitialHighlight('last'));
        return;
      }

      if (event.key === 'Enter' && isOpen && highlightedValue != null) {
        event.preventDefault();
        onCommit(highlightedValue);
        if (shouldClearOnCommit) {
          setHighlightedValue(null);
        }
        return;
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onOpenChange(false);
        setHighlightedValue(null);
      }
    },
    [
      getInitialHighlight,
      highlightedValue,
      isDisabled,
      isOpen,
      moveHighlight,
      onCommit,
      onOpenChange,
      shouldClearOnCommit,
    ],
  );

  return {
    activeDescendantId,
    getOptionId,
    handleKeyboardNavigation,
    highlightedValue,
    setHighlightedValue,
  };
}
