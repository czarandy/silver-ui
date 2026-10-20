import {cva} from 'styled-system/css';

/**
 * Shared styles for the element that holds a menu's items. Dividers get their
 * spacing here so a `<Divider />` passed as compound content matches the
 * data-driven `{type: 'divider'}`.
 */
export const menuListRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    overflowY: 'auto',
    p: '1',
    '& [role="separator"]': {my: '1'},
  },
});
