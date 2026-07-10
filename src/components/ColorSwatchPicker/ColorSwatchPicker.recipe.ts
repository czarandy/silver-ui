import {cva, sva, type RecipeVariantProps} from 'styled-system/css';

export const colorSwatchPickerRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1',
  },
});

/**
 * The button reserves `spacing.1` of padding around the circle so the selected
 * ring and the focus ring both draw inside the button's own box, never over a
 * neighboring swatch. Both rings occupy the same 2px–4px band outside the
 * circle, so a focused swatch shows the primary outline in place of its
 * selected ring; the check icon still marks which swatch is selected.
 */
export const colorSwatchRecipe = sva({
  slots: ['button', 'fill', 'icon'],
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
        outline: 'none',
      },
    },
    fill: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 'thin',
      borderStyle: 'solid',
      borderRadius: 'full',
      transitionProperty: 'box-shadow, transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0s',
      },
      '[role="radio"]:hover &': {
        transform: 'scale(1.12)',
      },
      '[role="radio"]:focus-visible &': {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    icon: {
      mt: '1px',
    },
  },
  variants: {
    color: {
      red: {
        fill: {
          '--swatch-ring': 'token(colors.surface.red.accent)',
          bg: 'surface.red',
          borderColor: 'surface.red.accent',
          color: 'surface.red.fg',
        },
      },
      orange: {
        fill: {
          '--swatch-ring': 'token(colors.surface.orange.accent)',
          bg: 'surface.orange',
          borderColor: 'surface.orange.accent',
          color: 'surface.orange.fg',
        },
      },
      yellow: {
        fill: {
          '--swatch-ring': 'token(colors.surface.yellow.accent)',
          bg: 'surface.yellow',
          borderColor: 'surface.yellow.accent',
          color: 'surface.yellow.fg',
        },
      },
      green: {
        fill: {
          '--swatch-ring': 'token(colors.surface.green.accent)',
          bg: 'surface.green',
          borderColor: 'surface.green.accent',
          color: 'surface.green.fg',
        },
      },
      teal: {
        fill: {
          '--swatch-ring': 'token(colors.surface.teal.accent)',
          bg: 'surface.teal',
          borderColor: 'surface.teal.accent',
          color: 'surface.teal.fg',
        },
      },
      cyan: {
        fill: {
          '--swatch-ring': 'token(colors.surface.cyan.accent)',
          bg: 'surface.cyan',
          borderColor: 'surface.cyan.accent',
          color: 'surface.cyan.fg',
        },
      },
      blue: {
        fill: {
          '--swatch-ring': 'token(colors.surface.blue.accent)',
          bg: 'surface.blue',
          borderColor: 'surface.blue.accent',
          color: 'surface.blue.fg',
        },
      },
      purple: {
        fill: {
          '--swatch-ring': 'token(colors.surface.purple.accent)',
          bg: 'surface.purple',
          borderColor: 'surface.purple.accent',
          color: 'surface.purple.fg',
        },
      },
      pink: {
        fill: {
          '--swatch-ring': 'token(colors.surface.pink.accent)',
          bg: 'surface.pink',
          borderColor: 'surface.pink.accent',
          color: 'surface.pink.fg',
        },
      },
      gray: {
        fill: {
          '--swatch-ring': 'token(colors.surface.gray.accent)',
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
          boxShadow:
            '0 0 0 2px token(colors.bg), 0 0 0 4px var(--swatch-ring, token(colors.border.emphasized))',
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
        fill: {
          '[role="radio"]:hover &': {
            transform: 'none',
          },
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
