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
import {OverflowList} from '../../internal/OverflowList';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import {useLayer} from '../../internal/useLayer';
import {BaseAutocompleteInput} from '../AutocompleteInput';
import type {SearchableItem, SearchSource} from '../AutocompleteInput';
import {Button} from '../Button';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {inputRecipe, inputStyles} from '../Field/inputStyles';
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
   * Whether the input is read-only. Prevents typing and hides the clear
   * button without applying disabled opacity.
   * @default false
   */
  isReadOnly?: boolean;
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
   * Provides results for the menu. Use `createStaticSearchSource` for
   * in-memory data, or implement {@link SearchSource} for async/remote
   * search.
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
  wrapperWithTags: css({
    rowGap: '1',
  }),
  wrapperWithTagsSize: {
    sm: css({pt: '0px', pb: '0.5'}),
    md: css({py: '1'}),
    lg: css({py: '1'}),
  },
  layerPopover: css({
    w: 'anchor-size(width)',
  }),
  truncatedWrapper: css({
    flexWrap: 'nowrap',
    overflow: 'hidden',
  }),
  truncatedSize: {
    sm: css({h: 'component.sm'}),
    md: css({h: 'component.md'}),
    lg: css({h: 'component.lg'}),
  },
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
  isReadOnly = false,
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
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [queryValue, setQueryValue] = useState('');
  const isLayerMode = tagOverflowBehavior === 'unfocusedLayer';
  const layer = useLayer();
  const layerContentRef = useRef<HTMLDivElement>(null);
  const selectedIDsRef = useRef(new Set<string>());
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern: synchronous, idempotent sync with props
  selectedIDsRef.current = new Set(value.map(item => item.id));
  const isAtMax = maxEntries != null && value.length >= maxEntries;
  const isAtMaxRef = useRef(false);
  // eslint-disable-next-line @eslint-react/refs -- latest-ref pattern
  isAtMaxRef.current = isAtMax;
  const isTruncated =
    !isFocusedWithin && tagOverflowBehavior !== 'none' && value.length > 0;

  const placeholderRef = useCallback(
    (element: HTMLElement | null) => {
      if (isLayerMode) {
        layer.ref(element);
      }
    },
    [isLayerMode, layer],
  );

  const isFocusInTagsInput = useCallback(
    (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) {
        return false;
      }
      if (wrapperRef.current?.contains(target)) {
        return true;
      }
      if (layerContentRef.current?.contains(target)) {
        return true;
      }
      const popoverElement = document.getElementById(layer.id);
      return popoverElement?.contains(target) ?? false;
    },
    [layer.id],
  );

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
      const comingFromOutside = !isFocusInTagsInput(event.relatedTarget);
      setIsFocusedWithin(true);
      if (isLayerMode) {
        layer.show();
      }
      if (comingFromOutside) {
        onFocus?.(event);
      }
    },
    [isFocusInTagsInput, isLayerMode, layer, onFocus],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!isFocusInTagsInput(event.relatedTarget)) {
        setIsFocusedWithin(false);
        if (isLayerMode) {
          layer.hide();
        }
        onBlur?.(event);
      }
    },
    [isFocusInTagsInput, isLayerMode, layer, onBlur],
  );

  const handleWrapperPointerDown = useCallback(() => {
    if (!isDisabled) {
      if (isLayerMode) {
        layer.show();
        setIsFocusedWithin(true);
      }
      document.addEventListener(
        'click',
        event => {
          // Focus the input only when the click that completes this press lands
          // inside the TagsInput. A press on a tag may open a popover anchored to
          // it (e.g. SearchFilterInput's edit popover); since the tag's own click
          // can stop propagation, this listener instead fires on the next click
          // — which might be a control in that popover. Focusing the input then
          // would steal focus back and briefly re-open the input's surface.
          if (isFocusInTagsInput(event.target)) {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        },
        {once: true},
      );
    }
  }, [isDisabled, isFocusInTagsInput, isLayerMode, layer]);

  const necessity = getNecessity(isOptional, isRequired);

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

  const wrapperContent = (
    <>
      {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions -- pointerdown delegates to inner input for focus convenience */}
      <div
        aria-label={label}
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled,
          }),
          styles.wrapper,
          value.length > 0 && !isTruncated ? styles.wrapperWithTags : undefined,
          value.length > 0 && !isTruncated
            ? styles.wrapperWithTagsSize[size]
            : undefined,
          isTruncated ? styles.truncatedWrapper : undefined,
          isTruncated ? styles.truncatedSize[size] : undefined,
        )}
        data-testid={dataTestId}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onPointerDown={handleWrapperPointerDown}
        ref={wrapperRef}
        role="group">
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>
            <Icon color="secondary" icon={startIcon} size="sm" />
          </span>
        ) : null}
        {isTruncated ? (
          <OverflowList
            behavior="observeParent"
            gap={4}
            overflowRenderer={overflowItems => (
              <span className={styles.overflowText}>
                +{overflowItems.length} more
              </span>
            )}>
            {tokens}
          </OverflowList>
        ) : (
          tokens
        )}
        <BaseAutocompleteInput
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
          hasReopenOnSelect={hasEntriesOnFocus}
          inputId={inputId}
          isDisabled={isDisabled || isReadOnly || isAtMax}
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
          onQueryChange={nextQuery => {
            setQueryValue(nextQuery);
            onQueryChange?.(nextQuery);
          }}
          placeholder={value.length === 0 ? placeholder : undefined}
          query={queryValue}
          ref={inputRef}
          renderItem={renderItem}
          searchSource={filteredSource}
          size={size}
          value={null}
        />
        {isReactNode(endContent) ? (
          <span className={styles.endContent}>{endContent}</span>
        ) : null}
        {hasClear && value.length > 0 && !isDisabled && !isReadOnly ? (
          <Button
            icon={X}
            isIconOnly
            label={`Clear ${label}`}
            onClick={event => {
              event.stopPropagation();
              onChangeRef.current([], {
                items: valueRef.current,
                type: 'remove-all',
              });
              announce('Cleared all tags');
            }}
            size="sm"
            variant="ghost"
          />
        ) : null}
        <span aria-live="polite" className={styles.liveRegion} role="status">
          {announcement}
        </span>
      </div>
    </>
  );

  const popoverOverrideStyle: CSSProperties = {
    positionArea: undefined,
    positionTryFallbacks: undefined,
    top: 'anchor(top)',
    left: 'anchor(start)',
  };

  const inputContent = isLayerMode ? (
    <>
      <div
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled,
          }),
          styles.wrapper,
          isTruncated ? styles.truncatedWrapper : undefined,
          styles.truncatedSize[size],
        )}
        onPointerDown={handleWrapperPointerDown}
        ref={placeholderRef}>
        {isTruncated ? (
          <>
            {startIcon != null ? (
              <span className={inputStyles.iconSlot}>
                <Icon color="secondary" icon={startIcon} size="sm" />
              </span>
            ) : null}
            <OverflowList
              behavior="observeParent"
              gap={4}
              overflowRenderer={overflowItems => (
                <span className={styles.overflowText}>
                  +{overflowItems.length} more
                </span>
              )}>
              {tokens}
            </OverflowList>
          </>
        ) : null}
      </div>
      {layer.render(
        <div
          data-testid={dataTestId == null ? undefined : `${dataTestId}-layer`}
          ref={layerContentRef}>
          {wrapperContent}
        </div>,
        {
          alignment: 'start',
          className: styles.layerPopover,
          placement: 'below',
          style: popoverOverrideStyle,
        },
      )}
    </>
  ) : (
    wrapperContent
  );

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
      {inputContent}
    </Field>
  );
}

TagsInput.displayName = 'TagsInput';
