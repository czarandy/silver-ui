import {cva, type RecipeVariantProps} from 'styled-system/css';

export const buttonRecipe = cva({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderStyle: 'none',
    fontFamily: 'body',
    fontWeight: 'medium',
    borderRadius: 'md',
    cursor: 'pointer',
    transitionProperty: 'background-color, color, opacity, transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    userSelect: 'none',
    lineHeight: 'tight',
    whiteSpace: 'nowrap',
    _active: {
      transform: 'scale(0.98)',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
      transform: 'none',
    },
    '&[aria-disabled="true"]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '3px',
    },
  },
  variants: {
    variant: {
      primary: {
        bg: 'primary',
        color: 'white',
        _hover: {bg: 'primary.hover'},
        _active: {bg: 'primary.active'},
      },
      secondary: {
        bg: 'bg.subtle',
        color: 'fg',
        _hover: {bg: 'silver-neutral.100'},
        _active: {bg: 'silver-neutral.200'},
      },
      ghost: {
        color: 'fg',
        bg: 'transparent',
        _hover: {bg: 'bg.subtle'},
        _active: {bg: 'silver-neutral.100'},
      },
      destructive: {
        bg: 'red.600',
        color: 'white',
        _hover: {bg: 'red.700'},
        _active: {bg: 'red.800'},
      },
    },
    size: {
      sm: {h: '8', px: '3', fontSize: 'sm', gap: '1.5'},
      md: {h: '10', px: '4', fontSize: 'md', gap: '2'},
      lg: {h: '12', px: '5', fontSize: 'md', gap: '2.5'},
    },
    iconOnly: {
      true: {
        aspectRatio: 'square',
        px: 0,
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
    iconOnly: false,
  },
});

export type ButtonVariants = RecipeVariantProps<typeof buttonRecipe>;
