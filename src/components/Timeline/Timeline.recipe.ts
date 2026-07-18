import {sva, type RecipeVariantProps} from 'styled-system/css';

export const timelineRecipe = sva({
  slots: [
    'root',
    'item',
    'indicatorColumn',
    'indicator',
    'dot',
    'connector',
    'content',
    'timestamp',
    'title',
    'body',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      w: 'full',
      m: 0,
      p: 0,
      listStyleType: 'none',
    },
    item: {
      display: 'flex',
      alignItems: 'stretch',
      minH: '12',
      position: 'relative',
      _last: {
        '& [data-timeline-content]': {
          pb: 0,
        },
      },
    },
    indicatorColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      w: '7',
      flexShrink: 0,
    },
    indicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '7',
      h: '7',
      flexShrink: 0,
      color: 'primary',
    },
    dot: {
      w: '2',
      h: '2',
      borderRadius: 'full',
      bg: 'primary',
    },
    connector: {
      flex: 1,
      w: '0.5',
      my: '1',
      borderRadius: 'full',
      bg: 'track.emphasized',
    },
    content: {
      flex: 1,
      minW: 0,
      ps: '3',
      pb: '6',
    },
    timestamp: {
      display: 'block',
    },
    title: {
      display: 'block',
      mt: '0.5',
    },
    body: {
      mt: '2',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'sm',
      lineHeight: 'normal',
    },
  },
});

export type TimelineVariants = RecipeVariantProps<typeof timelineRecipe>;
