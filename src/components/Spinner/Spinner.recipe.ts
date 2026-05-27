import {cva, type RecipeVariantProps} from 'styled-system/css';

export const spinnerRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    color: 'primary',
  },
  variants: {
    size: {
      sm: {
        w: '3.5',
        h: '3.5',
        fontSize: '3.5',
      },
      md: {
        w: '5',
        h: '5',
        fontSize: '5',
      },
      lg: {
        w: '6',
        h: '6',
        fontSize: '6',
      },
      xl: {
        w: '9',
        h: '9',
        fontSize: '9',
      },
    },
    shade: {
      default: {
        color: 'primary',
      },
      subtle: {
        color: 'fg.muted',
      },
      onMedia: {
        color: 'white',
      },
    },
    hasLabel: {
      true: {
        flexDirection: 'column',
        gap: '2',
        w: 'auto',
        h: 'auto',
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    shade: 'default',
    hasLabel: false,
  },
});

export type SpinnerVariants = RecipeVariantProps<typeof spinnerRecipe>;
