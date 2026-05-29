import {useMemo, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
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

const styles = {
  nav: css({
    display: 'block',
  }),
  list: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1',
    m: 0,
    p: 0,
    listStyle: 'none',
  }),
} as const;

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

  return (
    <BreadcrumbsContext value={contextValue}>
      <nav
        aria-label={label}
        className={cx(styles.nav, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <ol className={styles.list}>{children}</ol>
      </nav>
    </BreadcrumbsContext>
  );
}

Breadcrumbs.displayName = 'Breadcrumbs';
