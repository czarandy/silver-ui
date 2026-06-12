import {CheckCircle2, CircleAlert, CircleX} from 'lucide-react';
import type {ReactNode} from 'react';
import type {InputStatus, InputStatusType} from 'components/Field/types';
import {Icon} from 'components/Icon';

export function getDescribedBy(
  ...ids: (string | null | undefined | false)[]
): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

export function getStatusMessageID(
  inputId: string,
  status: InputStatus | undefined,
): string | undefined {
  return status?.message != null ? `${inputId}-status` : undefined;
}

export function getStatusIcon(type: InputStatusType): ReactNode {
  if (type === 'success') {
    return <Icon color="success" icon={CheckCircle2} size="sm" />;
  }

  if (type === 'warning') {
    return <Icon color="warning" icon={CircleAlert} size="sm" />;
  }

  return <Icon color="error" icon={CircleX} size="sm" />;
}
