'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useAvatarSize} from 'components/Avatar/AvatarSizeContext';
import {StatusDot} from 'components/StatusDot/StatusDot';
import type {
  StatusDotSize,
  StatusDotVariant,
} from 'components/StatusDot/StatusDot.types';

export type AvatarStatusDotVariant = StatusDotVariant;

/**
 * Size-aware status indicator intended for Avatar's `status` prop.
 */
export interface AvatarStatusDotProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Optional icon rendered inside medium and large dots.
   */
  icon?: ReactNode;
  /**
   * Accessible label describing the status, such as "Online".
   */
  label: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Semantic dot color. Default is `success`.
   */
  variant?: AvatarStatusDotVariant;
}

function resolveStatusDotSize(avatarSize: number): StatusDotSize {
  if (avatarSize <= 36) {
    return 'sm';
  }
  if (avatarSize <= 72) {
    return 'md';
  }
  return 'lg';
}

/**
 * Size-aware status indicator dot rendered in the corner of an Avatar.
 * A thin wrapper around StatusDot that derives its size from the
 * surrounding Avatar.
 */
export function AvatarStatusDot({
  className,
  'data-testid': dataTestId,
  icon,
  label,
  ref,
  style,
  variant = 'success',
}: AvatarStatusDotProps): React.JSX.Element {
  const avatarSize = useAvatarSize();

  return (
    <StatusDot
      className={className}
      data-testid={dataTestId}
      hasRing
      icon={icon}
      label={label}
      ref={ref}
      size={resolveStatusDotSize(avatarSize)}
      style={style}
      variant={variant}
    />
  );
}

AvatarStatusDot.displayName = 'AvatarStatusDot';
