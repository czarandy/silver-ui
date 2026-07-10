'use client';

import {Check, ChevronDown} from 'lucide-react';
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {Popover} from 'components/Popover';
import {tabMenuRecipe} from 'components/Tabs/TabMenu.recipe';
import {tabsRecipe} from 'components/Tabs/Tabs.recipe';
import {useTabsContext} from 'components/Tabs/TabsContext';
import useListFocus from 'hooks/useListFocus';
import {useIsTopLayer} from 'internal/LayerContext';
import {mergeRefs} from 'internal/mergeRefs';
import {cx} from 'utils/cx';

export interface TabMenuOption {
  /**
   * Icon rendered before the option label.
   */
  icon?: IconComponent;
  /**
   * Visible option label.
   */
  label: string;
  /**
   * Tab value selected by this option.
   */
  value: string;
}

export interface TabMenuProps {
  /**
   * Additional CSS class names applied to the trigger.
   */
  className?: string;
  /**
   * Test ID applied to the trigger.
   */
  'data-testid'?: string;
  /**
   * ID applied to the menu trigger tab.
   */
  id?: string;
  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Trigger and menu heading label.
   */
  label: string;
  /**
   * Menu options.
   */
  options: ReadonlyArray<TabMenuOption>;
  /**
   * Ref forwarded to the trigger button.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Inline styles applied to the trigger.
   */
  style?: CSSProperties;
}

/**
 * Overflow menu for additional tabs.
 */
export function TabMenu({
  className,
  'data-testid': dataTestId,
  id,
  isDisabled = false,
  label,
  options,
  ref,
  style,
}: TabMenuProps): React.JSX.Element {
  const context = useTabsContext();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === context.value);
  const triggerLabel = selectedOption?.label ?? label;
  const hasSelectedOption = selectedOption != null;
  const triggerClasses = tabsRecipe({
    size: context.size,
    layout: context.layout,
    isSelected: hasSelectedOption,
    isDisabled,
  });
  const classes = tabMenuRecipe({isOpen});

  const getMenuItems = useCallback(
    () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          [],
      ),
    [],
  );
  const {handleKeyDown: handleListKeyDown} = useListFocus({
    getItems: getMenuItems,
  });
  const isTopLayer = useIsTopLayer();

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && isTopLayer()) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    handleListKeyDown(event);
  };

  return (
    <Popover
      content={
        <div className={classes.menu} ref={menuRef}>
          {options.map(option => {
            const isSelected = option.value === context.value;
            return (
              <button
                aria-current={isSelected ? 'true' : undefined}
                className={tabMenuRecipe({isItemSelected: isSelected}).item}
                key={option.value}
                onClick={() => {
                  context.onChange(option.value);
                  setIsOpen(false);
                }}
                onKeyDown={handleMenuKeyDown}
                role="menuitem"
                type="button">
                <span className={classes.itemContent}>
                  {option.icon != null ? (
                    <span className={classes.itemIcon}>
                      <Icon color="secondary" icon={option.icon} size="sm" />
                    </span>
                  ) : null}
                  {option.label}
                </span>
                {isSelected ? (
                  <span className={classes.check}>
                    <Icon color="accent" icon={Check} size="sm" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      }
      hasAutoFocus
      hasCloseButton={false}
      isEnabled={!isDisabled}
      isOpen={isOpen}
      label={label}
      onOpenChange={setIsOpen}
      role="menu">
      <button
        aria-disabled={isDisabled || undefined}
        aria-selected={hasSelectedOption}
        className={cx(triggerClasses.tab, className)}
        data-tab-disabled={isDisabled ? 'true' : undefined}
        data-tab-value={
          hasSelectedOption && !isDisabled ? context.value : undefined
        }
        data-testid={dataTestId}
        disabled={isDisabled}
        id={id}
        onKeyDown={event => {
          if (event.key !== 'ArrowDown') {
            return;
          }

          event.preventDefault();
          setIsOpen(true);
        }}
        ref={mergeRefs(triggerRef, ref)}
        role="tab"
        style={style}
        tabIndex={hasSelectedOption && !isDisabled ? 0 : -1}
        type="button">
        {triggerLabel}
        <span className={classes.chevron}>
          <Icon icon={ChevronDown} size="sm" />
        </span>
      </button>
    </Popover>
  );
}

TabMenu.displayName = 'TabMenu';
