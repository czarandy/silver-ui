'use client';

import {Eye, EyeOff} from 'lucide-react';
import {useCallback, useState, type Ref} from 'react';
import {Button} from 'components/Button';
import {getNecessity} from 'components/Field';
import {useFieldset} from 'components/Fieldset';
import {useInputGroup} from 'components/InputGroup';
import {TextInput, type TextInputProps} from 'components/TextInput';

export type PasswordInputProps = Omit<
  TextInputProps,
  'endContent' | 'hasClear' | 'startIcon' | 'type'
> & {
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
};

/**
 * Password input with a toggle to show or hide the entered value.
 */
export function PasswordInput({
  className,
  'data-testid': dataTestId,
  isDisabled = false,
  isReadOnly = false,
  isOptional,
  isRequired,
  ref,
  style,
  ...props
}: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
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
  const toggleVisibility = useCallback(() => setIsVisible(v => !v), []);

  return (
    <TextInput
      {...props}
      {...getNecessity(isOptional, isRequired)}
      className={className}
      data-testid={dataTestId}
      endContent={
        <Button
          icon={isVisible ? EyeOff : Eye}
          isDisabled={effectiveDisabled || effectiveReadOnly}
          isIconOnly
          label={isVisible ? 'Hide password' : 'Show password'}
          onClick={toggleVisibility}
          size="sm"
          variant="ghost"
        />
      }
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      ref={ref}
      style={style}
      type={isVisible ? 'text' : 'password'}
    />
  );
}

PasswordInput.displayName = 'PasswordInput';
