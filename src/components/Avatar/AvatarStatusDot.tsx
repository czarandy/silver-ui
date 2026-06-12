import type {CSSProperties, ReactNode, Ref} from 'react';
import {useAvatarSize} from 'components/Avatar/AvatarSizeContext';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';
import isReactNode from '../../internal/isReactNode';

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
  label: string;
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
  }),
  success: css({
    bg: 'presence.success',
  }),
  neutral: css({
    bg: 'presence.neutral',
  }),
  error: css({
    bg: 'presence.error',
  }),
  icon: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'fg.onPrimary',
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

/**
 * Size-aware status indicator dot rendered in the corner of an Avatar.
 */
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
  const hasVisibleIcon = isReactNode(icon) && iconSize > 0;

  if (process.env.NODE_ENV !== 'production') {
    if (isReactNode(icon) && iconSize === 0) {
      console.warn(
        'AvatarStatusDot: `icon` is not visible at avatar sizes 36px or ' +
          'smaller. Use a larger avatar size or remove the `icon` prop.',
      );
    }
  }

  return (
    <div
      aria-label={label}
      className={cx(styles.root, variantClassName[variant], className)}
      data-testid={dataTestId}
      ref={ref}
      role="img"
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
