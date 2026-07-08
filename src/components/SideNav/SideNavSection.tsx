'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useId} from 'react';
import {useSideNavCollapse} from 'components/SideNav/SideNavContext';
import {Text} from 'components/Text';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import {css} from 'styled-system/css';

export interface SideNavSectionProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  endContent?: ReactNode;
  isHeaderHidden?: boolean;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  subtitle?: string;
  title: string;
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    py: '1',
  }),
  rootCollapsed: css({
    py: '0',
  }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '2',
    py: '1',
  }),
  titleContainer: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
  }),
  endContent: css({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  }),
  items: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
  }),
};

export function SideNavSection({
  children,
  className,
  'data-testid': dataTestId,
  endContent,
  isHeaderHidden = false,
  ref,
  style,
  subtitle,
  title,
}: SideNavSectionProps): React.JSX.Element {
  const {isCollapsed} = useSideNavCollapse();
  const id = useId();
  const titleId = `${id}-title`;
  const shouldHideHeader = isHeaderHidden || isCollapsed;
  const header = (
    <div className={styles.header}>
      <span className={styles.titleContainer}>
        <Text
          as="span"
          color="secondary"
          id={titleId}
          type="supporting"
          weight="semibold">
          {title}
        </Text>
        {subtitle != null ? (
          <Text as="span" color="secondary" type="supporting">
            {subtitle}
          </Text>
        ) : null}
      </span>
      {isReactNode(endContent) ? (
        <span className={styles.endContent}>{endContent}</span>
      ) : null}
    </div>
  );

  return (
    <div
      aria-labelledby={titleId}
      className={cx(
        styles.root,
        isCollapsed && styles.rootCollapsed,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      role="group"
      style={style}>
      {shouldHideHeader ? <VisuallyHidden>{header}</VisuallyHidden> : header}
      <div className={styles.items}>{children}</div>
    </div>
  );
}

SideNavSection.displayName = 'SideNavSection';
