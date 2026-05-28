import {css} from 'styled-system/css';
import type {InputSize, InputStatusType} from './types';

export const inputStyles = {
  wrapper: css({
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '3',
    py: '1.5',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.300',
    borderRadius: 'md',
    bg: 'bg',
    transitionProperty: 'border-color, box-shadow, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      borderColor: 'silver-neutral.400',
    },
    _focusWithin: {
      borderColor: 'primary',
      boxShadow: '0 0 0 2px token(colors.primary.subtle)',
    },
    _dark: {
      borderColor: 'silver-neutral.700',
      _hover: {
        borderColor: 'silver-neutral.600',
      },
    },
  }),
  wrapperDisabled: css({
    cursor: 'not-allowed',
    opacity: 0.55,
  }),
  control: css({
    display: 'block',
    flex: 1,
    minW: 0,
    borderWidth: 0,
    borderStyle: 'none',
    p: 0,
    fontFamily: 'body',
    fontSize: 'md',
    lineHeight: 'normal',
    color: 'fg',
    bg: 'transparent',
    outline: 'none',
    _placeholder: {
      color: 'fg.muted',
    },
    _disabled: {
      cursor: 'not-allowed',
    },
  }),
  controlInvalid: css({
    color: 'fg.muted',
  }),
  iconSlot: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'fg.muted',
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  clearButton: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    p: 0,
    borderWidth: 0,
    borderStyle: 'none',
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    borderRadius: 'sm',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  size: {
    sm: css({minH: 'component.sm'}),
    md: css({minH: 'component.md'}),
    lg: css({minH: 'component.lg'}),
  } satisfies Record<InputSize, string>,
  status: {
    warning: css({
      borderColor: 'yellow.500',
      _focusWithin: {borderColor: 'yellow.500'},
    }),
    error: css({
      borderColor: 'red.600',
      _focusWithin: {borderColor: 'red.600'},
    }),
    success: css({
      borderColor: 'green.600',
      _focusWithin: {borderColor: 'green.600'},
    }),
  } satisfies Record<InputStatusType, string>,
} as const;
