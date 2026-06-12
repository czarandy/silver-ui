import {sva, type RecipeVariantProps} from 'styled-system/css';

export const searchFilterInputEditPopoverRecipe = sva({
  slots: [
    'root',
    'content',
    'footer',
    'fieldSelector',
    'operatorSelector',
    'valueEditor',
    'nestedList',
    'nestedNode',
    'nestedRow',
    'nestedCell',
    'nestedField',
    'nestedOperator',
    'nestedValue',
  ],
  base: {
    root: {
      overflow: 'hidden',
      minW: '100',
    },
    content: {
      p: '4',
    },
    footer: {
      px: '3',
      pb: '3',
    },
    fieldSelector: {
      flexShrink: 0,
    },
    operatorSelector: {
      flex: '1 0 auto',
    },
    valueEditor: {
      flex: '2 1 0',
      minW: 0,
    },
    nestedList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2',
      w: 'full',
      listStyleType: 'none',
      m: 0,
      p: 0,
    },
    nestedNode: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2',
      ps: '3',
      borderInlineStartWidth: 'default',
      borderInlineStartStyle: 'solid',
      borderColor: 'border',
    },
    nestedRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      w: 'full',
    },
    nestedCell: {
      minW: 0,
    },
    nestedField: {
      flex: '0 0 200px',
    },
    nestedOperator: {
      flex: '0 0 180px',
    },
    nestedValue: {
      flex: '2 1 0',
    },
  },
});

export type SearchFilterInputEditPopoverVariants = RecipeVariantProps<
  typeof searchFilterInputEditPopoverRecipe
>;
