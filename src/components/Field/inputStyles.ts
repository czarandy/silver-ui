import {css, cva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Border color token per validation status, shared by the input recipe and
 * the Fieldset border so status colors cannot drift between them.
 */
export const statusBorderColor = {
  warning: 'status.warning.border',
  error: 'status.error.border',
  success: 'status.success.border',
} as const;

export const inputRecipe = cva({
  base: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    paddingInlineStart: '3',
    paddingInlineEnd: '1',
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
      boxShadow: 'focus',
      // Keep the focus border color while hovering a focused input; otherwise
      // the equal-specificity `_hover` rule would override it.
      _hover: {
        borderColor: 'primary',
      },
    },
  },
  variants: {
    size: {
      sm: {minH: 'component.sm'},
      md: {minH: 'component.md'},
      lg: {minH: 'component.lg'},
    },
    status: {
      warning: {
        borderColor: statusBorderColor.warning,
        _hover: {borderColor: 'status.warning.borderHover'},
        _focusWithin: {
          borderColor: statusBorderColor.warning,
          boxShadow: 'focus.warning',
          _hover: {borderColor: statusBorderColor.warning},
        },
      },
      error: {
        borderColor: statusBorderColor.error,
        _hover: {borderColor: 'status.error.borderHover'},
        _focusWithin: {
          borderColor: statusBorderColor.error,
          boxShadow: 'focus.error',
          _hover: {borderColor: statusBorderColor.error},
        },
      },
      success: {
        borderColor: statusBorderColor.success,
        _hover: {borderColor: 'status.success.borderHover'},
        _focusWithin: {
          borderColor: statusBorderColor.success,
          boxShadow: 'focus.success',
          _hover: {borderColor: statusBorderColor.success},
        },
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
} as const;
