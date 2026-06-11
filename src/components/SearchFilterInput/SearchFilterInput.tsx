import {Search} from 'lucide-react';
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {AutocompleteInputItem} from '../AutocompleteInput';
import type {InputStatus} from '../Field';
import type {IconComponent} from '../Icon';
import {Popover} from '../Popover';
import {Tag} from '../Tag';
import {
  TagsInput,
  type TagsInputChange,
  type TagsInputHandle,
  type TagsInputOverflowBehavior,
} from '../TagsInput';
import {Text} from '../Text';
import {SearchFilterInputEditPopover} from './SearchFilterInputEditPopover';
import {formatFilterValue} from './formatFilterValue';
import {useInternalSearchFilterInputConfig} from './internalConfig';
import type {
  PartialFilter,
  SearchFilterInputChangeType,
  SearchFilterInputComponents,
  SearchFilterInputConfig,
  SearchFilterInputFilter,
  SearchFilterInputHandle,
  SearchFilterInputItem,
} from './types';
import {useSearchFilterInputSource} from './useSearchFilterInputSource';

export type SearchFilterInputSize = 'sm' | 'md' | 'lg';

export interface SearchFilterInputProps {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Per-value-type component overrides.
   */
  components?: SearchFilterInputComponents;
  /**
   * SearchFilterInput field/operator configuration.
   */
  config: SearchFilterInputConfig;
  /**
   * Test ID applied to the input wrapper.
   */
  'data-testid'?: string;
  /**
   * Content displayed at the end of the input row.
   */
  endContent?: ReactNode;
  /**
   * Current filters.
   */
  filters: ReadonlyArray<SearchFilterInputFilter>;
  /**
   * Imperative focus/blur handle.
   */
  handleRef?: Ref<SearchFilterInputHandle>;
  /**
   * Whether to focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show a clear button.
   * @default true
   */
  hasClear?: boolean;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default true
   */
  isLabelHidden?: boolean;
  /**
   * Whether filters are read-only.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Accessible label.
   * @default 'Search'
   */
  label?: string;
  /**
   * Maximum number of items shown in the operator dropdown menu.
   * When set, only the first N operators are displayed.
   */
  maxOperatorMenuItems?: number;
  /**
   * Maximum displayed tag value length.
   * @default 40
   */
  maxTagLength?: number;
  /**
   * Called when focus leaves the control.
   */
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Called when filters change.
   */
  onChange: (
    filters: ReadonlyArray<SearchFilterInputFilter>,
    changeType: SearchFilterInputChangeType,
    index: number,
  ) => void;
  /**
   * Called when focus enters the control.
   */
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void;
  /**
   * Placeholder text.
   * @default 'Search...'
   */
  placeholder?: string;
  /**
   * Save button label in the edit popover.
   * @default 'Apply'
   */
  popoverSaveButtonLabel?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Result count displayed at end of row.
   */
  resultCount?: number | string;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: SearchFilterInputSize;
  /**
   * Icon shown before the input.
   */
  startIcon?: IconComponent;
  /**
   * Validation status displayed below the input.
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
   * Timezone ID for date formatting.
   */
  timezoneID?: string;
}

type PopoverState =
  | {type: 'idle'}
  | {partialFilter: PartialFilter; type: 'adding'}
  | {filterIndex: number; partialFilter: PartialFilter; type: 'editing'};

const styles = {
  entityPhoto: css({
    width: '16px',
    height: '16px',
    borderRadius: 'full',
    objectFit: 'cover',
    flexShrink: 0,
  }),
  root: css({
    w: 'full',
  }),
  popover: css({
    minW: '400px',
  }),
  resultCount: css({
    whiteSpace: 'nowrap',
  }),
  value: css({
    fontWeight: 'bold',
  }),
} as const;

/**
 * Structured search control where each tag represents a field/operator/value filter.
 */
