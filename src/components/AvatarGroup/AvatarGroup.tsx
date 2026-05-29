import type {CSSProperties, ReactNode, Ref} from 'react';
import {useMemo} from 'react';
import {cx} from '../../internal/cx';
import {resolveAvatarSize, type AvatarSize} from '../Avatar';
import {avatarGroupRecipe} from './AvatarGroup.recipe';
import {AvatarGroupContext} from './AvatarGroupContext';

const OVERLAP_RATIO = 0.25;

/**
 * Displays a stacked group of Avatars with shared size and overlap.
 */
export interface AvatarGroupProps {
  /**
   * Accessible label for the group. Default is "Avatars".
   */
  'aria-label'?: string;
  /**
   * Avatar and AvatarGroupOverflow children.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Size applied to child Avatars. Individual Avatar size props are ignored
   * while inside the group so the stack remains visually consistent.
   */
  size?: AvatarSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Displays a stacked group of Avatars with shared size and overlap.
 */
export function AvatarGroup({
  'aria-label': ariaLabel = 'Avatars',
  children,
  className,
  'data-testid': dataTestId,
  ref,
  size = 'small',
  style,
}: AvatarGroupProps): React.JSX.Element {
  const numericSize = resolveAvatarSize(size);
  const overlap = Math.round(numericSize * OVERLAP_RATIO);
  const contextValue = useMemo(
    () => ({numericSize, overlap, size}),
    [numericSize, overlap, size],
  );

  return (
    <AvatarGroupContext value={contextValue}>
      <div
        aria-label={ariaLabel}
        className={cx(avatarGroupRecipe(), className)}
        data-testid={dataTestId}
        ref={ref}
        role="group"
        style={style}>
        {children}
      </div>
    </AvatarGroupContext>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
