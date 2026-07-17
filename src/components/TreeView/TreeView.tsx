/* eslint-disable jsx-a11y-x/no-noninteractive-element-to-interactive-role -- tree semantics are applied to list markup */
'use client';

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {treeViewRecipe} from 'components/TreeView/TreeView.recipe';
import {TreeViewItem} from 'components/TreeView/TreeViewItem';
import type {
  TreeViewDensity,
  TreeViewItemData,
} from 'components/TreeView/types';
import useTypeahead from 'hooks/useTypeahead';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

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
   * Recursive tree item data. Pass a stable reference, or memoize large inline
   * arrays, to avoid repeating recursive expansion scans on every render.
   */
  items: TreeViewItemData[];
  /**
   * Called when an enabled item is activated. Providing this callback enables
   * controlled single selection.
   */
  onSelectionChange?: (selectedKey: string) => void;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * ID of the selected item when controlled selection is enabled. Omit or pass
   * `null` when no item is selected.
   */
  selectedKey?: string | null;
  /**
   * Inline styles applied to the root.
   */
  style?: CSSProperties;
}

const styles = treeViewRecipe();

interface VisibleTreeItem {
  hasChildren: boolean;
  id: string;
  isDisabled: boolean;
  isExpanded: boolean;
  label: string;
  parentId: string | null;
}

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

function getTextLabel(item: TreeViewItemData): string {
  if (item.ariaLabel != null) {
    return item.ariaLabel;
  }
  if (typeof item.label === 'string' || typeof item.label === 'number') {
    return String(item.label);
  }
  return item.id;
}

function getItemExpansion(
  id: string,
  expandedKeyOverrides: ReadonlyMap<string, boolean>,
  expandedKeysFromProps: ReadonlySet<string>,
): boolean {
  return expandedKeyOverrides.has(id)
    ? (expandedKeyOverrides.get(id) ?? false)
    : expandedKeysFromProps.has(id);
}

