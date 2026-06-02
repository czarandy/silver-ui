import type {LucideProps} from 'lucide-react';
import type {ComponentType, CSSProperties, Ref, SVGProps} from 'react';
import {cx} from '../../internal/cx';
import {iconRecipe} from './Icon.recipe';

export type IconColor =
  | 'accent'
  | 'blue'
  | 'cyan'
  | 'disabled'
  | 'error'
  | 'gray'
  | 'green'
  | 'info'
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
      {...props}
      aria-hidden={props['aria-label'] == null ? true : undefined}
      className={cx(iconRecipe({size, color}), className)}
      data-testid={dataTestId}
      focusable="false"
      height={undefined}
      ref={ref}
      role={props['aria-label'] == null ? undefined : 'img'}
      strokeWidth={strokeWidth}
      style={style}
      width={undefined}
    />
  );
}

Icon.displayName = 'Icon';
