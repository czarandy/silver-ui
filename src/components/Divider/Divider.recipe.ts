import {sva, type RecipeVariantProps} from 'styled-system/css';

export const dividerRecipe = sva({
  slots: ['root', 'line', 'label'],
  base: {
    root: {
      color: 'fg.muted',
      alignItems: 'center',
    },
    line: {
      flex: 1,
    },
    label: {
      flexShrink: 0,
      fontFamily: 'body',
      fontSize: 'sm',
      color: 'fg.muted',
    },
  },
  variants: {
    orientation: {
      horizontal: {
        root: {display: 'flex', w: '100%'},
        line: {h: '1px'},
        label: {px: '3'},
      },
      vertical: {
        root: {display: 'inline-flex', flexDirection: 'column', h: '100%'},
        line: {w: '1px'},
        label: {py: '3'},
      },
    },
    variant: {
      subtle: {line: {bg: 'border'}},
      strong: {line: {bg: 'border.emphasized'}},
    },
    // Marker variant; the real full-bleed styling is orientation-dependent, so
    // it lives in compoundVariants below.
    isFullBleed: {
      true: {},
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      isFullBleed: true,
      css: {
        root: {
          mx: 'calc(-1 * var(--card-padding, 0px))',
          w: 'calc(100% + var(--card-padding, 0px) * 2)',
        },
      },
    },
    {
      orientation: 'vertical',
      isFullBleed: true,
      css: {
        root: {
          my: 'calc(-1 * var(--card-padding, 0px))',
          h: 'calc(100% + var(--card-padding, 0px) * 2)',
        },
      },
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'subtle',
    isFullBleed: false,
  },
});

export type DividerVariants = RecipeVariantProps<typeof dividerRecipe>;
