import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {Text} from '../Text';
import type {SearchableItem} from './types';

export interface AutocompleteInputItemProps<
  T extends SearchableItem = SearchableItem,
> {
  /**
   * Additional CSS class names applied to the item layout.
   */
  className?: string;
  /**
   * Test ID applied to the item layout.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Icon or avatar rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Search result item.
   */
  item: T;
  /**
   * Ref forwarded to the item layout.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the item layout.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
  }),
  icon: css({
    display: 'inline-flex',
    flexShrink: 0,
    color: 'fg.muted',
  }),
  text: css({
    display: 'flex',
    flexDirection: 'column',
    minW: 0,
  }),
  disabled: css({opacity: 0.55}),
} as const;

/**
 * Default layout for AutocompleteInput and TagsInput result rows.
 */
export function AutocompleteInputItem<T extends SearchableItem>({
  className,
  'data-testid': dataTestId,
  description,
  icon,
  item,
  isDisabled = false,
  ref,
  style,
}: AutocompleteInputItemProps<T>): React.JSX.Element {
  if (item.element != null) {
    return <>{item.element}</>;
  }

  return (
    <div
      className={cx(
        styles.root,
        isDisabled ? styles.disabled : undefined,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {icon != null ? (
        <span className={styles.icon}>
          <Icon color="secondary" icon={icon} size="sm" />
        </span>
      ) : null}
      <span className={styles.text}>
        <Text as="span" color="inherit" type="label">
          {item.label}
        </Text>
        {description != null ? (
          <Text as="span" color="secondary" type="supporting">
            {description}
          </Text>
        ) : null}
      </span>
    </div>
  );
}

AutocompleteInputItem.displayName = 'AutocompleteInputItem';
