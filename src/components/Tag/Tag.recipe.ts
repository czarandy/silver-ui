import {cva, type RecipeVariantProps} from 'styled-system/css';

export const tagRecipe = cva({
  base: {
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
  variants: {
    size: {
      sm: {
        minH: '6',
        px: '2',
        fontSize: 'sm',
      },
      md: {
        minH: '8',
        px: '2',
        fontSize: 'sm',
      },
      lg: {
        minH: '10',
        px: '2.5',
        fontSize: 'md',
      },
    },
    color: {
      default: {
        bg: 'surface.gray',
        color: 'surface.gray.fg',
        _hover: {bg: 'surface.gray.hover'},
      },
      red: {
        bg: 'surface.red',
        color: 'surface.red.fg',
        _hover: {bg: 'surface.red.hover'},
      },
      orange: {
        bg: 'surface.orange',
        color: 'surface.orange.fg',
        _hover: {bg: 'surface.orange.hover'},
      },
      yellow: {
        bg: 'surface.yellow',
        color: 'surface.yellow.fg',
        _hover: {bg: 'surface.yellow.hover'},
      },
      green: {
        bg: 'surface.green',
        color: 'surface.green.fg',
        _hover: {bg: 'surface.green.hover'},
      },
      teal: {
        bg: 'surface.teal',
        color: 'surface.teal.fg',
        _hover: {bg: 'surface.teal.hover'},
      },
      cyan: {
        bg: 'surface.cyan',
        color: 'surface.cyan.fg',
        _hover: {bg: 'surface.cyan.hover'},
      },
      blue: {
        bg: 'surface.blue',
        color: 'surface.blue.fg',
        _hover: {bg: 'surface.blue.hover'},
      },
      purple: {
        bg: 'surface.purple',
        color: 'surface.purple.fg',
        _hover: {bg: 'surface.purple.hover'},
      },
      pink: {
        bg: 'surface.pink',
        color: 'surface.pink.fg',
        _hover: {bg: 'surface.pink.hover'},
      },
      gray: {
        bg: 'surface.gray',
        color: 'surface.gray.fg',
        _hover: {bg: 'surface.gray.hover'},
      },
    },
    isInteractive: {
      true: {
        cursor: 'pointer',
        _focusVisible: {
          outline: '2px solid',
          outlineColor: 'primary',
          outlineOffset: '2px',
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        opacity: 0.55,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
    isInteractive: false,
    isDisabled: false,
  },
});

export type TagVariants = RecipeVariantProps<typeof tagRecipe>;
