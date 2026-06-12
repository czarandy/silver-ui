import type {CSSProperties, ReactNode, Ref} from 'react';
import {
  layoutFooterRecipe,
  layoutRegionRecipe,
} from 'components/Layout/Layout.recipe';
import {useLayoutDivider} from 'components/Layout/LayoutContext';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import type {SpacingToken} from 'internal/spacingTokens';

interface LayoutFooterBaseProps {
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
  padding?: SpacingToken;
  /**
   * Ref forwarded to the footer element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Inline styles applied to the footer.
   */
  style?: CSSProperties;
}

interface LayoutFooterCustomProps extends LayoutFooterBaseProps {
  /**
   * Custom footer content rendered inside the footer shell.
   */
  children: ReactNode;
  primaryButton?: never;
  secondaryButton?: never;
  startContent?: never;
}

interface LayoutFooterActionsProps extends LayoutFooterBaseProps {
  children?: never;
  /**
   * Primary action button, rendered rightmost.
   */
  primaryButton?: ReactNode;
  /**
   * Secondary action button, rendered left of the primary button.
   */
  secondaryButton?: ReactNode;
  /**
   * Content rendered at the start (left) of the footer.
   */
  startContent?: ReactNode;
}

/**
 * Footer landmark region within a Layout. Use action slots for the standard
 * footer layout, or children for a custom footer inside the same shell.
 */
export type LayoutFooterProps =
  | LayoutFooterActionsProps
  | LayoutFooterCustomProps;

/**
 * Footer landmark region within a Layout.
 */
export function LayoutFooter({
  children,
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
  const isCustom = isReactNode(children);
  const hasActions = isReactNode(primaryButton) || isReactNode(secondaryButton);
  const classes = layoutFooterRecipe({hasDivider, isCustom});

  return (
    <footer
      aria-label={label}
      className={cx(classes.root, className)}
      data-divider={hasDivider || undefined}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div className={cx(classes.inner, layoutRegionRecipe({padding}))}>
        {isCustom ? (
          children
        ) : (
          <>
            {isReactNode(startContent) ? (
              <div className={classes.start}>{startContent}</div>
            ) : null}
            {hasActions ? (
              <div className={classes.actions}>
                {secondaryButton}
                {primaryButton}
              </div>
            ) : null}
          </>
        )}
      </div>
    </footer>
  );
}

LayoutFooter.displayName = 'LayoutFooter';
