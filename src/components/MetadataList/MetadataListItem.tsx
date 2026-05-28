import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useMetadataList} from './MetadataListContext';

export interface MetadataListItemProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  icon?: ReactNode;
  label: string;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
}

const styles = {
  label: css({
    color: 'fg.muted',
    fontSize: 'md',
    fontWeight: 'medium',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    m: 0,
    minH: '6',
  }),
  value: css({
    color: 'fg',
    fontSize: 'md',
    m: 0,
    minH: '6',
    overflowWrap: 'break-word',
  }),
  stacked: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
  }),
  icon: css({
    display: 'inline-flex',
    color: 'fg.muted',
  }),
} as const;

export function MetadataListItem({
  children,
  icon,
  label,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: MetadataListItemProps): React.JSX.Element {
  const context = useMetadataList();
  const isStacked =
    context?.label.position === 'top' || context?.orientation === 'horizontal';
  const labelContent = (
    <>
      {icon != null ? <span className={styles.icon}>{icon}</span> : null}
      {label}
    </>
  );

  if (isStacked) {
    return (
      <div
        className={cx(styles.stacked, className)}
        data-testid={dataTestId}
        ref={ref as Ref<HTMLDivElement>}
        style={style}>
        <dt className={styles.label}>{labelContent}</dt>
        <dd className={styles.value}>{children}</dd>
      </div>
    );
  }

  return (
    <>
      <dt
        className={cx(styles.label, className)}
        data-testid={dataTestId ? `${dataTestId}-label` : undefined}
        ref={ref}
        style={style}>
        {labelContent}
      </dt>
      <dd
        className={styles.value}
        data-testid={dataTestId ? `${dataTestId}-value` : undefined}>
        {children}
      </dd>
    </>
  );
}

MetadataListItem.displayName = 'MetadataListItem';
