'use client';

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
import {BaseAutocompleteInput} from 'components/AutocompleteInput';
import type {SearchableItem, SearchSource} from 'components/AutocompleteInput';
import {Button} from 'components/Button';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from 'components/Field';
import {inputRecipe, inputStyles} from 'components/Field/inputStyles';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {useFieldset} from 'components/Fieldset';
import {Icon, type IconComponent} from 'components/Icon';
import {useInputGroup} from 'components/InputGroup';
import {OverflowList} from 'components/OverflowList';
import {Tag} from 'components/Tag';
import {tagsInputRecipe} from 'components/TagsInput/TagsInput.recipe';
import useAnnounce from 'hooks/useAnnounce';
import {useResolvedSize} from 'internal/SizeContext';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import useLatest from 'internal/useLatest';
import {useLayer} from 'internal/useLayer';
import {cx} from 'utils/cx';

export type TagsInputChange<T extends SearchableItem> =
  | {item: T; type: 'add'}
  | {item: T; type: 'create'}
  | {item: T; type: 'remove'}
  | {items: T[]; type: 'remove-all'};

export type TagsInputOverflowBehavior =
  'none' | 'unfocusedInline' | 'unfocusedLayer';

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

/**
 * Props that gate free-text tag creation.
 *
 * Selecting the "Create …" suggestion mints a new item from the typed text via
 * `createItem`. The default builder produces `{id, label}` (both set to the raw
 * text):
 *
 * - When that shape satisfies `T` (e.g. the default `SearchableItem`),
 *   `createItem` is optional and `hasCreate` is a plain boolean toggle.
 * - When `T` has additional required fields the default builder cannot supply,
 *   creation requires an explicit `createItem`, so enabling it is expressed as
 *   `hasCreate` + `createItem` together (and may be omitted entirely).
 */
export type TagsInputCreateProps<T extends SearchableItem> = {
  id: string;
  label: string;
} extends T
  ? {
      /**
       * Whether users can create a tag from free text.
       * @default false
       */
      hasCreate?: boolean;
      /**
       * Builds the committed item from the typed text. Optional for this item
       * type because the default builder — `rawValue => ({id: rawValue, label:
       * rawValue})` — already produces a valid item.
       */
      createItem?: (rawValue: string) => T;
    }
  : | {
        /**
         * Whether users can create a tag from free text.
         * @default false
         */
        hasCreate?: false;
        createItem?: never;
      }
    | {
        /**
         * Whether users can create a tag from free text.
         */
        hasCreate: true;
        /**
         * Builds the committed item from the typed text. Required for this
         * item type because it has fields the default `{id, label}` builder
         * cannot supply.
         */
        createItem: (rawValue: string) => T;
      };

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
   * HTML name attribute for native form submission. Each selected item ID is
   * submitted as a separate entry.
   */
  htmlName?: string;
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
} & FieldNecessity &
  TagsInputCreateProps<T>;

