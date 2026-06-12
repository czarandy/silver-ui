/* eslint-disable @eslint-react/static-components */
import type {CSSProperties, ReactNode, Ref} from 'react';
import {useLinkComponent} from 'components/Link';
import {tabsRecipe} from 'components/Tabs/Tabs.recipe';
import {useTabsContext} from 'components/Tabs/TabsContext';
import {cx} from 'internal/cx';
import isReactNode from '../../internal/isReactNode';
import {Icon, type IconComponent} from '../Icon';
import type {LinkComponent} from '../Link';

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
  const classes = tabsRecipe({
    size: context.size,
    layout: context.layout,
    isSelected,
    isDisabled,
  });
  const rootClassName = cx(classes.tab, className);
  const content = (
    <>
      {displayIcon != null ? (
        <span className={classes.icon}>
          <Icon icon={displayIcon} size={context.size} />
        </span>
      ) : null}
      <span className={classes.label}>
        <span className={classes.labelText}>{label}</span>
        <span aria-hidden="true" className={classes.labelSizer}>
          {label}
        </span>
      </span>
      {isReactNode(endContent) ? (
        <span className={classes.endContent}>{endContent}</span>
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
