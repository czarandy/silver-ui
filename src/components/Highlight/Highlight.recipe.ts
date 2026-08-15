import {cva} from 'styled-system/css';

export const highlightRecipe = cva({
  base: {
    borderRadius: 'xs',
    bg: 'highlight.bg',
    color: 'highlight.fg',
  },
});
