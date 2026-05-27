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
    cursor: 'pointer',
    transitionProperty: 'background-color, color, opacity, transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    userSelect: 'none',
    lineHeight: 'tight',
    textDecoration: 'none',
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
        _focusVisible: {
          outlineColor: 'red.600',
        },
      },
    },
    size: {
      sm: {
        h: 'component.sm',
        px: 'component.sm',
        fontSize: 'component.sm',
        gap: '1.5',
        borderRadius: 'component.sm',
      },
      md: {
        h: 'component.md',
        px: 'component.md',
        fontSize: 'component.md',
        gap: '2',
        borderRadius: 'component.md',
      },
      lg: {
        h: 'component.lg',
        px: 'component.lg',
        fontSize: 'component.lg',
        gap: '2.5',
        borderRadius: 'component.lg',
      },
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
