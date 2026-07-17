import {sva, type RecipeVariantProps} from 'styled-system/css';
import {token} from 'styled-system/tokens';

/**
 * Each status fills a `primary` action with the foreground its own header is
 * built from, so the action inverts the surface it sits on rather than dropping
 * the global accent onto it.
 *
 * The label is `bg` rather than `fg.onPrimary`: these fills track the theme
 * (`surface.X.fg` is dark on a light theme and light on a dark one), while
 * `fg.onPrimary` is tuned against the accent and stays near-white in both — it
 * would vanish on the light fills a dark theme produces. `bg` is the neutral
 * that flips the same way the fills do, so the label reads white on a light
 * theme and near-black on a dark one.
 *
 * Hover and active shade the fill back toward the tint, mirroring how
 * `primary.hover` lightens the accent. Written out per status because Panda
 * extracts these statically.
 */
const labelOnFill = token.var('colors.bg');
const blueFg = token.var('colors.surface.blue.fg');
const blueTint = token.var('colors.surface.blue');
const greenFg = token.var('colors.surface.green.fg');
const greenTint = token.var('colors.surface.green');
const redFg = token.var('colors.surface.red.fg');
const redTint = token.var('colors.surface.red');
const yellowFg = token.var('colors.surface.yellow.fg');
const yellowTint = token.var('colors.surface.yellow');

const blueHover = `color-mix(in srgb, ${blueFg} 88%, ${blueTint})`;
const blueActive = `color-mix(in srgb, ${blueFg} 78%, ${blueTint})`;
const greenHover = `color-mix(in srgb, ${greenFg} 88%, ${greenTint})`;
const greenActive = `color-mix(in srgb, ${greenFg} 78%, ${greenTint})`;
const redHover = `color-mix(in srgb, ${redFg} 88%, ${redTint})`;
const redActive = `color-mix(in srgb, ${redFg} 78%, ${redTint})`;
const yellowHover = `color-mix(in srgb, ${yellowFg} 88%, ${yellowTint})`;
const yellowActive = `color-mix(in srgb, ${yellowFg} 78%, ${yellowTint})`;

/**
 * Symmetric padding overrides for the collapsible body. Keys mirror the
 * `SpacingToken` scale so the `padding` prop maps onto build-time-validated
 * spacing tokens instead of a runtime token lookup.
 */
const paddingVariants = {
  0: {bodyContent: {px: '0', py: '0'}},
  0.5: {bodyContent: {px: '0.5', py: '0.5'}},
  1: {bodyContent: {px: '1', py: '1'}},
  1.5: {bodyContent: {px: '1.5', py: '1.5'}},
  2: {bodyContent: {px: '2', py: '2'}},
  3: {bodyContent: {px: '3', py: '3'}},
  4: {bodyContent: {px: '4', py: '4'}},
  5: {bodyContent: {px: '5', py: '5'}},
  6: {bodyContent: {px: '6', py: '6'}},
  8: {bodyContent: {px: '8', py: '8'}},
  10: {bodyContent: {px: '10', py: '10'}},
};

export const alertRecipe = sva({
  slots: [
    'root',
    'header',
    'icon',
    'content',
    'endArea',
    'chevron',
    'body',
    'bodyContent',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'body',
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '2',
      px: '4',
      py: '3',
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    content: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      minW: 0,
    },
    endArea: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      gap: '2',
      ms: 'auto',
    },
    // The body stays mounted so child state and the `aria-controls` target are
    // preserved; it is collapsed with a `grid-template-rows` 1fr -> 0fr
    // transition (mirroring `AccordionItem`). `overflow: hidden` lives on this
    // grid so the body chrome on `bodyContent` is fully clipped when collapsed.
    body: {
      display: 'grid',
      gridTemplateRows: '1fr',
      overflow: 'hidden',
      // `visibility` is transitioned alongside the rows so the content stays
      // readable while collapsing, then becomes `hidden` (removing it from the
      // a11y tree and tab order) once closed. The inline `visibility` style in
      // the component drives the open/closed value.
      transitionProperty: 'grid-template-rows, visibility',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01s',
      },
    },
    bodyContent: {
      minH: 0,
      bg: 'bg',
      borderBlockEndWidth: 'default',
      borderColor: 'border',
      borderInlineWidth: 'default',
      borderStyle: 'solid',
      px: '4',
      py: '3',
    },
  },
  variants: {
    status: {
      error: {
        header: {
          bg: 'surface.red',
          color: 'surface.red.fg',
          '--silver-text-color': 'token(colors.surface.red.fg)',
          '--silver-text-color-muted': 'token(colors.surface.red.fg)',
          '--silver-button-primary-bg': redFg,
          '--silver-button-primary-fg': labelOnFill,
          '--silver-button-primary-bg-hover': redHover,
          '--silver-button-primary-bg-active': redActive,
          '--silver-button-focus-color': redFg,
        },
      },
      info: {
        header: {
          bg: 'surface.blue',
          color: 'surface.blue.fg',
          '--silver-text-color': 'token(colors.surface.blue.fg)',
          '--silver-text-color-muted': 'token(colors.surface.blue.fg)',
          '--silver-button-primary-bg': blueFg,
          '--silver-button-primary-fg': labelOnFill,
          '--silver-button-primary-bg-hover': blueHover,
          '--silver-button-primary-bg-active': blueActive,
          '--silver-button-focus-color': blueFg,
        },
      },
      success: {
        header: {
          bg: 'surface.green',
          color: 'surface.green.fg',
          '--silver-text-color': 'token(colors.surface.green.fg)',
          '--silver-text-color-muted': 'token(colors.surface.green.fg)',
          '--silver-button-primary-bg': greenFg,
          '--silver-button-primary-fg': labelOnFill,
          '--silver-button-primary-bg-hover': greenHover,
          '--silver-button-primary-bg-active': greenActive,
          '--silver-button-focus-color': greenFg,
        },
      },
      warning: {
        header: {
          bg: 'surface.yellow',
          color: 'surface.yellow.fg',
          '--silver-text-color': 'token(colors.surface.yellow.fg)',
          '--silver-text-color-muted': 'token(colors.surface.yellow.fg)',
          '--silver-button-primary-bg': yellowFg,
          '--silver-button-primary-fg': labelOnFill,
          '--silver-button-primary-bg-hover': yellowHover,
          '--silver-button-primary-bg-active': yellowActive,
          '--silver-button-focus-color': yellowFg,
        },
      },
    },
    container: {
      card: {
        header: {borderTopRadius: 'lg'},
        bodyContent: {borderBottomRadius: 'lg'},
      },
      section: {},
    },
    // Squares off the header's bottom corners while the body is revealed; the
    // compound variant rounds them back when there is no expanded content.
    hasContent: {
      true: {},
      false: {},
    },
    isCentered: {
      true: {header: {alignItems: 'center'}},
      false: {},
    },
    isExpanded: {
      true: {chevron: {transform: 'rotate(180deg)'}},
      false: {body: {gridTemplateRows: '0fr'}},
    },
    padding: paddingVariants,
  },
  compoundVariants: [
    {
      container: 'card',
      css: {header: {borderBottomRadius: 'lg'}},
      hasContent: false,
    },
  ],
  defaultVariants: {
    container: 'card',
    hasContent: false,
    isCentered: false,
    isExpanded: false,
    status: 'info',
  },
});

export type AlertVariants = RecipeVariantProps<typeof alertRecipe>;
