import {cva, type RecipeVariantProps} from 'styled-system/css';

export const linkRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    fontFamily: 'body',
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
    },
  },
  variants: {
    size: {
      xs: {fontSize: 'xs'},
      sm: {fontSize: 'sm'},
      md: {fontSize: 'md'},
      lg: {fontSize: 'lg'},
      xl: {fontSize: 'xl'},
      '2xl': {fontSize: '2xl'},
      '3xl': {fontSize: '3xl'},
      '4xl': {fontSize: '4xl'},
      '5xl': {fontSize: '5xl'},
      '6xl': {fontSize: '6xl'},
      inherit: {fontSize: 'inherit'},
    },
    color: {
      primary: {
        color: 'fg',
      },
      secondary: {
        color: 'fg.muted',
      },
      disabled: {
        color: 'silver-neutral.400',
      },
      placeholder: {
        color: 'fg.muted',
      },
      active: {
        color: 'primary',
      },
      inherit: {
        color: 'inherit',
      },
    },
    weight: {
      normal: {fontWeight: 'normal'},
      medium: {fontWeight: 'medium'},
      semibold: {fontWeight: 'semibold'},
      bold: {fontWeight: 'bold'},
      inherit: {fontWeight: 'inherit'},
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
    size: 'md',
    hasUnderline: false,
  },
});

export type LinkVariants = RecipeVariantProps<typeof linkRecipe>;
