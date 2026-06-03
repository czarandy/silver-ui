import {User} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo, useState} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAvatarGroup} from '../AvatarGroup/AvatarGroupContext';
import {Icon} from '../Icon';
import {avatarRecipe} from './Avatar.recipe';
import {AvatarSizeContext} from './AvatarSizeContext';

const CIRCLE_EDGE_OFFSET_RATIO = (1 - 1 / Math.SQRT2) / 2;
const INITIALS_FONT_SIZE_RATIO = 0.4;

export type AvatarNamedSize = 'tiny' | 'xsmall' | 'small' | 'medium' | 'large';

export type AvatarNumericSize =
  | 16
  | 20
  | 24
  | 32
  | 36
  | 40
  | 48
  | 60
  | 64
  | 72
  | 96
  | 128
  | 144
  | 180;

export type AvatarSize = AvatarNamedSize | AvatarNumericSize;

/**
 * Resolve an Avatar size token to its pixel size.
 */
export function resolveAvatarSize(size: AvatarSize): number {
  if (typeof size === 'number') {
    return size;
  }

  switch (size) {
    case 'tiny':
      return 20;
    case 'xsmall':
      return 24;
    case 'small':
      return 36;
    case 'medium':
      return 48;
    case 'large':
      return 128;
  }
}

/**
 * Displays a user profile image, initials, or a fallback icon.
 */
export interface AvatarProps {
  /**
   * Accessible text for the avatar image. Defaults to `name`, then "Avatar".
   */
  alt?: string;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Image URL to use if `src` fails to load.
   */
  fallbackSrc?: string;
  /**
   * User name used as fallback accessible text and initials.
   */
  name?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Avatar size. Named sizes map to the same pixel values as the XDS source.
   * Default is `small`.
   */
  size?: AvatarSize;
  /**
   * Primary image URL.
   */
  src?: string;
  /**
   * Corner content, usually an AvatarStatusDot.
   */
  status?: ReactNode;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  content: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    overflow: 'hidden',
    userSelect: 'none',
    bg: 'bg.subtle',
    color: 'fg.muted',
  }),
  image: css({
    w: '100%',
    h: '100%',
    objectFit: 'cover',
  }),
  fallback: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '100%',
    h: '100%',
    bg: 'bg.subtle',
    color: 'fg.muted',
    fontFamily: 'body',
    fontWeight: 'medium',
    textTransform: 'uppercase',
  }),
  status: css({
    position: 'absolute',
  }),
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '';
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return `${words[0].charAt(0)}${words[words.length - 1].charAt(
    0,
  )}`.toUpperCase();
}

export function Avatar({
  alt,
  className,
  'data-testid': dataTestId,
  fallbackSrc,
  name,
  ref,
  size = 'small',
  src,
  style,
  status,
}: AvatarProps): React.JSX.Element {
  const avatarGroup = useAvatarGroup();
  const resolvedSize = avatarGroup?.size ?? size;
  const numericSize = useMemo(
    () => resolveAvatarSize(resolvedSize),
    [resolvedSize],
  );
  const initials = name != null ? getInitials(name) : '';
  const showInitials = initials !== '';
  const accessibleName = alt ?? (showInitials ? name : undefined) ?? 'Avatar';
  const contentStyle = {
    width: numericSize,
    height: numericSize,
  };
  const fallbackStyle = {
    fontSize: numericSize * INITIALS_FONT_SIZE_RATIO,
  };
  const statusStyle = {
    bottom: numericSize * CIRCLE_EDGE_OFFSET_RATIO,
    right: numericSize * CIRCLE_EDGE_OFFSET_RATIO,
    transform: 'translate(50%, 50%)',
  };

  return (
    <AvatarSizeContext value={numericSize}>
      <div
        aria-label={accessibleName}
        className={cx(
          avatarRecipe({isGrouped: avatarGroup != null}),
          className,
        )}
        data-testid={dataTestId}
        ref={ref}
        role="img"
        style={style}>
        <div className={styles.content} style={contentStyle}>
          <AvatarImage
            fallbackSrc={fallbackSrc}
            key={`${src}\0${fallbackSrc}`}
            src={src}>
            {showInitials ? (
              <div className={styles.fallback} style={fallbackStyle}>
                {initials}
              </div>
            ) : (
              <div className={styles.fallback}>
                <Icon
                  icon={User}
                  size={
                    numericSize < 48 ? 'sm' : numericSize < 96 ? 'md' : 'lg'
                  }
                />
              </div>
            )}
          </AvatarImage>
        </div>
        {status != null ? (
          <div className={styles.status} style={statusStyle}>
            {status}
          </div>
        ) : null}
      </div>
    </AvatarSizeContext>
  );
}

function AvatarImage({
  children,
  fallbackSrc,
  src,
}: {
  children: ReactNode;
  fallbackSrc?: string;
  src?: string;
}): React.JSX.Element {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const showImage = src != null && src !== '' && !imageError;
  const showFallbackImage =
    !showImage && fallbackSrc != null && fallbackSrc !== '' && !fallbackError;

  if (showImage) {
    return (
      <img
        alt=""
        className={styles.image}
        onError={() => setImageError(true)}
        src={src}
      />
    );
  }

  if (showFallbackImage) {
    return (
      <img
        alt=""
        className={styles.image}
        onError={() => setFallbackError(true)}
        src={fallbackSrc}
      />
    );
  }

  return <>{children}</>;
}

Avatar.displayName = 'Avatar';
