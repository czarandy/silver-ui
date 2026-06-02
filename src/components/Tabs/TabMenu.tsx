import {Check, ChevronDown} from 'lucide-react';
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {Icon, type IconComponent} from '../Icon';
import {Popover} from '../Popover';
import {useTabsContext} from './TabsContext';

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

const styles = {
  trigger: css({
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
    whiteSpace: 'nowrap',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  triggerSelected: css({
    borderBottomColor: 'fg',
    color: 'fg',
    fontWeight: 'semibold',
  }),
  triggerDisabled: css({
    color: 'fg.disabled',
    cursor: 'not-allowed',
    _hover: {bg: 'transparent'},
  }),
  fill: css({flex: 1}),
  size: {
    sm: css({h: 'component.sm'}),
    md: css({h: 'component.md'}),
    lg: css({h: 'component.lg'}),
  },
  chevron: css({
    display: 'inline-flex',
  }),
  chevronOpen: css({transform: 'rotate(180deg)'}),
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    minW: '40',
    p: '1',
  }),
  item: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2',
    w: 'full',
    px: '2',
    py: '2',
    borderWidth: 0,
    borderRadius: 'md',
    bg: 'transparent',
    color: 'fg',
    cursor: 'pointer',
    fontFamily: 'body',
    textAlign: 'start',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffsetTight',
    },
  }),
  itemSelected: css({fontWeight: 'medium'}),
  itemContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
  }),
  itemIcon: css({
    display: 'inline-flex',
    color: 'fg.muted',
  }),
  check: css({
    display: 'inline-flex',
    color: 'primary',
  }),
} as const;

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
        <div className={styles.menu}>
          {options.map(option => {
            const isSelected = option.value === context.value;
            return (
              <button
                aria-current={isSelected ? 'true' : undefined}
                className={cx(
                  styles.item,
                  isSelected ? styles.itemSelected : undefined,
                )}
                key={option.value}
                onClick={() => {
                  context.onChange(option.value);
                  setIsOpen(false);
                }}
                onKeyDown={handleMenuKeyDown}
                role="menuitem"
                type="button">
                <span className={styles.itemContent}>
                  {option.icon != null ? (
                    <span className={styles.itemIcon}>
                      <Icon color="secondary" icon={option.icon} size="sm" />
                    </span>
                  ) : null}
                  {option.label}
                </span>
                {isSelected ? (
                  <span className={styles.check}>
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
        className={cx(
          styles.trigger,
          styles.size[context.size],
          hasSelectedOption ? styles.triggerSelected : undefined,
          isDisabled ? styles.triggerDisabled : undefined,
          context.layout === 'fill' ? styles.fill : undefined,
          className,
        )}
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
        <span
          className={cx(
            styles.chevron,
            isOpen ? styles.chevronOpen : undefined,
          )}>
          <Icon icon={ChevronDown} size="sm" />
        </span>
      </button>
    </Popover>
  );
}

TabMenu.displayName = 'TabMenu';
