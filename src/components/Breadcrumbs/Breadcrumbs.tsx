import {useMemo, type CSSProperties, type ReactNode, type Ref} from 'react';
import {cx} from '../../internal/cx';
import {breadcrumbsRecipe} from './Breadcrumbs.recipe';
import {
  BreadcrumbsContext,
  type BreadcrumbsVariant,
} from './BreadcrumbsContext';

export interface BreadcrumbsProps {
  /**
   * BreadcrumbItem children.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the nav element.
   */
  className?: string;
  /**
   * Test ID applied to the nav element.
   */
  'data-testid'?: string;
  /**
   * Accessible label for the navigation landmark.
   * @default 'Breadcrumb'
   */
  label?: string;
  /**
   * Ref forwarded to the nav element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Separator rendered between items.
   * @default '/'
   */
  separator?: ReactNode;
  /**
   * Inline styles applied to the nav element.
   */
  style?: CSSProperties;
  /**
   * Visual text variant.
   * @default 'default'
   */
  variant?: BreadcrumbsVariant;
}

/**
 * Navigation landmark that displays a trail of breadcrumb links.
 */
export function Breadcrumbs({
  children,
  className,
  'data-testid': dataTestId,
  label = 'Breadcrumb',
  ref,
  separator = '/',
  style,
  variant = 'default',
}: BreadcrumbsProps): React.JSX.Element {
  const contextValue = useMemo(
    () => ({separator, variant}),
    [separator, variant],
  );
  const classes = breadcrumbsRecipe();

  return (
    <BreadcrumbsContext value={contextValue}>
      <nav
        aria-label={label}
        className={cx(classes.nav, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <ol className={classes.list}>{children}</ol>
      </nav>
    </BreadcrumbsContext>
  );
}

Breadcrumbs.displayName = 'Breadcrumbs';
