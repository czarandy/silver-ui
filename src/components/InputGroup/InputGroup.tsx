import {
  useMemo,
  useId,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from 'components/Field';
import {inputGroupRecipe} from 'components/InputGroup/InputGroup.recipe';
import {InputGroupContext} from 'components/InputGroup/InputGroupContext';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';

export type InputGroupProps = {
  /**
   * Grouped input children to render side-by-side.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the group wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the group wrapper.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether all grouped inputs are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Label text for the input group.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Ref forwarded to the group wrapper.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Visual size applied to the group.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the group.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the group wrapper.
   */
  style?: CSSProperties;
} & FieldNecessity;

/**
 * Groups multiple inputs into a single visually connected row.
 */
export function InputGroup({
  children,
  label,
  description,
  isDisabled = false,
  isLabelHidden = false,
  isOptional,
  isRequired,
  size = 'md',
  status,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: InputGroupProps): React.JSX.Element {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusID = status?.message != null ? `${inputId}-status` : undefined;
  const describedBy =
    [descriptionID, statusID].filter(Boolean).join(' ') || undefined;
  const contextValue = useMemo(
    () => ({
      isInGroup: true as const,
      isDisabled,
      label,
      size,
      statusType: status?.type,
    }),
    [isDisabled, label, size, status?.type],
  );

  const necessity = getNecessity(isOptional, isRequired);

  return (
    <InputGroupContext value={contextValue}>
      <Field
        description={description}
        descriptionID={descriptionID}
        inputId={inputId}
        isDisabled={isDisabled}
        isLabelHidden={isLabelHidden}
        labelAs="span"
        labelId={labelId}
        {...necessity}
        label={label}
        labelTooltip={labelTooltip}
        status={status == null ? undefined : {...status, messageID: statusID}}
        statusVariant="detached">
        <div
          aria-describedby={describedBy}
          aria-disabled={isDisabled || undefined}
          aria-labelledby={labelId}
          className={cx(
            inputGroupRecipe({
              isDisabled,
              size,
              status: status?.type,
            }),
            className,
          )}
          data-testid={dataTestId}
          ref={ref}
          role="group"
          style={style}>
          {children}
        </div>
      </Field>
    </InputGroupContext>
  );
}

InputGroup.displayName = 'InputGroup';
