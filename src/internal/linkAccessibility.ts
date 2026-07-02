'use client';

import {useMemo} from 'react';

export function getAriaLabel(
  label: string | undefined,
  opensInNewTab: boolean,
): string | undefined {
  if (!opensInNewTab) {
    return label;
  }

  return label != null ? `${label} (opens in new tab)` : undefined;
}

export function useRel({
  isExternalLink = false,
  target,
  rel,
}: {
  isExternalLink?: boolean;
  target?: string;
  rel?: string;
}): string | undefined {
  return useMemo(() => {
    if (!isExternalLink && target !== '_blank') {
      return rel;
    }

    const relValues = new Set((rel ?? '').split(/\s+/).filter(Boolean));
    relValues.add('noopener');
    relValues.add('noreferrer');

    return Array.from(relValues).join(' ');
  }, [isExternalLink, target, rel]);
}
