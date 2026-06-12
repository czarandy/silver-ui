import {Eye, EyeOff} from 'lucide-react';
import {useCallback, useState, type Ref} from 'react';
import {getNecessity} from 'components/Field';
import {Button} from '../Button';
import {TextInput, type TextInputProps} from '../TextInput';

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
  isOptional,
  isRequired,
  ref,
  style,
  ...props
}: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
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
          isDisabled={isDisabled}
          isIconOnly
          label={isVisible ? 'Hide password' : 'Show password'}
          onClick={toggleVisibility}
          size="sm"
          variant="ghost"
        />
      }
      isDisabled={isDisabled}
      ref={ref}
      style={style}
      type={isVisible ? 'text' : 'password'}
    />
  );
}

PasswordInput.displayName = 'PasswordInput';
