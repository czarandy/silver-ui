import type {ComponentPropsWithoutRef, ElementType} from 'react';

export type SilverUIProps<T extends ElementType> =
  ComponentPropsWithoutRef<T> & {
    className?: string;
    style?: React.CSSProperties;
  };