export function SearchFilterInput({
  className,
  components,
  config: configFromProps,
  'data-testid': dataTestId,
  endContent,
  filters,
  handleRef,
  hasAutoFocus = false,
  hasClear = true,
  isDisabled = false,
  isLabelHidden = true,
  isReadOnly = false,
  label = 'Search',
  maxOperatorMenuItems,
  maxTagLength = 40,
  onBlur,
  onChange,
  onFocus,
  placeholder = 'Search...',
  popoverSaveButtonLabel = 'Apply',
  ref,
  resultCount,
  size = 'md',
  startIcon,
  status,
  style,
  tagOverflowBehavior,
  timezoneID,
}: SearchFilterInputProps): React.JSX.Element {
  const config = useInternalSearchFilterInputConfig(configFromProps);
  const searchSource = useSearchFilterInputSource(config);
  const tagsInputRef = useRef<TagsInputHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const wasInputFocusedRef = useRef(false);
  const [popoverState, setPopoverState] = useState<PopoverState>({
    type: 'idle',
  });

  useImperativeHandle(handleRef, () => ({
    blurInput: () => tagsInputRef.current?.blur(),
    focusInput: () => tagsInputRef.current?.focus(),
  }));

  const tagsInputValue = useMemo<SearchFilterInputItem[]>(
    () =>
      filters.map((filter, index) => {
        const field = config.getField(filter.field);
        const operator = config.getOperator(filter.field, filter.operator);
        const operatorLabel = operator?.label ? ` ${operator.label}` : '';
        const value =
          operator == null
            ? ''
            : formatFilterValue(
                operator.value,
                filter.value,
                maxTagLength,
                timezoneID,
              );
        return {
          auxiliaryData: {
            fieldKey: filter.field,
            filterIndex: index,
            filterValue: filter.value,
            operatorKey: filter.operator,
          },
          id: `filter-${index}-${filter.field}-${filter.operator}`,
          label: value
            ? `${field?.label ?? filter.field}${operatorLabel} ${value}`
            : `${field?.label ?? filter.field}${operatorLabel}`,
        };
      }),
    [config, filters, maxTagLength, timezoneID],
  );

  const openEditor = useCallback(
    (state: Exclude<PopoverState, {type: 'idle'}>) => {
      // Remember whether the text input was the interaction surface before
      // opening the editor, so cancel/escape can restore focus only when it
      // makes sense. Adding always originates from typing in the input; for
      // editing (a tag click) fall back to the actual focus state.
      const active = document.activeElement;
      const isInputFocused =
        active?.tagName === 'INPUT' &&
        rootRef.current?.contains(active) === true;
      wasInputFocusedRef.current = state.type === 'adding' || isInputFocused;
      tagsInputRef.current?.blur();
      setPopoverState(state);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    const wasInputFocused = wasInputFocusedRef.current;
    setPopoverState({type: 'idle'});
    if (wasInputFocused) {
      // The input was the interaction surface before opening — return focus to
      // it so the user can keep typing.
      requestAnimationFrame(() => tagsInputRef.current?.focus());
    } else {
      // The editor was opened by clicking a tag, so the input was not focused
      // and should not be. Clicking the Cancel button triggers TagsInput's
      // "focus the input on the next click after a wrapper press" behavior,
      // which queues a focus in a requestAnimationFrame. Blur in a nested frame
      // so it runs after that focus and the input ends up unfocused.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => tagsInputRef.current?.blur());
      });
    }
  }, []);

  const handleTagsInputChange = useCallback(
    (
      _items: SearchFilterInputItem[],
      change: TagsInputChange<SearchFilterInputItem>,
    ) => {
      if (change.type === 'remove') {
        const index = change.item.auxiliaryData?.filterIndex;
        if (index != null) {
          onChange(
            filters.filter((_, i) => i !== index),
            'remove',
            index,
          );
        }
        return;
      }

      if (change.type !== 'add') {
        return;
      }

      const auxiliaryData = change.item.auxiliaryData;
      if (auxiliaryData == null) {
        return;
      }
      const operator =
        auxiliaryData.operatorKey == null
          ? config.getDefaultOperator(auxiliaryData.fieldKey)
          : config.getOperator(
              auxiliaryData.fieldKey,
              auxiliaryData.operatorKey,
            );
      if (operator == null) {
        return;
      }
      if (auxiliaryData.filterValue != null) {
        const nextFilter: SearchFilterInputFilter = {
          field: auxiliaryData.fieldKey,
          operator: operator.key,
          value: auxiliaryData.filterValue,
        };
        onChange([...filters, nextFilter], 'add', filters.length);
        return;
      }
      if (operator.value.type === 'empty') {
        const nextFilter: SearchFilterInputFilter = {
          field: auxiliaryData.fieldKey,
          operator: operator.key,
          value: {type: 'empty'},
        };
        onChange([...filters, nextFilter], 'add', filters.length);
        return;
      }
      openEditor({
        partialFilter: {
          field: auxiliaryData.fieldKey,
          operator: operator.key,
          value: undefined,
        },
        type: 'adding',
      });
    },
    [config, filters, onChange, openEditor],
  );

  const handleTagClick = (index: number) => {
    if (isReadOnly || isDisabled) {
      return;
    }
    const filter = filters[index];
    if (filter.isReadOnly === true) {
      return;
    }
    openEditor({
      filterIndex: index,
      partialFilter: {
        field: filter.field,
        operator: filter.operator,
        value: filter.value,
      },
      type: 'editing',
    });
  };

  const renderTag = (item: SearchFilterInputItem, onRemove: () => void) => {
    const auxiliaryData = item.auxiliaryData;
    const filterIndex = auxiliaryData?.filterIndex ?? -1;
    const filter = filterIndex >= 0 ? filters[filterIndex] : undefined;
    const field =
      auxiliaryData == null
        ? undefined
        : config.getField(auxiliaryData.fieldKey);
    const operator =
      auxiliaryData?.operatorKey == null
        ? undefined
        : config.getOperator(auxiliaryData.fieldKey, auxiliaryData.operatorKey);
    const canInteract =
      !isReadOnly && !isDisabled && filter?.isReadOnly !== true;
    const TagOverride =
      operator == null ? undefined : components?.[operator.value.type]?.Tag;

    if (
      TagOverride != null &&
      filter != null &&
      field != null &&
      operator != null
    ) {
      return (
        <TagOverride
          config={configFromProps}
          field={field}
          filter={filter}
          isDisabled={isDisabled}
          maxLength={maxTagLength}
          onClick={canInteract ? () => handleTagClick(filterIndex) : undefined}
          onRemove={canInteract ? onRemove : undefined}
          operator={operator}
        />
      );
    }

    const value =
      operator != null && filter != null
        ? formatFilterValue(
            operator.value,
            filter.value,
            Math.max(
              maxTagLength - (field?.label.length ?? 0) - operator.label.length,
              10,
            ),
            timezoneID,
          )
        : '';
    const entityPhoto =
      filter?.value.type === 'entity_list'
        ? (() => {
            const entities = filter.value.value;
            return entities.length === 1 && entities[0].photo != null
              ? entities[0].photo
              : undefined;
          })()
        : undefined;
    return (
      <Tag
        endContent={
          value === '' ? undefined : (
            <span className={styles.value}>{value}</span>
          )
        }
        isDisabled={isDisabled}
        label={`${field?.label ?? ''} ${operator?.label ?? ''}`.trim()}
        onClick={
          canInteract
            ? event => {
                event.stopPropagation();
                handleTagClick(filterIndex);
              }
            : undefined
        }
        onRemove={canInteract ? onRemove : undefined}
        size={size}
        startContent={
          entityPhoto != null ? (
            <img alt="" className={styles.entityPhoto} src={entityPhoto} />
          ) : undefined
        }
      />
    );
  };

  const renderItem = (item: SearchFilterInputItem) => {
    const field =
      item.auxiliaryData == null
        ? undefined
        : config.getField(item.auxiliaryData.fieldKey);
    return (
      <AutocompleteInputItem
        description={field?.description}
        icon={field?.icon ?? Search}
        item={item}
      />
    );
  };

  const handleSave = (savedFilter: SearchFilterInputFilter | null) => {
    if (popoverState.type === 'adding') {
      if (savedFilter != null) {
        onChange([...filters, savedFilter], 'add', filters.length);
      }
    } else if (popoverState.type === 'editing') {
      if (savedFilter == null) {
        onChange(
          filters.filter((_, index) => index !== popoverState.filterIndex),
          'remove',
          popoverState.filterIndex,
        );
      } else {
        const nextFilters = [...filters];
        nextFilters[popoverState.filterIndex] = savedFilter;
        onChange(nextFilters, 'edit', popoverState.filterIndex);
      }
    }
    setPopoverState({type: 'idle'});
    requestAnimationFrame(() => tagsInputRef.current?.focus());
  };

  const partialFilter =
    popoverState.type === 'idle' ? null : popoverState.partialFilter;
  const EditorOverride =
    partialFilter?.operator == null
      ? undefined
      : components?.[
          config.getOperator(partialFilter.field, partialFilter.operator)?.value
            .type ?? 'empty'
        ]?.Editor;
  const editorContent =
    partialFilter == null ? null : EditorOverride != null ? (
      <EditorOverride
        config={configFromProps}
        filter={partialFilter}
        isReadOnly={isReadOnly}
        mode={popoverState.type === 'editing' ? 'edit' : 'create'}
        onCancel={handleCancel}
        onSave={handleSave}
        saveButtonLabel={popoverSaveButtonLabel}
        timezoneID={timezoneID}
      />
    ) : (
      <SearchFilterInputEditPopover
        config={config}
        filter={partialFilter}
        isReadOnly={isReadOnly}
        maxOperatorMenuItems={maxOperatorMenuItems}
        mode={popoverState.type === 'editing' ? 'edit' : 'create'}
        onCancel={handleCancel}
        onSave={handleSave}
        saveButtonLabel={popoverSaveButtonLabel}
      />
    );

  const resultCountNode =
    resultCount == null ? null : (
      <Text
        as="span"
        className={styles.resultCount}
        color="secondary"
        type="supporting">
        {typeof resultCount === 'number'
          ? `${new Intl.NumberFormat().format(resultCount)} ${
              resultCount === 1 ? 'result' : 'results'
            }`
          : resultCount}
      </Text>
    );

  return (
    <>
      <div className={styles.root} ref={rootRef}>
        <TagsInput
          className={className}
          data-testid={dataTestId}
          debounceMs={0}
          endContent={
            <>
              {resultCountNode}
              {endContent}
            </>
          }
          handleRef={tagsInputRef}
          hasAutoFocus={hasAutoFocus}
          hasClear={hasClear && !isReadOnly}
          hasEntriesOnFocus
          isDisabled={isDisabled}
          isLabelHidden={isLabelHidden}
          isReadOnly={isReadOnly}
          label={label}
          onBlur={onBlur}
          onChange={handleTagsInputChange}
          onFocus={onFocus}
          placeholder={
            isReadOnly ? '' : filters.length === 0 ? placeholder : ''
          }
          ref={ref}
          renderItem={renderItem}
          renderTag={renderTag}
          searchSource={searchSource}
          size={size}
          startIcon={startIcon}
          status={status}
          style={style}
          tagOverflowBehavior={tagOverflowBehavior}
          value={tagsInputValue}
        />
      </div>
      <Popover
        anchorRef={rootRef}
        className={styles.popover}
        content={editorContent}
        hasAutoFocus={false}
        hasCloseButton={false}
        isDismissable={false}
        isOpen={popoverState.type !== 'idle'}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setPopoverState({type: 'idle'});
          }
        }}
      />
    </>
  );
}

SearchFilterInput.displayName = 'SearchFilterInput';
