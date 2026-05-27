import {cva, type RecipeVariantProps} from 'styled-system/css';

export const textRecipe = cva({
  base: {
    m: 0,
    fontFamily: 'body',
  },
  variants: {
    type: {
      body: {
        fontSize: 'md',
        lineHeight: 'normal',
        fontWeight: 'normal',
      },
      large: {
        fontSize: 'lg',
        lineHeight: 'normal',
        fontWeight: 'normal',
      },
      label: {
        fontSize: 'sm',
        lineHeight: 'snug',
        fontWeight: 'medium',
      },
      supporting: {
        fontSize: 'sm',
        lineHeight: 'normal',
        fontWeight: 'normal',
      },
      code: {
        fontFamily: 'mono',
        fontSize: 'sm',
        lineHeight: 'normal',
        fontWeight: 'normal',
      },
      'display-1': {
        fontSize: '5xl',
        lineHeight: 'tight',
        fontWeight: 'semibold',
      },
      'display-2': {
        fontSize: '4xl',
        lineHeight: 'tight',
        fontWeight: 'semibold',
      },
      'display-3': {
        fontSize: '3xl',
        lineHeight: 'tight',
        fontWeight: 'semibold',
      },
      inherit: {
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        fontWeight: 'inherit',
      },
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
      inherit: {fontSize: 'inherit'},
    },
    color: {
      primary: {color: 'fg'},
      secondary: {color: 'fg.muted'},
      disabled: {color: 'silver-neutral.400'},
      placeholder: {color: 'fg.muted'},
      active: {color: 'primary'},
      inherit: {color: 'inherit'},
    },
    weight: {
      normal: {fontWeight: 'normal'},
      medium: {fontWeight: 'medium'},
      semibold: {fontWeight: 'semibold'},
      bold: {fontWeight: 'bold'},
      inherit: {fontWeight: 'inherit'},
    },
    display: {
      inline: {display: 'inline'},
      block: {display: 'block'},
    },
    wordBreak: {
      'break-word': {
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      },
      'break-all': {
        wordBreak: 'break-all',
      },
    },
    textWrap: {
      wrap: {textWrap: 'wrap'},
      nowrap: {textWrap: 'nowrap'},
      balance: {textWrap: 'balance'},
      pretty: {textWrap: 'pretty'},
    },
    hasCapsize: {
      true: {
        display: 'block',
        textBoxEdge: 'cap alphabetic',
        textBoxTrim: 'trim-both',
      },
      false: {},
    },
    hasStrikethrough: {
      true: {textDecoration: 'line-through'},
      false: {},
    },
    hasTabularNumbers: {
      true: {fontVariantNumeric: 'tabular-nums'},
      false: {},
    },
    maxLines: {
      none: {},
      one: {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      multiple: {
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
      },
    },
  },
  defaultVariants: {
    type: 'body',
    color: 'primary',
    display: 'inline',
    hasCapsize: false,
    hasStrikethrough: false,
    hasTabularNumbers: false,
    maxLines: 'none',
  },
});

export const headingRecipe = cva({
  base: {
    m: 0,
    fontFamily: 'body',
    fontWeight: 'semibold',
    color: 'fg',
  },
  variants: {
    level: {
      1: {fontSize: '4xl', lineHeight: 'tight'},
      2: {fontSize: '3xl', lineHeight: 'tight'},
      3: {fontSize: '2xl', lineHeight: 'snug'},
      4: {fontSize: 'xl', lineHeight: 'snug'},
      5: {fontSize: 'lg', lineHeight: 'snug'},
      6: {fontSize: 'md', lineHeight: 'snug'},
    },
    type: {
      'display-1': {
        fontSize: '5xl',
        lineHeight: 'tight',
      },
      'display-2': {
        fontSize: '4xl',
        lineHeight: 'tight',
      },
      'display-3': {
        fontSize: '3xl',
        lineHeight: 'tight',
      },
    },
    color: {
      primary: {color: 'fg'},
      secondary: {color: 'fg.muted'},
      disabled: {color: 'silver-neutral.400'},
      placeholder: {color: 'fg.muted'},
      active: {color: 'primary'},
      inherit: {color: 'inherit'},
    },
    display: {
      inline: {display: 'inline'},
      block: {display: 'block'},
    },
    wordBreak: {
      'break-word': {
        wordBreak: 'normal',
        overflowWrap: 'break-word',
      },
      'break-all': {
        wordBreak: 'break-all',
      },
    },
    textWrap: {
      wrap: {textWrap: 'wrap'},
      nowrap: {textWrap: 'nowrap'},
      balance: {textWrap: 'balance'},
      pretty: {textWrap: 'pretty'},
    },
    hasCapsize: {
      true: {
        display: 'block',
        textBoxEdge: 'cap alphabetic',
        textBoxTrim: 'trim-both',
      },
      false: {},
    },
    hasStrikethrough: {
      true: {textDecoration: 'line-through'},
      false: {},
    },
    maxLines: {
      none: {},
      one: {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      multiple: {
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
      },
    },
  },
  defaultVariants: {
    level: 2,
    color: 'primary',
    display: 'block',
    hasCapsize: false,
    hasStrikethrough: false,
    maxLines: 'none',
  },
});

export type TextVariants = RecipeVariantProps<typeof textRecipe>;
export type HeadingVariants = RecipeVariantProps<typeof headingRecipe>;
