import {sva, type RecipeVariantProps} from 'styled-system/css';

export const calendarRecipe = sva({
  slots: [
    'root',
    'header',
    'monthYear',
    'months',
    'monthGrid',
    'weekHeader',
    'dayName',
    'daysGrid',
    'weekRow',
    'weekNumber',
    'cell',
    'rangeBackground',
    'day',
  ],
  base: {
    root: {
      display: 'inline-block',
      minW: '220px',
      color: 'fg',
      fontFamily: 'body',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2',
      mb: '2',
    },
    monthYear: {
      flex: 1,
      textAlign: 'center',
      fontSize: 'sm',
      fontWeight: 'semibold',
    },
    months: {
      display: 'flex',
      gap: '4',
    },
    monthGrid: {
      flex: '1 1 0',
    },
    weekHeader: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      mb: '1',
    },
    dayName: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: 'component.md',
      h: 'component.md',
      color: 'fg.muted',
      fontSize: 'sm',
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
    },
    weekRow: {
      display: 'contents',
    },
    weekNumber: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: 'component.md',
      h: 'component.md',
      color: 'fg.muted',
      fontSize: 'sm',
    },
    cell: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      h: 'component.md',
      isolation: 'isolate',
    },
    rangeBackground: {
      position: 'absolute',
      insetBlock: '2px',
      insetInline: 0,
    },
    day: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: 'component.sm',
      h: 'component.sm',
      p: 0,
      borderWidth: 0,
      borderStyle: 'none',
      borderRadius: 'full',
      bg: 'transparent',
      color: 'fg',
      cursor: 'pointer',
      fontFamily: 'inherit',
      fontSize: 'md',
      transitionProperty: 'background-color, color',
      transitionDuration: 'fast',
      _hover: {
        bg: 'bg.subtle',
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
      _disabled: {
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    // Reserve a leading column for ISO week numbers in the header and grid.
    hasWeekNumbers: {
      true: {
        weekHeader: {gridTemplateColumns: 'auto repeat(7, 1fr)'},
        daysGrid: {gridTemplateColumns: 'auto repeat(7, 1fr)'},
      },
      false: {},
    },
    isOutside: {
      true: {day: {color: 'fg.muted', opacity: 0.55}},
      false: {},
    },
    // Marker variant; the today ring is suppressed for selected/in-range days,
    // so the real styling lives in compoundVariants below.
    isToday: {
      true: {},
      false: {},
    },
    isSelected: {
      true: {
        day: {
          bg: 'primary',
          color: 'fg.onPrimary',
          _hover: {bg: 'primary'},
        },
      },
      false: {},
    },
    // Marker variant; only used to suppress the today ring on range middles.
    isInRange: {
      true: {},
      false: {},
    },
    // Declared after isOutside so the disabled opacity wins when both apply.
    // Outside days are `aria-disabled` but intentionally not natively
    // `disabled` (that would drop them from useGridFocus's dense-grid index
    // math), so the not-allowed cursor is driven from this variant rather than
    // the native `:disabled` pseudo.
    isDisabled: {
      true: {day: {opacity: 0.35, cursor: 'not-allowed'}},
      false: {},
    },
    rangeTone: {
      range: {rangeBackground: {bg: 'bg.selected'}},
      preview: {rangeBackground: {bg: 'bg.subtle'}},
    },
    roundedStart: {
      true: {
        rangeBackground: {
          left: '2px',
          borderTopLeftRadius: 'full',
          borderBottomLeftRadius: 'full',
        },
      },
      false: {},
    },
    roundedEnd: {
      true: {
        rangeBackground: {
          right: '2px',
          borderTopRightRadius: 'full',
          borderBottomRightRadius: 'full',
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      isToday: true,
      isSelected: false,
      isInRange: false,
      css: {
        day: {boxShadow: 'inset 0 0 0 1px token(colors.border.emphasized)'},
      },
    },
  ],
  defaultVariants: {
    hasWeekNumbers: false,
    isOutside: false,
    isToday: false,
    isSelected: false,
    isInRange: false,
    isDisabled: false,
    rangeTone: 'range',
    roundedStart: false,
    roundedEnd: false,
  },
});

export type CalendarVariants = RecipeVariantProps<typeof calendarRecipe>;
