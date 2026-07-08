import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe for the schedule monthly grid. The view renders the day cells and
 * the event overlay as separate grids, so this keeps their shared sizing and
 * day-state styles in one place.
 */
export const scheduleMonthlyViewRecipe = sva({
  slots: [
    'grid',
    'weekday',
    'cell',
    'dayNumber',
    'todayText',
    'monthSurface',
    'monthCellGrid',
    'monthEventOverlay',
    'monthEventSpan',
    'monthSeeMoreSpan',
    'monthSeeMoreButton',
    'monthPopoverContent',
    'monthPopoverEvents',
  ],
  base: {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    },
    weekday: {
      p: '2',
      textAlign: 'center',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    cell: {
      minH: '24',
      p: '0.5',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    dayNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '6',
      h: '6',
      m: '0.5',
      borderRadius: 'full',
    },
    monthSurface: {
      position: 'relative',
      gridColumn: '1 / -1',
    },
    monthCellGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gridAutoRows: 'var(--schedule-month-row-height)',
    },
    monthEventOverlay: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gridAutoRows: 'var(--schedule-month-row-height)',
      pointerEvents: 'none',
    },
    monthEventSpan: {
      alignSelf: 'start',
      minW: 0,
      mx: '0.5',
      pointerEvents: 'auto',
      zIndex: 1,
    },
    monthSeeMoreSpan: {
      alignSelf: 'start',
      minW: 0,
      mx: '0.5',
      pointerEvents: 'auto',
      zIndex: 2,
    },
    monthSeeMoreButton: {
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
    monthPopoverContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      p: '3',
    },
    monthPopoverEvents: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      m: 0,
      p: 0,
      listStyleType: 'none',
    },
  },
  variants: {
    isLastColumn: {
      true: {cell: {borderInlineEndWidth: 0}},
      false: {},
    },
    isLastRow: {
      true: {cell: {borderBlockEndWidth: 0}},
      false: {},
    },
    isOtherMonth: {
      true: {
        cell: {
          bg: 'bg.subtle',
          color: 'fg.muted',
        },
      },
      false: {},
    },
    isToday: {
      true: {
        dayNumber: {
          bg: 'primary',
          color: 'fg.onPrimary',
        },
      },
      false: {},
    },
    // Two-digit day numbers need a 1px end nudge to look optically centered
    // inside the today circle; single-digit numbers already center cleanly.
    isTwoDigit: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      isToday: true,
      isTwoDigit: true,
      css: {
        todayText: {
          marginInlineEnd: '1px',
        },
      },
    },
  ],
  defaultVariants: {
    isLastColumn: false,
    isLastRow: false,
    isOtherMonth: false,
    isToday: false,
    isTwoDigit: false,
  },
});

export type ScheduleMonthlyViewVariants = RecipeVariantProps<
  typeof scheduleMonthlyViewRecipe
>;
