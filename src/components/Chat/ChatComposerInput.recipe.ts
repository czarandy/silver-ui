import {cva, type RecipeVariantProps} from 'styled-system/css';

export const chatComposerInputRecipe = cva({
  base: {
    w: '100%',
    resize: 'none',
    border: 'none',
    outline: 'none',
    bg: 'transparent',
    p: 0,
    m: 0,
    fontFamily: 'body',
    fontSize: 'md',
    lineHeight: 'normal',
    color: 'fg',
    caretColor: 'primary',
    _placeholder: {
      color: 'fg.muted',
    },
    _disabled: {
      color: 'fg.disabled',
      cursor: 'not-allowed',
    },
  },
});

export type ChatComposerInputVariants = RecipeVariantProps<
  typeof chatComposerInputRecipe
>;
