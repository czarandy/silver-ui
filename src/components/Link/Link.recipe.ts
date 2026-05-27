import {cva, type RecipeVariantProps} from 'styled-system/css';

export const linkRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    fontFamily: 'body',
    fontSize: 'md',
    fontWeight: 'inherit',
    lineHeight: 'normal',
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'color, text-decoration-color, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      textDecoration: 'underline',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    '&[aria-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
  variants: {
    color: {
      active: {
        color: 'primary',
      },
      primary: {
        color: 'fg',
      },
      secondary: {
        color: 'fg.muted',
      },
      inherit: {
        color: 'inherit',
      },
    },
    hasUnderline: {
      true: {
        textDecoration: 'underline',
      },
      false: {},
    },
  },
  defaultVariants: {
    color: 'active',
    hasUnderline: false,
  },
});

export type LinkVariants = RecipeVariantProps<typeof linkRecipe>;
