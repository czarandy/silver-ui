import {defineConfig, defineRecipe} from '@pandacss/dev';
import {generateColorScale} from './scripts/generate-color-scale';
import {gapVariants} from './src/internal/spacingTokens';

const gray = {
  ...generateColorScale('#6a7b8c'),
  50: {value: '#f1f4f7'},
};
const green = generateColorScale('#26a332');
// Darkened from '#1ca49e' so teal.500 (the default `primary` accent) clears WCAG
// AA (4.5:1) against white text — the original measured 3.06:1. See issue #1.
const teal = generateColorScale('#0f7a76');
const red = {
  50: {value: '#fceef0'},
  100: {value: '#f9d1d8'},
  200: {value: '#f1bcc5'},
  300: {value: '#e28d9b'},
  400: {value: '#da4e65'},
  500: {value: '#d92644'},
  600: {value: '#e31a3b'},
  700: {value: '#842e3d'},
  800: {value: '#6b2e38'},
  900: {value: '#562b32'},
};
const yellow = generateColorScale('#f0aa00');
const blue = generateColorScale('#4a98ff');
const cyan = generateColorScale('#40b9dd');
const orange = generateColorScale('#eb6d02');
const pink = generateColorScale('#d951a8');
const purple = generateColorScale('#7952ff');

