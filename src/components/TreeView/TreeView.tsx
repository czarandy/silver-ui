/* eslint-disable jsx-a11y-x/no-noninteractive-element-to-interactive-role -- tree semantics are applied to list markup */

import {
  useCallback,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {TreeViewItem} from './TreeViewItem';
import type {TreeViewDensity, TreeViewItemData} from './types';

export interface TreeViewProps {
  /**
   * Additional CSS class names applied to the root.
   */
  className?: string;
  /**
   * Test ID applied to the root.
   */
  'data-testid'?: string;
  /**
   * Spacing density for tree items.
   * @default 'balanced'
   */
  density?: TreeViewDensity;
  /**
   * Header content rendered above the tree and associated with `aria-labelledby`.
   */
  header?: ReactNode;
  /**
   * Recursive tree item data.
   */
  items: TreeViewItemData[];
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root.
   */
  style?: CSSProperties;
}

const styles = {
  header: css({
    mb: '2',
  }),
  list: css({
    m: 0,
    p: 0,
    listStyleType: 'none',
  }),
  root: css({
    position: 'relative',
  }),
} as const;

function collectExpandedKeys(items: TreeViewItemData[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (item.isExpanded && item.children != null && item.children.length > 0) {
      keys.push(item.id);
    }
    if (item.children != null) {
      keys.push(...collectExpandedKeys(item.children));
    }
  }
  return keys;
}

/**
 * Renders a hierarchical tree of expandable and selectable items.
 */
export function TreeView({
  className,
  'data-testid': dataTestId,
  density = 'balanced',
  header,
  items,
  ref,
  style,
}: TreeViewProps): React.JSX.Element {
  const headerId = useId();
  const expandedKeysFromProps = useMemo(
    () => new Set(collectExpandedKeys(items)),
    [items],
  );
  const [expandedKeyOverrides, setExpandedKeyOverrides] = useState<
    Map<string, boolean>
  >(() => new Map());

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedKeyOverrides(previous => {
        const next = new Map(previous);
        const isExpanded = previous.has(id)
          ? (previous.get(id) ?? false)
          : expandedKeysFromProps.has(id);
        next.set(id, !isExpanded);
        return next;
      });
    },
    [expandedKeysFromProps],
  );

  const renderItems = useCallback(
    (
      treeItems: TreeViewItemData[],
      nestedLevel: number,
      ancestorsIsLast: ReadonlyArray<boolean>,
    ): ReactNode =>
      treeItems.map((item, index) => {
        const isLast = index === treeItems.length - 1;
        const hasChildren = item.children != null && item.children.length > 0;
        const isExpanded = expandedKeyOverrides.has(item.id)
          ? (expandedKeyOverrides.get(item.id) ?? false)
          : expandedKeysFromProps.has(item.id);
        const childAncestorsIsLast = hasChildren
          ? [...ancestorsIsLast, isLast]
          : ancestorsIsLast;
        const renderedChildren =
          isExpanded && hasChildren
            ? renderItems(
                item.children ?? [],
                nestedLevel + 1,
                childAncestorsIsLast,
              )
            : undefined;

        return (
          <TreeViewItem
            ancestorsIsLast={ancestorsIsLast}
            density={density}
            description={item.description}
            endContent={item.endContent}
            hasChildren={hasChildren}
            href={item.href}
            id={item.id}
            isDisabled={item.isDisabled}
            isExpanded={isExpanded}
            isLast={isLast}
            isSelected={item.isSelected}
            key={item.id}
            label={item.label}
            nestedLevel={nestedLevel}
            onClick={item.onClick}
            onToggle={handleToggle}
            renderedChildren={renderedChildren}
            startContent={item.startContent}
            target={item.target}
          />
        );
      }),
    [density, expandedKeyOverrides, expandedKeysFromProps, handleToggle],
  );

  return (
    <div
      className={cx('silver-tree-view', styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {header == null ? null : (
        <div className={styles.header} id={headerId}>
          {header}
        </div>
      )}
      <ul
        aria-labelledby={header == null ? undefined : headerId}
        className={styles.list}
        role="tree">
        {renderItems(items, 0, [])}
      </ul>
    </div>
  );
}

TreeView.displayName = 'TreeView';
