'use client';

import {Check, ChevronDown, Search, X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import {useFieldset} from 'components/Fieldset';
import {Icon, type IconComponent} from 'components/Icon';
import {useInputGroup} from 'components/InputGroup';
import {Popover} from 'components/Popover';
import {
  selectMenuRecipe,
  selectTriggerRecipe,
} from 'components/Select/Select.recipe';
import {Spinner} from 'components/Spinner';
import {TextInput} from 'components/TextInput';
import {useResolvedSize} from 'internal/SizeContext';
import {mergeRefs} from 'internal/mergeRefs';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {
  renderSelectListboxOptions,
  useSelectListbox,
  type SelectListboxOptionData,
} from 'internal/useSelectListbox';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

const menuClasses = selectMenuRecipe();

export interface SelectOptionData<
  TAuxiliaryData = unknown,
> extends SelectListboxOptionData {
  /**
   * Custom data associated with the option.
   */
  auxiliaryData?: TAuxiliaryData;
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

export interface SelectSection<TAuxiliaryData = unknown> {
  /**
   * Options within this section.
   */
  options: ReadonlyArray<SelectOptionData<TAuxiliaryData>>;
  /**
   * Optional heading text for the section.
   */
  title?: string;
  /**
   * Discriminator identifying a section entry.
   */
  type: 'section';
}

export type SelectOptionDefinition<TAuxiliaryData = unknown> =
  | SelectDivider
  | SelectOptionData<TAuxiliaryData>
  | SelectSection<TAuxiliaryData>
  | string;

export type SelectVariant = 'button' | 'ghost' | 'outline';

export type SelectProps<TAuxiliaryData = unknown> = {
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
   * HTML name attribute for native form submission.
   */
  htmlName?: string;
  /**
   * Whether focusing the trigger opens the option list. Pointer presses keep
   * their ordinary click-to-toggle behaviour.
   * @default false
   */
  hasEntriesOnFocus?: boolean;
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
   * Whether the value is displayed without allowing focus or interaction.
   * @default false
   */
  isReadOnly?: boolean;
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
   * Called when selection changes. The selected option is provided as the
   * second argument, or `null` when the selection is cleared.
   */
  onChange: (
    value: string | null,
    option: SelectOptionData<TAuxiliaryData> | null,
  ) => void;
  /**
   * Options to display.
   */
  options: ReadonlyArray<SelectOptionDefinition<TAuxiliaryData>>;
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
  renderOption?: (option: SelectOptionData<TAuxiliaryData>) => ReactNode;
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
  /**
   * Visual style of the selector trigger.
   * @default 'outline'
   */
  variant?: SelectVariant;
} & FieldNecessity;

/**
 * Single-select dropdown field.
 */
export function Select<TAuxiliaryData = unknown>({
  className,
  'data-testid': dataTestId,
  description,
  hasClear = false,
  hasEntriesOnFocus = false,
  hasSearch = false,
  htmlName,
  isDisabled = false,
  isLabelHidden = false,
  isLoading = false,
  isReadOnly = false,
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
  size: sizeProp,
  startIcon,
  status,
  style,
  value,
  variant = 'outline',
}: SelectProps<TAuxiliaryData>): React.JSX.Element {
  const inputGroup = useInputGroup();
  const fieldset = useFieldset();
  const effectiveDisabled =
    isDisabled ||
    inputGroup?.isDisabled === true ||
    fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled &&
    (isReadOnly ||
      inputGroup?.isReadOnly === true ||
      fieldset?.isReadOnly === true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const size = useResolvedSize(inputGroup?.size, sizeProp);
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;

  const selectedValues = useMemo(
    () => (value == null ? new Set<string>() : new Set([value])),
    [value],
  );

  const commitOption = useCallback(
    (option: SelectOptionData<TAuxiliaryData>): boolean => {
      if (effectiveReadOnly || option.isDisabled) {
        return false;
      }

      onChange(option.value, option);
      return true;
    },
    [effectiveReadOnly, onChange],
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
    handleTriggerBlur,
    handleTriggerClick,
    handleTriggerFocus,
    handleTriggerPointerDown,
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
    hasEntriesOnFocus,
    isDisabled: effectiveDisabled,
    isLoading,
    isListboxClosedOnCommit: true,
    isQueryClearedOnCommit: true,
    isReadOnly: effectiveReadOnly,
    isTypeaheadEnabled: true,
    onCommitOption: commitOption,
    options,
    selectedValues,
    status,
  });

  useEffect(() => {
    if (effectiveReadOnly) {
      setIsOpen(false);
      setQuery('');
      buttonRef.current?.blur();
    }
  }, [effectiveReadOnly, setIsOpen, setQuery]);

  const selectedOption = useMemo(
    () => selectableOptions.find(option => option.value === value),
    [selectableOptions, value],
  );

  const renderOption = useCallback(
    (option: SelectOptionData<TAuxiliaryData>): ReactNode => {
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
        <TextInput
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          aria-controls={listboxId}
          hasClear
          isLabelHidden
          label={`Search ${label}`}
          onChange={nextQuery => {
            setQuery(nextQuery);
            setHighlightedValue(null);
          }}
          onKeyDown={handleKeyboardNavigation}
          placeholder={searchPlaceholder}
          role="searchbox"
          size={size}
          startIcon={Search}
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
    variant,
    isDisabled: isInteractionDisabled,
    isReadOnly: effectiveReadOnly,
    isPlaceholder: selectedOption == null,
  });
  const triggerWrapperClassName = css(
    inputRecipe.raw({
      size,
      status: effectiveStatusType,
      isDisabled: effectiveDisabled,
      isReadOnly: effectiveReadOnly,
    }),
    selectTriggerRecipe.raw({
      variant,
      isDisabled: isInteractionDisabled,
      isReadOnly: effectiveReadOnly,
      isPlaceholder: selectedOption == null,
    }).wrapper,
  );

  const trigger = (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- mouse clicks anywhere on the visual input delegate to the inner combobox button; keyboard handling stays on that button.
    <div
      className={cx(
        triggerWrapperClassName,
        inputGroup != null ? className : undefined,
      )}
      onClick={handleTriggerClick}
      onClickCapture={
        effectiveReadOnly ? preventReadOnlyInteraction : undefined
      }
      onFocusCapture={effectiveReadOnly ? blurReadOnlyInteraction : undefined}
      onKeyDownCapture={
        effectiveReadOnly ? preventReadOnlyInteraction : undefined
      }
      onPointerDown={handleTriggerPointerDown}
      onPointerDownCapture={
        effectiveReadOnly ? preventReadOnlyInteraction : undefined
      }
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
        aria-readonly={effectiveReadOnly || undefined}
        className={triggerClasses.trigger}
        data-testid={dataTestId}
        disabled={isInteractionDisabled}
        id={inputId}
        onBlur={handleTriggerBlur}
        onFocus={handleTriggerFocus}
        onKeyDown={handleKeyboardNavigation}
        ref={mergeRefs(ref, buttonRef)}
        role="combobox"
        tabIndex={effectiveReadOnly ? -1 : undefined}
        type="button">
        <span className={triggerClasses.label}>
          {selectedOption?.label ?? placeholder}
        </span>
      </button>
      {isLoading ? <Spinner size="sm" /> : null}
      {hasClear &&
      selectedOption != null &&
      !effectiveDisabled &&
      !effectiveReadOnly ? (
        <Button
          icon={X}
          isIconOnly
          label={`Clear ${label}`}
          onClick={event => {
            event.stopPropagation();
            onChange(null, null);
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
      isDisabled={effectiveDisabled}
      isLabelHidden={isLabelHidden}
      isReadOnly={effectiveReadOnly}
      {...necessity}
      label={label}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      statusVariant={variant === 'outline' ? 'attached' : 'detached'}
      style={style}>
      {htmlName == null || value == null ? null : (
        <input
          disabled={effectiveDisabled}
          name={htmlName}
          type="hidden"
          value={value}
        />
      )}
      {trigger}
      {popover}
    </Field>
  );
}

Select.displayName = 'Select';
