import {Check, ChevronDown, X} from 'lucide-react';
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {
  renderSelectListboxOptions,
  useSelectListbox,
  type SelectListboxOptionData,
} from '../../internal/useSelectListbox';
import {
  Field,
  inputRecipe,
  inputStyles,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {Icon, type IconComponent} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';

export interface SelectOptionData extends SelectListboxOptionData {
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

export type SelectOptionDefinition =
  | SelectDivider
  | SelectOptionData
  | SelectSection
  | string;

export type SelectProps = {
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
  options: ReadonlyArray<SelectOptionDefinition>;
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
   * Custom render function for selectable options.
   */
  renderOption?: (option: SelectOptionData) => ReactNode;
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
  wrapper: css({
    cursor: 'pointer',
  }),
  wrapperDisabled: css({
    cursor: 'not-allowed',
  }),
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
    outline: 'none',
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
    borderWidth: 'default',
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
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffsetTight',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),
  optionSelected: css({fontWeight: 'medium'}),
  optionHighlighted: css({bg: 'bg.subtle'}),
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

/**
 * Single-select dropdown field.
 */
export function Select({
  className,
  'data-testid': dataTestId,
  description,
  hasClear = false,
  hasSearch = false,
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
  renderOption: renderOptionProp,
  searchPlaceholder = 'Search...',
  size = 'md',
  startIcon,
  status,
  style,
  value,
}: SelectProps): React.JSX.Element {
  const selectedValues = useMemo(
    () => (value == null ? new Set<string>() : new Set([value])),
    [value],
  );

  const commitOption = useCallback(
    (option: SelectOptionData): boolean => {
      if (option.isDisabled) {
        return false;
      }

      onChange(option.value);
      return true;
    },
    [onChange],
  );

  const {
    activeDescendantId,
    describedBy,
    descriptionID,
    filteredValues,
    getOptionId,
    handleKeyboardNavigation,
    handleOptionClick,
    handleOptionMouseEnter,
    highlightedValue,
    inputId,
    isInteractionDisabled,
    isOpen,
    listboxId,
    query,
    selectableOptions,
    setHighlightedValue,
    setIsOpen,
    setQuery,
    statusMessageID,
    triggerRef,
  } = useSelectListbox({
    clearQueryOnCommit: true,
    closeOnCommit: true,
    description,
    isDisabled,
    isLoading,
    onCommitOption: commitOption,
    options,
    selectedValues,
    status,
  });

  const selectedOption = useMemo(
    () => selectableOptions.find(option => option.value === value),
    [selectableOptions, value],
  );

  const renderOption = useCallback(
    (option: SelectOptionData): ReactNode => {
      if (!filteredValues.has(option.value)) {
        return null;
      }
      const isSelected = option.value === value;
      const isHighlighted = option.value === highlightedValue;
      return (
        <button
          aria-selected={isSelected}
          className={cx(
            styles.option,
            isSelected ? styles.optionSelected : undefined,
            isHighlighted ? styles.optionHighlighted : undefined,
          )}
          data-value={option.value}
          disabled={option.isDisabled}
          id={getOptionId(option.value)}
          key={option.value}
          onClick={handleOptionClick}
          onMouseEnter={handleOptionMouseEnter}
          role="option"
          tabIndex={isHighlighted ? 0 : -1}
          type="button">
          <span className={styles.optionContent}>
            {renderOptionProp == null ? (
              <>
                {option.icon != null ? (
                  <span className={styles.iconSlot}>
                    <Icon color="secondary" icon={option.icon} size="sm" />
                  </span>
                ) : null}
                {option.label}
              </>
            ) : (
              renderOptionProp(option)
            )}
          </span>
          {isSelected ? (
            <span className={styles.check}>
              <Icon color="accent" icon={Check} size="sm" />
            </span>
          ) : null}
        </button>
      );
    },
    [
      filteredValues,
      getOptionId,
      handleOptionClick,
      handleOptionMouseEnter,
      highlightedValue,
      renderOptionProp,
      value,
    ],
  );

  const optionNodes = renderSelectListboxOptions({
    dividerClassName: styles.divider,
    inputId,
    options,
    renderOption,
    sectionHeadingClassName: styles.sectionHeading,
  });

  const menu = (
    <>
      {hasSearch ? (
        <input
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-label={`Search ${label}`}
          className={styles.search}
          onChange={event => {
            setQuery(event.target.value);
            setHighlightedValue(null);
          }}
          onKeyDown={handleKeyboardNavigation}
          placeholder={searchPlaceholder}
          type="search"
          value={query}
        />
      ) : null}
      <div
        aria-label={`${label} options`}
        className={styles.menu}
        id={listboxId}
        role="listbox">
        {optionNodes}
      </div>
    </>
  );

  const necessity: FieldNecessity = {isOptional, isRequired};

  const trigger = (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- mouse clicks anywhere on the visual input delegate to the inner combobox button; keyboard handling stays on that button.
    <div
      className={cx(
        inputRecipe({
          size,
          status: status?.type,
          isDisabled,
        }),
        styles.wrapper,
        isInteractionDisabled ? styles.wrapperDisabled : undefined,
      )}
      onClick={() => {
        if (!isInteractionDisabled) {
          setIsOpen(currentIsOpen => !currentIsOpen);
        }
      }}
      ref={triggerRef}>
      {startIcon != null ? (
        <span className={styles.iconSlot}>
          <Icon color="secondary" icon={startIcon} size="sm" />
        </span>
      ) : null}
      <button
        aria-activedescendant={activeDescendantId}
        aria-busy={isLoading || undefined}
        aria-controls={listboxId}
        aria-describedby={describedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={status?.type === 'error' || undefined}
        className={styles.trigger}
        data-testid={dataTestId}
        disabled={isInteractionDisabled}
        id={inputId}
        onKeyDown={handleKeyboardNavigation}
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
          onClick={event => {
            event.stopPropagation();
            onChange(null);
          }}
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
      {trigger}
      <Popover
        anchorRef={triggerRef}
        content={menu}
        hasAutoFocus={hasSearch}
        hasCloseButton={false}
        isEnabled={false}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </Field>
  );
}

Select.displayName = 'Select';