export default defineConfig({
  preflight: true,
  prefix: 'silver',
  include: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  exclude: [],
  staticCss: {
    css: [
      {
        // Recipes share the `gapVariants` map imported from
        // internal/spacingTokens, and Panda's static extraction does not
        // follow cross-file imports — without this, the gap rules only exist
        // while some other file happens to use the same value inline. Force
        // every spacing-scale gap utility so the shared map always resolves.
        properties: {gap: Object.values(gapVariants).map(({gap}) => gap)},
      },
    ],
  },
  outdir: 'styled-system',
  outExtension: 'js',
  jsxFramework: 'react',
  patterns: {
    extend: {
      // Panda claims any JSX tag named after a built-in pattern, so silver-ui's
      // own <Grid> would otherwise be extracted as the built-in grid pattern —
      // emitting dead CSS, and malformed CSS for non-token minChildWidth
      // values. Neutralize the pattern; nothing imports styled-system/patterns.
      grid: {
        properties: {},
        transform: () => ({}),
      },
    },
  },
  cssVarRoot: ':where(:root, :host)',
  conditions: {
    extend: {
      // `_dark` is the *explicit* opt-in: it applies only when a `data-theme`
      // attribute is present. Following the OS `prefers-color-scheme` for
      // `<Theme mode="system">` is layered on afterwards by
      // scripts/inject-system-theme.mjs, which mirrors the dark token block
      // into a media query. (Panda treats an array condition as AND-nested,
      // so a `['@media …', '[data-theme=dark]']` array does NOT mean "OS dark
      // OR attribute dark" — it silently drops the media query. See issue #57.)
      dark: '&:where([data-theme=dark])',
    },
  },
  theme: {
    extend: {
      recipes: {
        layerReset: defineRecipe({
          className: 'layer-reset',
          base: {
            m: 0,
            p: 0,
            borderWidth: 0,
            borderStyle: 'none',
            borderColor: 'transparent',
            overflow: 'visible',
            bg: 'transparent',
          },
        }),
      },
      tokens: {
        colors: {
          gray,
          green,
          red,
          yellow,
          blue,
          cyan,
          orange,
          pink,
          purple,
          teal,
        },
        fonts: {
          body: {value: 'system-ui, -apple-system, sans-serif'},
          mono: {value: 'ui-monospace, monospace'},
        },
        radii: {
          sm: {value: '0.25rem'},
          md: {value: '0.375rem'},
          lg: {value: '0.5rem'},
          full: {value: '9999px'},
        },
        borderWidths: {
          default: {value: '1px'},
          emphasized: {value: '2px'},
          focus: {value: '2px'},
        },
      },
      semanticTokens: {
        colors: {
          primary: {
            DEFAULT: {value: '{colors.teal.500}'},
            hover: {
              value: {base: '{colors.teal.600}', _dark: '{colors.teal.400}'},
            },
            active: {
              value: {base: '{colors.teal.700}', _dark: '{colors.teal.300}'},
            },
            subtle: {
              value: {
                base: '{colors.teal.100}',
                _dark: 'color-mix(in srgb, {colors.primary} 45%, transparent)',
              },
            },
          },
          destructive: {
            DEFAULT: {
              value: {base: '{colors.red.600}', _dark: '{colors.red.500}'},
            },
            hover: {
              value: {base: '{colors.red.700}', _dark: '{colors.red.400}'},
            },
            active: {
              value: {base: '{colors.red.800}', _dark: '{colors.red.300}'},
            },
            fg: {value: '{colors.white}'},
          },
          status: {
            success: {
              fg: {value: '{colors.green.600}'},
              border: {
                value: {
                  base: '{colors.green.600}',
                  _dark: '{colors.green.400}',
                },
              },
              borderHover: {
                value: {
                  base: '{colors.green.700}',
                  _dark: '{colors.green.300}',
                },
              },
              solid: {
                // _dark pinned to green.600 (not the lighter green.500): with
                // white text green.500 measured only 3.30:1 in dark mode. See
                // issue #1.
                value: {
                  base: '{colors.green.600}',
                  _dark: '{colors.green.600}',
                },
              },
              solidFg: {value: '{colors.white}'},
            },
            error: {
              fg: {value: '{colors.red.500}'},
              border: {
                value: {base: '{colors.red.600}', _dark: '{colors.red.400}'},
              },
              borderHover: {
                value: {base: '{colors.red.700}', _dark: '{colors.red.300}'},
              },
              solid: {
                value: {base: '{colors.red.600}', _dark: '{colors.red.500}'},
              },
              solidFg: {value: '{colors.white}'},
            },
            warning: {
              fg: {value: '{colors.yellow.500}'},
              border: {
                value: {
                  base: '{colors.yellow.500}',
                  _dark: '{colors.yellow.400}',
                },
              },
              borderHover: {
                value: {
                  base: '{colors.yellow.600}',
                  _dark: '{colors.yellow.300}',
                },
              },
              solid: {
                value: {
                  base: '{colors.yellow.500}',
                  _dark: '{colors.yellow.400}',
                },
              },
              // Dark text on the light amber solid: white measured only 2.01:1
              // (fails WCAG AA). gray.900 is fixed dark in both modes — the solid
              // is a light amber in light AND dark mode, so a mode-flipping fg
              // would fail in dark mode. See issue #1.
              solidFg: {value: '{colors.gray.900}'},
            },
            info: {
              fg: {value: '{colors.blue.700}'},
              solid: {value: '{colors.primary}'},
              solidFg: {value: '{colors.fg.onPrimary}'},
            },
            neutral: {
              solid: {
                // Darkened from gray.500/gray.400 so white text clears WCAG AA
                // (was 4.35:1 light / 4.05:1 dark). See issue #1.
                value: {
                  base: '{colors.gray.600}',
                  _dark: '{colors.gray.600}',
                },
              },
              solidFg: {value: '{colors.white}'},
            },
            disabled: {
              solid: {
                value: {
                  base: '{colors.gray.400}',
                  _dark: '{colors.gray.600}',
                },
              },
              solidFg: {value: '{colors.white}'},
            },
          },
          presence: {
            success: {
              value: {base: '{colors.green.500}', _dark: '{colors.green.400}'},
            },
            neutral: {
              value: {
                base: '{colors.gray.500}',
                _dark: '{colors.gray.400}',
              },
            },
            error: {
              value: {base: '{colors.red.600}', _dark: '{colors.red.400}'},
            },
          },
          fg: {
            DEFAULT: {
              value: {
                base: '{colors.gray.900}',
                _dark: '{colors.gray.50}',
              },
            },
            muted: {
              value: {
                base: '{colors.gray.600}',
                _dark: '{colors.gray.200}',
              },
            },
            disabled: {
              value: {
                base: '{colors.gray.200}',
                _dark: '{colors.gray.600}',
              },
            },
            onPrimary: {value: '{colors.white}'},
          },
          bg: {
            DEFAULT: {
              value: {base: '{colors.white}', _dark: '{colors.gray.900}'},
            },
            subtle: {
              value: {
                base: '{colors.gray.50}',
                _dark: '{colors.gray.800}',
              },
            },
            hover: {
              value: {
                base: '{colors.gray.100}',
                _dark: '{colors.gray.700}',
              },
            },
            selected: {value: '{colors.primary.subtle}'},
            ghost: {
              hover: {
                value: {
                  base: 'rgba(0, 0, 0, 0.06)',
                  _dark: 'rgba(255, 255, 255, 0.08)',
                },
              },
              active: {
                value: {
                  base: 'rgba(0, 0, 0, 0.1)',
                  _dark: 'rgba(255, 255, 255, 0.12)',
                },
              },
            },
          },
          border: {
            DEFAULT: {
              value: {
                base: '{colors.gray.100}',
                // One step lighter than `bg` (gray.900) so default borders stay
                // visible in dark mode, mirroring gray.100-on-white in light.
                _dark: '{colors.gray.800}',
              },
            },
            emphasized: {
              value: {
                base: '{colors.gray.100}',
                _dark: '{colors.gray.700}',
              },
            },
          },
          track: {
            DEFAULT: {
              value: {
                base: '{colors.gray.100}',
                _dark: '{colors.gray.700}',
              },
            },
            emphasized: {
              value: {
                base: '{colors.gray.300}',
                _dark: '{colors.gray.600}',
              },
            },
            disabled: {
              value: {
                base: '{colors.gray.300}',
                _dark: '{colors.gray.700}',
              },
            },
          },
          overlay: {
            scrim: {
              DEFAULT: {value: 'rgba(0, 0, 0, 0.45)'},
              subtle: {value: 'rgba(0, 0, 0, 0.35)'},
              strong: {value: 'rgba(0, 0, 0, 0.76)'},
            },
          },
          skeleton: {
            DEFAULT: {
              value: {
                base: '{colors.gray.100}',
                _dark: '{colors.gray.600}',
              },
            },
            shimmer: {
              value: {
                base: '{colors.gray.50}',
                _dark: '{colors.gray.500}',
              },
            },
          },
          surface: {
            blue: {
              DEFAULT: {
                value: {base: '{colors.blue.100}', _dark: '{colors.blue.900}'},
              },
              fg: {
                value: {base: '{colors.blue.800}', _dark: '{colors.blue.100}'},
              },
              hover: {
                value: {base: '{colors.blue.200}', _dark: '{colors.blue.800}'},
              },
              accent: {
                value: {base: '{colors.blue.700}', _dark: '{colors.blue.500}'},
              },
            },
            cyan: {
              DEFAULT: {
                value: {base: '{colors.cyan.100}', _dark: '{colors.cyan.900}'},
              },
              fg: {
                value: {base: '{colors.cyan.800}', _dark: '{colors.cyan.200}'},
              },
              hover: {
                value: {base: '{colors.cyan.200}', _dark: '{colors.cyan.800}'},
              },
              accent: {
                value: {base: '{colors.cyan.600}', _dark: '{colors.cyan.700}'},
              },
            },
            gray: {
              DEFAULT: {
                value: {
                  base: '{colors.gray.50}',
                  _dark: '{colors.gray.800}',
                },
              },
              fg: {
                value: {
                  base: '{colors.gray.900}',
                  _dark: '{colors.gray.100}',
                },
              },
              hover: {
                value: {
                  base: '{colors.gray.100}',
                  _dark: '{colors.gray.700}',
                },
              },
              accent: {
                value: {
                  base: '{colors.gray.600}',
                  _dark: '{colors.gray.400}',
                },
              },
            },
            green: {
              DEFAULT: {
                value: {
                  base: '{colors.green.100}',
                  _dark: '{colors.green.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.green.900}',
                  _dark: '{colors.green.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.green.200}',
                  _dark: '{colors.green.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.green.600}',
                  _dark: '{colors.green.400}',
                },
              },
            },
            orange: {
              DEFAULT: {
                value: {
                  base: '{colors.orange.100}',
                  _dark: '{colors.orange.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.orange.800}',
                  _dark: '{colors.orange.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.orange.200}',
                  _dark: '{colors.orange.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.orange.500}',
                  _dark: '{colors.orange.700}',
                },
              },
            },
            pink: {
              DEFAULT: {
                value: {base: '{colors.pink.100}', _dark: '{colors.pink.900}'},
              },
              fg: {
                value: {
                  base: '{colors.pink.800}',
                  _dark: '{colors.pink.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.pink.200}',
                  _dark: '{colors.pink.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.pink.500}',
                  _dark: '{colors.pink.600}',
                },
              },
            },
            purple: {
              DEFAULT: {
                value: {
                  base: '{colors.purple.100}',
                  _dark: '{colors.purple.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.purple.800}',
                  _dark: '{colors.purple.200}',
                },
              },
              hover: {
                value: {
                  base: '{colors.purple.200}',
                  _dark: '{colors.purple.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.purple.200}',
                  _dark: '{colors.purple.500}',
                },
              },
            },
            red: {
              DEFAULT: {
                value: {base: '{colors.red.100}', _dark: '{colors.red.900}'},
              },
              fg: {
                value: {base: '{colors.red.800}', _dark: '{colors.red.200}'},
              },
              hover: {
                value: {base: '{colors.red.200}', _dark: '{colors.red.800}'},
              },
              accent: {
                value: {base: '{colors.red.600}', _dark: '{colors.red.400}'},
              },
            },
            teal: {
              DEFAULT: {
                value: {base: '{colors.teal.100}', _dark: '{colors.teal.900}'},
              },
              fg: {
                value: {
                  base: '{colors.teal.800}',
                  _dark: '{colors.teal.300}',
                },
              },
              hover: {
                value: {
                  base: '{colors.teal.200}',
                  _dark: '{colors.teal.800}',
                },
              },
              accent: {
                value: {base: '{colors.teal.500}', _dark: '{colors.teal.700}'},
              },
            },
            yellow: {
              DEFAULT: {
                value: {
                  base: '{colors.yellow.100}',
                  _dark: '{colors.yellow.900}',
                },
              },
              fg: {
                value: {
                  base: '{colors.yellow.800}',
                  _dark: '{colors.yellow.400}',
                },
              },
              hover: {
                value: {
                  base: '{colors.yellow.200}',
                  _dark: '{colors.yellow.800}',
                },
              },
              accent: {
                value: {
                  base: '{colors.yellow.600}',
                  _dark: '{colors.yellow.700}',
                },
              },
            },
          },
          icon: {
            primary: {value: '{colors.fg}'},
            secondary: {value: '{colors.fg.muted}'},
            tertiary: {
              value: {
                base: '{colors.gray.500}',
                _dark: '{colors.gray.500}',
              },
            },
            disabled: {
              value: {
                base: '{colors.gray.400}',
                _dark: '{colors.gray.600}',
              },
            },
            accent: {value: '{colors.primary}'},
            success: {value: '{colors.status.success.fg}'},
            error: {value: '{colors.status.error.fg}'},
            warning: {value: '{colors.status.warning.fg}'},
            info: {value: '{colors.status.info.fg}'},
            blue: {
              value: {base: '{colors.blue.700}', _dark: '{colors.blue.500}'},
            },
            red: {value: '{colors.red.600}'},
            green: {value: '{colors.green.600}'},
            gray: {
              value: {base: '{colors.gray.600}', _dark: '{colors.gray.200}'},
            },
            cyan: {
              value: {base: '{colors.cyan.600}', _dark: '{colors.cyan.500}'},
            },
            teal: {value: '{colors.teal.500}'},
            yellow: {
              value: {
                base: '{colors.yellow.300}',
                _dark: '{colors.yellow.200}',
              },
            },
            orange: {value: '{colors.orange.500}'},
            pink: {
              value: {base: '{colors.pink.600}', _dark: '{colors.pink.500}'},
            },
            purple: {
              value: {
                base: '{colors.purple.700}',
                _dark: '{colors.purple.500}',
              },
            },
          },
        },
        sizes: {
          // Fills the gap in Panda's default scale, which has the half-steps
          // `4.5`/`5.5` but jumps straight from `6` to `7`.
          '6.5': {value: '1.625rem'},
          component: {
            sm: {value: '{sizes.7}'},
            md: {value: '{sizes.9}'},
            lg: {value: '{sizes.11}'},
          },
          icon: {
            sm: {value: '{sizes.4}'},
            md: {value: '{sizes.5}'},
            lg: {value: '{sizes.6}'},
          },
        },
        spacing: {
          '6.5': {value: '1.625rem'},
          component: {
            sm: {value: '{spacing.3}'},
            md: {value: '{spacing.4}'},
            lg: {value: '{spacing.5}'},
          },
          focusOffset: {value: '2px'},
          focusOffsetTight: {value: '1px'},
          focusOffsetLoose: {value: '3px'},
        },
        fontSizes: {
          // The component scale is deliberately offset from the type scale:
          // `sm` and `md` share 14px, and only `lg` steps up to 16px.
          component: {
            sm: {value: '{fontSizes.sm}'},
            md: {value: '{fontSizes.sm}'},
            lg: {value: '{fontSizes.md}'},
          },
          icon: {
            sm: {value: '{sizes.icon.sm}'},
            md: {value: '{sizes.icon.md}'},
            lg: {value: '{sizes.icon.lg}'},
          },
        },
        radii: {
          component: {
            sm: {value: '{radii.sm}'},
            md: {value: '{radii.md}'},
            lg: {value: '{radii.lg}'},
          },
        },
        shadows: {
          focus: {
            DEFAULT: {
              value: 'inset 0 0 0 {borderWidths.focus} {colors.primary.subtle}',
            },
            error: {
              value: 'inset 0 0 0 {borderWidths.focus} {colors.surface.red}',
            },
            warning: {
              value: 'inset 0 0 0 {borderWidths.focus} {colors.surface.yellow}',
            },
            success: {
              value: 'inset 0 0 0 {borderWidths.focus} {colors.surface.green}',
            },
          },
        },
      },
      keyframes: {
        'chat-pulse': {
          '0%, 100%': {opacity: 1},
          '50%': {opacity: 0.4},
        },
        'skeleton-shimmer': {
          '0%': {backgroundPosition: '200% 0'},
          '100%': {backgroundPosition: '-200% 0'},
        },
      },
    },
  },
});
