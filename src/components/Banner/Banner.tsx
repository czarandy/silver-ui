import {
  CheckCircle2,
  ChevronDown,
  Info,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react';
import {useState, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import {Text} from '../Text';
import {bannerHeaderRecipe, bannerRecipe} from './Banner.recipe';

export type BannerStatus = 'info' | 'warning' | 'error' | 'success';
export type BannerContainer = 'card' | 'section';

export interface BannerProps {
  children?: ReactNode;
  className?: string;
  container?: BannerContainer;
  'data-testid'?: string;
  description?: ReactNode;
  endContent?: ReactNode;
  icon?: ReactNode;
  isDefaultExpanded?: boolean;
  isDismissable?: boolean;
  onDismiss?: () => void;
  ref?: Ref<HTMLDivElement>;
  status: BannerStatus;
  style?: CSSProperties;
  title: ReactNode;
}

const statusRole: Record<BannerStatus, 'alert' | 'status'> = {
  info: 'status',
  warning: 'alert',
  error: 'alert',
  success: 'status',
};

const defaultIcons: Record<BannerStatus, ReactNode> = {
  info: <Info />,
  warning: <TriangleAlert />,
  error: <XCircle />,
  success: <CheckCircle2 />,
};

const styles = {
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: 'fg.muted',
    fontSize: 'var(--silver-sizes-icon-md)',
    '& > svg': {
      w: '1em',
      h: '1em',
    },
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
  }),
  endArea: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
    ms: 'auto',
  }),
  body: css({
    bg: 'bg',
    px: '4',
    py: '3',
    borderInlineWidth: '1px',
    borderBlockEndWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.200',
  }),
  bodyCard: css({
    borderBottomRadius: 'lg',
  }),
  chevronExpanded: css({
    transform: 'rotate(180deg)',
  }),
};

export function Banner({
  children,
  className,
  container = 'card',
  'data-testid': dataTestId,
  description,
  endContent,
  icon,
  isDefaultExpanded = false,
  isDismissable = false,
  onDismiss,
  ref,
  status,
  style,
  title,
}: BannerProps): React.JSX.Element | null {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
  const hasChildren = children != null;
  const showContent = hasChildren && isExpanded;
  const showEndArea = endContent != null || isDismissable || hasChildren;
  const isSingleLine =
    description == null && (endContent != null || isDismissable);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cx(bannerRecipe(), className)}
      data-testid={dataTestId}
      ref={ref}
      role={statusRole[status]}
      style={style}>
      <div
        className={bannerHeaderRecipe({
          status,
          container,
          hasContent: showContent,
          isCentered: isSingleLine,
        })}>
        <span aria-hidden="true" className={styles.icon}>
          {icon ?? defaultIcons[status]}
        </span>
        <div className={styles.content}>
          <Text as="p" type="label" weight="semibold">
            {title}
          </Text>
          {description != null ? (
            <Text as="p" color="secondary" type="supporting">
              {description}
            </Text>
          ) : null}
        </div>
        {showEndArea ? (
          <div className={styles.endArea}>
            {endContent}
            {hasChildren ? (
              <Button
                icon={
                  <ChevronDown
                    className={cx(isExpanded && styles.chevronExpanded)}
                  />
                }
                isIconOnly
                label={isExpanded ? 'Collapse' : 'Expand'}
                onClick={() => setIsExpanded(value => !value)}
                size="sm"
                variant="ghost"
              />
            ) : null}
            {isDismissable ? (
              <Button
                icon={<X />}
                isIconOnly
                label="Dismiss"
                onClick={() => {
                  setIsDismissed(true);
                  onDismiss?.();
                }}
                size="sm"
                variant="ghost"
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {showContent ? (
        <div
          className={cx(styles.body, container === 'card' && styles.bodyCard)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

Banner.displayName = 'Banner';
