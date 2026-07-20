import {sva} from 'styled-system/css';

export const statRecipe = sva({
  slots: [
    'root',
    'icon',
    'definition',
    'label',
    'details',
    'value',
    'description',
  ],
  base: {
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '3',
    },
    icon: {
      flexShrink: 0,
    },
    definition: {
      flex: 1,
      minW: 0,
      m: 0,
    },
    label: {
      m: 0,
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      minW: 0,
      m: 0,
      mt: '1',
    },
    value: {
      overflowWrap: 'break-word',
    },
    description: {
      overflowWrap: 'break-word',
    },
  },
});
