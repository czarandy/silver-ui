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
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';
import isReactNode from '../../internal/isReactNode';
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
import {BaseAutocompleteInput} from './BaseAutocompleteInput';
import type {SearchableItem, SearchSource} from './types';

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
  clearButton: css({
    ms: 'auto',
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
  isDisabled = false,
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
  size = 'md',
  startIcon,
  status,
  style,
  value,
}: AutocompleteInputProps<T>): React.JSX.Element {
  const inputId = useId();
  const descriptionID = isReactNode(description)
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
      {/* eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- wrapper delegates focus to the inner input; keyboard users interact with the input directly */}
      <div
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled,
          }),
          styles.wrapper,
        )}
        data-testid={dataTestId}
        onClick={() => {
          if (showTag) {
            startEditing(value.label);
          }
        }}
        ref={wrapperRef}>
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>
            <Icon color="secondary" icon={startIcon} size="sm" />
          </span>
        ) : null}
        {showTag ? (
          <Tag
            className={styles.tag}
            isDisabled={isDisabled}
            label={value.label}
            onClick={() => startEditing(value.label)}
            size={size}
          />
        ) : null}
        <BaseAutocompleteInput
          anchorRef={wrapperRef}
          ariaDescribedBy={describedBy}
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
            className={styles.clearButton}
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
    </Field>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';
