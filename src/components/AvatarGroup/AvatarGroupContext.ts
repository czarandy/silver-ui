import {createContext, use} from 'react';
import type {AvatarSize} from 'components/Avatar';

export interface AvatarGroupContextValue {
  numericSize: number;
  overlap: number;
  size: AvatarSize;
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(
  null,
);
AvatarGroupContext.displayName = 'AvatarGroupContext';

export function useAvatarGroup(): AvatarGroupContextValue | null {
  return use(AvatarGroupContext);
}
