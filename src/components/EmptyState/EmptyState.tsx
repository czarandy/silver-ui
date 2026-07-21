'use client';

import {
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {emptyStateRecipe} from 'components/EmptyState/EmptyState.recipe';
import {Heading, type HeadingLevel, Text} from 'components/Text';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

type NativeEmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'>;

export interface EmptyStateProps extends NativeEmptyStateProps {
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
   * @default 4
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

/**
 * A placeholder for an empty data or content area.
 */
export function EmptyState({
  actions,
  className,
  'data-testid': dataTestId,
  description,
  headingLevel = 4,
  illustration,
  isCompact = false,
  ref,
  role = 'region',
  style,
  title,
  ...htmlProps
}: EmptyStateProps): React.JSX.Element {
  const headingId = useId();
  const classes = emptyStateRecipe({isCompact});

  return (
    <div
      {...htmlProps}
      aria-labelledby={headingId}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role={role}
      style={style}>
      {isNonEmptyReactNode(illustration) ? (
        <div aria-hidden="true" className={classes.illustration}>
          {illustration}
        </div>
      ) : null}
      <div className={classes.text}>
        <Heading id={headingId} level={headingLevel}>
          {title}
        </Heading>
        {description != null ? (
          <Text as="div" color="secondary" role="paragraph" size="sm">
            {description}
          </Text>
        ) : null}
      </div>
      {isNonEmptyReactNode(actions) ? (
        <div className={classes.actions}>{actions}</div>
      ) : null}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
