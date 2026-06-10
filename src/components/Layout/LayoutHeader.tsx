import {X} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import type {SpacingToken} from '../../internal/spacingTokens';
import {Button} from '../Button';
import {useDialogContext} from '../Dialog/DialogContext';
import {Heading, Text} from '../Text';
import {layoutHeaderRecipe, layoutRegionRecipe} from './Layout.recipe';
import {useLayoutDivider} from './LayoutContext';

/**
 * Header landmark region within a Layout with a structured title,
 * optional subtitle, and start/end content slots.
 *
 * When rendered inside a Dialog, a close button is automatically
 * appended after `endContent`. The button calls `onOpenChange(false)`
 * on the parent Dialog and the title receives initial focus.
 */
export interface LayoutHeaderProps {
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
 * When rendered inside a Dialog, a close button is automatically
 * appended after `endContent`. The button calls `onOpenChange(false)`
 * on the parent Dialog and the title receives initial focus.
 */
export function LayoutHeader({
  className,
  'data-testid': dataTestId,
  endContent,
  height,
  label,
  padding = 4,
  ref,
  startContent,
  style,
  subtitle,
  title,
}: LayoutHeaderProps): React.JSX.Element {
  const dividerContext = useLayoutDivider();
  const dialogContext = useDialogContext();
  const hasDivider = dividerContext?.hasDividers ?? false;
  const rootStyle: CSSProperties = {height, ...style};
  const classes = layoutHeaderRecipe({hasDivider});

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
  const hasEnd = isReactNode(endContent) || closeButton != null;

  return (
    <header
      aria-label={label}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div className={cx(classes.inner, layoutRegionRecipe({padding}))}>
        {isReactNode(startContent) ? (
          <div className={classes.actions}>{startContent}</div>
        ) : null}
        <div className={classes.titleArea}>
          <Heading
            data-dialog-autofocus={dialogContext != null ? 'true' : undefined}
            id={dialogContext?.titleId}
            level={4}
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
