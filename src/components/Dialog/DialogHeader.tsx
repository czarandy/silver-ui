import {X} from 'lucide-react';
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import {Heading, Text} from '../Text';

export interface DialogHeaderProps {
  className?: string;
  'data-testid'?: string;
  endContent?: ReactNode;
  hasDivider?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  ref?: Ref<HTMLDivElement>;
  startContent?: ReactNode;
  style?: CSSProperties;
  subtitle?: string;
  title: string;
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '3',
    p: '4',
    flexShrink: 0,
  }),
  divider: css({
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  title: css({
    flex: 1,
    minW: 0,
    outline: 'none',
  }),
  actions: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
  }),
} as const;

export function DialogHeader({
  title,
  subtitle,
  onOpenChange,
  startContent,
  endContent,
  hasDivider = false,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DialogHeaderProps): React.JSX.Element {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div
      className={cx(
        styles.root,
        hasDivider ? styles.divider : undefined,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {startContent != null ? (
        <div className={styles.actions}>{startContent}</div>
      ) : null}
      <div className={styles.title}>
        <Heading level={2} ref={titleRef} tabIndex={-1}>
          {title}
        </Heading>
        {subtitle != null ? (
          <Text as="p" color="secondary" type="supporting">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {endContent != null || onOpenChange != null ? (
        <div className={styles.actions}>
          {endContent}
          {onOpenChange != null ? (
            <Button
              icon={X}
              isIconOnly
              label="Close"
              onClick={() => onOpenChange(false)}
              tooltip="Close"
              variant="ghost"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

DialogHeader.displayName = 'DialogHeader';
