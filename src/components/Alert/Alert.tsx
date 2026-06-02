import {
  CheckCircle2,
  ChevronDown,
  Info,
  TriangleAlert,
  X,
  XCircle,
} from 'lucide-react';
import {
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {token} from 'styled-system/tokens';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import {Icon} from '../Icon';
import type {SpacingStep} from '../Layout/types';
import {Text} from '../Text';
import {alertHeaderRecipe, alertRecipe} from './Alert.recipe';

export type AlertContainer = 'card' | 'section';
export type AlertStatus = 'error' | 'info' | 'success' | 'warning';

export interface AlertProps {
  /**
   * Extra content rendered below the alert header in a collapsible area.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Visual container style.
   * @default 'card'
   */
  container?: AlertContainer;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Supporting description displayed below the title.
   */
  description?: ReactNode;
  /**
   * Content rendered at the end of the header, before collapse and dismiss controls.
   */
  endContent?: ReactNode;
  /**
   * Custom status icon. A default icon is rendered when omitted.
   */
  icon?: ReactNode;
  /**
   * Whether collapsible children are expanded initially.
   * @default false
   */
  isDefaultExpanded?: boolean;
  /**
   * Whether the alert can be dismissed.
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Called when the dismiss button is clicked.
   */
  onDismiss?: () => void;
  /**
   * Inner padding step.
   * @default 4
   */
  padding?: SpacingStep;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Status controlling role, icon, and color.
   */
  status: AlertStatus;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Primary alert title.
   */
  title: ReactNode;
}

const statusRole: Record<AlertStatus, 'alert' | 'status'> = {
  error: 'alert',
  info: 'status',
  success: 'status',
  warning: 'alert',
};

const defaultIcons: Record<AlertStatus, ReactNode> = {
  error: <Icon color="error" icon={XCircle} />,
  info: <Icon color="info" icon={Info} />,
  success: <Icon color="success" icon={CheckCircle2} />,
  warning: <Icon color="warning" icon={TriangleAlert} />,
};

const styles = {
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  content: css({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minW: 0,
  }),
  endArea: css({
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: '2',
    ms: 'auto',
  }),
  body: css({
    bg: 'bg',
    borderBlockEndWidth: 'default',
    borderColor: 'border',
    borderInlineWidth: 'default',
    borderStyle: 'solid',
    px: '4',
    py: '3',
  }),
  bodyCard: css({
    borderBottomRadius: 'lg',
  }),
  chevronExpanded: css({
    transform: 'rotate(180deg)',
  }),
} as const;

/**
 * Displays a contextual message with status-based styling, an optional
 * collapsible body, and dismiss functionality.
 */
export function Alert({
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
  padding,
  ref,
  status,
  style,
  title,
}: AlertProps): React.JSX.Element | null {
  const bodyId = useId();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
  const hasChildren = children != null;
  const showContent = hasChildren && isExpanded;
  const showEndArea = endContent != null || isDismissable || hasChildren;
  const isSingleLine =
    description == null && (endContent != null || isDismissable || hasChildren);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={cx(alertRecipe(), className)}
      data-testid={dataTestId}
      ref={ref}
      role={statusRole[status]}
      style={style}>
      <div
        className={alertHeaderRecipe({
          container,
          hasContent: showContent,
          isCentered: isSingleLine,
          status,
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
                aria-controls={bodyId}
                aria-expanded={isExpanded}
                className={isExpanded ? styles.chevronExpanded : undefined}
                icon={ChevronDown}
                isIconOnly
                label={isExpanded ? 'Collapse' : 'Expand'}
                onClick={() => setIsExpanded(value => !value)}
                size="sm"
                variant="ghost"
              />
            ) : null}
            {isDismissable ? (
              <Button
                icon={X}
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
          className={cx(
            styles.body,
            container === 'card' ? styles.bodyCard : undefined,
          )}
          id={bodyId}
          style={
            padding != null ? {padding: token(`spacing.${padding}`)} : undefined
          }>
          {children}
        </div>
      ) : null}
    </div>
  );
}

Alert.displayName = 'Alert';
