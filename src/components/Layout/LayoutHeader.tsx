import {X} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import {useDialogContext} from '../Dialog/DialogContext';
import {Heading, Text} from '../Text';
import {layoutRegionRecipe} from './Layout.recipe';
import {useLayoutDivider} from './LayoutContext';
import type {SpacingStep} from './types';

/**
 * Header landmark region within a Layout with a structured title,
 * optional subtitle, and start/end content slots.
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
  padding?: SpacingStep;
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

const styles = {
  root: css({
    flexShrink: 0,
  }),
  divider: css({
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  inner: css({
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '3',
  }),
  titleArea: css({
    flex: 1,
    minW: 0,
    '& > :focus': {
      outline: 'none',
    },
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
    '&:last-child': {
      marginInlineEnd: '-2',
      marginBlockStart: '-2',
    },
  }),
} as const;

/**
 * Header landmark region within a Layout with a structured title,
 * optional subtitle, and start/end content slots.
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
  const closeButton =
    dialogContext != null ? (
      <Button
        icon={X}
        isIconOnly
        label="Close"
        onClick={() => dialogContext.onOpenChange(false)}
        variant="ghost"
      />
    ) : null;
  const hasEnd = endContent != null || closeButton != null;

  return (
    <header
      aria-label={label}
      className={cx(styles.root, hasDivider && styles.divider, className)}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div className={cx(styles.inner, layoutRegionRecipe({padding}))}>
        {startContent != null ? (
          <div className={styles.actions}>{startContent}</div>
        ) : null}
        <div className={styles.titleArea}>
          <Heading
            data-dialog-autofocus={dialogContext != null ? 'true' : undefined}
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
          <div className={styles.actions}>
            {endContent}
            {closeButton}
          </div>
        ) : null}
      </div>
    </header>
  );
}

LayoutHeader.displayName = 'LayoutHeader';
