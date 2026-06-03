import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Heading, type HeadingLevel, Text} from '../Text';

export interface EmptyStateProps {
  /**
   * Action controls rendered below the text.
   */
  actions?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Supporting text.
   */
  description?: string;
  /**
   * Semantic heading level for the title.
   * @default 3
   */
  headingLevel?: HeadingLevel;
  /**
   * Decorative illustration or large icon rendered above the title.
   */
  illustration?: ReactNode;
  /**
   * Whether to use tighter spacing for constrained areas.
   * @default false
   */
  isCompact?: boolean;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Primary empty-state message.
   */
  title: string;
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '4',
    w: 'full',
    px: '6',
    py: '8',
  }),
  compact: css({
    gap: '2',
    px: '4',
    py: '4',
  }),
  illustration: css({
    display: 'inline-flex',
    color: 'fg.muted',
    w: '16',
    h: '16',
    '& > svg': {
      w: 'full',
      h: 'full',
    },
  }),
  text: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1',
    maxW: '96',
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '2',
    mt: '1',
  }),
  actionsCompact: css({
    flexDirection: 'column',
  }),
} as const;

/**
 * A placeholder for an empty data or content area.
 */
export function EmptyState({
  actions,
  className,
  'data-testid': dataTestId,
  description,
  headingLevel = 3,
  illustration,
  isCompact = false,
  ref,
  style,
  title,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cx(
        styles.root,
        isCompact ? styles.compact : undefined,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role="region"
      style={style}>
      {illustration != null ? (
        <div aria-hidden="true" className={styles.illustration}>
          {illustration}
        </div>
      ) : null}
      <div className={styles.text}>
        <Heading level={headingLevel}>{title}</Heading>
        {description != null ? (
          <Text as="p" color="secondary">
            {description}
          </Text>
        ) : null}
      </div>
      {actions != null ? (
        <div
          className={cx(
            styles.actions,
            isCompact ? styles.actionsCompact : undefined,
          )}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
