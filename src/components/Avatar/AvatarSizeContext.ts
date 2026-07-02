'use client';

import {createContext, use} from 'react';

const DEFAULT_AVATAR_SIZE = 36;

export const AvatarSizeContext = createContext<number>(DEFAULT_AVATAR_SIZE);
AvatarSizeContext.displayName = 'AvatarSizeContext';

export function useAvatarSize(): number {
  return use(AvatarSizeContext);
}
