'use client';

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';
import {resolveListboxKeyAction} from 'internal/listboxKeyboard';
import {scrollOptionIntoView} from 'internal/scrollOptionIntoView';

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
  const [storedHighlightedValue, setStoredHighlightedValue] = useState<
    string | null
  >(null);
  const highlightedValue = isOpen ? storedHighlightedValue : null;
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

  // Keep the highlighted option visible as the user arrows through an
  // overflowing list. The option elements already carry stable ids, so this
  // runs right after the highlight moves without needing element refs.
  const scrollHighlightIntoView = useCallback(
    (optionValue: string | null): void => {
      if (optionValue != null) {
        scrollOptionIntoView(getOptionId(optionValue));
      }
    },
    [getOptionId],
  );

  const getEdgeHighlight = useCallback(
    (edge: 'first' | 'last'): string | null => {
      if (enabledOptions.length === 0) {
        return null;
      }

      return edge === 'last'
        ? enabledOptions[enabledOptions.length - 1].value
        : enabledOptions[0].value;
    },
    [enabledOptions],
  );

  // Opening the listbox lands on the current selection when there is one, so
  // the user starts from where they left off. Explicit first/last jumps go
  // through `getEdgeHighlight` instead -- they mean the edge, not the
  // selection.
  const getInitialHighlight = useCallback(
    (edge: 'first' | 'last'): string | null => {
      const selectedEnabledOption = enabledOptions.find(option =>
        selectedValues?.has(option.value),
      );
      return selectedEnabledOption?.value ?? getEdgeHighlight(edge);
    },
    [enabledOptions, getEdgeHighlight, selectedValues],
  );

  const getNextHighlight = useCallback(
    (currentValue: string | null, direction: 1 | -1): string | null => {
      if (enabledOptions.length === 0) {
        return null;
      }

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
    },
    [enabledOptions],
  );

  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>): void => {
      if (isDisabled) {
        return;
      }

      const action = resolveListboxKeyAction(event, {isOpen});
      if (action == null) {
        return;
      }

      switch (action.type) {
        case 'open': {
          event.preventDefault();
          onOpenChange(true);
          setStoredHighlightedValue(getInitialHighlight(action.edge));
          return;
        }
        case 'move': {
          event.preventDefault();
          const nextValue = getNextHighlight(highlightedValue, action.step);
          setStoredHighlightedValue(nextValue);
          scrollHighlightIntoView(nextValue);
          return;
        }
        case 'jump': {
          event.preventDefault();
          const nextValue = getEdgeHighlight(action.edge);
          setStoredHighlightedValue(nextValue);
          scrollHighlightIntoView(nextValue);
          return;
        }
        case 'commit': {
          if (highlightedValue == null) {
            return;
          }
          event.preventDefault();
          onCommit(highlightedValue);
          if (shouldClearOnCommit) {
            setStoredHighlightedValue(null);
          }
          return;
        }
      }
    },
    [
      getEdgeHighlight,
      getInitialHighlight,
      getNextHighlight,
      highlightedValue,
      isDisabled,
      isOpen,
      onCommit,
      onOpenChange,
      scrollHighlightIntoView,
      shouldClearOnCommit,
    ],
  );

  return {
    activeDescendantId,
    getOptionId,
    handleKeyboardNavigation,
    highlightedValue,
    setHighlightedValue: setStoredHighlightedValue,
  };
}
