import type {CSSProperties, ReactNode, Ref} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {metadataListRecipe} from 'components/MetadataList/MetadataList.recipe';
import {useMetadataList} from 'components/MetadataList/MetadataListContext';
import {cx} from 'internal/cx';

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

  const styles = metadataListRecipe({labelPosition: context?.labelPosition});
  const labelContent = (
    <>
      {icon != null ? <Icon color="secondary" icon={icon} size="sm" /> : null}
      {label}
    </>
  );

  return (
    <div
      className={cx(styles.item, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <dt className={styles.label}>{labelContent}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}

MetadataListItem.displayName = 'MetadataListItem';
