import type {
  AriaAttributes,
  CSSProperties,
  KeyboardEventHandler,
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
  onKeyDown?: KeyboardEventHandler<HTMLAnchorElement>;
  ref?: Ref<HTMLAnchorElement>;
  rel?: string;
  style?: CSSProperties;
  tabIndex?: number;
  target?: string;
  to?: string;
}

export type LinkComponent = React.ElementType<LinkComponentProps>;
