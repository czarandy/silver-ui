import {sva} from 'styled-system/css';

export const statRecipe = sva({
  slots: [
    'root',
    'definition',
    'label',
    'details',
    'value',
    'change',
    'description',
    'tooltipIcon',
  ],
  base: {
    root: {
      minW: 0,
    },
    definition: {
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
    },
    description: {
      overflowWrap: 'break-word',
    },
    tooltipIcon: {
      display: 'inline-flex',
      alignSelf: 'center',
      color: 'fg.muted',
    },
  },
  variants: {
    changeTone: {
      positive: {
        change: {color: 'status.success.fg'},
      },
      negative: {
        change: {color: 'status.error.fg'},
      },
      neutral: {
        change: {color: 'fg.muted'},
      },
    },
  },
  defaultVariants: {
    changeTone: 'neutral',
  },
});
