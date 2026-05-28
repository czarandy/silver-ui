import {useMemo, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {TabsContext, type TabsLayout, type TabsSize} from './TabsContext';

export interface TabsProps {
  /**
   * Tab and TabMenu children.
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
   * Whether to show a bottom divider.
   * @default false
   */
  hasDivider?: boolean;
  /**
   * Accessible label for the tabs.
   * @default 'Tabs'
   */
  label?: string;
  /**
   * Tab layout mode.
   * @default 'hug'
   */
  layout?: TabsLayout;
  /**
   * Called when a tab is selected.
   */
  onChange: (value: string) => void;
  /**
   * Ref forwarded to the nav element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Tab size.
   * @default 'md'
   */
  size?: TabsSize;
  /**
   * Inline styles applied to the nav element.
   */
  style?: CSSProperties;
  /**
   * Current selected tab value.
   */
  value: string;
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.5',
    maxW: 'full',
    minW: 0,
  }),
  fill: css({
    w: 'full',
  }),
  divider: css({
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
} as const;

/**
 * Controlled tab navigation wrapper.
 */
export function Tabs({
  children,
  className,
  'data-testid': dataTestId,
  hasDivider = false,
  label = 'Tabs',
  layout = 'hug',
  onChange,
  ref,
  size = 'md',
  style,
  value,
}: TabsProps): React.JSX.Element {
  const contextValue = useMemo(
    () => ({layout, onChange, size, value}),
    [layout, onChange, size, value],
  );

  return (
    <TabsContext value={contextValue}>
      <nav
        aria-label={label}
        className={cx(
          styles.root,
          layout === 'fill' ? styles.fill : undefined,
          hasDivider ? styles.divider : undefined,
          className,
        )}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {children}
      </nav>
    </TabsContext>
  );
}

Tabs.displayName = 'Tabs';
