import {cva, type RecipeVariantProps} from 'styled-system/css';

export const linkRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
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
    underline: {
      true: {
        textDecoration: 'underline',
      },
      false: {},
    },
    isStandalone: {
      true: {
        fontFamily: 'body',
        fontSize: 'md',
        lineHeight: 'normal',
      },
      false: {},
    },
  },
  defaultVariants: {
    color: 'active',
    underline: false,
    isStandalone: false,
  },
});

export type LinkVariants = RecipeVariantProps<typeof linkRecipe>;
