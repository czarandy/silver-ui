import {css, cva, type RecipeVariantProps} from 'styled-system/css';

export const inputRecipe = cva({
  base: {
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    px: '3',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
    borderRadius: 'md',
    bg: 'bg',
    transitionProperty: 'border-color, box-shadow, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      borderColor: 'fg.muted',
    },
    _focusWithin: {
      borderColor: 'primary',
      boxShadow: '0 0 0 2px token(colors.primary.subtle)',
    },
  },
  variants: {
    size: {
      sm: {minH: 'component.sm', py: '0.5'},
      md: {minH: 'component.md', py: '1.5'},
      lg: {minH: 'component.lg', py: '2'},
    },
    status: {
      warning: {
        borderColor: 'status.warning.border',
        _hover: {borderColor: 'status.warning.borderHover'},
        _focusWithin: {borderColor: 'status.warning.border'},
      },
      error: {
        borderColor: 'status.error.border',
        _hover: {borderColor: 'status.error.borderHover'},
        _focusWithin: {borderColor: 'status.error.border'},
      },
      success: {
        borderColor: 'status.success.border',
        _hover: {borderColor: 'status.success.borderHover'},
        _focusWithin: {borderColor: 'status.success.border'},
      },
    },
    isDisabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.55,
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    isDisabled: false,
  },
});

export type InputVariants = RecipeVariantProps<typeof inputRecipe>;

export const inputStyles = {
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
  iconSlot: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'fg.muted',
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
  }),
} as const;
