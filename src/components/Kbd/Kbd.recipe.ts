import {sva, type RecipeVariantProps} from 'styled-system/css';

export const kbdRecipe = sva({
  slots: ['root', 'key'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      verticalAlign: 'bottom',
    },
    key: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'sm',
      bg: 'bg.subtle',
      borderBottomWidth: 'emphasized',
      borderBottomStyle: 'solid',
      borderBottomColor: 'border',
      color: 'fg.muted',
      fontFamily: 'body',
      fontWeight: 'medium',
      lineHeight: 'none',
      userSelect: 'none',
    },
  },
  variants: {
    size: {
      sm: {
        root: {gap: '0.5'},
        key: {minW: '4', h: '4', px: '0.5', fontSize: '2xs'},
      },
      md: {
        root: {gap: '1'},
        key: {minW: '5', h: '5', px: '1', fontSize: 'xs'},
      },
      lg: {
        root: {gap: '1.5'},
        key: {minW: '6', h: '6', px: '1.5', fontSize: 'sm'},
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type KbdVariants = RecipeVariantProps<typeof kbdRecipe>;
