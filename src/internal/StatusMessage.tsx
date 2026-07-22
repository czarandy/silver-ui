import type {InputStatus} from 'components/Field/types';
import {statusMessageRecipe} from 'internal/StatusMessage.recipe';

interface StatusMessageProps {
  /**
   * ID applied to the message element for `aria-describedby` wiring.
   */
  id?: string;
  /**
   * Validation status to display. Renders nothing without a message.
   */
  status?: InputStatus;
  /**
   * Whether the message hangs off the input above it or stands alone.
   * @default 'attached'
   */
  variant?: 'attached' | 'detached';
}

/**
 * The validation status message rendered below an input or group, with
 * error/warning/success surfaces and live-region semantics. Shared by Field,
 * CheckboxInput, and Fieldset so status behavior cannot drift between them.
 */
export function StatusMessage({
  id,
  status,
  variant = 'attached',
}: StatusMessageProps): React.JSX.Element | null {
  if (status?.message == null) {
    return null;
  }
  return (
    <div
      aria-live={status.type === 'error' ? 'assertive' : 'polite'}
      className={statusMessageRecipe({statusType: status.type, variant})}
      id={id}
      role={status.type === 'error' ? 'alert' : 'status'}>
      {status.message}
    </div>
  );
}

StatusMessage.displayName = 'StatusMessage';
