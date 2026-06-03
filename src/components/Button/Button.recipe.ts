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
      pointerEvents: 'auto',
      transform: 'none',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffsetLoose',
    },
  },
  variants: {
    variant: {
      primary: {
        bg: 'primary',
        color: 'fg.onPrimary',
        _hover: {bg: 'primary.hover'},
        _active: {bg: 'primary.active'},
      },
      secondary: {
        bg: 'bg.subtle',
        color: 'fg',
        _hover: {bg: 'bg.hover'},
        _active: {bg: 'surface.gray.hover'},
      },
      ghost: {
        color: 'fg',
        bg: 'transparent',
        _hover: {bg: 'bg.ghost.hover'},
        _active: {bg: 'bg.ghost.active'},
      },
      destructive: {
        bg: 'destructive',
        color: 'destructive.fg',
        _hover: {bg: 'destructive.hover'},
        _active: {bg: 'destructive.active'},
        _focusVisible: {
          outlineColor: 'destructive',
        },
      },
      onSolid: {
        color: 'inherit',
        bg: 'transparent',
        _hover: {bg: 'color-mix(in srgb, currentColor 15%, transparent)'},
        _active: {bg: 'color-mix(in srgb, currentColor 20%, transparent)'},
        _focusVisible: {
          outlineColor: 'currentColor',
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
        '--button-icon-size': 'var(--silver-sizes-icon-sm)',
      },
      md: {
        h: 'component.md',
        px: 'component.md',
        fontSize: 'component.md',
        gap: '2',
        borderRadius: 'component.md',
        '--button-icon-size': 'var(--silver-sizes-icon-md)',
      },
      lg: {
        h: 'component.lg',
        px: 'component.lg',
        fontSize: 'component.lg',
        gap: '2.5',
        borderRadius: 'component.lg',
        '--button-icon-size': 'var(--silver-sizes-icon-lg)',
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
