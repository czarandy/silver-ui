import {
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {Heading} from '../Text';
import {metadataListRecipe} from './MetadataList.recipe';
import {MetadataListContext} from './MetadataListContext';

export type MetadataListLabelPosition = 'start' | 'top';

export interface MetadataListProps {
  /**
   * Metadata items to render inside the list.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root.
   */
  className?: string;
  /**
   * Test ID applied to the root.
   */
  'data-testid'?: string;
  /**
   * Position of item labels relative to their values.
   * @default 'start'
   */
  labelPosition?: MetadataListLabelPosition;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root.
   */
  style?: CSSProperties;
  /**
   * Optional title rendered above the list as a heading.
   */
  title?: string;
}

/**
 * Displays a list of label-value metadata pairs in configurable layouts.
 */
export function MetadataList({
  children,
  labelPosition = 'start',
  title,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: MetadataListProps): React.JSX.Element {
  const titleId = useId();
  const contextValue = useMemo(() => ({labelPosition}), [labelPosition]);
  const styles = metadataListRecipe({labelPosition});

  return (
    <MetadataListContext value={contextValue}>
      <div
        className={cx(styles.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {title != null ? (
          <Heading className={styles.title} id={titleId} level={5}>
            {title}
          </Heading>
        ) : null}
        <dl
          aria-labelledby={title != null ? titleId : undefined}
          className={styles.dl}>
          {children}
        </dl>
      </div>
    </MetadataListContext>
  );
}

MetadataList.displayName = 'MetadataList';
