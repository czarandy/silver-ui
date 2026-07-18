'use client';

import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react';
import {useMemo} from 'react';
import {resolveAvatarSize, type AvatarSize} from 'components/Avatar';
import {avatarGroupRecipe} from 'components/AvatarGroup/AvatarGroup.recipe';
import {AvatarGroupContext} from 'components/AvatarGroup/AvatarGroupContext';
import {cx} from 'utils/cx';

const OVERLAP_RATIO = 0.25;

const rootClass = avatarGroupRecipe();

/**
 * Displays a stacked group of Avatars with shared size and overlap.
 *
 * Unrecognized props (`id`, `tabIndex`, `title`, `data-*`, `aria-*`, event
 * handlers, …) are forwarded to the root `<div>`.
 */
export interface AvatarGroupProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> {
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

type AvatarGroupStyle = CSSProperties & {
  '--avatar-group-overlap': string;
};

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
  ...rest
}: AvatarGroupProps): React.JSX.Element {
  const numericSize = resolveAvatarSize(size);
  const overlap = Math.round(numericSize * OVERLAP_RATIO);
  const contextValue = useMemo(
    () => ({numericSize, overlap, size}),
    [numericSize, overlap, size],
  );
  const rootStyle: AvatarGroupStyle = {
    '--avatar-group-overlap': `${-overlap}px`,
    ...style,
  };

  return (
    <AvatarGroupContext value={contextValue}>
      <div
        {...rest}
        aria-label={ariaLabel}
        className={cx(rootClass, className)}
        data-testid={dataTestId}
        ref={ref}
        role="group"
        style={rootStyle}>
        {children}
      </div>
    </AvatarGroupContext>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
