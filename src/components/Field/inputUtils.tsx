import {CheckCircle2, CircleAlert, CircleX} from 'lucide-react';
import type {ReactNode} from 'react';
import type {InputStatus, InputStatusType} from './types';

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
    return <CheckCircle2 aria-hidden="true" />;
  }

  if (type === 'warning') {
    return <CircleAlert aria-hidden="true" />;
  }

  return <CircleX aria-hidden="true" />;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
