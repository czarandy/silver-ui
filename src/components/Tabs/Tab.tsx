/* eslint-disable @eslint-react/static-components */
import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {useTabsContext} from './TabsContext';

export interface TabProps {
  /**
   * Custom link component used when href is set.
   */
  as?: LinkComponent;
  /**
   * Additional CSS class names applied to the tab.
   */
  className?: string;
  /**
   * Test ID applied to the tab.
   */
  'data-testid'?: string;
  /**
   * Content rendered after the label.
   */
  endContent?: ReactNode;
  /**
   * Optional link URL. When set, the tab renders as a link.
   */
  href?: string;
  /**
   * Icon shown before the label.
   */
  icon?: IconComponent; /**
   * Visible tab label.
   */
  label: string;
  /**
   * Ref forwarded to the tab root.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Icon shown when selected. Falls back to icon.
   */
  selectedIcon?: IconComponent;
  /**
   * Inline styles applied to the tab.
   */
  style?: CSSProperties;
  /**
   * Unique tab value.
   */
  value: string;
}

const styles = {
  root: css({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
    px: '3',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: 'md',
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    fontFamily: 'body',
    fontSize: 'md',
    fontWeight: 'normal',
    lineHeight: 'normal',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transitionProperty: 'color, background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      bg: 'bg.subtle',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  selected: css({
    color: 'fg',
    fontWeight: 'semibold',
  }),
  fill: css({
    flex: 1,
  }),
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  label: css({
    display: 'inline-grid',
  }),
  labelText: css({
    gridRowStart: 1,
    gridColumnStart: 1,
  }),
  labelSizer: css({
    gridRowStart: 1,
    gridColumnStart: 1,
    visibility: 'hidden',
    pointerEvents: 'none',
    fontWeight: 'semibold',
  }),
  endContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  indicator: css({
    position: 'absolute',
    bottom: '-2px',
    insetInlineStart: '3',
    insetInlineEnd: '3',
    h: '0.5',
    borderRadius: 'full',
    bg: 'fg',
    opacity: 0,
  }),
  indicatorSelected: css({
    opacity: 1,
  }),
  size: {
    sm: css({h: 'component.sm', '--tab-icon-size': '14px'}),
    md: css({h: 'component.md', '--tab-icon-size': '16px'}),
    lg: css({h: 'component.lg', '--tab-icon-size': '18px'}),
  },
} as const;

/**
 * A single tab inside `Tabs`.
 */
export function Tab({
  as,
  className,
  'data-testid': dataTestId,
  endContent,
  href,
  icon,
  label,
  ref,
  selectedIcon,
  style,
  value,
}: TabProps): React.JSX.Element {
  const context = useTabsContext();
  const LinkComponent = useLinkComponent(as);
  const isSelected = context.value === value;
  const displayIcon = isSelected && selectedIcon != null ? selectedIcon : icon;
  const rootClassName = cx(
    styles.root,
    styles.size[context.size],
    isSelected ? styles.selected : undefined,
    context.layout === 'fill' ? styles.fill : undefined,
    className,
  );
  const content = (
    <>
      {displayIcon != null ? (
        <span className={styles.icon}>
          <Icon icon={displayIcon} size="sm" />
        </span>
      ) : null}
      <span className={styles.label}>
        <span className={styles.labelText}>{label}</span>
        <span aria-hidden="true" className={styles.labelSizer}>
          {label}
        </span>
      </span>
      {endContent != null ? (
        <span className={styles.endContent}>{endContent}</span>
      ) : null}
      <span
        aria-hidden="true"
        className={cx(
          styles.indicator,
          isSelected ? styles.indicatorSelected : undefined,
        )}
      />
    </>
  );

  if (href != null) {
    return (
      <LinkComponent
        aria-current={isSelected ? 'page' : undefined}
        className={rootClassName}
        data-testid={dataTestId}
        href={href}
        onClick={() => context.onChange(value)}
        ref={ref as Ref<HTMLAnchorElement>}
        style={style}
        to={LinkComponent === 'a' ? undefined : href}>
        {content}
      </LinkComponent>
    );
  }

  return (
    <button
      aria-current={isSelected ? 'page' : undefined}
      className={rootClassName}
      data-testid={dataTestId}
      onClick={() => context.onChange(value)}
      ref={ref as Ref<HTMLButtonElement>}
      style={style}
      type="button">
      {content}
    </button>
  );
}

Tab.displayName = 'Tab';
