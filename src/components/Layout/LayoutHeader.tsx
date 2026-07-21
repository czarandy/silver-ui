'use client';

import {X} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {Button} from 'components/Button';
import {useDialogContext} from 'components/Dialog/DialogContext';
import {
  layoutHeaderRecipe,
  layoutRegionRecipe,
} from 'components/Layout/Layout.recipe';
import {useLayoutRegions} from 'components/Layout/LayoutContext';
import {Heading, Text, type HeadingLevel} from 'components/Text';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

/**
 * Header landmark region within a Layout with a structured title,
 * optional subtitle, and start/end content slots.
 *
 * When rendered inside a Dialog, Drawer, or Popover, a close button is
 * automatically appended after `endContent`. The button calls
 * `onOpenChange(false)` on the parent surface. Dialog and Drawer also use the
 * title as their fallback initial focus target.
 */
export interface LayoutHeaderProps {
  /**
   * Overrides the ARIA heading level of the title independently of the
   * rendered heading element.
   */
  accessibilityLevel?: HeadingLevel;
  /**
   * Cross-axis alignment of the start content, title, and end content within
   * the header row. Default is `start`.
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Additional CSS class names applied to the header.
   */
  className?: string;
  /**
   * Test ID applied to the header.
   */
  'data-testid'?: string;
  /**
   * Content rendered after the title area.
   */
  endContent?: ReactNode;
  /**
   * Fixed height for the header.
   */
  height?: number | string;
  /**
   * Accessible label for the header landmark.
   */
  label?: string;
  /**
   * Semantic heading level used for the title.
   * @default 4
   */
  level?: HeadingLevel;
  /**
   * Inner padding.
   */
  padding?: SpacingToken;
  /**
   * Ref forwarded to the header element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Content rendered before the title area.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the header.
   */
  style?: CSSProperties;
  /**
   * Supporting text displayed below the title.
   */
  subtitle?: string;
  /**
   * Primary header title.
   */
  title: string;
}

/**
 * Header landmark region within a Layout with a structured title,
 * optional subtitle, and start/end content slots.
 *
 * When rendered inside a Dialog, Drawer, or Popover, a close button is
 * automatically appended after `endContent`. The button calls
 * `onOpenChange(false)` on the parent surface. Dialog and Drawer also use the
 * title as their fallback initial focus target.
 */
export function LayoutHeader({
  accessibilityLevel,
  align = 'start',
  className,
  'data-testid': dataTestId,
  endContent,
  height,
  label,
  level = 4,
  padding = 4,
  ref,
  startContent,
  style,
  subtitle,
  title,
}: LayoutHeaderProps): React.JSX.Element {
  const regions = useLayoutRegions();
  const dialogContext = useDialogContext();
  const hasDivider = regions?.hasDividers ?? false;
  const rootStyle: CSSProperties = {height, ...style};
  const classes = layoutHeaderRecipe({align, hasDivider});

  const closeButton =
    dialogContext != null ? (
      <Button
        className={classes.closeButton}
        icon={X}
        isIconOnly
        label="Close"
        onClick={() => dialogContext.onOpenChange(false)}
        variant="ghost"
      />
    ) : null;
  const hasEnd = isNonEmptyReactNode(endContent) || closeButton != null;

  return (
    <header
      aria-label={label}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div className={cx(classes.inner, layoutRegionRecipe({padding}))}>
        {isNonEmptyReactNode(startContent) ? (
          <div className={classes.actions}>{startContent}</div>
        ) : null}
        <div className={classes.titleArea}>
          <Heading
            accessibilityLevel={accessibilityLevel}
            data-dialog-autofocus={dialogContext != null ? 'true' : undefined}
            id={dialogContext?.titleId}
            level={level}
            tabIndex={dialogContext != null ? -1 : undefined}>
            {title}
          </Heading>
          {subtitle != null ? (
            <Text as="p" color="secondary" type="supporting">
              {subtitle}
            </Text>
          ) : null}
        </div>
        {hasEnd ? (
          <div className={classes.actions}>
            {endContent}
            {closeButton}
          </div>
        ) : null}
      </div>
    </header>
  );
}

LayoutHeader.displayName = 'LayoutHeader';
