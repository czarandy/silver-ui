import type {
  AriaAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';

export interface LinkComponentProps {
  'aria-disabled'?: AriaAttributes['aria-disabled'];
  'aria-label'?: AriaAttributes['aria-label'];
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  ref?: Ref<HTMLAnchorElement>;
  rel?: string;
  style?: CSSProperties;
  tabIndex?: number;
  target?: string;
  to?: string;
}

export type LinkComponent = React.ElementType<LinkComponentProps>;
