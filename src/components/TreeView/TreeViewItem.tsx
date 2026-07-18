/* eslint-disable jsx-a11y-x/no-noninteractive-element-to-interactive-role, jsx-a11y-x/no-static-element-interactions, silver-ui/require-component-props -- internal recursive tree item */
'use client';

import {ChevronRight} from 'lucide-react';
import {useCallback, useId, useRef, type ReactNode, type Ref} from 'react';
import {Icon} from 'components/Icon';
import {TreeViewBranches} from 'components/TreeView/TreeViewBranches';
import {treeViewItemRecipe} from 'components/TreeView/TreeViewItem.recipe';
import type {TreeViewDensity} from 'components/TreeView/types';
import {ActionElement} from 'internal/ActionElement';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

interface TreeViewItemProps {
  /**
   * Whether each ancestor at the corresponding level is the last sibling.
   */
  ancestorsIsLast: ReadonlyArray<boolean>;
  /**
   * Plain-text label used for generated control labels.
   */
  ariaLabel?: string;
  /**
   * Spacing density for the item.
   */
  density: TreeViewDensity;
  /**
   * Secondary description text shown below the label.
   */
  description?: string;
  /**
   * Content rendered at the end of the item row.
   */
  endContent?: React.ReactNode;
  /**
   * Whether this item has child items.
   */
  hasChildren: boolean;
  /**
   * Link destination. When provided, the item renders as a link.
   */
  href?: string;
  /**
   * Unique identifier for the item.
   */
  id: string;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the item's children are visible.
   */
  isExpanded: boolean;
  /**
   * Whether this item currently owns roving focus.
   */
  isFocused: boolean;
  /**
   * Whether the item is selected.
   */
  isSelected: boolean;
  /**
   * Whether root-controlled selection is enabled.
   */
  isSelectionEnabled: boolean;
  /**
   * Primary label content.
   */
  label: React.ReactNode;
  /**
   * Zero-based nesting depth of this item.
   */
  nestedLevel: number;
  /**
   * Click handler for the item action.
   */
  onClick?: (event: React.MouseEvent) => void;
  /**
   * Called when the item receives focus.
   */
  onFocusItem: (id: string, isFocusVisible?: boolean) => void;
  /**
   * Called for tree keyboard navigation.
   */
  onItemKeyDown: (
    event: React.KeyboardEvent<HTMLLIElement>,
    id: string,
  ) => void;
  /**
   * Called when the item requests selection.
   */
  onSelect: (id: string) => void;
  /**
   * Called when the expand/collapse toggle is activated.
   */
  onToggle?: (id: string) => void;
  /**
   * Ref forwarded to the treeitem element.
   */
  ref?: Ref<HTMLLIElement>;
  /**
   * Pre-rendered child items.
   */
  renderedChildren?: ReactNode;
  /**
   * Content rendered before the label.
   */
  startContent?: React.ReactNode;
  /**
   * Roving tab index for this treeitem.
   */
  tabIndex: 0 | -1;
  /**
   * Link target attribute (e.g. '_blank').
   */
  target?: string;
}

/**
 * Renders a single tree item with toggle, branch lines, and optional link or button action.
 */
