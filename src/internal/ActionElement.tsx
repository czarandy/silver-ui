/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {
  AriaAttributes,
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import type {LinkComponent} from 'components/Link/types';
import {useLinkComponent} from 'components/Link/useLinkComponent';

export interface ActionElementProps {
  'aria-busy'?: AriaAttributes['aria-busy'];
  'aria-controls'?: AriaAttributes['aria-controls'];
  'aria-current'?: AriaAttributes['aria-current'];
  'aria-describedby'?: AriaAttributes['aria-describedby'];
  'aria-description'?: AriaAttributes['aria-description'];
  'aria-details'?: AriaAttributes['aria-details'];
  'aria-disabled'?: AriaAttributes['aria-disabled'];
  'aria-expanded'?: AriaAttributes['aria-expanded'];
  'aria-haspopup'?: AriaAttributes['aria-haspopup'];
  'aria-hidden'?: AriaAttributes['aria-hidden'];
  'aria-keyshortcuts'?: AriaAttributes['aria-keyshortcuts'];
  'aria-label'?: AriaAttributes['aria-label'];
  'aria-labelledby'?: AriaAttributes['aria-labelledby'];
  'aria-owns'?: AriaAttributes['aria-owns'];
  'aria-pressed'?: AriaAttributes['aria-pressed'];
  'aria-roledescription'?: AriaAttributes['aria-roledescription'];
  as?: LinkComponent;
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  disabled?: boolean;
  form?: string;
  href?: string;
  name?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  rel?: string;
  renderAsLink?: boolean;
  role?: string;
  style?: CSSProperties;
  tabIndex?: number;
  target?: string;
  type?: 'button' | 'submit' | 'reset';
  value?: string;
}

export function ActionElement({
  as,
  children,
  disabled,
  form,
  href,
  name,
  onClick,
  onKeyDown,
  ref,
  rel,
  renderAsLink = href != null,
  role: roleFromProps,
  style,
  tabIndex,
  target,
  type = 'button',
  value,
  ...props
}: ActionElementProps): React.JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const role =
    roleFromProps ?? (renderAsLink && href == null ? 'link' : undefined);

  if (renderAsLink) {
    return (
      <LinkComponent
        {...props}
        href={href}
        onClick={onClick}
        onKeyDown={onKeyDown}
        ref={ref as Ref<HTMLAnchorElement>}
        rel={rel}
        role={role}
        style={style}
        tabIndex={tabIndex}
        target={target}
        to={href == null || LinkComponent === 'a' ? undefined : href}>
        {children}
      </LinkComponent>
    );
  }

  return (
    <button
      {...props}
      disabled={disabled}
      form={form}
      name={name}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={ref as Ref<HTMLButtonElement>}
      role={role}
      style={style}
      tabIndex={tabIndex}
      type={type}
      value={value}>
      {children}
    </button>
  );
}

ActionElement.displayName = 'ActionElement';
