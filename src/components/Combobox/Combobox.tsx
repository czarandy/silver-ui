import {X} from 'lucide-react';
import {
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {Tag} from '../Tag';
import {BaseCombobox} from './BaseCombobox';
import type {SearchableItem, SearchSource} from './types';

export interface ComboboxProps<T extends SearchableItem = SearchableItem> {
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
}

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
} as const;

/**
 * Search-as-you-type field for selecting a single item from a search source.
 */
export function Combobox<T extends SearchableItem>({
  className,
  'data-testid': dataTestId,
  debounceMs,
  description,
  emptySearchResultsText,
  hasAutoFocus = false,
  hasClear = true,
  hasEntriesOnFocus = false,
  isDisabled = false,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  label,
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
}: ComboboxProps<T>): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const showTag = value != null && !isEditing;
  const fieldStatus = useMemo(
    () =>
      status == null ? undefined : {...status, messageID: statusMessageID},
    [status, statusMessageID],
  );

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
      status={fieldStatus}>
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
        ref={wrapperRef}
        style={style}>
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>{startIcon}</span>
        ) : null}
        {showTag ? (
          <Tag
            className={styles.tag}
            isDisabled={isDisabled}
            label={value.label}
            onClick={() => {
              setIsEditing(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            size={size}
          />
        ) : null}
        <BaseCombobox
          anchorRef={wrapperRef}
          ariaDescribedBy={describedBy}
          className={showTag ? styles.inputHidden : undefined}
          debounceMs={debounceMs}
          emptySearchResultsText={emptySearchResultsText}
          hasAutoFocus={hasAutoFocus}
          hasEntriesOnFocus={hasEntriesOnFocus}
          inputId={inputId}
          isDisabled={isDisabled}
          maxMenuItems={maxMenuItems}
          onChange={item => {
            setIsEditing(false);
            onChange(item);
          }}
          onOpenChange={onOpenChange}
          onQueryChange={onQueryChange}
          placeholder={showTag ? undefined : placeholder}
          ref={inputRef}
          renderItem={renderItem}
          searchSource={searchSource}
          size={size}
          value={value}
        />
        {hasClear && value != null && !isDisabled ? (
          <button
            aria-label={`Clear ${label}`}
            className={inputStyles.clearButton}
            onClick={event => {
              event.stopPropagation();
              setIsEditing(false);
              onChange(null);
              inputRef.current?.focus();
            }}
            type="button">
            <Icon icon={X} size="sm" />
          </button>
        ) : null}
      </div>
    </Field>
  );
}

Combobox.displayName = 'Combobox';
