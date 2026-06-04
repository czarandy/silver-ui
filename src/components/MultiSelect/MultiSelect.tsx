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
import {Badge} from '../Badge';
import {
  Field,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {inputRecipe, inputStyles} from '../Field/inputStyles';
import {Icon, type IconComponent} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';
import {Text} from '../Text';

export interface MultiSelectOptionData extends SelectListboxOptionData {
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

export interface MultiSelectDivider {
  /**
   * Discriminator identifying a divider entry.
   */
  type: 'divider';
}

export interface MultiSelectSection {
  /**
   * Options within this section.
   */
  options: ReadonlyArray<MultiSelectOptionData>;
  /**
   * Optional heading text for the section.
   */
  title?: string;
  /**
   * Discriminator identifying a section entry.
   */
  type: 'section';
}

export type MultiSelectOption =
  | MultiSelectDivider
  | MultiSelectOptionData
  | MultiSelectSection
  | string;

export type MultiSelectTriggerDisplay = 'count' | 'labels' | 'badges';

export type MultiSelectProps = {
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
   * How selected items are summarized in the trigger.
   * @default 'count'
   */
  triggerDisplay?: MultiSelectTriggerDisplay;
  /**
   * Selected option values.
   */
  value: string[];
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
    w: 'full',
    px: '2',
    py: '1',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
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
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffsetTight',
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
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'fg.muted',
    borderRadius: 'sm',
    bg: 'bg',
    color: 'fg.onPrimary',
  }),
  checkboxSelected: css({
    bg: 'primary',
    borderColor: 'primary',
  }),
  optionHighlighted: css({bg: 'bg.subtle'}),
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
    bg: 'border',
    my: '1',
  }),
} as const;

/**
 * Multi-select dropdown field with checkbox-style options.
 */
export function MultiSelect({
  children,
  className,
  'data-testid': dataTestId,
  description,
  hasClear = false,
  hasSearch = false,
  hasSelectAll = false,
  isDefaultOpen = false,
  isDisabled = false,
  isLabelHidden = false,
  isLoading = false,
  isOptional,
  isRequired,
  label,
  labelIcon,
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
  const selectedValues = useMemo(() => new Set(value), [value]);
  const commitChange = useCallback(
    (nextValue: string[]) => {
      onChange(nextValue);
    },
    [onChange],
  );

  const toggleValue = useCallback(
    (option: MultiSelectOptionData): boolean => {
      if (option.isDisabled === true) {
        return false;
      }

      const nextValues = new Set(value);
      if (nextValues.has(option.value)) {
        nextValues.delete(option.value);
      } else {
        nextValues.add(option.value);
      }
      commitChange(Array.from(nextValues));
      return true;
    },
    [commitChange, value],
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
    visibleSelectableOptions,
  } = useSelectListbox({
    description,
    isDefaultOpen,
    isDisabled,
    isLoading,
    onCommitOption: toggleValue,
    options,
    selectedValues,
    shouldClearOnCommit: false,
    status,
  });

  const selectedOptions = useMemo(
    () => selectableOptions.filter(option => selectedValues.has(option.value)),
    [selectableOptions, selectedValues],
  );
  const enabledVisibleOptions = useMemo(
    () => visibleSelectableOptions.filter(option => option.isDisabled !== true),
    [visibleSelectableOptions],
  );
  const allSelected =
    enabledVisibleOptions.length > 0 &&
    enabledVisibleOptions.every(option => selectedValues.has(option.value));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      commitChange(
        value.filter(
          optionValue =>
            !enabledVisibleOptions.some(option => option.value === optionValue),
        ),
      );
      return;
    }

    const nextValues = new Set(value);
    for (const option of enabledVisibleOptions) {
      nextValues.add(option.value);
    }
    commitChange(Array.from(nextValues));
  }, [allSelected, commitChange, enabledVisibleOptions, value]);

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
    if (!filteredValues.has(option.value)) {
      return null;
    }
    const isSelected = selectedValues.has(option.value);
    const isHighlighted = highlightedValue === option.value;
    return (
      <button
        aria-selected={isSelected}
        className={cx(
          styles.option,
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
              {option.icon != null ? (
                <span className={styles.iconSlot}>
                  <Icon color="secondary" icon={option.icon} size="sm" />
                </span>
              ) : null}
              {option.label}
            </>
          ) : (
            children(option)
          )}
        </span>
      </button>
    );
  };

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
        aria-multiselectable="true"
        className={styles.menu}
        id={listboxId}
        role="listbox">
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
    </>
  );

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
        {renderTriggerValue()}
      </button>
      {isLoading ? <Spinner size="sm" /> : null}
      {hasClear && value.length > 0 && !isDisabled ? (
        <button
          aria-label={`Clear ${label}`}
          className={inputStyles.clearButton}
          onClick={event => {
            event.stopPropagation();
            commitChange([]);
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

  const necessity: FieldNecessity = {isOptional, isRequired};

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

MultiSelect.displayName = 'MultiSelect';
