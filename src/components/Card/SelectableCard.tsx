/* eslint-disable jsx-a11y-x/click-events-have-key-events -- the semantic checkbox or radio is the clipped sibling; the visible surface only delegates pointer activation */
'use client';

import {Check} from 'lucide-react';
import {
  useRef,
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
  type Ref,
} from 'react';
import type {CardColor, CardVariant} from 'components/Card/Card';
import {cardRecipe} from 'components/Card/Card.recipe';
import {selectableCardRecipe} from 'components/Card/SelectableCard.recipe';
import {checkboxInputRecipe} from 'components/CheckboxInput/CheckboxInput.recipe';
import {clickableContainerRecipe} from 'components/Clickable/ClickableContainer.recipe';
import {Icon} from 'components/Icon';
import {radioGroupItemRecipe} from 'components/RadioGroup/RadioGroup.recipe';
import {forwardSurfaceEvent} from 'internal/forwardSurfaceEvent';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

const selectableCardClasses = selectableCardRecipe();

export interface SelectableCardBaseProps {
  /**
   * Rich content rendered beside the selection indicator.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the card root.
   */
  className?: string;
  /**
   * Decorative surface color. When set, overrides the variant's default
   * background with the corresponding surface color token.
   */
  color?: CardColor;
  /**
   * Test ID applied to the card root.
   */
  'data-testid'?: string;
  /**
   * Whether this selection item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Accessible name for the native checkbox or radio. It is not rendered.
   */
  label: string;
  /**
   * Inner padding step.
   * @default 0
   */
  padding?: SpacingToken;
  /**
   * Ref forwarded to the card root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the card root.
   */
  style?: CSSProperties;
  /**
   * Value represented by this selection item.
   */
  value: string;
  /**
   * Visual style variant.
   * @default 'default'
   */
  variant?: CardVariant;
}

interface SelectableCardProps extends SelectableCardBaseProps {
  controlType: 'checkbox' | 'radio';
  htmlName?: string;
  isChecked: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  onChange: (isChecked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  size: 'sm' | 'md' | 'lg';
}

/**
 * Shared rendering for checkbox and radio cards. The public wrappers provide
 * their distinct group and native-input contracts.
 */
export function SelectableCard({
  children,
  className,
  color,
  controlType,
  'data-testid': dataTestId,
  htmlName,
  isChecked,
  isDisabled = false,
  isReadOnly = false,
  isRequired,
  label,
  onChange,
  padding = 0,
  ref,
  size,
  style,
  value,
  variant = 'default',
}: SelectableCardProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const surfaceClasses = clickableContainerRecipe({
    hasInheritedBorderRadius: false,
    isDisabled,
    isInteractive: !isReadOnly,
  });
  const checkboxClasses = checkboxInputRecipe({
    isDisabled: false,
    mark: isChecked ? 'check' : 'none',
    size,
  });
  const radioClasses = radioGroupItemRecipe({
    isChecked,
    isDisabled: false,
    size,
  });

  const indicator =
    controlType === 'checkbox' ? (
      <span aria-hidden="true" className={checkboxClasses.box}>
        {isChecked ? (
          <Icon className={checkboxClasses.icon} icon={Check} />
        ) : null}
      </span>
    ) : (
      <span aria-hidden="true" className={radioClasses.radio}>
        {isChecked ? <span className={radioClasses.dot} /> : null}
      </span>
    );

  return (
    <div
      className={cx(
        cardRecipe({color, isSelected: isChecked, padding, variant}),
        surfaceClasses.root,
        className,
      )}
      data-clickable-disabled={isDisabled ? 'true' : undefined}
      data-testid={dataTestId}
      onClick={
        isReadOnly
          ? undefined
          : event =>
              forwardSurfaceEvent({
                control: inputRef.current,
                event,
                isDisabled,
              })
      }
      ref={ref}
      style={style}>
      <input
        aria-label={label}
        checked={isChecked}
        className={surfaceClasses.control}
        data-clickable-control=""
        disabled={isDisabled}
        name={htmlName}
        onChange={event => {
          if (isReadOnly) {
            event.preventDefault();
            return;
          }
          onChange(event.target.checked, event);
        }}
        onClick={event => {
          if (isReadOnly) {
            event.preventDefault();
          }
        }}
        ref={inputRef}
        required={isRequired}
        type={controlType}
        value={value}
      />
      <div
        aria-hidden="true"
        className={surfaceClasses.overlay}
        data-clickable-overlay=""
      />
      <div
        className={cx(surfaceClasses.content, selectableCardClasses.content)}
        data-clickable-content="">
        <span className={selectableCardClasses.indicator}>{indicator}</span>
        <div className={selectableCardClasses.body}>{children}</div>
      </div>
    </div>
  );
}

SelectableCard.displayName = 'SelectableCard';
