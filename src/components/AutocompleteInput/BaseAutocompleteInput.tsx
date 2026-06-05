import {Check, LoaderCircle} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {Icon} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';
import {Text} from '../Text';
import {
  autocompleteMenuRecipe,
  optionHighlightedStyle,
  optionSelectedStyle,
} from './AutocompleteInput.recipe';
import {AutocompleteInputItem} from './AutocompleteInputItem';
import type {SearchableItem, SearchSource} from './types';

export interface BaseAutocompleteInputProps<T extends SearchableItem> {
  /**
   * Ref to the element the result popover should align to.
   */
  anchorRef?: RefObject<HTMLElement | null>;
  /**
   * IDs describing the input.
   */
  ariaDescribedBy?: string;
  /**
   * Additional CSS class names applied to the input.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
   */
  'data-testid'?: string;
  /**
   * Debounce delay in milliseconds before search runs.
   * @default 150
   */
  debounceMs?: number;
  /**
   * Empty state text.
   * @default 'No results found'
   */
  emptySearchResultsText?: string;
  /**
   * Text shown in the menu when a search fails.
   * @default 'Something went wrong'
   */
  errorText?: string;
  /**
   * Whether to focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show bootstrap results on focus before typing.
   * @default false
   */
  hasEntriesOnFocus?: boolean;
  /**
   * Whether to re-bootstrap results after selecting an item. Useful for
   * multi-select comboboxes where the user picks several items in a row.
   * @default false
   */
  hasReopenOnSelect?: boolean;
  /**
   * Optional ID for the input.
   */
  inputId?: string;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the input is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Maximum number of menu items.
   * @default 10
   */
  maxMenuItems?: number;
  /**
   * Called when a result is selected.
   */
  onChange: (item: T | null) => void;
  /**
   * Keyboard handler invoked before internal navigation.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Called when the result popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Called when the query changes.
   */
  onQueryChange: (query: string) => void;
  /**
   * Placeholder text.
   * @default 'Search...'
   */
  placeholder?: string;
  /**
   * Current query string.
   */
  query: string;
  /**
   * Ref forwarded to the input.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Custom result renderer.
   */
  renderItem?: (item: T) => ReactNode;
  /**
   * Search source.
   */
  searchSource: SearchSource<T>;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Inline styles applied to the input.
   */
  style?: CSSProperties;
  /**
   * Selected item.
   */
  value: T | null;
}

const styles = {
  input: css({
    display: 'block',
    flex: 1,
    minW: '15',
    borderWidth: 0,
    p: 0,
    fontFamily: 'body',
    fontSize: 'md',
    lineHeight: 'normal',
    color: 'fg',
    bg: 'transparent',
    outline: 'none',
    _placeholder: {color: 'fg.muted'},
    _disabled: {cursor: 'not-allowed'},
  }),
} as const;

/**
 * Internal combobox engine used by AutocompleteInput and TagsInput.
 */
