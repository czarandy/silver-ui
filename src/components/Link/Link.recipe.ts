import {cva, type RecipeVariantProps} from 'styled-system/css';

export const linkRecipe = cva({
  base: {
    display: 'inline-flex',
    appearance: 'none',
    alignItems: 'center',
    padding: 0,
    border: 0,
    background: 'none',
    gap: '1',
    fontFamily: 'body',
    fontWeight: 'inherit',
    lineHeight: 'normal',
    textAlign: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'color, text-decoration-color, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      textDecoration: 'underline',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
    '&[aria-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  variants: {
    // `inline-flex` keeps the external-link icon centered beside the text but
    // makes the whole link one unbreakable box. `inline` lets a link inside a
    // sentence wrap mid-link like the words around it.
    display: {
      'inline-flex': {},
      inline: {display: 'inline'},
    },
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
      inherit: {fontSize: 'inherit', lineHeight: 'inherit'},
    },
    color: {
      primary: {
        color: 'fg',
      },
      secondary: {
        color: 'fg.muted',
      },
      disabled: {
        color: 'fg.disabled',
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
    display: 'inline-flex',
    color: 'active',
    size: 'inherit',
    hasUnderline: false,
  },
});

export const externalLinkIconRecipe = cva({
  base: {
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.875em',
    lineHeight: 1,
  },
  variants: {
    display: {
      'inline-flex': {},
      // Flex `gap` does not apply to an inline link. A margin, unlike a space
      // character, keeps the link text free of stray whitespace.
      inline: {marginInlineStart: '1', verticalAlign: '-0.125em'},
    },
  },
  defaultVariants: {
    display: 'inline-flex',
  },
});

export type LinkVariants = RecipeVariantProps<typeof linkRecipe>;
