import type {
  AriaAttributes,
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';

export interface LinkComponentProps {
  'aria-controls'?: AriaAttributes['aria-controls'];
  'aria-current'?: AriaAttributes['aria-current'];
  'aria-describedby'?: AriaAttributes['aria-describedby'];
  'aria-details'?: AriaAttributes['aria-details'];
  'aria-disabled'?: AriaAttributes['aria-disabled'];
  'aria-expanded'?: AriaAttributes['aria-expanded'];
  'aria-haspopup'?: AriaAttributes['aria-haspopup'];
  'aria-hidden'?: AriaAttributes['aria-hidden'];
  'aria-keyshortcuts'?: AriaAttributes['aria-keyshortcuts'];
  'aria-label'?: AriaAttributes['aria-label'];
  'aria-labelledby'?: AriaAttributes['aria-labelledby'];
  'aria-owns'?: AriaAttributes['aria-owns'];
  'aria-roledescription'?: AriaAttributes['aria-roledescription'];
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
