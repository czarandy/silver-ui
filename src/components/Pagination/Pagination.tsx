import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useTransition, type CSSProperties, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import {Select} from '../Select';
import {Text} from '../Text';

export type PaginationVariant = 'pages' | 'count' | 'compact' | 'dots' | 'none';
export type PaginationSize = 'sm' | 'md';

export interface PaginationProps {
  /**
   * Async action fired after a page change.
   */
  changeAction?: (page: number) => Promise<void> | void;
  /**
   * Additional CSS class names applied to the navigation root.
   */
  className?: string;
  /**
   * Test ID applied to the navigation root.
   */
  'data-testid'?: string;
  /**
   * Whether another page exists when the total page count is unknown.
   */
  hasMore?: boolean;
  /**
   * Whether the pagination controls are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Accessible label for the navigation landmark.
   * @default 'Pagination'
   */
  label?: string;
  /**
   * Called when the page changes.
   */
  onChange: (page: number) => void;
  /**
   * Called when the page size changes.
   */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Current page number, starting at 1.
   */
  page: number;
  /**
   * Number of items per page.
   * @default 10
   */
  pageSize?: number;
  /**
   * Available page size options.
   */
  pageSizeOptions?: number[];
  /**
   * Ref forwarded to the navigation root.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Number of page buttons to show on each side of the current page.
   * @default 1
   */
  siblingCount?: number;
  /**
   * Control size.
   * @default 'md'
   */
  size?: PaginationSize;
  /**
   * Inline styles applied to the navigation root.
   */
  style?: CSSProperties;
  /**
   * Total item count. Takes precedence over `totalPages`.
   */
  totalItems?: number;
  /**
   * Total page count.
   */
  totalPages?: number;
  /**
   * Display variant.
   * @default 'pages'
   */
  variant?: PaginationVariant;
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4',
  }),
  controls: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
  }),
  ellipsis: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minW: 'var(--pagination-control-size)',
    h: 'var(--pagination-control-size)',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'sm',
    userSelect: 'none',
  }),
  infoText: css({
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  }),
  dotsContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
  }),
  dot: css({
    w: '2',
    h: '2',
    p: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: 'full',
    bg: 'silver-neutral.300',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  }),
  dotSm: css({
    w: '1.5',
    h: '1.5',
  }),
  dotActive: css({
    bg: 'primary',
  }),
  activePage: css({
    bg: 'silver-neutral.100',
    fontWeight: 'medium',
  }),
  pageSizeSelector: css({
    display: 'flex',
    alignItems: 'center',
    w: '20',
  }),
  size: {
    sm: css({'--pagination-control-size': 'var(--silver-sizes-component-sm)'}),
    md: css({'--pagination-control-size': 'var(--silver-sizes-component-md)'}),
  },
} as const;

