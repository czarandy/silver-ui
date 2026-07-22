import type {Breakpoint} from 'internal/breakpoints';
import {gapVariants} from 'internal/spacingTokens';
import {cva, type RecipeVariantProps} from 'styled-system/css';

export const gridRecipe = cva({
  base: {
    display: 'grid',
  },
  variants: {
    gap: gapVariants,
    layout: {
      columns: {
        // The literal keys are required for Panda's static extraction; the
        // `satisfies` check pins them to the shared breakpoint list.
        gridTemplateColumns: {
          base: 'repeat(var(--silver-grid-columns-base), minmax(0, 1fr))',
          sm: 'repeat(var(--silver-grid-columns-sm), minmax(0, 1fr))',
          md: 'repeat(var(--silver-grid-columns-md), minmax(0, 1fr))',
          lg: 'repeat(var(--silver-grid-columns-lg), minmax(0, 1fr))',
          xl: 'repeat(var(--silver-grid-columns-xl), minmax(0, 1fr))',
          '2xl': 'repeat(var(--silver-grid-columns-2xl), minmax(0, 1fr))',
        } satisfies Record<Breakpoint, string>,
      },
      minChildWidth: {
        // min(100%, …) keeps a minimum wider than the container from forcing
        // horizontal overflow; the column clamps to the container instead.
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, var(--silver-grid-min-child-width)), 1fr))',
      },
    },
  },
});

export type GridVariants = RecipeVariantProps<typeof gridRecipe>;
