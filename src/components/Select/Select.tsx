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
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';

export interface SelectOptionData {
  /**
   * Icon displayed before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the option is disabled.
   */
  isDisabled?: boolean;
  /**
   * Option label. Defaults to `value`.
   */
  label?: string;
  /**
   * Option value.
   */
  value: string;
}

export interface SelectDivider {
  /**
   * Discriminator identifying a divider entry.
   */
  type: 'divider';
}

export interface SelectSection {
  /**
   * Options within this section.
   */
  options: ReadonlyArray<SelectOptionData>;
  /**
   * Optional heading text for the section.
   */
  title?: string;
  /**
   * Discriminator identifying a section entry.
   */
  type: 'section';
}

export type SelectOption =
  | SelectDivider
  | SelectOptionData
  | SelectSection
  | string;

export type SelectProps = {
  /**
   * Custom render function for selectable options.
   */
  children?: (option: SelectOptionData) => ReactNode;
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
   * Whether to show a clear button when a value is selected.
   * @default false
   */
  hasClear?: boolean;
  /**
   * Whether to show search input in the dropdown.
   * @default false
   */
  hasSearch?: boolean;
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
   * Called when selection changes.
   */
  onChange: (value: string | null) => void;
  /**
   * Options to display.
   */
  options: ReadonlyArray<SelectOption>;
  /**
   * Placeholder shown when no option is selected.
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
   * Select size.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Start icon rendered in the trigger.
   */
  startIcon?: IconComponent;
  /**
   * Validation status displayed below the selector.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the trigger wrapper.
   */
  style?: CSSProperties;
  /**
   * Selected option value.
   */
  value: string | null;
} & FieldNecessity;

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
    _disabled: {
      cursor: 'not-allowed',
    },
  }),
  label: css({
    flex: 1,
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  placeholder: css({
    color: 'fg.muted',
  }),
  iconSlot: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: 'fg.muted',
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
    borderColor: 'border.emphasized',
    borderRadius: 'md',
    fontFamily: 'body',
    outline: 'none',
    _focus: {
      borderColor: 'primary',
    },
  }),
  option: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),
  optionSelected: css({fontWeight: 'medium'}),
  optionContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
  }),
  check: css({
    display: 'inline-flex',
    color: 'primary',
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
    bg: 'border',
    my: '1',
  }),
} as const;

function normalizeOption(option: string | SelectOptionData): SelectOptionData {
  return typeof option === 'string'
    ? {label: option, value: option}
    : {...option, label: option.label ?? option.value};
}

function getSelectableOptions(
  options: ReadonlyArray<SelectOption>,
): SelectOptionData[] {
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
 * Single-select dropdown field.
 */
export function Select({
  children,
  className,
  'data-testid': dataTestId,
  description,
  hasClear = false,
  hasSearch = false,
  isDefaultOpen = false,
  isDisabled = false,
  isLabelHidden = false,
  isLoading = false,
  isOptional,
  isRequired,
  label,
  labelIcon,
  labelTooltip,
  onChange,
  options,
  placeholder = 'Select...',
  ref,
  searchPlaceholder = 'Search...',
  size = 'md',
  startIcon,
  status,
  style,
  value,
}: SelectProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const [query, setQuery] = useState('');
  const selectableOptions = useMemo(
    () => getSelectableOptions(options),
    [options],
  );
  const selectedOption = selectableOptions.find(
    option => option.value === value,
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

  const renderOption = (option: SelectOptionData): ReactNode => {
    if (!filteredValues.has(option.value)) {
      return null;
    }
    const normalized = normalizeOption(option);
    const isSelected = normalized.value === value;
    return (
      <button
        aria-selected={isSelected}
        className={cx(
          styles.option,
          isSelected ? styles.optionSelected : undefined,
        )}
        disabled={normalized.isDisabled}
        key={normalized.value}
        onClick={() => {
          onChange(normalized.value);
          setIsOpen(false);
          setQuery('');
        }}
        role="option"
        type="button">
        <span className={styles.optionContent}>
          {children == null ? (
            <>
              {normalized.icon != null ? (
                <span className={styles.iconSlot}>
                  <Icon color="secondary" icon={normalized.icon} size="sm" />
                </span>
              ) : null}
              {normalized.label}
            </>
          ) : (
            children(normalized)
          )}
        </span>
        {isSelected ? (
          <span className={styles.check}>
            <Icon color="accent" icon={Check} size="sm" />
          </span>
        ) : null}
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
    <div aria-label={`${label} options`} className={styles.menu} role="listbox">
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
      {optionNodes}
    </div>
  );

  const necessity: FieldNecessity = {isOptional, isRequired};

  const trigger = (
    <div
      className={inputRecipe({
        size,
        status: status?.type,
        isDisabled,
      })}>
      {startIcon != null ? (
        <span className={styles.iconSlot}>
          <Icon color="secondary" icon={startIcon} size="sm" />
        </span>
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
        <span
          className={cx(
            styles.label,
            selectedOption == null ? styles.placeholder : undefined,
          )}>
          {selectedOption?.label ?? placeholder}
        </span>
      </button>
      {isLoading ? <Spinner size="sm" /> : null}
      {hasClear && selectedOption != null && !isDisabled ? (
        <button
          aria-label={`Clear ${label}`}
          className={inputStyles.clearButton}
          onClick={() => onChange(null)}
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
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      style={style}>
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

Select.displayName = 'Select';
