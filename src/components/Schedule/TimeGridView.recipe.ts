import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe for the schedule time grid shared by day and week views.
 * Variants cover scrolling behavior, edge borders, and the highlighted day
 * header.
 */
export const scheduleTimeGridViewRecipe = sva({
  slots: [
    'container',
    'grid',
    'overflowCueStart',
    'overflowCueEnd',
    'fixedRows',
    'timeRows',
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
    container: {
      position: 'relative',
      minW: 0,
      w: 'full',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '72px 1fr',
      overflow: 'auto',
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    overflowCueStart: {
      position: 'absolute',
      zIndex: 2,
      insetBlock: '1px',
      insetInlineStart: '1px',
      w: '6',
      pointerEvents: 'none',
      backgroundImage:
        'linear-gradient(to right, token(colors.bg) 0%, transparent 100%)',
      _rtl: {
        backgroundImage:
          'linear-gradient(to left, token(colors.bg) 0%, transparent 100%)',
      },
    },
    overflowCueEnd: {
      position: 'absolute',
      zIndex: 2,
      insetBlock: '1px',
      insetInlineEnd: '1px',
      w: '6',
      pointerEvents: 'none',
      backgroundImage:
        'linear-gradient(to left, token(colors.bg) 0%, transparent 100%)',
      _rtl: {
        backgroundImage:
          'linear-gradient(to right, token(colors.bg) 0%, transparent 100%)',
      },
    },
    fixedRows: {
      display: 'grid',
      gridColumn: '1 / -1',
      gridTemplateColumns: '72px 1fr',
    },
    timeRows: {
      position: 'relative',
      zIndex: 0,
      display: 'grid',
      gridColumn: '1 / -1',
      gridTemplateColumns: '72px 1fr',
      overflowBlock: 'clip',
    },
    header: {
      display: 'grid',
      gridTemplateColumns:
        'repeat(var(--schedule-day-count), minmax(var(--schedule-day-min-width), 1fr))',
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
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: '1',
    },
    dayHeaderDayNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '32px',
      h: '32px',
      mt: '-1px',
      mb: '-1px',
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
        'repeat(var(--schedule-day-count), minmax(var(--schedule-day-min-width), 1fr))',
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
        'repeat(var(--schedule-day-count), minmax(var(--schedule-day-min-width), 1fr))',
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
    height: {
      auto: {},
      fill: {
        container: {
          flex: 1,
          minH: 0,
        },
        grid: {
          alignContent: 'start',
          h: 'full',
        },
        fixedRows: {
          position: 'sticky',
          top: 0,
          zIndex: 1,
          bg: 'bg',
        },
        timeRows: {
          alignContent: 'start',
        },
      },
    },
    isCurrentDay: {
      true: {
        dayHeaderDayNumber: {
          bg: 'primary',
          color: 'fg.onPrimary',
          pb: '1px',
        },
      },
      false: {},
    },
    isDaySeven: {
      true: {},
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
  compoundVariants: [
    {
      isCurrentDay: true,
      isDaySeven: true,
      css: {
        dayHeaderDayNumber: {
          pl: '1px',
        },
      },
    },
  ],
  defaultVariants: {
    height: 'auto',
    isCurrentDay: false,
    isDaySeven: false,
    isLastColumn: false,
    isLastRow: false,
  },
});

export type ScheduleTimeGridViewVariants = RecipeVariantProps<
  typeof scheduleTimeGridViewRecipe
>;
