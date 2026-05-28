import {ChevronDown} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {useCollapsible} from './useCollapsible';

export interface AccordionItemProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  isDefaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  trigger: ReactNode;
  value?: string;
}

const styles = {
  root: css({
    w: '100%',
  }),
  trigger: css({
    all: 'unset',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    w: '100%',
    cursor: 'pointer',
    fontFamily: 'body',
    fontSize: 'lg',
    fontWeight: 'semibold',
    color: 'fg',
    textAlign: 'start',
    py: 0,
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
      borderRadius: 'sm',
    },
  }),
  chevron: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    color: 'fg.muted',
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  chevronOpen: css({
    transform: 'rotate(180deg)',
  }),
  content: css({
    pt: '1',
  }),
} as const;

export function AccordionItem({
  trigger,
  children,
  isDefaultOpen,
  isOpen: controlledIsOpen,
  onOpenChange,
  value,
  ref,
  className,
  'data-testid': dataTestId,
  style,
}: AccordionItemProps): React.JSX.Element {
  const config =
    controlledIsOpen !== undefined
      ? {isOpen: controlledIsOpen, onOpenChange}
      : {defaultIsOpen: isDefaultOpen ?? true, onOpenChange};

  const {isOpen, toggle} = useCollapsible({
    isCollapsible: config,
    value,
  });

  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <button
        aria-expanded={isOpen}
        className={styles.trigger}
        onClick={toggle}
        type="button">
        <span>{trigger}</span>
        <span
          className={cx(
            styles.chevron,
            isOpen ? styles.chevronOpen : undefined,
          )}>
          <Icon icon={ChevronDown} size="sm" />
        </span>
      </button>
      <div className={styles.content} hidden={!isOpen || undefined}>
        {children}
      </div>
    </div>
  );
}

AccordionItem.displayName = 'AccordionItem';
