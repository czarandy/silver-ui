import type {ComponentPropsWithRef, ElementType} from 'react';

export type LinkComponentProps = ComponentPropsWithRef<'a'> & {
  to?: string;
};

export type LinkComponent = ElementType<LinkComponentProps>;
