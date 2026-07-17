'use client';

import {Check, ChevronDown, X} from 'lucide-react';
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from 'components/Field';
import {inputRecipe} from 'components/Field/inputStyles';
import {Icon, type IconComponent} from 'components/Icon';
import {useInputGroup} from 'components/InputGroup';
import {Popover} from 'components/Popover';
import {
  selectMenuRecipe,
  selectTriggerRecipe,
} from 'components/Select/Select.recipe';
import {Spinner} from 'components/Spinner';
import {
  renderSelectListboxOptions,
  useSelectListbox,
  type SelectListboxOptionData,
} from 'internal/useSelectListbox';
import {cx} from 'utils/cx';

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
  SelectDivider | SelectOptionData | SelectSection | string;

export type SelectProps = {
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
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
  /**
   * Selected option value.
   */
  value: string | null;
} & FieldNecessity;

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
  size: sizeProp = 'md',
  startIcon,
  status,
  style,
  value,
}: SelectProps): React.JSX.Element {
  const inputGroup = useInputGroup();
  const effectiveDisabled = isDisabled || inputGroup?.isDisabled === true;
  const size = inputGroup?.size ?? sizeProp;
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;

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
    description,
    isDisabled: effectiveDisabled,
    isLoading,
    isListboxClosedOnCommit: true,
    isQueryClearedOnCommit: true,
    isTypeaheadEnabled: true,
    onCommitOption: commitOption,
    options,
    selectedValues,
    status,
  });

  const selectedOption = useMemo(
    () => selectableOptions.find(option => option.value === value),
    [selectableOptions, value],
  );

  const menuClasses = selectMenuRecipe();

  const renderOption = useCallback(
    (option: SelectOptionData): ReactNode => {
      if (!filteredValues.has(option.value)) {
        return null;
      }
      return (
        // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events -- keyboard navigation is handled by the combobox input, not individual options
        <div
          aria-disabled={option.isDisabled ?? undefined}
          aria-selected={option.value === value || undefined}
          className={menuClasses.option}
          data-highlighted={option.value === highlightedValue ? '' : undefined}
          data-selected={option.value === value ? '' : undefined}
          data-value={option.value}
          id={getOptionId(option.value)}
          key={option.value}
          onClick={option.isDisabled ? undefined : handleOptionClick}
          onMouseEnter={handleOptionMouseEnter}
          role="option"
          tabIndex={option.value === highlightedValue ? 0 : -1}>
          <span className={menuClasses.optionContent}>
            {renderOptionProp == null ? (
              <>
                {option.icon != null ? (
                  <span className={menuClasses.iconSlot}>
                    <Icon color="secondary" icon={option.icon} size="sm" />
                  </span>
                ) : null}
                {option.label}
              </>
            ) : (
              renderOptionProp(option)
            )}
          </span>
          {option.value === value ? (
            <span className={menuClasses.check}>
              <Icon color="accent" icon={Check} size="sm" />
            </span>
          ) : null}
        </div>
      );
    },
    [
      filteredValues,
      getOptionId,
      handleOptionClick,
      handleOptionMouseEnter,
      highlightedValue,
      menuClasses,
      renderOptionProp,
      value,
    ],
  );

  const optionNodes = renderSelectListboxOptions({
    dividerClassName: menuClasses.divider ?? '',
    inputId,
    options,
    renderOption,
    sectionHeadingClassName: menuClasses.sectionHeading ?? '',
  });

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
        className={menuClasses.menu}
        id={listboxId}
        role="listbox">
        {optionNodes}
      </div>
    </>
  );

  const necessity = getNecessity(isOptional, isRequired);
  const triggerClasses = selectTriggerRecipe({
    isDisabled: isInteractionDisabled,
    isPlaceholder: selectedOption == null,
  });

  const trigger = (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- mouse clicks anywhere on the visual input delegate to the inner combobox button; keyboard handling stays on that button.
    <div
      className={cx(
        inputRecipe({
          size,
          status: effectiveStatusType,
          isDisabled: effectiveDisabled,
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
        <span className={triggerClasses.label}>
          {selectedOption?.label ?? placeholder}
        </span>
      </button>
      {isLoading ? <Spinner size="sm" /> : null}
      {hasClear && selectedOption != null && !effectiveDisabled ? (
        <Button
          icon={X}
          isIconOnly
          label={`Clear ${label}`}
          onClick={event => {
            event.stopPropagation();
            onChange(null);
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
      {trigger}
      {popover}
    </Field>
  );
}

Select.displayName = 'Select';
