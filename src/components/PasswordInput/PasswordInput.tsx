import {Eye, EyeOff} from 'lucide-react';
import {useState, type Ref} from 'react';
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
  ref,
  style,
  ...props
}: PasswordInputProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextInput
      {...props}
      className={className}
      data-testid={dataTestId}
      endContent={
        <Button
          icon={isVisible ? EyeOff : Eye}
          isDisabled={isDisabled}
          isIconOnly
          label={isVisible ? 'Hide password' : 'Show password'}
          onClick={() => setIsVisible(v => !v)}
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