const CREATABLE_ID_PREFIX = '__silver_create__';

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
  createItem,
  hasAutoFocus = false,
  hasClear = false,
  hasCreate = false,
  hasEntriesOnFocus = false,
  handleRef,
  htmlName,
  isDisabled: isDisabledFromProps = false,
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
  size: sizeProp,
  startIcon,
  status,
  style,
  tagOverflowBehavior = 'none',
  value,
}: TagsInputProps<T>): React.JSX.Element {
  const inputGroup = useInputGroup();
  const fieldset = useFieldset();
  const isDisabled =
    isDisabledFromProps ||
    inputGroup?.isDisabled === true ||
    fieldset?.isDisabled === true;
  const size = useResolvedSize(inputGroup?.size, sizeProp);
  const statusType = status?.type ?? inputGroup?.statusType;

  const inputId = useId();
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const {announce, announcer} = useAnnounce();
  const [queryValue, setQueryValue] = useState('');
  const isLayerMode = tagOverflowBehavior === 'unfocusedLayer';
  const layer = useLayer();
  const layerContentRef = useRef<HTMLDivElement>(null);
  const selectedIDsRef = useLatest(new Set(value.map(item => item.id)));
  const isAtMax = maxEntries != null && value.length >= maxEntries;
  const isAtMaxRef = useLatest(isAtMax);
  const isTruncated =
    !isFocusedWithin && tagOverflowBehavior !== 'none' && value.length > 0;
  const classes = tagsInputRecipe({
    size,
    hasTags: value.length > 0,
    isTruncated,
    hasFixedHeight: isTruncated,
    isInputHidden: isAtMax || isTruncated,
  });
  // Collapsed single-line placeholder shown behind the layer popover: always
  // fixed-height, never hides the input.
  const placeholderClasses = tagsInputRecipe({
    size,
    isTruncated,
    hasFixedHeight: true,
  });

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

  const valueRef = useLatest(value);
  const onChangeRef = useLatest(onChange);

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
    <span className={classes.tag} key={item.id}>
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

  // In layer mode the in-flow element is the collapsed placeholder, so that is
  // the group's item and owns className/style; wrapperContent then lives inside
  // the layer popover. Outside layer mode wrapperContent is itself the item.
  const isWrapperGroupItem = inputGroup != null && !isLayerMode;

  const wrapperContent = (
    /* eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions -- pointerdown delegates to inner input for focus convenience */
    <div
      aria-label={label}
      className={cx(
        inputRecipe({
          size,
          status: statusType,
          isDisabled,
        }),
        classes.wrapper,
        isWrapperGroupItem ? className : undefined,
      )}
      data-testid={dataTestId}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPointerDown={handleWrapperPointerDown}
      ref={isWrapperGroupItem ? mergeRefs(ref, wrapperRef) : wrapperRef}
      role="group"
      style={isWrapperGroupItem ? style : undefined}>
      {startIcon != null ? (
        <span className={inputStyles.iconSlot}>
          <Icon color="secondary" icon={startIcon} size="sm" />
        </span>
      ) : null}
      {isTruncated ? (
        <OverflowList
          behavior="observeParent"
          gap={1}
          overflowRenderer={overflowItems => (
            <span className={classes.overflowText}>
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
        ariaLabel={inputGroup != null ? label : undefined}
        className={classes.input}
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
            // `createItem` is guaranteed present for item types that need it
            // (see TagsInputCreateProps); the default builder is only reached
            // when `{id, label}` is a valid `T`, so the assertion is sound.
            const createdItem =
              createItem?.(rawValue) ??
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ({id: rawValue, label: rawValue} as T);
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
      {isNonEmptyReactNode(endContent) ? (
        <span className={classes.endContent}>{endContent}</span>
      ) : null}
      {hasClear && value.length > 0 && !isDisabled && !isReadOnly ? (
        <Button
          className={inputStyles.clearButton}
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
      {announcer}
    </div>
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
            status: statusType,
            isDisabled,
          }),
          placeholderClasses.wrapper,
          inputGroup != null ? className : undefined,
        )}
        onPointerDown={handleWrapperPointerDown}
        ref={
          inputGroup != null ? mergeRefs(ref, placeholderRef) : placeholderRef
        }
        style={inputGroup != null ? style : undefined}>
        {isTruncated ? (
          <>
            {startIcon != null ? (
              <span className={inputStyles.iconSlot}>
                <Icon color="secondary" icon={startIcon} size="sm" />
              </span>
            ) : null}
            <OverflowList
              behavior="observeParent"
              gap={1}
              overflowRenderer={overflowItems => (
                <span className={classes.overflowText}>
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
          className: classes.layerPopover,
          placement: 'below',
          style: popoverOverrideStyle,
        },
      )}
    </>
  ) : (
    wrapperContent
  );

  if (inputGroup != null) {
    return inputContent;
  }

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
      {htmlName == null
        ? null
        : value.map(item => (
            <input
              disabled={isDisabled}
              key={item.id}
              name={htmlName}
              type="hidden"
              value={item.id}
            />
          ))}
      {inputContent}
    </Field>
  );
}

TagsInput.displayName = 'TagsInput';
