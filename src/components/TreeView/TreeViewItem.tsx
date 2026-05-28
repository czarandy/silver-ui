/* eslint-disable jsx-a11y-x/no-noninteractive-element-to-interactive-role, jsx-a11y-x/no-static-element-interactions, silver-ui/require-component-props -- internal recursive tree item */

import {ChevronRight} from 'lucide-react';
import {useCallback, useId, useMemo, type ReactNode} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {TreeViewBranches} from './TreeViewBranches';
import type {TreeViewDensity} from './types';

interface TreeViewItemProps {
  ancestorsIsLast: ReadonlyArray<boolean>;
  density: TreeViewDensity;
  description?: string;
  endContent?: React.ReactNode;
  hasChildren: boolean;
  href?: string;
  id: string;
  isDisabled?: boolean;
  isExpanded: boolean;
  isLast: boolean;
  isSelected?: boolean;
  label: React.ReactNode;
  nestedLevel: number;
  onClick?: (event: React.MouseEvent) => void;
  onToggle?: (id: string) => void;
  renderedChildren?: ReactNode;
  startContent?: React.ReactNode;
  target?: string;
}

const styles = {
  childGroup: css({
    m: 0,
    p: 0,
    listStyleType: 'none',
  }),
  content: css({
    display: 'flex',
    flex: 1,
    minW: 0,
    flexDirection: 'column',
    textAlign: 'start',
  }),
  contentWrapper: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    boxSizing: 'border-box',
    overflow: 'hidden',
    px: '2',
    borderRadius: 'md',
    outline: 'none',
    textAlign: 'start',
  }),
  density: {
    balanced: css({
      py: '2',
      fontSize: 'sm',
      lineHeight: 'normal',
    }),
    compact: css({
      py: '1',
      fontSize: 'sm',
      lineHeight: 'normal',
    }),
    spacious: css({
      py: '3',
      fontSize: 'sm',
      lineHeight: 'normal',
    }),
  },
  description: css({
    color: 'fg.muted',
    fontSize: 'xs',
    lineHeight: 'normal',
  }),
  disabled: css({
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
  }),
  endContent: css({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    ml: 'auto',
  }),
  interactive: css({
    cursor: 'pointer',
    transitionDuration: 'fast',
    transitionProperty: 'background-color',
    transitionTimingFunction: 'default',
    _active: {
      bg: 'silver-neutral.100',
    },
    _hover: {
      '@media (hover: hover)': {
        bg: 'silver-neutral.50',
      },
    },
    '&:has(:focus-visible)': {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  invisibleAction: css({
    all: 'unset',
    display: 'flex',
    flex: 1,
    minW: 0,
    flexDirection: 'column',
    color: 'inherit',
    cursor: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    textDecoration: 'none',
    outline: 'none',
  }),
  label: css({
    color: 'fg',
  }),
  rowWrapper: css({
    position: 'relative',
  }),
  selected: css({
    bg: 'primary.subtle',
  }),
  startContent: css({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  toggleButton: css({
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    w: '4',
    h: '4',
    borderRadius: 'sm',
    color: 'fg.muted',
    cursor: 'pointer',
  }),
  toggleIcon: css({
    display: 'flex',
    transitionDuration: 'fast',
    transitionProperty: 'transform',
    transitionTimingFunction: 'default',
  }),
  toggleIconExpanded: css({
    transform: 'rotate(90deg)',
  }),
  toggleSpacer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    w: '4',
    h: '4',
    color: 'fg.muted',
  }),
  treeBranches: css({
    ps: '2',
  }),
  wrapper: css({
    position: 'relative',
    m: 0,
    p: 0,
    w: 'full',
    listStyleType: 'none',
  }),
} as const;

export function TreeViewItem({
  ancestorsIsLast,
  density,
  description,
  endContent,
  hasChildren,
  href,
  id,
  isDisabled = false,
  isExpanded,
  isLast: _isLast,
  isSelected = false,
  label,
  nestedLevel,
  onClick,
  onToggle,
  renderedChildren,
  startContent,
  target,
}: TreeViewItemProps): React.JSX.Element {
  const labelId = useId();
  const descriptionId = useId();
  const isInteractive = onClick != null || href != null;
  const togglesOnRow = hasChildren && onClick == null && onToggle != null;

  const handleToggle = useMemo(
    () =>
      hasChildren && onToggle != null
        ? (event: React.MouseEvent) => {
            event.stopPropagation();
            onToggle(id);
          }
        : undefined,
    [hasChildren, id, onToggle],
  );

  const handleRowClick = useMemo(() => {
    if (!togglesOnRow) {
      return undefined;
    }

    return () => {
      if (isDisabled) {
        return;
      }
      onToggle(id);
    };
  }, [id, isDisabled, onToggle, togglesOnRow]);

  const handleRowKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (handleRowClick == null) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleRowClick();
      }
    },
    [handleRowClick],
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
    <span
      className={cx(
        styles.toggleIcon,
        isExpanded ? styles.toggleIconExpanded : undefined,
      )}>
      <Icon icon={ChevronRight} size="sm" />
    </span>
  );

  const toggle = hasChildren ? (
    onClick != null ? (
      <button
        aria-expanded={isExpanded}
        aria-label="Toggle children"
        className={styles.toggleButton}
        onClick={handleToggle}
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
      {startContent == null ? null : (
        <span className={styles.startContent}>{startContent}</span>
      )}
      {href != null ? (
        <a
          aria-describedby={description == null ? undefined : descriptionId}
          aria-disabled={isDisabled || undefined}
          aria-labelledby={labelId}
          className={styles.invisibleAction}
          href={href}
          tabIndex={isDisabled ? -1 : undefined}
          target={target}>
          {labelAndDescription}
        </a>
      ) : onClick != null ? (
        <button
          aria-describedby={description == null ? undefined : descriptionId}
          aria-labelledby={labelId}
          className={styles.invisibleAction}
          disabled={isDisabled}
          onClick={onClick}
          type="button">
          {labelAndDescription}
        </button>
      ) : (
        <span className={styles.content}>{labelAndDescription}</span>
      )}
      {endContent == null ? null : (
        <span className={styles.endContent}>{endContent}</span>
      )}
    </>
  );

  const marginLeft = hasChildren
    ? `calc(${nestedLevel} * 16px)`
    : `calc(${nestedLevel} * 16px + 24px)`;

  return (
    <li
      aria-disabled={isDisabled || undefined}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected || undefined}
      className={styles.wrapper}
      role="treeitem">
      <div className={styles.treeBranches}>
        <TreeViewBranches
          ancestorsIsLast={ancestorsIsLast}
          nestedLevel={nestedLevel}
        />
      </div>
      <div className={styles.rowWrapper}>
        <div
          className={cx(
            'silver-tree-view-item',
            styles.contentWrapper,
            styles.density[density],
            isInteractive || togglesOnRow ? styles.interactive : undefined,
            isDisabled ? styles.disabled : undefined,
            isSelected ? styles.selected : undefined,
          )}
          onClick={handleRowClick}
          onKeyDown={handleRowKeyDown}
          role={togglesOnRow ? 'button' : undefined}
          style={{marginLeft}}
          tabIndex={togglesOnRow && !isDisabled ? 0 : undefined}>
          {content}
        </div>
      </div>
      {isExpanded && renderedChildren != null ? (
        <ul className={styles.childGroup} role="group">
          {renderedChildren}
        </ul>
      ) : null}
    </li>
  );
}

TreeViewItem.displayName = 'TreeViewItem';
