import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe for schedule event pills. The `inline` layout renders the
 * compact baseline pill used by list/all-day cells and the month overlay; the
 * `block` layout renders the stacked pill used by the time grid (positioned via
 * inline styles). The `color` variant defines the `--schedule-event-*` custom
 * properties consumed by every slot, and `isPast` mutes them.
 */
export const scheduleEventRecipe = sva({
  slots: ['event', 'dot', 'time', 'title'],
  base: {
    event: {
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'var(--schedule-event-border)',
      borderRadius: 'sm',
      overflow: 'hidden',
      px: '1',
      py: '0.5',
      fontSize: 'xs',
      lineHeight: 'tight',
      bg: 'var(--schedule-event-bg)',
      color: 'var(--schedule-event-fg)',
      _hover: {
        bg: 'var(--schedule-event-bg-hover)',
      },
    },
    dot: {
      display: 'inline-block',
      w: '2',
      h: '2',
      borderRadius: 'full',
      bg: 'var(--schedule-event-dot)',
      flexShrink: 0,
    },
    time: {
      flexShrink: 0,
      fontWeight: 'normal',
    },
    title: {
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    layout: {
      inline: {
        event: {
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '1',
          maxW: 'full',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 'medium',
        },
      },
      block: {
        event: {
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          minH: '9',
          minW: 0,
        },
        time: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
    },
    // Full-width pill used by the month overlay where the span sizes the cell.
    isFullWidth: {
      true: {event: {w: 'full'}},
      false: {},
    },
    // Applied when the pill is rendered as a clickable <button> trigger (event
    // popover plugin). Resets user-agent button styling so the pill looks
    // identical to its static <span> form.
    isInteractive: {
      true: {
        event: {
          appearance: 'none',
          textAlign: 'inherit',
          font: 'inherit',
          m: 0,
          cursor: 'pointer',
          _focusVisible: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
          },
        },
      },
      false: {},
    },
    color: {
      blue: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.blue)',
          '--schedule-event-bg-hover': 'token(colors.surface.blue.hover)',
          '--schedule-event-border': 'token(colors.surface.blue.accent)',
          '--schedule-event-fg': 'token(colors.surface.blue.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.blue.fg)',
          '--schedule-event-dot': 'token(colors.surface.blue.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.blue.accent)'},
      },
      cyan: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.cyan)',
          '--schedule-event-bg-hover': 'token(colors.surface.cyan.hover)',
          '--schedule-event-border': 'token(colors.surface.cyan.accent)',
          '--schedule-event-fg': 'token(colors.surface.cyan.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.cyan.fg)',
          '--schedule-event-dot': 'token(colors.surface.cyan.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.cyan.accent)'},
      },
      gray: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.gray)',
          '--schedule-event-bg-hover': 'token(colors.surface.gray.hover)',
          '--schedule-event-border': 'token(colors.surface.gray.accent)',
          '--schedule-event-fg': 'token(colors.surface.gray.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.gray.fg)',
          '--schedule-event-dot': 'token(colors.surface.gray.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.gray.accent)'},
      },
      green: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.green)',
          '--schedule-event-bg-hover': 'token(colors.surface.green.hover)',
          '--schedule-event-border': 'token(colors.surface.green.accent)',
          '--schedule-event-fg': 'token(colors.surface.green.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.green.fg)',
          '--schedule-event-dot': 'token(colors.surface.green.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.green.accent)'},
      },
      orange: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.orange)',
          '--schedule-event-bg-hover': 'token(colors.surface.orange.hover)',
          '--schedule-event-border': 'token(colors.surface.orange.accent)',
          '--schedule-event-fg': 'token(colors.surface.orange.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.orange.fg)',
          '--schedule-event-dot': 'token(colors.surface.orange.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.orange.accent)'},
      },
      pink: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.pink)',
          '--schedule-event-bg-hover': 'token(colors.surface.pink.hover)',
          '--schedule-event-border': 'token(colors.surface.pink.accent)',
          '--schedule-event-fg': 'token(colors.surface.pink.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.pink.fg)',
          '--schedule-event-dot': 'token(colors.surface.pink.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.pink.accent)'},
      },
      purple: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.purple)',
          '--schedule-event-bg-hover': 'token(colors.surface.purple.hover)',
          '--schedule-event-border': 'token(colors.surface.purple.accent)',
          '--schedule-event-fg': 'token(colors.surface.purple.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.purple.fg)',
          '--schedule-event-dot': 'token(colors.surface.purple.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.purple.accent)'},
      },
      red: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.red)',
          '--schedule-event-bg-hover': 'token(colors.surface.red.hover)',
          '--schedule-event-border': 'token(colors.surface.red.accent)',
          '--schedule-event-fg': 'token(colors.surface.red.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.red.fg)',
          '--schedule-event-dot': 'token(colors.surface.red.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.red.accent)'},
      },
      teal: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.teal)',
          '--schedule-event-bg-hover': 'token(colors.surface.teal.hover)',
          '--schedule-event-border': 'token(colors.surface.teal.accent)',
          '--schedule-event-fg': 'token(colors.surface.teal.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.teal.fg)',
          '--schedule-event-dot': 'token(colors.surface.teal.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.teal.accent)'},
      },
      yellow: {
        event: {
          '--schedule-event-bg': 'token(colors.surface.yellow)',
          '--schedule-event-bg-hover': 'token(colors.surface.yellow.hover)',
          '--schedule-event-border': 'token(colors.surface.yellow.accent)',
          '--schedule-event-fg': 'token(colors.surface.yellow.fg)',
          '--schedule-event-fg-base': 'token(colors.surface.yellow.fg)',
          '--schedule-event-dot': 'token(colors.surface.yellow.accent)',
        },
        dot: {'--schedule-event-dot': 'token(colors.surface.yellow.accent)'},
      },
    },
    isPast: {
      true: {
        event: {
          '--schedule-event-bg':
            'color-mix(in srgb, var(--schedule-event-dot) 10%, token(colors.bg))',
          '--schedule-event-bg-hover':
            'color-mix(in srgb, var(--schedule-event-dot) 14%, token(colors.bg))',
          '--schedule-event-border':
            'color-mix(in srgb, var(--schedule-event-dot) 48%, token(colors.border))',
          '--schedule-event-fg':
            'color-mix(in srgb, var(--schedule-event-fg-base) 52%, token(colors.fg.muted))',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    layout: 'inline',
    color: 'blue',
    isFullWidth: false,
    isInteractive: false,
    isPast: false,
  },
});

export type ScheduleEventVariants = RecipeVariantProps<
  typeof scheduleEventRecipe
>;
