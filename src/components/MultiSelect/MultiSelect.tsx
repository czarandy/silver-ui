import {Check, ChevronDown, X} from 'lucide-react';
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Badge} from '../Badge';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';
import {Text} from '../Text';

export interface MultiSelectOptionData {
  /**
   * Whether the option is disabled.
   */
  disabled?: boolean;
  /**
   * Icon displayed before the label.
   */
  icon?: ReactNode;
  /**
   * Option label. Defaults to `value`.
   */
  label?: string;
  /**
   * Option value.
   */
  value: string;
}

export interface MultiSelectDivider {
  type: 'divider';
}

export interface MultiSelectSection {
  options: ReadonlyArray<MultiSelectOptionData>;
  title?: string;
  type: 'section';
}

export type MultiSelectOption =
  | MultiSelectDivider
  | MultiSelectOptionData
  | MultiSelectSection
  | string;

export type MultiSelectTriggerDisplay = 'count' | 'labels' | 'badges';

export interface MultiSelectProps {
  /**
   * Async action called after `onChange`.
   */
  changeAction?: (value: string[]) => Promise<void> | void;
  /**
   * Custom render function for selectable options.
   */
  children?: (option: MultiSelectOptionData) => ReactNode;
  /**
   * Additional CSS class names applied to the trigger wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the combobox button.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether to show a clear button when values are selected.
   * @default false
   */
  hasClear?: boolean;
  /**
   * Whether to show search input in the dropdown.
   * @default false
   */
  hasSearch?: boolean;
  /**
   * Whether to show a select-all option.
   * @default false
   */
  hasSelectAll?: boolean;
  /**
   * Whether the selector starts open.
   * @default false
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the selector is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the selector is loading.
   * @default false
   */
  isLoading?: boolean;
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
   * Maximum number of badges before showing an overflow count.
   * @default 3
   */
  maxBadges?: number;
  /**
   * Called when selection changes.
   */
  onChange: (value: string[]) => void;
  /**
   * Options to display.
   */
  options: ReadonlyArray<MultiSelectOption>;
  /**
   * Placeholder shown when no values are selected.
   * @default 'Select...'
   */
  placeholder?: string;
  /**
   * Ref forwarded to the combobox button.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Search input placeholder.
   * @default 'Search...'
   */
  searchPlaceholder?: string;
  /**
   * Select-all option label.
   * @default 'Select all'
   */
  selectAllLabel?: string;
  /**
   * Select size.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Start icon rendered in the trigger.
   */
  startIcon?: ReactNode;
  /**
   * Validation status displayed below the selector.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the trigger wrapper.
   */
  style?: CSSProperties;
  /**
   * How selected items are summarized in the trigger.
   * @default 'count'
   */
  triggerDisplay?: MultiSelectTriggerDisplay;
  /**
   * Selected option values.
   */
  value: string[];
}

const styles = {
  trigger: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2',
    flex: 1,
    minW: 0,
    p: 0,
    borderWidth: 0,
    bg: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontFamily: 'body',
    textAlign: 'start',
    _disabled: {cursor: 'not-allowed'},
  }),
  triggerText: css({
    flex: 1,
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  placeholder: css({color: 'fg.muted'}),
  iconSlot: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: 'fg.muted',
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  badges: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    minW: 0,
    overflow: 'hidden',
  }),
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    overflowY: 'auto',
    p: '1',
  }),
  search: css({
    boxSizing: 'border-box',
    w: 'full',
    px: '2',
    py: '1',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.300',
    borderRadius: 'md',
    fontFamily: 'body',
    outline: 'none',
    _focus: {borderColor: 'primary'},
  }),
  option: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    w: 'full',
    px: '2',
    py: '2',
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
    _disabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  }),
  checkbox: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    w: '5',
    h: '5',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.400',
    borderRadius: 'sm',
    bg: 'bg',
    color: 'white',
    '& > svg': {
      w: '3.5',
      h: '3.5',
    },
  }),
  checkboxSelected: css({
    bg: 'primary',
    borderColor: 'primary',
  }),
  optionContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
    flex: 1,
  }),
  sectionHeading: css({
    px: '2',
    py: '1',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'semibold',
  }),
  divider: css({
    h: '1px',
    bg: 'silver-neutral.200',
    my: '1',
  }),
} as const;

