import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe for the schedule list view. Variants cover row separators, the
 * highlighted day number, and muted past events.
 */
export const scheduleListViewRecipe = sva({
  slots: [
    'list',
    'day',
    'dayHeading',
    'dayWeekday',
    'dayNumber',
    'events',
    'eventRow',
    'eventContent',
    'eventTime',
  ],
  base: {
    list: {
      display: 'flex',
      flexDirection: 'column',
    },
    day: {
      display: 'grid',
      gridTemplateColumns: '112px minmax(0, 1fr)',
      alignItems: 'start',
      columnGap: '3',
      p: '3',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    dayHeading: {
      m: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: '2',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'lg',
      fontWeight: 'semibold',
      lineHeight: 'tight',
      whiteSpace: 'nowrap',
    },
    dayWeekday: {
      display: 'inline-block',
      fontSize: 'lg',
    },
    dayNumber: {
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      w: '30px',
      h: '30px',
      borderRadius: 'full',
      fontWeight: 'bold',
    },
    events: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2',
    },
    eventRow: {
      display: 'grid',
      gridTemplateColumns: '160px minmax(0, 1fr)',
      alignItems: 'center',
      gap: '3',
    },
    eventContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      minW: 0,
    },
    eventTime: {
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    isHighlightedDay: {
      true: {
        dayNumber: {
          bg: 'primary',
          color: 'fg.onPrimary',
        },
      },
      false: {},
    },
    isLastDay: {
      true: {
        day: {
          borderBlockEndWidth: 0,
        },
      },
      false: {},
    },
    isPastEvent: {
      true: {
        eventRow: {
          opacity: 0.64,
        },
      },
      false: {},
    },
    isInteractiveEvent: {
      true: {
        eventContent: {
          appearance: 'none',
          bg: 'none',
          borderWidth: 0,
          p: 0,
          m: 0,
          font: 'inherit',
          textAlign: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
          borderRadius: 'sm',
          _focusVisible: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    isHighlightedDay: false,
    isLastDay: false,
    isPastEvent: false,
    isInteractiveEvent: false,
  },
});

export type ScheduleListViewVariants = RecipeVariantProps<
  typeof scheduleListViewRecipe
>;