function collectVisibleItems(
  items: TreeViewItemData[],
  expandedKeyOverrides: ReadonlyMap<string, boolean>,
  expandedKeysFromProps: ReadonlySet<string>,
  parentId: string | null = null,
): VisibleTreeItem[] {
  const visibleItems: VisibleTreeItem[] = [];
  for (const item of items) {
    const hasChildren = item.children != null && item.children.length > 0;
    const isExpanded = getItemExpansion(
      item.id,
      expandedKeyOverrides,
      expandedKeysFromProps,
    );
    visibleItems.push({
      hasChildren,
      id: item.id,
      isDisabled: item.isDisabled === true,
      isExpanded,
      label: getTextLabel(item),
      parentId,
    });

    if (hasChildren && isExpanded) {
      visibleItems.push(
        ...collectVisibleItems(
          item.children ?? [],
          expandedKeyOverrides,
          expandedKeysFromProps,
          item.id,
        ),
      );
    }
  }
  return visibleItems;
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
  onSelectionChange,
  ref,
  selectedKey,
  style,
}: TreeViewProps): React.JSX.Element {
  const headerId = useId();
  const itemElementsRef = useRef(new Map<string, HTMLLIElement>());
  const inputModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');
  const expandedKeysFromProps = useMemo(
    () => new Set(collectExpandedKeys(items)),
    [items],
  );
  const [expandedKeyOverrides, setExpandedKeyOverrides] = useState<
    Map<string, boolean>
  >(() => new Map());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [focusVisibleId, setFocusVisibleId] = useState<string | null>(null);
  const isSelectionEnabled = onSelectionChange != null;

  const visibleItems = useMemo(
    () =>
      collectVisibleItems(items, expandedKeyOverrides, expandedKeysFromProps),
    [expandedKeyOverrides, expandedKeysFromProps, items],
  );
  const focusableItems = useMemo(
    () => visibleItems.filter(item => !item.isDisabled),
    [visibleItems],
  );
  const activeFocusedId =
    focusedId != null && focusableItems.some(item => item.id === focusedId)
      ? focusedId
      : isSelectionEnabled &&
          selectedKey != null &&
          focusableItems.some(item => item.id === selectedKey)
        ? selectedKey
        : (focusableItems[0]?.id ?? null);

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedKeyOverrides(previous => {
        const next = new Map(previous);
        const defaultIsExpanded = expandedKeysFromProps.has(id);
        const isExpanded = previous.has(id)
          ? (previous.get(id) ?? false)
          : defaultIsExpanded;
        const nextIsExpanded = !isExpanded;
        if (nextIsExpanded === defaultIsExpanded) {
          next.delete(id);
        } else {
          next.set(id, nextIsExpanded);
        }
        return next;
      });
    },
    [expandedKeysFromProps],
  );

  const focusItem = useCallback((id: string) => {
    setFocusedId(id);
    itemElementsRef.current.get(id)?.focus();
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onSelectionChange?.(id);
    },
    [onSelectionChange],
  );

  const handleItemFocus = useCallback((id: string, isFocusVisible = false) => {
    setFocusedId(id);
    setFocusVisibleId(
      isFocusVisible || inputModalityRef.current === 'keyboard' ? id : null,
    );
  }, []);

  const handleFocusCapture = useCallback(() => {
    setHasFocusWithin(true);
  }, []);

  const handleBlurCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget;
    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }

    setHasFocusWithin(false);
    setFocusVisibleId(null);
  }, []);

  const handleKeyDownCapture = useCallback(() => {
    inputModalityRef.current = 'keyboard';
  }, []);

  const handlePointerDownCapture = useCallback(() => {
    inputModalityRef.current = 'pointer';
  }, []);

  // Set on every item keydown so typeahead resumes from the item the user is
  // actually on, rather than from whatever React state has caught up to.
  const typeaheadItemIdRef = useRef<string | null>(null);
  const handleTypeahead = useTypeahead<VisibleTreeItem>({
    getActiveIndex: () =>
      focusableItems.findIndex(item => item.id === typeaheadItemIdRef.current),
    getItems: () => focusableItems,
    getLabel: item => item.label,
    onMatch: item => focusItem(item.id),
  });

  const handleItemKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>, id: string) => {
      const currentIndex = focusableItems.findIndex(item => item.id === id);
      if (currentIndex === -1) {
        return;
      }

      const currentItem = focusableItems[currentIndex];
      const direction = event.currentTarget
        .closest<HTMLElement>('[dir]')
        ?.getAttribute('dir');
      const isRtl = direction?.toLowerCase() === 'rtl';
      const expandKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
      const collapseKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex + 1;
        if (nextIndex < focusableItems.length) {
          focusItem(focusableItems[nextIndex].id);
        }
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const previousIndex = currentIndex - 1;
        if (previousIndex >= 0) {
          focusItem(focusableItems[previousIndex].id);
        }
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        if (focusableItems.length > 0) {
          focusItem(focusableItems[0].id);
        }
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        if (focusableItems.length > 0) {
          focusItem(focusableItems[focusableItems.length - 1].id);
        }
        return;
      }

      if (event.key === expandKey) {
        if (!currentItem.hasChildren) {
          return;
        }
        event.preventDefault();
        if (!currentItem.isExpanded) {
          handleToggle(currentItem.id);
          return;
        }

        const firstChild = focusableItems.find(
          item => item.parentId === currentItem.id,
        );
        if (firstChild != null) {
          focusItem(firstChild.id);
        }
        return;
      }

      if (event.key === collapseKey) {
        event.preventDefault();
        if (currentItem.hasChildren && currentItem.isExpanded) {
          handleToggle(currentItem.id);
          return;
        }
        if (currentItem.parentId != null) {
          focusItem(currentItem.parentId);
        }
        return;
      }

      typeaheadItemIdRef.current = id;
      handleTypeahead(event);
    },
    [focusItem, focusableItems, handleToggle, handleTypeahead],
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
            ariaLabel={item.ariaLabel}
            density={density}
            description={item.description}
            endContent={item.endContent}
            hasChildren={hasChildren}
            href={item.href}
            id={item.id}
            isDisabled={item.isDisabled}
            isExpanded={isExpanded}
            isFocused={hasFocusWithin && focusVisibleId === item.id}
            isSelected={
              isSelectionEnabled
                ? item.isDisabled !== true && selectedKey === item.id
                : item.isSelected
            }
            isSelectionEnabled={isSelectionEnabled}
            key={item.id}
            label={item.label}
            nestedLevel={nestedLevel}
            onClick={item.onClick}
            onFocusItem={handleItemFocus}
            onItemKeyDown={handleItemKeyDown}
            onSelect={handleSelect}
            onToggle={handleToggle}
            ref={(element: HTMLLIElement | null) => {
              if (element == null) {
                itemElementsRef.current.delete(item.id);
              } else {
                itemElementsRef.current.set(item.id, element);
              }
            }}
            renderedChildren={renderedChildren}
            startContent={item.startContent}
            tabIndex={activeFocusedId === item.id ? 0 : -1}
            target={item.target}
          />
        );
      }),
    [
      activeFocusedId,
      density,
      expandedKeyOverrides,
      expandedKeysFromProps,
      focusVisibleId,
      hasFocusWithin,
      handleItemFocus,
      handleItemKeyDown,
      handleSelect,
      handleToggle,
      isSelectionEnabled,
      selectedKey,
    ],
  );

  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      onBlurCapture={handleBlurCapture}
      onFocusCapture={handleFocusCapture}
      onKeyDownCapture={handleKeyDownCapture}
      onPointerDownCapture={handlePointerDownCapture}
      ref={ref}
      style={style}>
      {!isReactNode(header) ? null : (
        <div className={styles.header} id={headerId}>
          {header}
        </div>
      )}
      <ul
        aria-labelledby={!isReactNode(header) ? undefined : headerId}
        className={styles.list}
        role="tree">
        {renderItems(items, 0, [])}
      </ul>
    </div>
  );
}

TreeView.displayName = 'TreeView';
