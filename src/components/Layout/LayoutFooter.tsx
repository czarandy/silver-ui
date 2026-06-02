import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {layoutRegionRecipe} from './Layout.recipe';
import {useLayoutDivider} from './LayoutContext';
import type {SpacingStep} from './types';

/**
 * Footer landmark region within a Layout with structured action slots.
 */
export interface LayoutFooterProps {
  /**
   * Additional CSS class names applied to the footer.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Fixed height for the footer.
   */
  height?: number | string;
  /**
   * Accessible label for the footer landmark.
   */
  label?: string;
  /**
   * Inner padding.
   */
  padding?: SpacingStep;
  /**
   * Primary action button, rendered rightmost.
   */
  primaryButton: ReactNode;
  /**
   * Ref forwarded to the footer element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Secondary action button, rendered left of the primary button.
   */
  secondaryButton?: ReactNode;
  /**
   * Content rendered at the start (left) of the footer.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the footer.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    flexShrink: 0,
  }),
  divider: css({
    borderBlockStartWidth: 'default',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'border',
  }),
  inner: css({
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '3',
  }),
  start: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flex: 1,
    minW: 0,
    marginInlineEnd: 'auto',
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
  }),
};

/**
 * Footer landmark region within a Layout with structured action slots.
 */
export function LayoutFooter({
  className,
  'data-testid': dataTestId,
  height,
  label,
  padding = 4,
  primaryButton,
  ref,
  secondaryButton,
  startContent,
  style,
}: LayoutFooterProps): React.JSX.Element {
  const dividerContext = useLayoutDivider();
  const hasDivider = dividerContext?.hasDividers ?? false;
  const rootStyle: CSSProperties = {height, ...style};

  return (
    <footer
      aria-label={label}
      className={cx(styles.root, hasDivider && styles.divider, className)}
      data-divider={hasDivider || undefined}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div className={cx(styles.inner, layoutRegionRecipe({padding}))}>
        {startContent != null ? (
          <div className={styles.start}>{startContent}</div>
        ) : null}
        <div className={styles.actions}>
          {secondaryButton}
          {primaryButton}
        </div>
      </div>
    </footer>
  );
}

LayoutFooter.displayName = 'LayoutFooter';
