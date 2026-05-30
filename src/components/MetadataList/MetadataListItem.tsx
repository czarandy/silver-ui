import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {useMetadataList} from './MetadataListContext';

/**
 * A single label-value pair rendered inside a MetadataList.
 */
export interface MetadataListItemProps {
  /**
   * Value content rendered beside or below the label.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Optional icon rendered before the label text.
   */
  icon?: IconComponent;
  /**
   * Descriptive label for this metadata entry.
   */
  label: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  label: css({
    color: 'fg.muted',
    fontSize: 'md',
    fontWeight: 'bold',
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
  inline: css({
    display: 'contents',
  }),
} as const;

/**
 * A single label-value pair rendered inside a MetadataList.
 */
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

  if (context == null && process.env.NODE_ENV !== 'production') {
    throw new Error('MetadataListItem must be rendered inside a MetadataList.');
  }

  const isStacked = context?.labelPosition === 'top';
  const labelContent = (
    <>
      {icon != null ? <Icon color="secondary" icon={icon} size="sm" /> : null}
      {label}
    </>
  );

  if (isStacked) {
    return (
      <div
        className={cx(styles.stacked, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <dt className={styles.label}>{labelContent}</dt>
        <dd className={styles.value}>{children}</dd>
      </div>
    );
  }

  return (
    <div
      className={cx(styles.inline, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <dt className={styles.label}>{labelContent}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}

MetadataListItem.displayName = 'MetadataListItem';
