import type {
  AriaAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';

export interface LinkComponentProps {
  ref?: Ref<HTMLAnchorElement>;
  href?: string;
  to?: string;
  target?: string;
  rel?: string;
  'aria-label'?: AriaAttributes['aria-label'];
  'aria-disabled'?: AriaAttributes['aria-disabled'];
  tabIndex?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
}

export type LinkComponent = React.ElementType<LinkComponentProps>;
