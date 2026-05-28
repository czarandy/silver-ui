import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAvatarSize} from './AvatarSizeContext';

export type AvatarStatusDotVariant = 'success' | 'neutral' | 'error';

/**
 * Size-aware status indicator intended for Avatar's `status` prop.
 */
export interface AvatarStatusDotProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Optional icon rendered inside medium and large dots.
   */
  icon?: ReactNode;
  /**
   * Accessible label describing the status, such as "Online".
   */
  label?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Semantic dot color. Default is `success`.
   */
  variant?: AvatarStatusDotVariant;
}

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    borderStyle: 'solid',
    borderColor: 'bg',
    boxSizing: 'border-box',
  }),
  success: css({
    bg: 'green.500',
  }),
  neutral: css({
    bg: 'silver-neutral.500',
  }),
  error: css({
    bg: 'red.600',
  }),
  icon: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    lineHeight: 0,
    '& > svg': {
      w: '100%',
      h: '100%',
    },
  }),
};

const variantClassName: Record<AvatarStatusDotVariant, string> = {
  success: styles.success,
  neutral: styles.neutral,
  error: styles.error,
};

function resolveStatusDotSize(avatarSize: number): {
  borderWidth: number;
  dotSize: number;
  iconSize: number;
} {
  if (avatarSize <= 36) {
    return {borderWidth: 1, dotSize: 10, iconSize: 0};
  }

  if (avatarSize <= 72) {
    return {borderWidth: 2, dotSize: 20, iconSize: 12};
  }

  return {borderWidth: 4, dotSize: 32, iconSize: 18};
}

export function AvatarStatusDot({
  className,
  'data-testid': dataTestId,
  icon,
  label,
  ref,
  style,
  variant = 'success',
}: AvatarStatusDotProps): React.JSX.Element {
  const avatarSize = useAvatarSize();
  const {borderWidth, dotSize, iconSize} = resolveStatusDotSize(avatarSize);
  const hasVisibleIcon = icon != null && iconSize > 0;

  return (
    <div
      aria-label={label}
      className={cx(styles.root, variantClassName[variant], className)}
      data-testid={dataTestId}
      ref={ref}
      role={label != null ? 'img' : undefined}
      style={{width: dotSize, height: dotSize, borderWidth, ...style}}>
      {hasVisibleIcon ? (
        <span
          aria-hidden="true"
          className={styles.icon}
          style={{width: iconSize, height: iconSize}}>
          {icon}
        </span>
      ) : null}
    </div>
  );
}

AvatarStatusDot.displayName = 'AvatarStatusDot';
