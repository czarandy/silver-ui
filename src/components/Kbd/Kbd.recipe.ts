import {cva, type RecipeVariantProps} from 'styled-system/css';

export const kbdRecipe = cva({
  base: {
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
  variants: {
    size: {
      sm: {minW: '4', h: '4', px: '0.5', fontSize: '2xs'},
      md: {minW: '5', h: '5', px: '1', fontSize: 'xs'},
      lg: {minW: '6', h: '6', px: '1.5', fontSize: 'sm'},
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type KbdVariants = RecipeVariantProps<typeof kbdRecipe>;