export function TreeViewItem({
  ariaLabel,
  ancestorsIsLast,
  density,
  description,
  endContent,
  hasChildren,
  href,
  id,
  isDisabled = false,
  isExpanded,
  isFocused,
  isSelected,
  isSelectionEnabled,
  label,
  nestedLevel,
  onClick,
  onFocusItem,
  onItemKeyDown,
  onSelect,
  onToggle,
  ref,
  renderedChildren,
  startContent,
  tabIndex,
  target,
}: TreeViewItemProps): React.JSX.Element {
  const labelId = useId();
  const descriptionId = useId();
  const actionRef = useRef<HTMLElement>(null);
  const hasPrimaryAction =
    isSelectionEnabled || onClick != null || href != null;
  const isInteractive = hasPrimaryAction;
  const togglesOnRow = hasChildren && !hasPrimaryAction && onToggle != null;
  const styles = treeViewItemRecipe({
    density,
    isInteractive: isInteractive || togglesOnRow,
    isDisabled,
    isSelected,
    isFocused,
    isExpanded,
  });
  const textLabel =
    ariaLabel ??
    (typeof label === 'string' || typeof label === 'number'
      ? String(label)
      : id);

  const handleToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isDisabled) {
        return;
      }
      onToggle?.(id);
    },
    [id, isDisabled, onToggle],
  );

  const handleRowActivation = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (isSelectionEnabled) {
      onSelect(id);
      return;
    }
    if (togglesOnRow) {
      onToggle(id);
    }
  }, [id, isDisabled, isSelectionEnabled, onSelect, onToggle, togglesOnRow]);

  const handleRowClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (actionRef.current?.contains(event.target as Node) === true) {
        return;
      }
      handleRowActivation();
    },
    [handleRowActivation],
  );

  const handleRowKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      event.stopPropagation();
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (isDisabled) {
          return;
        }
        if (actionRef.current != null) {
          actionRef.current.click();
          return;
        }
        handleRowActivation();
        return;
      }
      onItemKeyDown(event, id);
    },
    [handleRowActivation, id, isDisabled, onItemKeyDown],
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLLIElement>) => {
      if (event.currentTarget !== event.target) {
        return;
      }
      onFocusItem(id, event.currentTarget.matches(':focus-visible'));
    },
    [id, onFocusItem],
  );

  const handlePointerDown = useCallback(() => {
    onFocusItem(id, false);
  }, [id, onFocusItem]);

  const handleActionClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
      if (isSelectionEnabled) {
        onSelect(id);
      }
    },
    [id, isDisabled, isSelectionEnabled, onClick, onSelect],
  );

  const labelAndDescription = (
    <>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      {description == null ? null : (
        <span className={styles.description} id={descriptionId}>
          {description}
        </span>
      )}
    </>
  );

  const toggleIcon = (
    <span className={styles.toggleIcon}>
      <Icon icon={ChevronRight} size="sm" />
    </span>
  );

  const toggle = hasChildren ? (
    hasPrimaryAction ? (
      <button
        aria-label={`Toggle ${textLabel} children`}
        className={styles.toggleButton}
        disabled={isDisabled}
        onClick={handleToggle}
        tabIndex={-1}
        type="button">
        {toggleIcon}
      </button>
    ) : (
      <span className={styles.toggleSpacer}>{toggleIcon}</span>
    )
  ) : null;

  const content = (
    <>
      {toggle}
      {!isReactNode(startContent) ? null : (
        <span className={styles.startContent}>{startContent}</span>
      )}
      {href != null || onClick != null ? (
        <ActionElement
          aria-describedby={description == null ? undefined : descriptionId}
          aria-disabled={href != null && isDisabled ? true : undefined}
          aria-labelledby={labelId}
          className={styles.invisibleAction}
          href={href}
          isDisabled={href == null ? isDisabled : undefined}
          isLink={href != null}
          onClick={handleActionClick}
          ref={actionRef}
          tabIndex={-1}
          target={href != null ? target : undefined}>
          {labelAndDescription}
        </ActionElement>
      ) : (
        <span className={styles.content}>{labelAndDescription}</span>
      )}
      {!isReactNode(endContent) ? null : (
        <span className={styles.endContent}>{endContent}</span>
      )}
    </>
  );

  const marginLeft = hasChildren
    ? `calc(${nestedLevel} * 16px)`
    : `calc(${nestedLevel} * 16px + 24px)`;

  return (
    <li
      aria-describedby={description == null ? undefined : descriptionId}
      aria-disabled={isDisabled || undefined}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-labelledby={labelId}
      aria-selected={isSelectionEnabled && !isDisabled ? isSelected : undefined}
      className={styles.wrapper}
      onFocus={handleFocus}
      onKeyDown={handleRowKeyDown}
      ref={ref}
      role="treeitem"
      tabIndex={isDisabled ? -1 : tabIndex}>
      <div className={styles.treeBranches}>
        <TreeViewBranches
          ancestorsIsLast={ancestorsIsLast}
          nestedLevel={nestedLevel}
        />
      </div>
      <div className={styles.rowWrapper}>
        {/* eslint-disable-next-line jsx-a11y-x/click-events-have-key-events -- keyboard interaction is handled by the parent treeitem for roving focus. */}
        <div
          className={cx('silver-tree-view-item', styles.contentWrapper)}
          onClick={handleRowClick}
          onPointerDown={handlePointerDown}
          style={{marginLeft}}>
          {content}
        </div>
      </div>
      {isExpanded && isReactNode(renderedChildren) ? (
        <ul className={styles.childGroup} role="group">
          {renderedChildren}
        </ul>
      ) : null}
    </li>
  );
}

TreeViewItem.displayName = 'TreeViewItem';
