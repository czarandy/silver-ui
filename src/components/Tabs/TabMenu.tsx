import {Check, ChevronDown} from 'lucide-react';
import {
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
import {cx} from 'internal/cx';
import {mergeRefs} from 'internal/mergeRefs';

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

  const focusMenuItem = (
    event: KeyboardEvent<HTMLElement>,
    nextIndex: number,
  ) => {
    const menu = event.currentTarget.closest<HTMLElement>('[role="menu"]');
    const items = Array.from(
      menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
    items[nextIndex]?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const menu = event.currentTarget.closest<HTMLElement>('[role="menu"]');
    const items = Array.from(
      menu?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
    const activeIndex = items.indexOf(
      document.activeElement as HTMLButtonElement,
    );

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (items.length === 0) {
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusMenuItem(event, 0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusMenuItem(event, items.length - 1);
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    event.preventDefault();

    const currentIndex = activeIndex === -1 ? 0 : activeIndex;
    const nextIndex =
      event.key === 'ArrowDown'
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    focusMenuItem(event, nextIndex);
  };

  return (
    <Popover
      content={
        <div className={classes.menu}>
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
