import {sva} from 'styled-system/css';

export const statRecipe = sva({
  slots: [
    'root',
    'icon',
    'definition',
    'label',
    'details',
    'value',
    'change',
    'description',
  ],
  base: {
    root: {
      minW: 0,
    },
    icon: {
      flexShrink: 0,
    },
    definition: {
      minW: 0,
      m: 0,
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5',
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
      whiteSpace: 'nowrap',
    },
    change: {
      display: 'inline-flex',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: '1',
      whiteSpace: 'nowrap',
      '&[data-direction="increase"]': {
        color: 'status.success.fg',
      },
      '&[data-direction="decrease"]': {
        color: 'status.error.fg',
      },
      '&[data-direction="unchanged"]': {
        color: 'fg.muted',
      },
    },
    description: {
      overflowWrap: 'break-word',
    },
  },
});
