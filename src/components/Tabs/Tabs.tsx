import {
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {TabsContext, type TabsLayout, type TabsSize} from './TabsContext';

export interface TabsProps {
  /**
   * Tab and TabMenu children.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the tablist element.
   */
  className?: string;
  /**
   * Test ID applied to the tablist element.
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
   * Ref forwarded to the tablist element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Tab size.
   * @default 'md'
   */
  size?: TabsSize;
  /**
   * Inline styles applied to the tablist element.
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
    maxW: 'full',
    minW: 0,
  }),
  fill: css({
    w: 'full',
  }),
  divider: css({
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
} as const;

/**
 * Controlled tab wrapper.
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

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    const activeTab = (event.target as HTMLElement).closest<HTMLElement>(
      '[role="tab"]',
    );
    if (activeTab == null || !event.currentTarget.contains(activeTab)) {
      return;
    }

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        '[role="tab"]:not([data-tab-disabled="true"])',
      ),
    );
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : event.key === 'ArrowRight'
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    nextTab.focus();

    const nextValue = nextTab.dataset.tabValue;
    if (nextValue != null) {
      onChange(nextValue);
    }
  };

  return (
    <TabsContext value={contextValue}>
      <div
        aria-label={label}
        className={cx(
          styles.root,
          layout === 'fill' ? styles.fill : undefined,
          hasDivider ? styles.divider : undefined,
          className,
        )}
        data-testid={dataTestId}
        onKeyDown={handleKeyDown}
        ref={ref as Ref<HTMLDivElement>}
        role="tablist"
        style={style}
        tabIndex={-1}>
        {children}
      </div>
    </TabsContext>
  );
}

Tabs.displayName = 'Tabs';
