import {X} from 'lucide-react';
import {
  useCallback,
  useImperativeHandle,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useOverflowCount} from '../../internal/useOverflowCount';
import {BaseCombobox} from '../Combobox';
import type {SearchableItem, SearchSource} from '../Combobox';
import {
  Field,
  inputRecipe,
  inputStyles,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Tag} from '../Tag';

export type TagsInputChange<T extends SearchableItem> =
  | {item: T; type: 'add'}
  | {item: T; type: 'create'}
  | {item: T; type: 'remove'}
  | {items: T[]; type: 'remove-all'};

export type TagsInputOverflowBehavior =
  | 'none'
  | 'unfocusedInline'
  | 'unfocusedLayer';

export interface TagsInputHandle {
  /**
   * Blur the input.
   */
  blur(): void;
  /**
   * Focus the input.
   */
  focus(): void;
}

export type TagsInputProps<T extends SearchableItem = SearchableItem> = {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the input wrapper.
   */
  'data-testid'?: string;
  /**
   * Debounce delay in milliseconds before search runs.
   * @default 150
   */
  debounceMs?: number;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Empty state text.
   * @default 'No results found'
   */
  emptySearchResultsText?: string;
  /**
   * Content rendered at the end of the input row.
   */
  endContent?: ReactNode;
  /**
   * Imperative focus/blur handle.
   */
  handleRef?: Ref<TagsInputHandle>;
  /**
   * Whether to focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show a clear button that removes all tags.
   * @default false
   */
  hasClear?: boolean;
  /**
   * Whether users can create a tag from free text.
   * @default false
   */
  hasCreate?: boolean;
  /**
   * Whether to show bootstrap results on focus before typing.
   * @default false
   */
  hasEntriesOnFocus?: boolean;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Field label.
   */
  label: string;
  /**
   * Icon shown before the label.
   */
  labelIcon?: IconComponent;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Maximum number of selected tags.
   */
  maxEntries?: number;
  /**
   * Maximum number of menu items.
   * @default 10
   */
  maxMenuItems?: number;
  /**
   * Called when focus leaves the tags-input.
   */
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Called when selected tags change.
   */
  onChange: (items: T[], change: TagsInputChange<T>) => void;
  /**
   * Called when focus enters the tags-input.
   */
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Called when the query changes.
   */
  onQueryChange?: (query: string) => void;
  /**
   * Placeholder text.
   */
  placeholder?: string;
  /**
   * Ref forwarded to the field root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Custom result renderer.
   */
  renderItem?: (item: T) => ReactNode;
  /**
   * Custom tag renderer.
   */
  renderTag?: (item: T, onRemove: () => void) => ReactNode;
  /**
   * Search source.
   */
  searchSource: SearchSource<T>;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Icon shown before the input.
   */
  startIcon?: IconComponent;
  /**
   * Validation status displayed below the tags-input.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the input wrapper.
   */
  style?: CSSProperties;
  /**
   * Controls how tags overflow when the container is too narrow.
   * - `'none'`: Tags wrap to multiple lines (default).
   * - `'unfocusedInline'`: Single line with "+ N more" when unfocused; expands inline on focus.
   * - `'unfocusedLayer'`: Single line with "+ N more" when unfocused; expands as overlay on focus.
   * @default 'none'
   */
  tagOverflowBehavior?: TagsInputOverflowBehavior;
  /**
   * Selected items.
   */
  value: T[];
} & FieldNecessity;

const CREATABLE_ID_PREFIX = '__silver_create__';

const styles = {
  wrapper: css({
    cursor: 'text',
    flexWrap: 'wrap',
    alignItems: 'center',
    h: 'auto',
  }),
  truncatedWrapper: css({
    flexWrap: 'nowrap',
    overflow: 'hidden',
  }),
  tag: css({flexShrink: 0}),
  input: css({
    minW: '10',
    flex: '1 1 40px',
  }),
  inputHidden: css({
    position: 'absolute',
    opacity: 0,
    w: 0,
    minW: 0,
    flexBasis: 0,
  }),
  endContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  overflowText: css({
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontSize: 'sm',
    color: 'fg.muted',
    px: '1',
  }),
  liveRegion: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  }),
} as const;

function isCreatableItem<T extends SearchableItem>(item: T): boolean {
  return item.id.startsWith(CREATABLE_ID_PREFIX);
}

/**
 * Multi-select combobox that renders selected values as removable tags.
 */
