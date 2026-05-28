import {createContext, use} from 'react';

export type MetadataListLabelPosition = 'start' | 'top';
export type MetadataListOrientation = 'horizontal' | 'vertical';

export interface MetadataListLabelConfig {
  position?: MetadataListLabelPosition;
  width?: number | string;
}

export interface MetadataListContextValue {
  label: Required<Pick<MetadataListLabelConfig, 'position'>> &
    Pick<MetadataListLabelConfig, 'width'>;
  orientation: MetadataListOrientation;
}

export const MetadataListContext =
  createContext<MetadataListContextValue | null>(null);

MetadataListContext.displayName = 'MetadataListContext';

export function useMetadataList(): MetadataListContextValue | null {
  return use(MetadataListContext);
}