export function BaseAutocompleteInput<T extends SearchableItem>({
  anchorRef,
  ariaDescribedBy,
  className,
  'data-testid': dataTestId,
  debounceMs = 150,
  emptySearchResultsText = 'No results found',
  errorText = 'Something went wrong',
  hasAutoFocus = false,
  hasEntriesOnFocus = false,
  hasReopenOnSelect = false,
  inputId,
  isDisabled = false,
  isRequired = false,
  maxMenuItems = 10,
  onChange,
  onKeyDown,
  onOpenChange,
  onQueryChange,
  placeholder = 'Search...',
  query,
  ref,
  renderItem,
  searchSource,
  size = 'md',
  style,
  value,
}: BaseAutocompleteInputProps<T>): React.JSX.Element {
  const generatedId = useId();
  const listboxId = useId();
  const resolvedInputId = inputId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackAnchorRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const [results, setResults] = useState<T[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const selectingRef = useRef(false);

  const setOpen = useCallback(
    (isNextOpen: boolean) => {
      setIsOpen(isNextOpen);
      onOpenChange?.(isNextOpen);
      if (!isNextOpen) {
        searchSource.cancel?.();
        setHighlightedIndex(-1);
      }
    },
    [onOpenChange, searchSource],
  );

  const showMenu = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const runSearch = useCallback(
    async (nextQuery: string, kind: 'bootstrap' | 'search') => {
      const generation = ++generationRef.current;
      searchSource.cancel?.();
      setIsLoading(true);
      setHasSearched(true);
      setHasError(false);

      try {
        const nextResults =
          kind === 'bootstrap'
            ? await searchSource.bootstrap()
            : await searchSource.search(nextQuery);
        if (generationRef.current !== generation) {
          return;
        }
        const limitedResults = nextResults.slice(0, maxMenuItems);
        setResults(limitedResults);
        setHighlightedIndex(limitedResults.length > 0 ? 0 : -1);
        if (limitedResults.length > 0 || nextQuery !== '') {
          showMenu();
        } else {
          setOpen(false);
        }
      } catch {
        if (generationRef.current === generation) {
          setResults([]);
          setHighlightedIndex(-1);
          setHasError(true);
          showMenu();
        }
      } finally {
        if (generationRef.current === generation) {
          setIsLoading(false);
        }
      }
    },
    [maxMenuItems, searchSource, setOpen, showMenu],
  );

  const updateQuery = useCallback(
    (nextQuery: string) => {
      onQueryChange(nextQuery);

      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }

      if (nextQuery === '' && !hasEntriesOnFocus) {
        generationRef.current++;
        searchSource.cancel?.();
        setResults([]);
        setHasSearched(false);
        setHasError(false);
        setIsLoading(false);
        setOpen(false);
        return;
      }

      const searchKind = nextQuery === '' ? 'bootstrap' : 'search';
      if (debounceMs <= 0) {
        void runSearch(nextQuery, searchKind);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        void runSearch(nextQuery, searchKind);
      }, debounceMs);
    },
    [
      debounceMs,
      hasEntriesOnFocus,
      onQueryChange,
      runSearch,
      searchSource,
      setOpen,
    ],
  );

  const selectItem = useCallback(
    (item: T) => {
      generationRef.current++;
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
      searchSource.cancel?.();
      onQueryChange('');
      setResults([]);
      setHasSearched(false);
      setHasError(false);
      setIsLoading(false);
      onChange(item);
      selectingRef.current = true;
      inputRef.current?.focus();
      selectingRef.current = false;
      if (hasReopenOnSelect && hasEntriesOnFocus) {
        void runSearch('', 'bootstrap');
      } else {
        setOpen(false);
      }
    },
    [
      hasEntriesOnFocus,
      hasReopenOnSelect,
      onChange,
      onQueryChange,
      runSearch,
      searchSource,
      setOpen,
    ],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
      searchSource.cancel?.();
    };
  }, [searchSource]);

  const menuClasses = autocompleteMenuRecipe({size});

  const menu = (
    <div
      aria-label="Search results"
      className={menuClasses.menu}
      id={listboxId}
      role="listbox">
      {isLoading ? (
        <div className={menuClasses.loading} role="status">
          <Icon icon={LoaderCircle} size="sm" />
          <Text as="span" color="secondary" type="supporting">
            Loading
          </Text>
        </div>
      ) : hasError ? (
        <div className={menuClasses.empty} role="alert">
          <Text as="span" color="secondary" type="supporting">
            {errorText}
          </Text>
        </div>
      ) : results.length === 0 && hasSearched ? (
        <div className={menuClasses.empty}>
          <Text as="span" color="secondary" type="supporting">
            {emptySearchResultsText}
          </Text>
        </div>
      ) : (
        results.map((item, index) => {
          const isSelected = value?.id === item.id;
          return (
            <button
              aria-selected={isSelected}
              className={cx(
                menuClasses.option,
                index === highlightedIndex ? optionHighlightedStyle : undefined,
                isSelected ? optionSelectedStyle : undefined,
              )}
              id={`${listboxId}-option-${index}`}
              key={item.id}
              onClick={() => selectItem(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              type="button">
              {renderItem == null ? (
                <AutocompleteInputItem item={item} />
              ) : (
                renderItem(item)
              )}
              {isSelected ? (
                <span className={menuClasses.check}>
                  <Icon color="accent" icon={Check} size="sm" />
                </span>
              ) : null}
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <>
      <input
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-required={isRequired || undefined}
        autoComplete="off"
        // eslint-disable-next-line jsx-a11y-x/no-autofocus
        autoFocus={hasAutoFocus}
        className={cx(styles.input, className)}
        data-autofocus={hasAutoFocus || undefined}
        data-testid={dataTestId}
        disabled={isDisabled}
        id={resolvedInputId}
        onBlur={() => {
          // Defer so we can check whether focus moved to an option inside
          // the popover (e.g. the user clicked a result). If focus left
          // both the input and the popover, close the menu.
          requestAnimationFrame(() => {
            if (
              !inputRef.current?.contains(document.activeElement) &&
              !document.activeElement?.closest('[role="listbox"]')
            ) {
              setOpen(false);
            }
          });
        }}
        onChange={event => updateQuery(event.target.value)}
        onFocus={() => {
          if (selectingRef.current) {
            return;
          }
          if (query !== '' && results.length === 0) {
            void runSearch(query, 'search');
          } else if (
            hasEntriesOnFocus &&
            query === '' &&
            results.length === 0
          ) {
            void runSearch('', 'bootstrap');
          } else if (results.length > 0) {
            showMenu();
          }
        }}
        onKeyDown={event => {
          onKeyDown?.(event);
          if (event.defaultPrevented) {
            return;
          }

          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
              if (results.length > 0) {
                showMenu();
              } else if (hasEntriesOnFocus) {
                void runSearch('', 'bootstrap');
              }
              return;
            }
            setHighlightedIndex(index =>
              results.length === 0 ? -1 : (index + 1) % results.length,
            );
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex(index =>
              results.length === 0
                ? -1
                : (index - 1 + results.length) % results.length,
            );
          } else if (
            event.key === 'Enter' &&
            isOpen &&
            highlightedIndex >= 0 &&
            highlightedIndex < results.length
          ) {
            event.preventDefault();
            selectItem(results[highlightedIndex]);
          } else if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        ref={mergeRefs(ref, inputRef, fallbackAnchorRef)}
        role="combobox"
        style={style}
        type="text"
        value={query}
      />
      {isLoading ? <Spinner size="sm" /> : null}
      <Popover
        anchorRef={anchorRef ?? fallbackAnchorRef}
        content={menu}
        hasAutoFocus={false}
        hasCloseButton={false}
        hasLightDismiss={false}
        isOpen={isOpen}
        onOpenChange={setOpen}
      />
    </>
  );
}

BaseAutocompleteInput.displayName = 'BaseAutocompleteInput';
