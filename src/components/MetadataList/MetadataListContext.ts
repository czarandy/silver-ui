import {createContext, use} from 'react';

export interface MetadataListContextValue {
  labelPosition: 'start' | 'top';
}

export const MetadataListContext =
  createContext<MetadataListContextValue | null>(null);

MetadataListContext.displayName = 'MetadataListContext';

export function useMetadataList(): MetadataListContextValue | null {
  return use(MetadataListContext);
}
