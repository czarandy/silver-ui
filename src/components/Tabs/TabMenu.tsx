import {Check, ChevronDown} from 'lucide-react';
import {useState, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {Popover} from '../Popover';
import {useTabsContext} from './TabsContext';

export interface TabMenuOption {
  /**
   * Icon rendered before the option label.
   */
  icon?: ReactNode;
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
    whiteSpace: 'nowrap',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  triggerSelected: css({
    color: 'fg',
    fontWeight: 'semibold',
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
  indicator: css({
    position: 'absolute',
    bottom: '-2px',
    insetInlineStart: '3',
    insetInlineEnd: '3',
    h: '0.5',
    borderRadius: 'full',
    bg: 'fg',
  }),
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    minW: '40',
    p: '1',
  }),
  heading: css({
    px: '2',
    py: '1',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'semibold',
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
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '1px',
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
  label,
  options,
  ref,
  style,
}: TabMenuProps): React.JSX.Element {
  const context = useTabsContext();
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === context.value);
  const triggerLabel = selectedOption?.label ?? label;
  const hasSelectedOption = selectedOption != null;

  return (
    <Popover
      content={
        <div className={styles.menu} role="menu">
          <span className={styles.heading} role="presentation">
            {label}
          </span>
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
                role="menuitem"
                type="button">
                <span className={styles.itemContent}>
                  {option.icon != null ? (
                    <span className={styles.itemIcon}>{option.icon}</span>
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
      isOpen={isOpen}
      label={label}
      onOpenChange={setIsOpen}>
      <button
        className={cx(
          styles.trigger,
          styles.size[context.size],
          hasSelectedOption ? styles.triggerSelected : undefined,
          context.layout === 'fill' ? styles.fill : undefined,
          className,
        )}
        data-testid={dataTestId}
        ref={ref}
        style={style}
        type="button">
        {triggerLabel}
        <span
          className={cx(
            styles.chevron,
            isOpen ? styles.chevronOpen : undefined,
          )}>
          <Icon icon={ChevronDown} size="sm" />
        </span>
        {hasSelectedOption ? (
          <span aria-hidden="true" className={styles.indicator} />
        ) : null}
      </button>
    </Popover>
  );
}

TabMenu.displayName = 'TabMenu';
