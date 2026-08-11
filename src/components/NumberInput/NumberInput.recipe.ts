import {sva, type RecipeVariantProps} from 'styled-system/css';

export const numberInputRecipe = sva({
  slots: ['stepper', 'stepperButton'],
  base: {
    stepper: {
      alignSelf: 'stretch',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      marginInlineEnd: '-3',
      borderInlineStartWidth: 'default',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'border',
    },
    stepperButton: {
      display: 'inline-flex',
      flex: 1,
      minH: 0,
      alignItems: 'center',
      justifyContent: 'center',
      appearance: 'none',
      p: 0,
      borderWidth: 0,
      borderStyle: 'none',
      borderRadius: 0,
      color: 'fg.muted',
      bg: 'transparent',
      cursor: 'pointer',
      transitionProperty: 'background-color, color',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      _hover: {
        color: 'fg',
        bg: 'bg.ghost.hover',
      },
      _active: {
        bg: 'bg.ghost.active',
      },
      _disabled: {
        color: 'fg.disabled',
        cursor: 'not-allowed',
        bg: 'transparent',
      },
      _last: {
        borderBlockStartWidth: 'default',
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: 'border',
      },
    },
  },
  variants: {
    size: {
      sm: {stepperButton: {w: '4'}},
      md: {stepperButton: {w: '5'}},
      lg: {stepperButton: {w: '6'}},
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type NumberInputVariants = RecipeVariantProps<typeof numberInputRecipe>;
