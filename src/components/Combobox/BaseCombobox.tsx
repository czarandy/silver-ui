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
import {Text} from '../Text';
import {ComboboxItem} from './ComboboxItem';
import type {SearchableItem, SearchSource} from './types';

export interface BaseComboboxProps<T extends SearchableItem> {
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
   * Optional ID for the input.
   */
  inputId?: string;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
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
  onQueryChange?: (query: string) => void;
  /**
   * Placeholder text.
   * @default 'Search...'
   */
  placeholder?: string;
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
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    overflowY: 'auto',
    p: '1',
  }),
  option: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2',
    w: 'full',
    borderWidth: 0,
    borderRadius: 'md',
    bg: 'transparent',
    color: 'fg',
    cursor: 'pointer',
    fontFamily: 'body',
    textAlign: 'start',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '1px',
    },
  }),
  optionHighlighted: css({bg: 'bg.subtle'}),
  optionSelected: css({fontWeight: 'medium'}),
  optionSize: {
    sm: css({px: '2', py: '1'}),
    md: css({px: '2', py: '2'}),
    lg: css({px: '3', py: '2.5'}),
  } satisfies Record<'sm' | 'md' | 'lg', string>,
  check: css({
    display: 'inline-flex',
    flexShrink: 0,
    color: 'primary',
  }),
  loading: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    p: '2',
    color: 'fg.muted',
    '& > svg': {
      animation: 'spin 0.8s linear infinite',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '& > svg': {animation: 'none'},
    },
  }),
  empty: css({
    p: '3',
    textAlign: 'center',
  }),
} as const;

/**
 * Internal combobox engine used by Combobox and TagsInput.
 */
export function BaseCombobox<T extends SearchableItem>({
  anchorRef,
  ariaDescribedBy,
  className,
  'data-testid': dataTestId,
  debounceMs = 150,
  emptySearchResultsText = 'No results found',
  hasAutoFocus = false,
  hasEntriesOnFocus = false,
  inputId,
  isDisabled = false,
  maxMenuItems = 10,
  onChange,
  onKeyDown,
  onOpenChange,
  onQueryChange,
  placeholder = 'Search...',
  ref,
  renderItem,
  searchSource,
  size = 'md',
  style,
  value,
}: BaseComboboxProps<T>): React.JSX.Element {
  const generatedId = useId();
  const listboxId = useId();
  const resolvedInputId = inputId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackAnchorRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const runSearch = useCallback(
    async (nextQuery: string, kind: 'bootstrap' | 'search') => {
      const generation = ++generationRef.current;
      searchSource.cancel?.();
      setIsLoading(true);
      setHasSearched(true);

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
        setOpen(limitedResults.length > 0 || nextQuery !== '');
      } catch {
        if (generationRef.current === generation) {
          setResults([]);
          setHighlightedIndex(-1);
          setOpen(false);
        }
      } finally {
        if (generationRef.current === generation) {
          setIsLoading(false);
        }
      }
    },
    [maxMenuItems, searchSource, setOpen],
  );

  const updateQuery = useCallback(
    (nextQuery: string) => {
      setQuery(nextQuery);
      onQueryChange?.(nextQuery);

      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }

      if (nextQuery === '' && !hasEntriesOnFocus) {
        generationRef.current++;
        searchSource.cancel?.();
        setResults([]);
        setHasSearched(false);
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
      onChange(item);
      setQuery('');
      setResults([]);
      setHasSearched(false);
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, searchSource, setOpen],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
      searchSource.cancel?.();
    };
  }, [searchSource]);

  const menu = (
    <div
      aria-label="Search results"
      className={styles.menu}
      id={listboxId}
      role="listbox">
      {isLoading ? (
        <div className={styles.loading} role="status">
          <Icon icon={LoaderCircle} size="sm" />
          <Text as="span" color="secondary" type="supporting">
            Loading
          </Text>
        </div>
      ) : results.length === 0 && hasSearched ? (
        <div className={styles.empty}>
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
                styles.option,
                styles.optionSize[size],
                index === highlightedIndex
                  ? styles.optionHighlighted
                  : undefined,
                isSelected ? styles.optionSelected : undefined,
              )}
              id={`${listboxId}-option-${index}`}
              key={item.id}
              onClick={() => selectItem(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              type="button">
              {renderItem == null ? (
                <ComboboxItem item={item} />
              ) : (
                renderItem(item)
              )}
              {isSelected ? (
                <span className={styles.check}>
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
        autoComplete="off"
        // eslint-disable-next-line jsx-a11y-x/no-autofocus
        autoFocus={hasAutoFocus}
        className={cx(styles.input, className)}
        data-autofocus={hasAutoFocus || undefined}
        data-testid={dataTestId}
        disabled={isDisabled}
        id={resolvedInputId}
        onChange={event => updateQuery(event.target.value)}
        onFocus={() => {
          if (hasEntriesOnFocus && query === '' && results.length === 0) {
            void runSearch('', 'bootstrap');
          } else if (results.length > 0) {
            setOpen(true);
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
                setOpen(true);
              } else if (hasEntriesOnFocus) {
                void runSearch('', 'bootstrap');
              }
              return;
            }
            setHighlightedIndex(index =>
              results.length === 0
                ? -1
                : Math.min(index + 1, results.length - 1),
            );
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex(index =>
              results.length === 0 ? -1 : Math.max(index - 1, 0),
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
      <Popover
        anchorRef={anchorRef ?? fallbackAnchorRef}
        content={menu}
        hasAutoFocus={false}
        hasCloseButton={false}
        isOpen={isOpen}
        onOpenChange={setOpen}
      />
    </>
  );
}

BaseCombobox.displayName = 'BaseCombobox';
