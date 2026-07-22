'use client';

import {
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {tabsRecipe} from 'components/Tabs/Tabs.recipe';
import {
  TabsContext,
  type TabsLayout,
  type TabsSize,
} from 'components/Tabs/TabsContext';
import useKeyboardHint from 'hooks/useKeyboardHint';
import useListFocus from 'hooks/useListFocus';
import {useAmbientSize} from 'internal/SizeContext';
import {mergeRefs} from 'internal/mergeRefs';
import {cx} from 'utils/cx';

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

/**
 * Controlled tab wrapper.
 *
 * Uses `tablist` / `tabpanel` semantics, so reach for it when selecting an
 * option shows or hides associated content panels. To pick a value without
 * swapping panels — a styled radio group for filters, settings, or view modes —
 * use {@link SegmentedControl} instead.
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
  size: sizeProp,
  style,
  value,
}: TabsProps): React.JSX.Element {
  const ambientSize = useAmbientSize();
  const size = sizeProp ?? ambientSize ?? 'md';
  const contextValue = useMemo(
    () => ({layout, onChange, size, value}),
    [layout, onChange, size, value],
  );
  const classes = tabsRecipe({hasDivider, layout});
  const tabListRef = useRef<HTMLDivElement>(null);

  const getTabs = useCallback(
    () =>
      Array.from(
        tabListRef.current?.querySelectorAll<HTMLElement>(
          '[role="tab"]:not([data-tab-disabled="true"])',
        ) ?? [],
      ),
    [],
  );
  const {getActiveIndex, handleKeyDown: handleListKeyDown} = useListFocus({
    getItems: getTabs,
    // Selection follows focus, per the WAI-ARIA tabs pattern.
    onFocusItem: tab => {
      const nextValue = tab.dataset.tabValue;
      if (nextValue != null) {
        onChange(nextValue);
      }
    },
    orientation: 'horizontal',
  });

  const hint = useKeyboardHint({orientation: 'horizontal'});

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // Dismiss before the guards below: an arrow press means the user found the
    // affordance, even when the key came from somewhere we do not navigate.
    hint.onKeyDown(event);

    const activeTab = (event.target as HTMLElement).closest<HTMLElement>(
      '[role="tab"]',
    );
    // Keys pressed inside a disabled tab, or outside the tablist entirely, are
    // left alone.
    if (
      activeTab == null ||
      !event.currentTarget.contains(activeTab) ||
      getActiveIndex() === -1
    ) {
      return;
    }

    handleListKeyDown(event);
  };

  return (
    <TabsContext value={contextValue}>
      <div
        aria-label={label}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        onBlur={hint.onBlur}
        onFocus={hint.onFocus}
        onKeyDown={handleKeyDown}
        ref={mergeRefs(ref as Ref<HTMLDivElement>, tabListRef)}
        role="tablist"
        style={style}
        tabIndex={-1}>
        {children}
        {hint.hintElement}
      </div>
    </TabsContext>
  );
}

Tabs.displayName = 'Tabs';
