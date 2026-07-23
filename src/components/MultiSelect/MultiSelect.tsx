'use client';

import {Check, ChevronDown, X} from 'lucide-react';
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Badge} from 'components/Badge';
import {Button} from 'components/Button';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from 'components/Field';
import {inputRecipe} from 'components/Field/inputStyles';
import {useFieldset} from 'components/Fieldset';
import {Icon, type IconComponent} from 'components/Icon';
import {useInputGroup} from 'components/InputGroup';
import {
  multiSelectMenuRecipe,
  multiSelectTriggerRecipe,
} from 'components/MultiSelect/MultiSelect.recipe';
import {Popover} from 'components/Popover';
import {Spinner} from 'components/Spinner';
import {Text} from 'components/Text';
import {useResolvedSize} from 'internal/SizeContext';
import {
  renderSelectListboxOptions,
  useSelectListbox,
  type SelectListboxOptionData,
} from 'internal/useSelectListbox';
import {cx} from 'utils/cx';

const menuClasses = multiSelectMenuRecipe();

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
  MultiSelectDivider | MultiSelectOptionData | MultiSelectSection | string;

export type MultiSelectTriggerDisplay = 'count' | 'labels' | 'badges';

export type MultiSelectProps = {
  /**
   * Custom render function for selectable options.
   */
  children?: (option: MultiSelectOptionData) => ReactNode;
  /**
   * Additional CSS class names applied to the field root.
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
   * HTML name attribute for native form submission. Each selected value is
   * submitted as a separate entry.
   */
  htmlName?: string;
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
   * Inline styles applied to the field root.
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
  htmlName,
  isDefaultOpen = false,
  isDisabled: isDisabledFromProps = false,
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
  size: sizeProp,
  startIcon,
  status,
  style,
  triggerDisplay = 'count',
  value,
}: MultiSelectProps): React.JSX.Element {
  const inputGroup = useInputGroup();
  const fieldset = useFieldset();
  const isDisabled =
    isDisabledFromProps ||
    inputGroup?.isDisabled === true ||
    fieldset?.isDisabled === true;
  const size = useResolvedSize(inputGroup?.size, sizeProp);
  const statusType = status?.type ?? inputGroup?.statusType;

  const selectedValues = useMemo(() => new Set(value), [value]);

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
      onChange(Array.from(nextValues));
      return true;
    },
    [onChange, value],
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
    isHighlightClearedOnCommit: false,
    isLoading,
    onCommitOption: toggleValue,
    options,
    selectedValues,
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
      onChange(
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
    onChange(Array.from(nextValues));
  }, [allSelected, onChange, enabledVisibleOptions, value]);

  const triggerClasses = multiSelectTriggerRecipe({
    isDisabled: isInteractionDisabled,
    isPlaceholder: selectedOptions.length === 0,
  });

  const renderTriggerValue = (): ReactNode => {
    if (selectedOptions.length === 0) {
      return <span className={triggerClasses.triggerText}>{placeholder}</span>;
    }
    if (triggerDisplay === 'labels') {
      const labels = selectedOptions.map(
        option => option.label ?? option.value,
      );
      return (
        <span className={triggerClasses.triggerText}>{labels.join(', ')}</span>
      );
    }
    if (triggerDisplay === 'badges') {
      const visible = selectedOptions.slice(0, maxBadges);
      const overflow = selectedOptions.length - visible.length;
      return (
        <span className={triggerClasses.badges}>
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
      <span className={triggerClasses.triggerText}>
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
    const optionClasses = multiSelectMenuRecipe({isHighlighted, isSelected});
    return (
      // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events -- keyboard navigation is handled by the combobox input, not individual options
      <div
        aria-disabled={option.isDisabled ?? undefined}
        aria-selected={isSelected}
        className={optionClasses.option}
        data-value={option.value}
        id={getOptionId(option.value)}
        key={option.value}
        onClick={option.isDisabled ? undefined : handleOptionClick}
        onMouseEnter={handleOptionMouseEnter}
        role="option"
        tabIndex={isHighlighted ? 0 : -1}>
        <span aria-hidden="true" className={optionClasses.checkbox}>
          {isSelected ? <Icon icon={Check} size="sm" /> : null}
        </span>
        <span className={optionClasses.optionContent}>
          {children == null ? (
            <>
              {option.icon != null ? (
                <span className={optionClasses.iconSlot}>
                  <Icon color="secondary" icon={option.icon} size="sm" />
                </span>
              ) : null}
              {option.label}
            </>
          ) : (
            children(option)
          )}
        </span>
      </div>
    );
  };

  const optionNodes = renderSelectListboxOptions({
    dividerClassName: menuClasses.divider ?? '',
    inputId,
    options,
    renderOption,
    sectionHeadingClassName: menuClasses.sectionHeading ?? '',
  });

  const selectAllClasses = multiSelectMenuRecipe({isSelected: allSelected});

  const menu = (
    <>
      {hasSearch ? (
        <input
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-label={`Search ${label}`}
          className={menuClasses.search}
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
        className={menuClasses.menu}
        id={listboxId}
        role="listbox">
        {hasSelectAll ? (
          // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events -- keyboard navigation is handled by the combobox input, not individual options
          <div
            aria-selected={allSelected}
            className={selectAllClasses.option}
            onClick={toggleAll}
            role="option"
            tabIndex={-1}>
            <span aria-hidden="true" className={selectAllClasses.checkbox}>
              {allSelected ? <Icon icon={Check} size="sm" /> : null}
            </span>
            <span className={selectAllClasses.optionContent}>
              {selectAllLabel}
            </span>
          </div>
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
          status: statusType,
          isDisabled,
        }),
        triggerClasses.wrapper,
        inputGroup != null ? className : undefined,
      )}
      onClick={() => {
        if (!isInteractionDisabled) {
          setIsOpen(currentIsOpen => !currentIsOpen);
        }
      }}
      ref={triggerRef}
      style={inputGroup != null ? style : undefined}>
      {startIcon != null ? (
        <span className={menuClasses.iconSlot}>
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
        aria-label={inputGroup != null ? label : undefined}
        className={triggerClasses.trigger}
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
        <Button
          icon={X}
          isIconOnly
          label={`Clear ${label}`}
          onClick={event => {
            event.stopPropagation();
            onChange([]);
          }}
          size="sm"
          variant="ghost"
        />
      ) : null}
      <span className={menuClasses.iconSlot}>
        <Icon icon={ChevronDown} size="sm" />
      </span>
    </div>
  );

  const necessity = getNecessity(isOptional, isRequired);

  const popover = (
    <Popover
      anchorRef={triggerRef}
      content={menu}
      hasAutoFocus={hasSearch}
      hasCloseButton={false}
      isEnabled={false}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    />
  );

  if (inputGroup != null) {
    return (
      <>
        {trigger}
        {popover}
      </>
    );
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
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      style={style}>
      {htmlName == null
        ? null
        : value.map(selectedValue => (
            <input
              disabled={isDisabled}
              key={selectedValue}
              name={htmlName}
              type="hidden"
              value={selectedValue}
            />
          ))}
      {trigger}
      {popover}
    </Field>
  );
}

MultiSelect.displayName = 'MultiSelect';
