'use client';

import {X} from 'lucide-react';
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {BaseAutocompleteInput} from 'components/AutocompleteInput/BaseAutocompleteInput';
import type {
  SearchableItem,
  SearchSource,
} from 'components/AutocompleteInput/types';
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
import {Tag} from 'components/Tag';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export type AutocompleteInputProps<T extends SearchableItem = SearchableItem> =
  {
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
     * Whether to show a clear button when a value is selected.
     * @default true
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
     * Maximum number of menu items.
     * @default 10
     */
    maxMenuItems?: number;
    /**
     * Called when selection changes.
     */
    onChange: (item: T | null) => void;
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
     * Validation status displayed below the selector.
     */
    status?: InputStatus;
    /**
     * Inline styles applied to the input wrapper.
     */
    style?: CSSProperties;
    /**
     * Selected item.
     */
    value: T | null;
  } & FieldNecessity;

const styles = {
  wrapper: css({
    cursor: 'text',
    flexWrap: 'wrap',
  }),
  // While the tag is shown the query input is taken out of flow, so nothing
  // absorbs the free space before the clear button. This slot grows in its
  // place, keeping the clear button flush right like TextInput's. Growth is
  // used rather than an auto margin because a consumer reset (`* {margin: 0}`)
  // in a CSS layer ordered after Panda's `utilities` would zero the margin.
  tagSlot: css({
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minW: 0,
  }),
  tag: css({
    my: '-1',
    ms: '-1',
  }),
  inputHidden: css({
    position: 'absolute',
    opacity: 0,
    w: 0,
    minW: 0,
    flexBasis: 0,
  }),
} as const;

/**
 * Search-as-you-type field for selecting a single item from a search source.
 */
export function AutocompleteInput<T extends SearchableItem>({
  className,
  'data-testid': dataTestId,
  debounceMs,
  description,
  emptySearchResultsText,
  errorText,
  hasAutoFocus = false,
  hasClear = true,
  hasEntriesOnFocus = false,
  isDisabled: isDisabledFromProps = false,
  isLabelHidden = false,
  isOptional,
  isRequired,
  label,
  labelIcon,
  labelTooltip,
  maxMenuItems,
  onChange,
  onOpenChange,
  onQueryChange,
  placeholder,
  ref,
  renderItem,
  searchSource,
  size: sizeProp = 'md',
  startIcon,
  status,
  style,
  value,
}: AutocompleteInputProps<T>): React.JSX.Element {
  const inputGroup = useInputGroup();
  const fieldset = useFieldset();
  const isDisabled =
    isDisabledFromProps ||
    inputGroup?.isDisabled === true ||
    fieldset?.isDisabled === true;
  const size = inputGroup?.size ?? sizeProp;
  const statusType = status?.type ?? inputGroup?.statusType;

  const inputId = useId();
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [queryValue, setQueryValue] = useState('');
  const showTag = value != null && !isEditing;
  const fieldStatus = useMemo(
    () =>
      status == null ? undefined : {...status, messageID: statusMessageID},
    [status, statusMessageID],
  );

  const necessity = getNecessity(isOptional, isRequired);

  const startEditing = useCallback(
    (seedQuery: string) => {
      if (isDisabled) {
        return;
      }
      setIsEditing(true);
      setQueryValue(seedQuery);
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (input != null) {
          input.focus();
          input.setSelectionRange(seedQuery.length, seedQuery.length);
        }
      });
    },
    [isDisabled],
  );

  const wrapper = (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- wrapper delegates focus to the inner input; keyboard users interact with the input directly
    <div
      className={cx(
        inputRecipe({
          size,
          status: statusType,
          isDisabled,
        }),
        styles.wrapper,
        inputGroup != null ? className : undefined,
      )}
      data-testid={dataTestId}
      onClick={() => {
        if (showTag) {
          startEditing(value.label);
        }
      }}
      // Outside a group the ref targets the Field root; in a group there is no
      // Field, so it targets the wrapper -- the component's outermost element
      // either way.
      ref={inputGroup != null ? mergeRefs(ref, wrapperRef) : wrapperRef}
      style={inputGroup != null ? style : undefined}>
      {startIcon != null ? (
        <span className={inputStyles.iconSlot}>
          <Icon color="secondary" icon={startIcon} size="sm" />
        </span>
      ) : null}
      {showTag ? (
        <span className={styles.tagSlot}>
          <Tag
            className={styles.tag}
            isDisabled={isDisabled}
            label={value.label}
            onClick={() => startEditing(value.label)}
            size={size}
          />
        </span>
      ) : null}
      <BaseAutocompleteInput
        anchorRef={wrapperRef}
        ariaDescribedBy={describedBy}
        ariaLabel={inputGroup != null ? label : undefined}
        className={showTag ? styles.inputHidden : undefined}
        debounceMs={debounceMs}
        emptySearchResultsText={emptySearchResultsText}
        errorText={errorText}
        hasAutoFocus={hasAutoFocus}
        hasEntriesOnFocus={hasEntriesOnFocus}
        inputId={inputId}
        isDisabled={isDisabled}
        isRequired={isRequired}
        maxMenuItems={maxMenuItems}
        onChange={item => {
          setIsEditing(false);
          setQueryValue('');
          onChange(item);
        }}
        onOpenChange={onOpenChange}
        onQueryChange={nextQuery => {
          setQueryValue(nextQuery);
          onQueryChange?.(nextQuery);
        }}
        placeholder={showTag ? undefined : placeholder}
        query={queryValue}
        ref={inputRef}
        renderItem={renderItem}
        searchSource={searchSource}
        size={size}
        value={value}
      />
      {hasClear && value != null && !isDisabled ? (
        <Button
          className={inputStyles.clearButton}
          icon={X}
          isIconOnly
          label={`Clear ${label}`}
          onClick={event => {
            event.stopPropagation();
            setIsEditing(false);
            onChange(null);
            inputRef.current?.focus();
          }}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </div>
  );

  if (inputGroup != null) {
    return wrapper;
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
      status={fieldStatus}
      style={style}>
      {wrapper}
    </Field>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';
