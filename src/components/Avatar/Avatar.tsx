'use client';

import {User} from 'lucide-react';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {useMemo, useState} from 'react';
import {avatarRecipe} from 'components/Avatar/Avatar.recipe';
import {AvatarSizeContext} from 'components/Avatar/AvatarSizeContext';
import {useAvatarGroup} from 'components/AvatarGroup/AvatarGroupContext';
import {Icon} from 'components/Icon';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

const CIRCLE_EDGE_OFFSET_RATIO = (1 - 1 / Math.SQRT2) / 2;
const INITIALS_FONT_SIZE_RATIO = 0.4;

export type AvatarNamedSize = 'tiny' | 'xsmall' | 'small' | 'medium' | 'large';

export type AvatarNumericSize =
  16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180;

export type AvatarSize = AvatarNamedSize | AvatarNumericSize;

export type AvatarColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

/**
 * Non-gray hues used when deriving a color from the avatar's name.
 */
const AVATAR_AUTO_COLORS: AvatarColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'cyan',
  'blue',
  'purple',
  'pink',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Resolve the avatar surface color: an explicit `color` wins, otherwise a hue
 * is derived deterministically from `name`. Falls back to `gray` when there are
 * no initials to color (e.g. the default icon).
 */
function resolveAvatarColor(
  color: AvatarColor | undefined,
  name: string | undefined,
  hasInitials: boolean,
): AvatarColor {
  if (color != null) {
    return color;
  }

  if (hasInitials && name != null) {
    return AVATAR_AUTO_COLORS[hashName(name) % AVATAR_AUTO_COLORS.length];
  }

  return 'gray';
}

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
 *
 * Unrecognized props (`id`, `tabIndex`, `title`, `data-*`, `aria-*`, event
 * handlers, …) are forwarded to the root `<div>`.
 */
export interface AvatarProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'color'
> {
  /**
   * Accessible text for the avatar image. Defaults to `name`, then "Avatar".
   */
  alt?: string;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Surface color for the initials/icon fallback, which also drives the text
   * color. When omitted, a hue is derived deterministically from `name`
   * (fallbacks without initials use `gray`).
   */
  color?: AvatarColor;
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
  color,
  'data-testid': dataTestId,
  fallbackSrc,
  name,
  ref,
  size = 'small',
  src,
  style,
  status,
  ...rest
}: AvatarProps): React.JSX.Element {
  const avatarGroup = useAvatarGroup();
  const resolvedSize = avatarGroup?.size ?? size;
  const numericSize = useMemo(
    () => resolveAvatarSize(resolvedSize),
    [resolvedSize],
  );
  const initials = name != null ? getInitials(name) : '';
  const showInitials = initials !== '';
  const classes = avatarRecipe({
    color: resolveAvatarColor(color, name, showInitials),
    hasInitials: showInitials,
    isGrouped: avatarGroup != null,
  });
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
        {...rest}
        aria-label={accessibleName}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        role="img"
        style={style}>
        <div className={classes.content} style={contentStyle}>
          <AvatarImage
            classes={classes}
            fallbackSrc={fallbackSrc}
            key={`${src}\0${fallbackSrc}`}
            src={src}>
            {showInitials ? (
              <div className={classes.fallback} style={fallbackStyle}>
                {initials}
              </div>
            ) : (
              <div className={classes.fallback}>
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
        {isReactNode(status) ? (
          <div className={classes.status} style={statusStyle}>
            {status}
          </div>
        ) : null}
      </div>
    </AvatarSizeContext>
  );
}

function AvatarImage({
  children,
  classes,
  fallbackSrc,
  src,
}: {
  children: ReactNode;
  classes: {image?: string};
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
        className={classes.image}
        onError={() => setImageError(true)}
        src={src}
      />
    );
  }

  if (showFallbackImage) {
    return (
      <img
        alt=""
        className={classes.image}
        onError={() => setFallbackError(true)}
        src={fallbackSrc}
      />
    );
  }

  return <>{children}</>;
}

Avatar.displayName = 'Avatar';
