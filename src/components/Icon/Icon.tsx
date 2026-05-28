import type {LucideProps} from 'lucide-react';
import type {ComponentType, CSSProperties, Ref, SVGProps} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

export type IconColor =
  | 'accent'
  | 'blue'
  | 'cyan'
  | 'disabled'
  | 'error'
  | 'gray'
  | 'green'
  | 'inherit'
  | 'orange'
  | 'pink'
  | 'primary'
  | 'purple'
  | 'red'
  | 'secondary'
  | 'success'
  | 'teal'
  | 'tertiary'
  | 'warning'
  | 'yellow';

export type IconSize = 'sm' | 'md' | 'lg';
export type IconComponent = ComponentType<
  LucideProps | SVGProps<SVGSVGElement>
>;

export interface IconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'color' | 'height' | 'ref' | 'width'
> {
  /**
   * Additional CSS class names applied to the SVG element.
   */
  className?: string;
  /**
   * Color token used for the icon.
   * @default 'inherit'
   */
  color?: IconColor;
  /**
   * Test ID applied to the SVG element.
   */
  'data-testid'?: string;
  /**
   * Lucide icon component to render.
   */
  icon: IconComponent;
  /**
   * Ref forwarded to the SVG element.
   */
  ref?: Ref<SVGSVGElement>;
  /**
   * Icon size.
   * @default 'md'
   */
  size?: IconSize;
  /**
   * Inline styles applied to the SVG element.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'inline-block',
    flexShrink: 0,
    color: 'var(--icon-color)',
    w: 'var(--icon-size)',
    h: 'var(--icon-size)',
  }),
  size: {
    sm: css({'--icon-size': 'var(--silver-sizes-icon-sm)'}),
    md: css({'--icon-size': 'var(--silver-sizes-icon-md)'}),
    lg: css({'--icon-size': 'var(--silver-sizes-icon-lg)'}),
  } satisfies Record<IconSize, string>,
  color: {
    primary: css({'--icon-color': 'var(--silver-colors-icon-primary)'}),
    secondary: css({'--icon-color': 'var(--silver-colors-icon-secondary)'}),
    tertiary: css({'--icon-color': 'var(--silver-colors-icon-tertiary)'}),
    disabled: css({'--icon-color': 'var(--silver-colors-icon-disabled)'}),
    accent: css({'--icon-color': 'var(--silver-colors-icon-accent)'}),
    success: css({'--icon-color': 'var(--silver-colors-icon-success)'}),
    error: css({'--icon-color': 'var(--silver-colors-icon-error)'}),
    warning: css({'--icon-color': 'var(--silver-colors-icon-warning)'}),
    inherit: css({'--icon-color': 'currentColor'}),
    blue: css({'--icon-color': 'var(--silver-colors-icon-blue)'}),
    red: css({'--icon-color': 'var(--silver-colors-icon-red)'}),
    green: css({'--icon-color': 'var(--silver-colors-icon-green)'}),
    gray: css({'--icon-color': 'var(--silver-colors-icon-gray)'}),
    cyan: css({'--icon-color': 'var(--silver-colors-icon-cyan)'}),
    teal: css({'--icon-color': 'var(--silver-colors-icon-teal)'}),
    yellow: css({'--icon-color': 'var(--silver-colors-icon-yellow)'}),
    orange: css({'--icon-color': 'var(--silver-colors-icon-orange)'}),
    pink: css({'--icon-color': 'var(--silver-colors-icon-pink)'}),
    purple: css({'--icon-color': 'var(--silver-colors-icon-purple)'}),
  } satisfies Record<IconColor, string>,
} as const;

/**
 * Renders a lucide icon with Silver UI size and color tokens.
 */
export function Icon({
  className,
  color = 'inherit',
  'data-testid': dataTestId,
  icon: IconElement,
  ref,
  size = 'md',
  strokeWidth = 2,
  style,
  ...props
}: IconProps): React.JSX.Element {
  return (
    <IconElement
      aria-hidden={props['aria-label'] == null ? true : undefined}
      className={cx(
        styles.root,
        styles.size[size],
        styles.color[color],
        className,
      )}
      data-testid={dataTestId}
      focusable="false"
      height="1em"
      ref={ref}
      role={props['aria-label'] == null ? undefined : 'img'}
      strokeWidth={strokeWidth}
      style={style}
      width="1em"
      {...props}
    />
  );
}

Icon.displayName = 'Icon';
