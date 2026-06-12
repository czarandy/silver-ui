import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe for the schedule time grid shared by day and week views.
 * Variants cover the edge borders and highlighted day header.
 */
export const scheduleTimeGridViewRecipe = sva({
  slots: [
    'grid',
    'header',
    'corner',
    'dayHeader',
    'dayHeaderContent',
    'dayHeaderDayNumber',
    'allDayLabel',
    'allDayRow',
    'dayCell',
    'timeLabel',
    'timeRow',
    'hourCell',
    'events',
    'allDayEvents',
    'allDayPopoverContent',
    'allDayPopoverEvents',
    'allDaySeeMoreButton',
    'rowContents',
  ],
  base: {
    grid: {
      display: 'grid',
      gridTemplateColumns: '72px 1fr',
      overflow: 'auto',
    },
    header: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(var(--schedule-day-count), minmax(160px, 1fr))',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    corner: {
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    dayHeader: {
      p: '2',
      textAlign: 'center',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
    },
    dayHeaderContent: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1',
    },
    dayHeaderDayNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minW: '30px',
      h: '30px',
      lineHeight: '30px',
      borderRadius: 'full',
    },
    allDayLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      py: '0.5',
      px: '2',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    allDayRow: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(var(--schedule-day-count), minmax(160px, 1fr))',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    dayCell: {
      minH: 0,
      p: '0.5',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
    },
    timeLabel: {
      p: '2',
      color: 'fg.muted',
      textAlign: 'end',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    timeRow: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(var(--schedule-day-count), minmax(160px, 1fr))',
    },
    hourCell: {
      position: 'relative',
      minH: '14',
      p: '1',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    events: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
    },
    allDayEvents: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
    },
    allDayPopoverContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      p: '3',
    },
    allDayPopoverEvents: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      m: 0,
      p: 0,
      listStyleType: 'none',
    },
    allDaySeeMoreButton: {
      display: 'inline-flex',
      alignItems: 'center',
      maxW: 'full',
      h: '5',
      px: '1',
      borderRadius: 'sm',
      color: 'primary',
      cursor: 'pointer',
      fontSize: 'xs',
      fontWeight: 'medium',
      lineHeight: 'tight',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      _hover: {
        bg: 'bg.muted',
      },
    },
    rowContents: {
      display: 'contents',
    },
  },
  variants: {
    isCurrentDay: {
      true: {
        dayHeaderDayNumber: {
          bg: 'primary',
          color: 'fg.onPrimary',
        },
      },
      false: {},
    },
    isLastColumn: {
      true: {
        dayHeader: {borderInlineEndWidth: 0},
        dayCell: {borderInlineEndWidth: 0},
        hourCell: {borderInlineEndWidth: 0},
      },
      false: {},
    },
    isLastRow: {
      true: {
        timeLabel: {borderBlockEndWidth: 0},
        hourCell: {borderBlockEndWidth: 0},
      },
      false: {},
    },
  },
  defaultVariants: {
    isCurrentDay: false,
    isLastColumn: false,
    isLastRow: false,
  },
});

export type ScheduleTimeGridViewVariants = RecipeVariantProps<
  typeof scheduleTimeGridViewRecipe
>;
