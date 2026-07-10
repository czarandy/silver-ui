import {cva, sva, type RecipeVariantProps} from 'styled-system/css';

export const colorSwatchPickerRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2',
  },
});

export const colorSwatchRecipe = sva({
  slots: ['button', 'fill'],
  base: {
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      p: '1',
      borderWidth: 0,
      borderStyle: 'none',
      borderRadius: 'full',
      bg: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    fill: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 'thin',
      borderStyle: 'solid',
      borderRadius: 'full',
      transitionProperty: 'border-color, border-width, box-shadow, transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
    },
  },
  variants: {
    color: {
      red: {
        fill: {
          bg: 'surface.red',
          borderColor: 'surface.red.accent',
          color: 'surface.red.fg',
        },
      },
      orange: {
        fill: {
          bg: 'surface.orange',
          borderColor: 'surface.orange.accent',
          color: 'surface.orange.fg',
        },
      },
      yellow: {
        fill: {
          bg: 'surface.yellow',
          borderColor: 'surface.yellow.accent',
          color: 'surface.yellow.fg',
        },
      },
      green: {
        fill: {
          bg: 'surface.green',
          borderColor: 'surface.green.accent',
          color: 'surface.green.fg',
        },
      },
      teal: {
        fill: {
          bg: 'surface.teal',
          borderColor: 'surface.teal.accent',
          color: 'surface.teal.fg',
        },
      },
      cyan: {
        fill: {
          bg: 'surface.cyan',
          borderColor: 'surface.cyan.accent',
          color: 'surface.cyan.fg',
        },
      },
      blue: {
        fill: {
          bg: 'surface.blue',
          borderColor: 'surface.blue.accent',
          color: 'surface.blue.fg',
        },
      },
      purple: {
        fill: {
          bg: 'surface.purple',
          borderColor: 'surface.purple.accent',
          color: 'surface.purple.fg',
        },
      },
      pink: {
        fill: {
          bg: 'surface.pink',
          borderColor: 'surface.pink.accent',
          color: 'surface.pink.fg',
        },
      },
      gray: {
        fill: {
          bg: 'surface.gray',
          borderColor: 'surface.gray.accent',
          color: 'surface.gray.fg',
        },
      },
    },
    size: {
      sm: {fill: {h: '6', w: '6'}},
      md: {fill: {h: '8', w: '8'}},
      lg: {fill: {h: '10', w: '10'}},
    },
    isSelected: {
      true: {
        fill: {
          borderWidth: 'thick',
          boxShadow: 'sm',
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        button: {
          cursor: 'not-allowed',
          opacity: 0.55,
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    isSelected: false,
    isDisabled: false,
  },
});

export type ColorSwatchVariants = RecipeVariantProps<typeof colorSwatchRecipe>;
