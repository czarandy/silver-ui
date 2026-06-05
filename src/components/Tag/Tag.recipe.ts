import {sva, type RecipeVariantProps} from 'styled-system/css';

export const tagRecipe = sva({
  slots: ['root', 'body', 'label', 'removeButton'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      maxW: 'full',
      overflow: 'hidden',
      borderWidth: 0,
      borderRadius: 'sm',
      fontFamily: 'body',
      fontWeight: 'medium',
      lineHeight: 'normal',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      _hover: {
        textDecoration: 'none',
      },
    },
    body: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'inherit',
      p: 0,
      borderWidth: 0,
      font: 'inherit',
      color: 'inherit',
      bg: 'transparent',
      cursor: 'pointer',
      minW: 0,
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    label: {
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    removeButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      p: 0,
      borderWidth: 0,
      borderRadius: 'full',
      bg: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      _hover: {
        opacity: 0.7,
      },
      _active: {
        opacity: 0.5,
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
  },
  variants: {
    size: {
      sm: {
        root: {
          minH: '6',
          px: '2',
          fontSize: 'sm',
        },
      },
      md: {
        root: {
          minH: '8',
          px: '2',
          fontSize: 'sm',
        },
      },
      lg: {
        root: {
          minH: '10',
          px: '2.5',
          fontSize: 'md',
        },
      },
    },
    color: {
      red: {
        root: {
          bg: 'surface.red',
          color: 'surface.red.fg',
          _hover: {bg: 'surface.red.hover'},
        },
      },
      orange: {
        root: {
          bg: 'surface.orange',
          color: 'surface.orange.fg',
          _hover: {bg: 'surface.orange.hover'},
        },
      },
      yellow: {
        root: {
          bg: 'surface.yellow',
          color: 'surface.yellow.fg',
          _hover: {bg: 'surface.yellow.hover'},
        },
      },
      green: {
        root: {
          bg: 'surface.green',
          color: 'surface.green.fg',
          _hover: {bg: 'surface.green.hover'},
        },
      },
      teal: {
        root: {
          bg: 'surface.teal',
          color: 'surface.teal.fg',
          _hover: {bg: 'surface.teal.hover'},
        },
      },
      cyan: {
        root: {
          bg: 'surface.cyan',
          color: 'surface.cyan.fg',
          _hover: {bg: 'surface.cyan.hover'},
        },
      },
      blue: {
        root: {
          bg: 'surface.blue',
          color: 'surface.blue.fg',
          _hover: {bg: 'surface.blue.hover'},
        },
      },
      purple: {
        root: {
          bg: 'surface.purple',
          color: 'surface.purple.fg',
          _hover: {bg: 'surface.purple.hover'},
        },
      },
      pink: {
        root: {
          bg: 'surface.pink',
          color: 'surface.pink.fg',
          _hover: {bg: 'surface.pink.hover'},
        },
      },
      gray: {
        root: {
          bg: 'surface.gray',
          color: 'surface.gray.fg',
          _hover: {bg: 'surface.gray.hover'},
        },
      },
    },
    isInteractive: {
      true: {
        root: {
          cursor: 'pointer',
          _focusVisible: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
        },
      },
    },
    isDisabled: {
      true: {
        root: {
          opacity: 0.55,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
      },
    },
    /**
     * When true, the root element is the interactive element itself
     * (a bare `<button>`) and needs native button styling reset.
     */
    isRootInteractive: {
      true: {
        root: {
          p: 0,
          borderWidth: 0,
          font: 'inherit',
          cursor: 'pointer',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'gray',
  },
});

export type TagVariants = RecipeVariantProps<typeof tagRecipe>;