function normalizeOption(
  option: string | MultiSelectOptionData,
): MultiSelectOptionData {
  return typeof option === 'string'
    ? {label: option, value: option}
    : {...option, label: option.label ?? option.value};
}

function getSelectableOptions(
  options: ReadonlyArray<MultiSelectOption>,
): MultiSelectOptionData[] {
  return options.flatMap(option => {
    if (typeof option === 'string') {
      return [normalizeOption(option)];
    }
    if ('type' in option) {
      return option.type === 'section'
        ? option.options.map(normalizeOption)
        : [];
    }
    return [normalizeOption(option)];
  });
}

/**
 * Multi-select dropdown field with checkbox-style options.
 */
export function MultiSelect({
  children,
  className,
  changeAction,
  'data-testid': dataTestId,
  description,
  hasClear = false,
  hasSearch = false,
  hasSelectAll = false,
  isDefaultOpen = false,
  isDisabled = false,
  isLabelHidden = false,
  isLoading = false,
  isOptional = false,
  isRequired = false,
  label,
  labelTooltip,
  maxBadges = 3,
  onChange,
  options,
  placeholder = 'Select...',
  ref,
  searchPlaceholder = 'Search...',
  selectAllLabel = 'Select all',
  size = 'md',
  startIcon,
  status,
  style,
  triggerDisplay = 'count',
  value,
}: MultiSelectProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const [query, setQuery] = useState('');
  const selectedValues = useMemo(() => new Set(value), [value]);
  const selectableOptions = useMemo(
    () => getSelectableOptions(options),
    [options],
  );
  const enabledOptions = selectableOptions.filter(
    option => option.disabled !== true,
  );
  const selectedOptions = selectableOptions.filter(option =>
    selectedValues.has(option.value),
  );
  const filteredValues = useMemo(() => {
    if (query.trim() === '') {
      return new Set(selectableOptions.map(option => option.value));
    }
    const lowerQuery = query.toLowerCase();
    return new Set(
      selectableOptions
        .filter(option =>
          (option.label ?? option.value).toLowerCase().includes(lowerQuery),
        )
        .map(option => option.value),
    );
  }, [query, selectableOptions]);
  const allSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every(option => selectedValues.has(option.value));

  const commitChange = (nextValue: string[]) => {
    onChange(nextValue);
    void changeAction?.(nextValue);
  };

  const toggleValue = (optionValue: string) => {
    const nextValues = new Set(value);
    if (nextValues.has(optionValue)) {
      nextValues.delete(optionValue);
    } else {
      nextValues.add(optionValue);
    }
    commitChange(Array.from(nextValues));
  };

  const toggleAll = () => {
    if (allSelected) {
      commitChange(
        value.filter(
          optionValue =>
            !enabledOptions.some(option => option.value === optionValue),
        ),
      );
      return;
    }

    const nextValues = new Set(value);
    for (const option of enabledOptions) {
      nextValues.add(option.value);
    }
    commitChange(Array.from(nextValues));
  };

  const renderTriggerValue = (): ReactNode => {
    if (selectedOptions.length === 0) {
      return (
        <span className={cx(styles.triggerText, styles.placeholder)}>
          {placeholder}
        </span>
      );
    }
    if (triggerDisplay === 'labels') {
      const labels = selectedOptions.map(
        option => option.label ?? option.value,
      );
      return <span className={styles.triggerText}>{labels.join(', ')}</span>;
    }
    if (triggerDisplay === 'badges') {
      const visible = selectedOptions.slice(0, maxBadges);
      const overflow = selectedOptions.length - visible.length;
      return (
        <span className={styles.badges}>
          {visible.map(option => (
            <Badge key={option.value} label={option.label ?? option.value} />
          ))}
          {overflow > 0 ? (
            <Text as="span" color="secondary" type="supporting">
              +{overflow}
            </Text>
          ) : null}
        </span>
      );
    }
    return (
      <span className={styles.triggerText}>
        {selectedOptions.length} selected
      </span>
    );
  };

  const renderOption = (option: MultiSelectOptionData): ReactNode => {
    const normalized = normalizeOption(option);
    if (!filteredValues.has(normalized.value)) {
      return null;
    }
    const isSelected = selectedValues.has(normalized.value);
    return (
      <button
        aria-selected={isSelected}
        className={styles.option}
        disabled={normalized.disabled}
        key={normalized.value}
        onClick={() => toggleValue(normalized.value)}
        role="option"
        type="button">
        <span
          aria-hidden="true"
          className={cx(
            styles.checkbox,
            isSelected ? styles.checkboxSelected : undefined,
          )}>
          {isSelected ? <Icon icon={Check} size="sm" /> : null}
        </span>
        <span className={styles.optionContent}>
          {children == null ? (
            <>
              {normalized.icon != null ? (
                <span className={styles.iconSlot}>{normalized.icon}</span>
              ) : null}
              {normalized.label}
            </>
          ) : (
            children(normalized)
          )}
        </span>
      </button>
    );
  };

  const optionNodes: ReactNode[] = [];
  for (const option of options) {
    if (typeof option === 'string') {
      optionNodes.push(renderOption(normalizeOption(option)));
    } else if ('type' in option) {
      if (option.type === 'divider') {
        optionNodes.push(
          <div className={styles.divider} key="divider" role="separator" />,
        );
      } else {
        const sectionKey =
          option.title ??
          option.options.map(sectionOption => sectionOption.value).join('|');
        optionNodes.push(
          <div
            aria-label={option.title}
            key={`section-${sectionKey}`}
            role="group">
            {option.title != null ? (
              <div className={styles.sectionHeading}>{option.title}</div>
            ) : null}
            {option.options.map(renderOption)}
          </div>,
        );
      }
    } else {
      optionNodes.push(renderOption(normalizeOption(option)));
    }
  }

  const menu = (
    <div
      aria-label={`${label} options`}
      aria-multiselectable="true"
      className={styles.menu}
      role="listbox">
      {hasSearch ? (
        <input
          aria-label={`Search ${label}`}
          className={styles.search}
          onChange={event => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={query}
        />
      ) : null}
      {hasSelectAll ? (
        <button
          aria-selected={allSelected}
          className={styles.option}
          onClick={toggleAll}
          role="option"
          type="button">
          <span
            aria-hidden="true"
            className={cx(
              styles.checkbox,
              allSelected ? styles.checkboxSelected : undefined,
            )}>
            {allSelected ? <Icon icon={Check} size="sm" /> : null}
          </span>
          <span className={styles.optionContent}>{selectAllLabel}</span>
        </button>
      ) : null}
      {optionNodes}
    </div>
  );

  const trigger = (
    <div
      className={cx(
        inputStyles.wrapper,
        inputStyles.size[size],
        status != null ? inputStyles.status[status.type] : undefined,
        isDisabled ? inputStyles.wrapperDisabled : undefined,
        className,
      )}
      style={style}>
      {startIcon != null ? (
        <span className={styles.iconSlot}>{startIcon}</span>
      ) : null}
      <button
        aria-controls={`${inputId}-listbox`}
        aria-describedby={describedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={status?.type === 'error' || undefined}
        className={styles.trigger}
        data-testid={dataTestId}
        disabled={isDisabled || isLoading}
        id={inputId}
        ref={ref}
        role="combobox"
        type="button">
        {renderTriggerValue()}
      </button>
      {isLoading ? <Spinner size="sm" /> : null}
      {hasClear && value.length > 0 && !isDisabled ? (
        <button
          aria-label={`Clear ${label}`}
          className={inputStyles.clearButton}
          onClick={() => commitChange([])}
          type="button">
          <Icon icon={X} size="sm" />
        </button>
      ) : null}
      <span className={styles.iconSlot}>
        <Icon icon={ChevronDown} size="sm" />
      </span>
    </div>
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
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }>
      <Popover
        content={menu}
        hasAutoFocus={hasSearch}
        hasCloseButton={false}
        isOpen={isOpen}
        onOpenChange={setIsOpen}>
        {trigger}
      </Popover>
    </Field>
  );
}

MultiSelect.displayName = 'MultiSelect';
