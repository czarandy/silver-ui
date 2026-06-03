import {cva, type RecipeVariantProps} from 'styled-system/css';

export const topNavItemRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    minH: '8',
    px: '3',
    py: '1.5',
    borderRadius: 'md',
    color: 'fg.muted',
    textDecoration: 'none',
    fontFamily: 'body',
    fontSize: 'md',
    fontWeight: 'medium',
    cursor: 'pointer',
    _hover: {bg: 'bg.hover'},
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  },
  variants: {
    isSelected: {
      true: {
        bg: 'bg.hover',
        color: 'fg',
        fontWeight: 'semibold',
      },
      false: {},
    },
    isDisabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
      false: {},
    },
    isIconOnly: {
      true: {
        px: '2',
        aspectRatio: 'square',
      },
      false: {},
    },
    isDrawer: {
      true: {
        display: 'flex',
        w: '100%',
      },
      false: {},
    },
  },
  defaultVariants: {
    isSelected: false,
    isDisabled: false,
    isIconOnly: false,
    isDrawer: false,
  },
});

export type TopNavItemVariants = RecipeVariantProps<typeof topNavItemRecipe>;
