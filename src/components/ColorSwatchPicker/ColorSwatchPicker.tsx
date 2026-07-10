'use client';

import {Check} from 'lucide-react';
import {
  useCallback,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  colorSwatchPickerRecipe,
  colorSwatchRecipe,
} from 'components/ColorSwatchPicker/ColorSwatchPicker.recipe';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from 'components/Field';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {Icon} from 'components/Icon';
import {useTooltip} from 'components/Tooltip';
import useKeyboardHint from 'hooks/useKeyboardHint';
import useListFocus from 'hooks/useListFocus';
import {COLOR_LABELS, COLOR_NAMES, type ColorName} from 'internal/colorNames';
import isReactNode from 'internal/isReactNode';
import {mergeRefs} from 'internal/mergeRefs';

export type ColorSwatchPickerProps = {
  /**
   * Additional CSS class names applied to the field root.
   */
  className?: string;
  /**
   * Palette colors to render, in display order.
   * @default COLOR_NAMES
   */
  colors?: ReadonlyArray<ColorName>;
  /**
   * Test ID applied to the field root.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether all swatches are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Label text for the swatch picker.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Callback fired when the selected color changes.
   */
  onChange: (value: ColorName) => void;
  /**
   * Ref forwarded to the field root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Size of the swatches.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the picker.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
  /**
   * The currently selected color.
   */
  value: ColorName;
} & FieldNecessity;

interface ColorSwatchProps {
  color: ColorName;
  isDisabled: boolean;
  isSelected: boolean;
  isTabbable: boolean;
  onSelect: (color: ColorName) => void;
  size: InputSize;
}

function ColorSwatch({
  color,
  isDisabled,
  isSelected,
  isTabbable,
  onSelect,
  size,
}: ColorSwatchProps): React.JSX.Element {
  const label = COLOR_LABELS[color];
  const classes = colorSwatchRecipe({color, isDisabled, isSelected, size});
  // Hover-only: focus already surfaces the color through the accessible name,
  // and a focus tooltip would collide with the group's keyboard hint and stay
  // open on the focused swatch while the pointer hovers another one.
  const {ref: tooltipRef, renderTooltip} = useTooltip({
    focusTrigger: 'never',
    isEnabled: !isDisabled,
  });

  return (
    <>
      <button
        aria-checked={isSelected}
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        className={classes.button}
        data-value={color}
        onClick={() => {
          if (!isDisabled) {
            onSelect(color);
          }
        }}
        ref={tooltipRef}
        role="radio"
        tabIndex={isTabbable ? 0 : -1}
        type="button">
        <span aria-hidden="true" className={classes.fill}>
          {isSelected ? <Icon icon={Check} size={size} /> : null}
        </span>
      </button>
      {/*
        The tooltip repeats the swatch's accessible name, so it is deliberately
        left out of `aria-describedby` — that would announce the color twice.
      */}
      {renderTooltip(label)}
    </>
  );
}

/**
 * A controlled swatch picker for choosing one named theme color.
 */
export function ColorSwatchPicker({
  className,
  colors = COLOR_NAMES,
  'data-testid': dataTestId,
  description,
  isDisabled = false,
  isLabelHidden = false,
  isOptional,
  isRequired,
  label,
  labelTooltip,
  onChange,
  ref,
  size = 'md',
  status,
  style,
  value,
}: ColorSwatchPickerProps): React.JSX.Element {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = colors.indexOf(value);
  const tabStopIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const handleChange = useCallback(
    (nextValue: ColorName) => {
      if (nextValue !== value) {
        onChange(nextValue);
      }
    },
    [onChange, value],
  );

  const getItems = useCallback(
    () =>
      Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(
          '[role="radio"]:not([aria-disabled="true"])',
        ) ?? [],
      ),
    [],
  );
  const {handleKeyDown: handleListKeyDown} = useListFocus({
    getItems,
    onFocusItem: item => {
      const nextValue = item.dataset.value as ColorName | undefined;
      if (nextValue != null) {
        handleChange(nextValue);
      }
    },
    orientation: 'both',
  });
  const hint = useKeyboardHint({
    isEnabled: !isDisabled,
    orientation: 'horizontal',
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      hint.onKeyDown(event);
      if (isDisabled) {
        return;
      }
      handleListKeyDown(event);
    },
    [handleListKeyDown, hint, isDisabled],
  );

  const necessity = getNecessity(isOptional, isRequired);

  return (
    <Field
      className={className}
      data-testid={dataTestId}
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelAs="span"
      labelId={labelId}
      labelTooltip={labelTooltip}
      ref={ref}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      statusVariant="detached"
      style={style}>
      <div
        aria-describedby={describedBy}
        aria-disabled={isDisabled || undefined}
        aria-invalid={status?.type === 'error' || undefined}
        aria-labelledby={labelId}
        aria-orientation="horizontal"
        aria-required={isRequired ?? undefined}
        className={colorSwatchPickerRecipe()}
        id={inputId}
        onBlur={hint.onBlur}
        onFocus={hint.onFocus}
        onKeyDown={handleKeyDown}
        ref={mergeRefs(containerRef)}
        role="radiogroup"
        tabIndex={-1}>
        {colors.map((color, index) => (
          <ColorSwatch
            color={color}
            isDisabled={isDisabled}
            isSelected={color === value}
            isTabbable={index === tabStopIndex}
            key={color}
            onSelect={handleChange}
            size={size}
          />
        ))}
        {hint.hintElement}
      </div>
    </Field>
  );
}

ColorSwatchPicker.displayName = 'ColorSwatchPicker';
