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
   * ID of the tabpanel controlled by this tab. Use this for in-page tabs, and
   * render the corresponding panel with `id={controls}`, `role="tabpanel"`,
   * and `aria-labelledby` pointing to this tab's `id`.
   */
  controls?: string;
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
  icon?: IconComponent;
  /**
   * ID applied to the tab element. Provide this with `controls` when rendering
   * your own tabpanel so the panel can reference the tab with
   * `aria-labelledby`.
   */
  id?: string;
  /**
   * Whether the tab is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
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
    mb: '-1px',
    px: '3',
    borderWidth: 0,
    borderBottomWidth: 'emphasized',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    fontFamily: 'body',
    fontSize: 'md',
    fontWeight: 'normal',
    lineHeight: 'normal',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      bg: 'bg.subtle',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  selected: css({
    borderBottomColor: 'fg',
    color: 'fg',
    fontWeight: 'semibold',
  }),
  disabled: css({
    color: 'fg.disabled',
    cursor: 'not-allowed',
    _hover: {
      bg: 'transparent',
    },
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
  size: {
    sm: css({h: 'component.sm'}),
    md: css({h: 'component.md'}),
    lg: css({h: 'component.lg'}),
  },
} as const;

/**
 * A single tab inside `Tabs`.
 */
export function Tab({
  as,
  className,
  'data-testid': dataTestId,
  controls,
  endContent,
  href,
  id,
  icon,
  isDisabled = false,
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
    isDisabled ? styles.disabled : undefined,
    context.layout === 'fill' ? styles.fill : undefined,
    className,
  );
  const content = (
    <>
      {displayIcon != null ? (
        <span className={styles.icon}>
          <Icon icon={displayIcon} size={context.size} />
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
    </>
  );

  if (href != null) {
    return (
      <LinkComponent
        aria-controls={controls}
        aria-disabled={isDisabled || undefined}
        aria-selected={isSelected}
        className={rootClassName}
        data-tab-disabled={isDisabled ? 'true' : undefined}
        data-tab-value={isDisabled ? undefined : value}
        data-testid={dataTestId}
        href={href}
        id={id}
        onClick={event => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }

          context.onChange(value);
        }}
        ref={ref as Ref<HTMLAnchorElement>}
        role="tab"
        style={style}
        tabIndex={isSelected && !isDisabled ? 0 : -1}
        to={LinkComponent === 'a' ? undefined : href}>
        {content}
      </LinkComponent>
    );
  }

  return (
    <button
      aria-controls={controls}
      aria-disabled={isDisabled || undefined}
      aria-selected={isSelected}
      className={rootClassName}
      data-tab-disabled={isDisabled ? 'true' : undefined}
      data-tab-value={isDisabled ? undefined : value}
      data-testid={dataTestId}
      disabled={isDisabled}
      id={id}
      onClick={() => {
        if (isDisabled) {
          return;
        }

        context.onChange(value);
      }}
      ref={ref as Ref<HTMLButtonElement>}
      role="tab"
      style={style}
      tabIndex={isSelected && !isDisabled ? 0 : -1}
      type="button">
      {content}
    </button>
  );
}

Tab.displayName = 'Tab';
