import {
  Children,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {
  MetadataListContext,
  type MetadataListLabelConfig,
} from './MetadataListContext';

export type MetadataListColumns = 'multi' | 'single' | number;

export interface MetadataListProps {
  /**
   * Metadata items to render inside the list.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root.
   */
  className?: string;
  /**
   * Number of columns or layout mode.
   */
  columns?: MetadataListColumns;
  /**
   * Test ID applied to the root.
   */
  'data-testid'?: string;
  /**
   * Configuration for item labels (position, width).
   */
  label?: MetadataListLabelConfig;
  /**
   * Maximum number of visible items before "Show more" appears.
   */
  maxNumOfItems?: number;
  /**
   * Layout orientation of the list.
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root.
   */
  style?: CSSProperties;
  /**
   * Optional title rendered above the list.
   */
  title?: ReactNode;
}

const styles = {
  root: css({display: 'flex', flexDirection: 'column'}),
  title: css({mb: '3'}),
  dl: css({m: 0, p: 0}),
  gridSingle: css({
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '2 4',
    alignItems: 'baseline',
  }),
  gridStackedSingle: css({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '3',
  }),
  gridMulti: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '4',
  }),
  horizontal: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4',
  }),
  toggle: css({alignSelf: 'flex-start', mt: '2'}),
  toggleButton: css({
    appearance: 'none',
    borderWidth: 0,
    bg: 'transparent',
    color: 'primary',
    cursor: 'pointer',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'medium',
    p: 0,
    _hover: {
      textDecoration: 'underline',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
} as const;

/**
 * Displays a list of label-value metadata pairs in configurable layouts.
 */
export function MetadataList({
  children,
  columns = 'single',
  label,
  maxNumOfItems,
  orientation = 'vertical',
  title,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: MetadataListProps): React.JSX.Element {
  const contentId = useId();
  const [isShowAll, setIsShowAll] = useState(false);
  const isMultiColumn =
    columns === 'multi' || (typeof columns === 'number' && columns > 1);
  const contextValue = useMemo(
    () => ({
      label:
        orientation === 'horizontal'
          ? {position: 'top' as const}
          : {
              ...label,
              position:
                label?.position ??
                (isMultiColumn ? ('top' as const) : ('start' as const)),
            },
      orientation,
    }),
    [isMultiColumn, label, orientation],
  );
  // Needed to count and slice arbitrary children for maxNumOfItems.
  // eslint-disable-next-line @eslint-react/no-children-to-array
  const childArray = Children.toArray(children);
  const effectiveMax = orientation === 'horizontal' ? undefined : maxNumOfItems;
  const isCollapsible =
    effectiveMax != null && childArray.length > effectiveMax;
  const visibleChildren =
    isCollapsible && !isShowAll
      ? childArray.slice(0, effectiveMax)
      : childArray;
  const isStacked = contextValue.label.position === 'top';
  const dlClassName =
    orientation === 'horizontal'
      ? styles.horizontal
      : isStacked
        ? columns === 'single' || columns === 1
          ? styles.gridStackedSingle
          : styles.gridMulti
        : columns === 'single' || columns === 1
          ? styles.gridSingle
          : styles.gridMulti;
  const dlStyle: CSSProperties | undefined =
    !isStacked && typeof columns === 'number' && columns > 1
      ? {gridTemplateColumns: `repeat(${columns}, auto 1fr)`}
      : !isStacked && contextValue.label.width != null
        ? {
            gridTemplateColumns: `${typeof contextValue.label.width === 'number' ? `${contextValue.label.width}px` : contextValue.label.width} 1fr`,
          }
        : undefined;

  return (
    <MetadataListContext value={contextValue}>
      <div
        className={cx(styles.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {title != null ? <div className={styles.title}>{title}</div> : null}
        <dl
          className={cx(styles.dl, dlClassName)}
          id={contentId}
          style={dlStyle}>
          {visibleChildren}
        </dl>
        {isCollapsible ? (
          <div className={styles.toggle}>
            <button
              aria-controls={contentId}
              aria-expanded={isShowAll}
              className={styles.toggleButton}
              onClick={() => setIsShowAll(value => !value)}
              type="button">
              {isShowAll ? 'Show less' : 'Show more'}
            </button>
          </div>
        ) : null}
      </div>
    </MetadataListContext>
  );
}

MetadataList.displayName = 'MetadataList';