export function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | '...')[] {
  const totalSlots = 5 + 2 * siblingCount;

  if (totalPages <= totalSlots) {
    return Array.from({length: totalPages}, (_, index) => index + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = 3 + 2 * siblingCount;
    return [
      ...Array.from({length: leftRange}, (_, index) => index + 1),
      '...',
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = 3 + 2 * siblingCount;
    return [
      1,
      '...',
      ...Array.from(
        {length: rightRange},
        (_, index) => totalPages - rightRange + index + 1,
      ),
    ];
  }

  return [
    1,
    '...',
    ...Array.from(
      {length: rightSiblingIndex - leftSiblingIndex + 1},
      (_, index) => leftSiblingIndex + index,
    ),
    '...',
    totalPages,
  ];
}

/**
 * Page navigation controls with multiple display variants
 * (numbered pages, count summary, compact label, dots, or none).
 */
export function Pagination({
  className,
  changeAction,
  'data-testid': dataTestId,
  hasMore,
  isDisabled = false,
  label = 'Pagination',
  onChange,
  onPageSizeChange,
  page,
  pageSize = 10,
  pageSizeOptions,
  ref,
  siblingCount = 1,
  size = 'md',
  style,
  totalItems,
  totalPages: totalPagesProp,
  variant = 'pages',
}: PaginationProps): React.JSX.Element | null {
  const [isPending, startTransition] = useTransition();
  const computedTotalPages =
    totalPagesProp ??
    (totalItems != null ? Math.ceil(totalItems / pageSize) : undefined);
  const hasPrevious = page > 1;
  const hasNext =
    computedTotalPages != null ? page < computedTotalPages : (hasMore ?? false);
  const buttonSize = size === 'sm' ? 'sm' : 'md';

  if (totalItems != null && totalItems <= 0) {
    return null;
  }

  if (computedTotalPages != null && computedTotalPages <= 0) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    if (isDisabled || isPending) {
      return;
    }

    onChange(newPage);
    if (changeAction != null) {
      startTransition(() => {
        void changeAction(newPage);
      });
    }
  };

  const handlePageSizeChange = (value: string | null) => {
    if (value == null) {
      return;
    }

    onPageSizeChange?.(Number(value));
    handlePageChange(1);
  };

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd =
    totalItems == null
      ? page * pageSize
      : Math.min(page * pageSize, totalItems);

  const renderIndicator = () => {
    switch (variant) {
      case 'pages': {
        if (computedTotalPages == null) {
          return null;
        }

        return generatePageRange(page, computedTotalPages, siblingCount).map(
          (item, index, pageRange) => {
            if (item === '...') {
              return (
                <span
                  aria-hidden="true"
                  className={styles.ellipsis}
                  key={`ellipsis-${pageRange[index - 1]}-${pageRange[index + 1]}`}>
                  ...
                </span>
              );
            }

            const isActive = item === page;
            return (
              <Button
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? styles.activePage : undefined}
                isDisabled={isDisabled}
                key={item}
                label={`Go to page ${item}`}
                onClick={() => handlePageChange(item)}
                size={buttonSize}
                variant="ghost"
              />
            );
          },
        );
      }

      case 'count':
        return totalItems == null ? null : (
          <span className={styles.infoText}>
            <Text color="secondary" size="sm" type="body">
              {`${rangeStart}-${rangeEnd} of ${totalItems}`}
            </Text>
          </span>
        );

      case 'compact':
        return computedTotalPages == null ? null : (
          <span className={styles.infoText}>
            <Text color="secondary" size="sm" type="body">
              {`Page ${page} of ${computedTotalPages}`}
            </Text>
          </span>
        );

      case 'dots':
        return computedTotalPages == null ? null : (
          <div
            aria-label="Page indicators"
            className={styles.dotsContainer}
            role="group">
            {Array.from({length: computedTotalPages}, (_, index) => {
              const dotPage = index + 1;
              const isActive = dotPage === page;
              return (
                <button
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Go to page ${dotPage}`}
                  className={cx(
                    styles.dot,
                    size === 'sm' ? styles.dotSm : undefined,
                    isActive ? styles.dotActive : undefined,
                  )}
                  disabled={isDisabled}
                  key={dotPage}
                  onClick={() => handlePageChange(dotPage)}
                  type="button"
                />
              );
            })}
          </div>
        );

      case 'none':
      default:
        return null;
    }
  };

  return (
    <nav
      aria-label={label}
      className={cx(styles.root, styles.size[size], className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {pageSizeOptions != null && pageSizeOptions.length > 0 ? (
        <div className={styles.pageSizeSelector}>
          <Select
            isDisabled={isDisabled}
            isLabelHidden
            label="Items per page"
            onChange={handlePageSizeChange}
            options={pageSizeOptions.map(option => String(option))}
            size={buttonSize}
            value={String(pageSize)}
          />
        </div>
      ) : null}
      <div className={styles.controls}>
        <Button
          icon={ChevronLeft}
          isDisabled={isDisabled || !hasPrevious}
          isIconOnly
          label="Go to previous page"
          onClick={() => handlePageChange(page - 1)}
          size={buttonSize}
          variant="ghost"
        />
        {renderIndicator()}
        <Button
          icon={ChevronRight}
          isDisabled={isDisabled || !hasNext}
          isIconOnly
          label="Go to next page"
          onClick={() => handlePageChange(page + 1)}
          size={buttonSize}
          variant="ghost"
        />
      </div>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
