import {X} from 'lucide-react';
import {
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
import {BaseCombobox} from '../Combobox';
import type {SearchableItem, SearchSource} from '../Combobox';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {Tag} from '../Tag';

export type TagsInputChange<T extends SearchableItem> =
  | {item: T; type: 'add'}
  | {item: T; type: 'create'}
  | {item: T; type: 'remove'};

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

export interface TagsInputProps<T extends SearchableItem = SearchableItem> {
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
   * Whether the field is optional.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Field label.
   */
  label: string;
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
   * Icon or content shown before the input.
   */
  startIcon?: ReactNode;
  /**
   * Validation status displayed below the tags-input.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the input wrapper.
   */
  style?: CSSProperties;
  /**
   * Overflow behavior for selected tags.
   * @default 'none'
   */
  tagOverflowBehavior?: TagsInputOverflowBehavior;
  /**
   * Selected items.
   */
  value: T[];
}

const CREATABLE_ID_PREFIX = '__silver_create__';

const styles = {
  wrapper: css({
    cursor: 'text',
    flexWrap: 'wrap',
    alignItems: 'center',
    h: 'auto',
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
  isOptional = false,
  isRequired = false,
  label,
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
  value,
}: TagsInputProps<T>): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const selectedIDs = useMemo(
    () => new Set(value.map(item => item.id)),
    [value],
  );
  const isAtMax = maxEntries != null && value.length >= maxEntries;
  const filteredSource = useMemo<SearchSource<T>>(
    () => ({
      cancel: () => searchSource.cancel?.(),
      async bootstrap() {
        const results = await searchSource.bootstrap();
        return results.filter(item => !selectedIDs.has(item.id));
      },
      async search(searchQuery) {
        const results = await searchSource.search(searchQuery);
        const filteredResults = results.filter(
          item => !selectedIDs.has(item.id),
        );
        if (!hasCreate || searchQuery.trim() === '' || isAtMax) {
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
    [hasCreate, isAtMax, searchSource, selectedIDs],
  );

  useImperativeHandle(
    handleRef,
    () => ({
      blur: () => inputRef.current?.blur(),
      focus: () => inputRef.current?.focus(),
    }),
    [],
  );

  const removeItem = (item: T) => {
    onChange(
      value.filter(selectedItem => selectedItem.id !== item.id),
      {item, type: 'remove'},
    );
  };

  return (
    <Field
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      isOptional={isOptional}
      isRequired={isRequired}
      label={label}
      labelTooltip={labelTooltip}
      ref={ref}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }>
      {/* eslint-disable-next-line jsx-a11y-x/no-static-element-interactions -- container observes descendant focus entering/leaving the compound input */}
      <div
        className={cx(
          inputStyles.wrapper,
          inputStyles.size[size],
          status != null ? inputStyles.status[status.type] : undefined,
          isDisabled ? inputStyles.wrapperDisabled : undefined,
          styles.wrapper,
          className,
        )}
        data-testid={dataTestId}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            onBlur?.(event);
          }
        }}
        onFocus={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            onFocus?.(event);
          }
        }}
        ref={wrapperRef}
        style={style}>
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>{startIcon}</span>
        ) : null}
        {value.map(item => (
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
        ))}
        <BaseCombobox
          anchorRef={wrapperRef}
          ariaDescribedBy={describedBy}
          className={cx(styles.input, isAtMax ? styles.inputHidden : undefined)}
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
              onChange([...value, createdItem], {
                item: createdItem,
                type: 'create',
              });
              return;
            }
            onChange([...value, item], {item, type: 'add'});
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Backspace' && query === '' && value.length > 0) {
              const item = value[value.length - 1];
              removeItem(item);
            }
          }}
          onQueryChange={nextQuery => {
            setQuery(nextQuery);
            onQueryChange?.(nextQuery);
          }}
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
              for (const item of value) {
                onChange([], {item, type: 'remove'});
                break;
              }
            }}
            type="button">
            <Icon icon={X} size="sm" />
          </button>
        ) : null}
      </div>
    </Field>
  );
}

TagsInput.displayName = 'TagsInput';
