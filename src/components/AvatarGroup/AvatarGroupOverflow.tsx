'use client';

import type {CSSProperties, MouseEventHandler, ReactNode, Ref} from 'react';
import {useAvatarGroup} from 'components/AvatarGroup/AvatarGroupContext';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';

const DEFAULT_SIZE = 36;
const BORDER_WIDTH = 2;
const OVERFLOW_FONT_RATIO = 0.35;

/**
 * Overflow indicator for AvatarGroup.
 */
export interface AvatarGroupOverflowProps {
  /**
   * Custom content rendered instead of the default "+N" text.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Number of hidden avatars represented by the overflow indicator.
   */
  count: number;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Click handler. When set, the overflow indicator renders as a button.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    borderWidth: `${BORDER_WIDTH}px`,
    borderStyle: 'solid',
    borderColor: 'bg',
    boxSizing: 'content-box',
    bg: 'bg.subtle',
    color: 'fg.muted',
    fontFamily: 'body',
    fontWeight: 'medium',
    userSelect: 'none',
    '&:not(:first-child)': {
      marginInlineStart: 'var(--avatar-group-overlap)',
    },
  }),
  button: css({
    cursor: 'pointer',
    p: 0,
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
};

/**
 * Overflow indicator showing the count of hidden avatars in an AvatarGroup.
 */
export function AvatarGroupOverflow({
  children,
  className,
  count,
  'data-testid': dataTestId,
  onClick,
  ref,
  style,
}: AvatarGroupOverflowProps): React.JSX.Element | null {
  const group = useAvatarGroup();

  if (count <= 0) {
    return null;
  }

  const numericSize = group?.numericSize ?? DEFAULT_SIZE;
  const label = `${count} more`;
  const content = children ?? `+${count}`;
  const rootStyle: CSSProperties = {
    width: numericSize,
    height: numericSize,
    fontSize: numericSize * OVERFLOW_FONT_RATIO,
    ...style,
  };

  if (onClick != null) {
    return (
      <button
        aria-label={label}
        className={cx(styles.root, styles.button, className)}
        data-testid={dataTestId}
        onClick={onClick}
        ref={ref as Ref<HTMLButtonElement>}
        style={rootStyle}
        type="button">
        {content}
      </button>
    );
  }

  return (
    <span
      aria-label={label}
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={rootStyle}>
      {content}
    </span>
  );
}

AvatarGroupOverflow.displayName = 'AvatarGroupOverflow';
