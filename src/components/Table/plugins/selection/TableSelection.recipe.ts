import {sva} from 'styled-system/css';

export const tableSelectionRecipe = sva({
  slots: ['control', 'cell'],
  base: {
    control: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cell: {
      // Selection is a narrow fixed-width column. Removing the standard cell
      // padding centers the control against the full column width, while the
      // more-specific selector also keeps it vertically centered when the
      // consumer aligns the table's content cells to the top or bottom.
      '&[data-part="cell"], &[data-part="header-cell"]': {
        px: '0',
        textAlign: 'center',
        verticalAlign: 'middle',
      },
    },
  },
});