export function TagsInput<T extends SearchableItem>({
  className,
  'data-testid': dataTestId,
  debounceMs,
  description,
  emptySearchResultsText,
  endContent,
  hasAutoFocus = false,
  hasClear = false,
  hasCreate = false,
  hasEntriesOnFocus = false,
  handleRef,
  isDisabled = false,
  isLabelHidden = false,
  isOptional,
  isRequired,
  label,
  labelIcon,
  labelTooltip,
  maxEntries,
  maxMenuItems,
  onBlur,
  onChange,
  onFocus,
  onQueryChange,
  placeholder,
  ref,
  renderItem,
  renderTag,
  searchSource,
  size = 'md',
  startIcon,
  status,
  style,
  tagOverflowBehavior = 'none',
  value,
}: TagsInputProps<T>): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const selectedIDsRef = useRef(new Set<string>());
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern: synchronous, idempotent sync with props
  selectedIDsRef.current = new Set(value.map(item => item.id));
  const isAtMax = maxEntries != null && value.length >= maxEntries;
  const isAtMaxRef = useRef(false);
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern
  isAtMaxRef.current = isAtMax;
  const isTruncated =
    !isFocusedWithin && tagOverflowBehavior !== 'none' && value.length > 0;
  const overflow = useOverflowCount(isTruncated);

  const filteredSource = useMemo<SearchSource<T>>(
    () => ({
      cancel: () => searchSource.cancel?.(),
      async bootstrap() {
        const results = await searchSource.bootstrap();
        return results.filter(item => !selectedIDsRef.current.has(item.id));
      },
      async search(searchQuery) {
        const results = await searchSource.search(searchQuery);
        const filteredResults = results.filter(
          item => !selectedIDsRef.current.has(item.id),
        );
        if (!hasCreate || searchQuery.trim() === '' || isAtMaxRef.current) {
          return filteredResults;
        }
        const existing = filteredResults.some(
          item => item.label.toLowerCase() === searchQuery.trim().toLowerCase(),
        );
        if (existing) {
          return filteredResults;
        }
        return [
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {
            id: `${CREATABLE_ID_PREFIX}${searchQuery}`,
            label: `Create "${searchQuery}"`,
            auxiliaryData: {value: searchQuery},
          } as T,
          ...filteredResults,
        ];
      },
    }),
    [hasCreate, searchSource],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      blur: () => inputRef.current?.blur(),
      focus: () => inputRef.current?.focus(),
    }),
    [],
  );

  const valueRef = useRef(value);
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern
  onChangeRef.current = onChange;

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  const removeItem = useCallback(
    (item: T) => {
      onChangeRef.current(
        valueRef.current.filter(selectedItem => selectedItem.id !== item.id),
        {item, type: 'remove'},
      );
      announce(`Removed ${item.label}`);
    },
    [announce],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setIsFocusedWithin(true);
        onFocus?.(event);
      }
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setIsFocusedWithin(false);
        onBlur?.(event);
      }
    },
    [onBlur],
  );

  const handleWrapperClick = useCallback(() => {
    if (!isDisabled) {
      inputRef.current?.focus();
    }
  }, [isDisabled]);

  const necessity: FieldNecessity = {isOptional, isRequired};

  const tokens = value.map(item => (
    <span className={styles.tag} key={item.id}>
      {renderTag == null ? (
        <Tag
          isDisabled={isDisabled}
          label={item.label}
          onRemove={() => removeItem(item)}
          size={size}
        />
      ) : (
        renderTag(item, () => removeItem(item))
      )}
    </span>
  ));

  return (
    <Field
      className={className}
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      ref={ref}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      style={style}>
      {/* eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions -- click delegates to inner input for focus convenience */}
      <div
        aria-label={label}
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled,
          }),
          styles.wrapper,
          isTruncated ? styles.truncatedWrapper : undefined,
        )}
        data-testid={dataTestId}
        onBlur={handleBlur}
        onClick={handleWrapperClick}
        onFocus={handleFocus}
        ref={wrapperRef}
        role="group">
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>
            <Icon color="secondary" icon={startIcon} size="sm" />
          </span>
        ) : null}
        {isTruncated ? (
          <div
            ref={overflow.ref}
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 'inherit',
              overflow: 'hidden',
              flex: 1,
              alignItems: 'center',
            }}>
            {tokens}
            {overflow.count > 0 ? (
              <span className={styles.overflowText} data-overflow-ignore="">
                +{overflow.count} more
              </span>
            ) : null}
          </div>
        ) : (
          tokens
        )}
        <BaseCombobox
          anchorRef={wrapperRef}
          ariaDescribedBy={describedBy}
          className={cx(
            styles.input,
            isAtMax || isTruncated ? styles.inputHidden : undefined,
          )}
          debounceMs={debounceMs}
          emptySearchResultsText={emptySearchResultsText}
          hasAutoFocus={hasAutoFocus}
          hasEntriesOnFocus={hasEntriesOnFocus}
          inputId={inputId}
          isDisabled={isDisabled || isAtMax}
          maxMenuItems={maxMenuItems}
          onChange={item => {
            if (item == null) {
              return;
            }
            if (isCreatableItem(item)) {
              const rawValue =
                typeof item.auxiliaryData === 'object' &&
                item.auxiliaryData != null &&
                'value' in item.auxiliaryData
                  ? String(item.auxiliaryData.value)
                  : item.label;
              const createdItem = {
                ...item,
                id: rawValue,
                label: rawValue,
              };
              onChangeRef.current([...valueRef.current, createdItem], {
                item: createdItem,
                type: 'create',
              });
              announce(`Added ${rawValue}`);
              return;
            }
            onChangeRef.current([...valueRef.current, item], {
              item,
              type: 'add',
            });
            announce(`Added ${item.label}`);
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (
              event.key === 'Backspace' &&
              event.currentTarget.value === '' &&
              valueRef.current.length > 0
            ) {
              const item = valueRef.current[valueRef.current.length - 1];
              removeItem(item);
            }
          }}
          onQueryChange={onQueryChange}
          placeholder={value.length === 0 ? placeholder : undefined}
          ref={inputRef}
          renderItem={renderItem}
          searchSource={filteredSource}
          size={size}
          value={null}
        />
        {endContent != null ? (
          <span className={styles.endContent}>{endContent}</span>
        ) : null}
        {hasClear && value.length > 0 && !isDisabled ? (
          <button
            aria-label={`Clear ${label}`}
            className={inputStyles.clearButton}
            onClick={event => {
              event.stopPropagation();
              onChangeRef.current([], {
                items: valueRef.current,
                type: 'remove-all',
              });
              announce('Cleared all tags');
            }}
            type="button">
            <Icon icon={X} size="sm" />
          </button>
        ) : null}
        <span aria-live="polite" className={styles.liveRegion} role="status">
          {announcement}
        </span>
      </div>
    </Field>
  );
}

TagsInput.displayName = 'TagsInput';
