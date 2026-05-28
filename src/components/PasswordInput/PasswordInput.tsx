import {Eye, EyeOff} from 'lucide-react';
import {useState, type Ref} from 'react';
import {inputStyles} from '../Field';
import {Icon} from '../Icon';
import {TextInput, type TextInputProps} from '../TextInput';

export interface PasswordInputProps extends Omit<
  TextInputProps,
  'endContent' | 'startIcon' | 'type'
> {
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
}

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
        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className={inputStyles.clearButton}
          disabled={isDisabled}
          onClick={() => setIsVisible(v => !v)}
          type="button">
          {isVisible ? (
            <Icon icon={EyeOff} size="sm" />
          ) : (
            <Icon icon={Eye} size="sm" />
          )}
        </button>
      }
      isDisabled={isDisabled}
      ref={ref}
      style={style}
      type={isVisible ? 'text' : 'password'}
    />
  );
}

PasswordInput.displayName = 'PasswordInput';
