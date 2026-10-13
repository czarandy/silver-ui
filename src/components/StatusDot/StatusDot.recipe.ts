import {sva, type RecipeVariantProps} from 'styled-system/css';

export const statusDotRecipe = sva({
  slots: ['root', 'icon'],
  base: {
    root: {
      '--status-dot-size': '20px',
      '--status-dot-border': '2px',
      '--status-dot-icon-size': '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: 'full',
      w: 'var(--status-dot-size)',
      h: 'var(--status-dot-size)',
    },
    icon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'fg.onPrimary',
      lineHeight: 0,
      w: 'var(--status-dot-icon-size)',
      h: 'var(--status-dot-icon-size)',
      '& > svg': {w: '100%', h: '100%'},
    },
  },
  variants: {
    // Dot, ring, and icon dimensions are bespoke pixel values matched to the
    // Avatar size tiers, intentionally not design-system tokens.
    size: {
      sm: {
        root: {
          '--status-dot-size': '10px',
          '--status-dot-border': '1px',
          '--status-dot-icon-size': '0px',
        },
      },
      md: {
        root: {
          '--status-dot-size': '20px',
          '--status-dot-border': '2px',
          '--status-dot-icon-size': '12px',
        },
      },
      lg: {
        root: {
          '--status-dot-size': '32px',
          '--status-dot-border': '4px',
          '--status-dot-icon-size': '18px',
        },
      },
    },
    color: {
      neutral: {root: {bg: 'presence.neutral'}},
      info: {root: {bg: 'status.info.solid'}},
      success: {root: {bg: 'presence.success'}},
      warning: {root: {bg: 'status.warning.solid'}},
      error: {root: {bg: 'presence.error'}},
      blue: {root: {bg: 'surface.blue.fg'}},
      cyan: {root: {bg: 'surface.cyan.fg'}},
      gray: {root: {bg: 'surface.gray.fg'}},
      green: {root: {bg: 'surface.green.fg'}},
      orange: {root: {bg: 'surface.orange.fg'}},
      pink: {root: {bg: 'surface.pink.fg'}},
      purple: {root: {bg: 'surface.purple.fg'}},
      red: {root: {bg: 'surface.red.fg'}},
      teal: {root: {bg: 'surface.teal.fg'}},
      yellow: {root: {bg: 'surface.yellow.fg'}},
    },
    hasRing: {
      true: {
        root: {
          borderColor: 'bg',
          borderStyle: 'solid',
          borderWidth: 'var(--status-dot-border)',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'success',
    hasRing: false,
  },
});

export type StatusDotVariants = RecipeVariantProps<typeof statusDotRecipe>;
