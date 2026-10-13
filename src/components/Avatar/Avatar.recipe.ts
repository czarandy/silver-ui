import {sva, type RecipeVariantProps} from 'styled-system/css';

export const avatarRecipe = sva({
  slots: ['root', 'content', 'image', 'fallback', 'status'],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      flexShrink: 0,
      verticalAlign: 'middle',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      userSelect: 'none',
    },
    image: {
      w: '100%',
      h: '100%',
      objectFit: 'cover',
    },
    fallback: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '100%',
      h: '100%',
      fontFamily: 'body',
      fontWeight: 'medium',
      textTransform: 'uppercase',
    },
    status: {
      position: 'absolute',
    },
  },
  variants: {
    shape: {
      circle: {
        root: {borderRadius: 'full'},
        content: {borderRadius: 'full'},
      },
      rounded: {
        root: {borderRadius: 'lg'},
        content: {borderRadius: 'lg'},
      },
      square: {
        root: {borderRadius: 0},
        content: {borderRadius: 0},
      },
    },
    hasInitials: {
      true: {},
      false: {},
    },
    hasTooltip: {
      true: {
        root: {
          _focusVisible: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
        },
      },
      false: {},
    },
    isLarge: {
      true: {},
      false: {},
    },
    is24Px: {
      true: {
        content: {paddingTop: '1px'},
      },
      false: {},
    },
    color: {
      red: {
        content: {bg: 'surface.red', color: 'surface.red.fg'},
        fallback: {bg: 'surface.red', color: 'surface.red.fg'},
      },
      orange: {
        content: {bg: 'surface.orange', color: 'surface.orange.fg'},
        fallback: {bg: 'surface.orange', color: 'surface.orange.fg'},
      },
      yellow: {
        content: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
        fallback: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
      },
      green: {
        content: {bg: 'surface.green', color: 'surface.green.fg'},
        fallback: {bg: 'surface.green', color: 'surface.green.fg'},
      },
      teal: {
        content: {bg: 'surface.teal', color: 'surface.teal.fg'},
        fallback: {bg: 'surface.teal', color: 'surface.teal.fg'},
      },
      cyan: {
        content: {bg: 'surface.cyan', color: 'surface.cyan.fg'},
        fallback: {bg: 'surface.cyan', color: 'surface.cyan.fg'},
      },
      blue: {
        content: {bg: 'surface.blue', color: 'surface.blue.fg'},
        fallback: {bg: 'surface.blue', color: 'surface.blue.fg'},
      },
      purple: {
        content: {bg: 'surface.purple', color: 'surface.purple.fg'},
        fallback: {bg: 'surface.purple', color: 'surface.purple.fg'},
      },
      pink: {
        content: {bg: 'surface.pink', color: 'surface.pink.fg'},
        fallback: {bg: 'surface.pink', color: 'surface.pink.fg'},
      },
      gray: {
        content: {bg: 'surface.gray', color: 'surface.gray.fg'},
        fallback: {bg: 'surface.gray', color: 'surface.gray.fg'},
      },
    },
    isGrouped: {
      true: {
        root: {
          borderWidth: 'emphasized',
          borderStyle: 'solid',
          borderColor: 'bg',
          bg: 'bg',
          boxSizing: 'content-box',
          '&:not(:first-child)': {
            marginInlineStart: 'var(--avatar-group-overlap)',
          },
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      hasInitials: true,
      isLarge: false,
      css: {fallback: {paddingBottom: '1px'}},
    },
    {
      hasInitials: true,
      isLarge: true,
      css: {fallback: {paddingBottom: '2px'}},
    },
  ],
  defaultVariants: {
    shape: 'circle',
    hasInitials: false,
    hasTooltip: false,
    is24Px: false,
    isLarge: false,
    color: 'gray',
    isGrouped: false,
  },
});

export type AvatarVariants = RecipeVariantProps<typeof avatarRecipe>;
