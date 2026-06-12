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
import {alertRecipe} from 'components/Alert/Alert.recipe';
import {Button} from 'components/Button';
import {Icon} from 'components/Icon';
import {Text} from 'components/Text';
import {cx} from 'internal/cx';
import isReactNode from '../../internal/isReactNode';
import type {SpacingToken} from '../../internal/spacingTokens';
import type {AlertContainer, AlertStatus} from './Alert.types';

export type {AlertContainer, AlertStatus} from './Alert.types';

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
  padding?: SpacingToken;
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
  const hasChildren = isReactNode(children);
  // The body is kept mounted whenever there are children (so child state and
  // the `aria-controls` target survive collapsing); `isExpanded` only drives
  // the visual collapse. `showContent` reflects whether the body is currently
  // revealed, which the header uses to square off its bottom corners.
  const showContent = hasChildren && isExpanded;
  const showEndArea = isReactNode(endContent) || isDismissable || hasChildren;
  const isSingleLine =
    !isReactNode(description) &&
    (isReactNode(endContent) || isDismissable || hasChildren);

  if (isDismissed) {
    return null;
  }

  const classes = alertRecipe({
    container,
    hasContent: showContent,
    isCentered: isSingleLine,
    isExpanded,
    padding,
    status,
  });

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role={statusRole[status]}
      style={style}>
      <div className={classes.header}>
        <span aria-hidden="true" className={classes.icon}>
          {icon ?? defaultIcons[status]}
        </span>
        <div className={classes.content}>
          <Text as="p" type="label" weight="semibold">
            {title}
          </Text>
          {isReactNode(description) ? (
            <Text as="p" color="secondary" type="supporting">
              {description}
            </Text>
          ) : null}
        </div>
        {showEndArea ? (
          <div className={classes.endArea}>
            {endContent}
            {hasChildren ? (
              <Button
                aria-controls={bodyId}
                aria-expanded={isExpanded}
                className={classes.chevron}
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
      {hasChildren ? (
        <div
          className={classes.body}
          id={bodyId}
          style={{visibility: isExpanded ? undefined : 'hidden'}}>
          <div className={classes.bodyContent}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

Alert.displayName = 'Alert';
