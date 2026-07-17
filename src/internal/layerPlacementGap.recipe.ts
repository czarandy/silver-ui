import {cva} from 'styled-system/css';

export const layerPlacementGapRecipe = cva({
  variants: {
    placement: {
      above: {marginBlockEnd: '1'},
      below: {marginBlockStart: '1'},
      start: {marginInlineEnd: '1'},
      end: {marginInlineStart: '1'},
    },
  },
});
