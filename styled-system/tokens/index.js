const tokens = {
  "aspectRatios.square": {
    "value": "1 / 1",
    "variable": "var(--silver-aspect-ratios-square)"
  },
  "aspectRatios.landscape": {
    "value": "4 / 3",
    "variable": "var(--silver-aspect-ratios-landscape)"
  },
  "aspectRatios.portrait": {
    "value": "3 / 4",
    "variable": "var(--silver-aspect-ratios-portrait)"
  },
  "aspectRatios.wide": {
    "value": "16 / 9",
    "variable": "var(--silver-aspect-ratios-wide)"
  },
  "aspectRatios.ultrawide": {
    "value": "18 / 5",
    "variable": "var(--silver-aspect-ratios-ultrawide)"
  },
  "aspectRatios.golden": {
    "value": "1.618 / 1",
    "variable": "var(--silver-aspect-ratios-golden)"
  },
  "borders.none": {
    "value": "none",
    "variable": "var(--silver-borders-none)"
  },
  "easings.default": {
    "value": "cubic-bezier(0.4, 0, 0.2, 1)",
    "variable": "var(--silver-easings-default)"
  },
  "easings.linear": {
    "value": "linear",
    "variable": "var(--silver-easings-linear)"
  },
  "easings.in": {
    "value": "cubic-bezier(0.4, 0, 1, 1)",
    "variable": "var(--silver-easings-in)"
  },
  "easings.out": {
    "value": "cubic-bezier(0, 0, 0.2, 1)",
    "variable": "var(--silver-easings-out)"
  },
  "easings.in-out": {
    "value": "cubic-bezier(0.4, 0, 0.2, 1)",
    "variable": "var(--silver-easings-in-out)"
  },
  "durations.fastest": {
    "value": "50ms",
    "variable": "var(--silver-durations-fastest)"
  },
  "durations.faster": {
    "value": "100ms",
    "variable": "var(--silver-durations-faster)"
  },
  "durations.fast": {
    "value": "150ms",
    "variable": "var(--silver-durations-fast)"
  },
  "durations.normal": {
    "value": "200ms",
    "variable": "var(--silver-durations-normal)"
  },
  "durations.slow": {
    "value": "300ms",
    "variable": "var(--silver-durations-slow)"
  },
  "durations.slower": {
    "value": "400ms",
    "variable": "var(--silver-durations-slower)"
  },
  "durations.slowest": {
    "value": "500ms",
    "variable": "var(--silver-durations-slowest)"
  },
  "fontWeights.thin": {
    "value": "100",
    "variable": "var(--silver-font-weights-thin)"
  },
  "fontWeights.extralight": {
    "value": "200",
    "variable": "var(--silver-font-weights-extralight)"
  },
  "fontWeights.light": {
    "value": "300",
    "variable": "var(--silver-font-weights-light)"
  },
  "fontWeights.normal": {
    "value": "400",
    "variable": "var(--silver-font-weights-normal)"
  },
  "fontWeights.medium": {
    "value": "500",
    "variable": "var(--silver-font-weights-medium)"
  },
  "fontWeights.semibold": {
    "value": "600",
    "variable": "var(--silver-font-weights-semibold)"
  },
  "fontWeights.bold": {
    "value": "700",
    "variable": "var(--silver-font-weights-bold)"
  },
  "fontWeights.extrabold": {
    "value": "800",
    "variable": "var(--silver-font-weights-extrabold)"
  },
  "fontWeights.black": {
    "value": "900",
    "variable": "var(--silver-font-weights-black)"
  },
  "lineHeights.none": {
    "value": "1",
    "variable": "var(--silver-line-heights-none)"
  },
  "lineHeights.tight": {
    "value": "1.25",
    "variable": "var(--silver-line-heights-tight)"
  },
  "lineHeights.snug": {
    "value": "1.375",
    "variable": "var(--silver-line-heights-snug)"
  },
  "lineHeights.normal": {
    "value": "1.5",
    "variable": "var(--silver-line-heights-normal)"
  },
  "lineHeights.relaxed": {
    "value": "1.625",
    "variable": "var(--silver-line-heights-relaxed)"
  },
  "lineHeights.loose": {
    "value": "2",
    "variable": "var(--silver-line-heights-loose)"
  },
  "letterSpacings.tighter": {
    "value": "-0.05em",
    "variable": "var(--silver-letter-spacings-tighter)"
  },
  "letterSpacings.tight": {
    "value": "-0.025em",
    "variable": "var(--silver-letter-spacings-tight)"
  },
  "letterSpacings.normal": {
    "value": "0em",
    "variable": "var(--silver-letter-spacings-normal)"
  },
  "letterSpacings.wide": {
    "value": "0.025em",
    "variable": "var(--silver-letter-spacings-wide)"
  },
  "letterSpacings.wider": {
    "value": "0.05em",
    "variable": "var(--silver-letter-spacings-wider)"
  },
  "letterSpacings.widest": {
    "value": "0.1em",
    "variable": "var(--silver-letter-spacings-widest)"
  },
  "fontSizes.2xs": {
    "value": "0.5rem",
    "variable": "var(--silver-font-sizes-2xs)"
  },
  "fontSizes.xs": {
    "value": "0.75rem",
    "variable": "var(--silver-font-sizes-xs)"
  },
  "fontSizes.sm": {
    "value": "0.875rem",
    "variable": "var(--silver-font-sizes-sm)"
  },
  "fontSizes.md": {
    "value": "1rem",
    "variable": "var(--silver-font-sizes-md)"
  },
  "fontSizes.lg": {
    "value": "1.125rem",
    "variable": "var(--silver-font-sizes-lg)"
  },
  "fontSizes.xl": {
    "value": "1.25rem",
    "variable": "var(--silver-font-sizes-xl)"
  },
  "fontSizes.2xl": {
    "value": "1.5rem",
    "variable": "var(--silver-font-sizes-2xl)"
  },
  "fontSizes.3xl": {
    "value": "1.875rem",
    "variable": "var(--silver-font-sizes-3xl)"
  },
  "fontSizes.4xl": {
    "value": "2.25rem",
    "variable": "var(--silver-font-sizes-4xl)"
  },
  "fontSizes.5xl": {
    "value": "3rem",
    "variable": "var(--silver-font-sizes-5xl)"
  },
  "fontSizes.6xl": {
    "value": "3.75rem",
    "variable": "var(--silver-font-sizes-6xl)"
  },
  "fontSizes.7xl": {
    "value": "4.5rem",
    "variable": "var(--silver-font-sizes-7xl)"
  },
  "fontSizes.8xl": {
    "value": "6rem",
    "variable": "var(--silver-font-sizes-8xl)"
  },
  "fontSizes.9xl": {
    "value": "8rem",
    "variable": "var(--silver-font-sizes-9xl)"
  },
  "shadows.2xs": {
    "value": "0 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--silver-shadows-2xs)"
  },
  "shadows.xs": {
    "value": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "variable": "var(--silver-shadows-xs)"
  },
  "shadows.sm": {
    "value": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "variable": "var(--silver-shadows-sm)"
  },
  "shadows.md": {
    "value": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "variable": "var(--silver-shadows-md)"
  },
  "shadows.lg": {
    "value": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "variable": "var(--silver-shadows-lg)"
  },
  "shadows.xl": {
    "value": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "variable": "var(--silver-shadows-xl)"
  },
  "shadows.2xl": {
    "value": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "variable": "var(--silver-shadows-2xl)"
  },
  "shadows.inset-2xs": {
    "value": "inset 0 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--silver-shadows-inset-2xs)"
  },
  "shadows.inset-xs": {
    "value": "inset 0 1px 1px rgb(0 0 0 / 0.05)",
    "variable": "var(--silver-shadows-inset-xs)"
  },
  "shadows.inset-sm": {
    "value": "inset 0 2px 4px rgb(0 0 0 / 0.05)",
    "variable": "var(--silver-shadows-inset-sm)"
  },
  "blurs.xs": {
    "value": "4px",
    "variable": "var(--silver-blurs-xs)"
  },
  "blurs.sm": {
    "value": "8px",
    "variable": "var(--silver-blurs-sm)"
  },
  "blurs.md": {
    "value": "12px",
    "variable": "var(--silver-blurs-md)"
  },
  "blurs.lg": {
    "value": "16px",
    "variable": "var(--silver-blurs-lg)"
  },
  "blurs.xl": {
    "value": "24px",
    "variable": "var(--silver-blurs-xl)"
  },
  "blurs.2xl": {
    "value": "40px",
    "variable": "var(--silver-blurs-2xl)"
  },
  "blurs.3xl": {
    "value": "64px",
    "variable": "var(--silver-blurs-3xl)"
  },
  "spacing.0": {
    "value": "0rem",
    "variable": "var(--silver-spacing-0)"
  },
  "spacing.1": {
    "value": "0.25rem",
    "variable": "var(--silver-spacing-1)"
  },
  "spacing.2": {
    "value": "0.5rem",
    "variable": "var(--silver-spacing-2)"
  },
  "spacing.3": {
    "value": "0.75rem",
    "variable": "var(--silver-spacing-3)"
  },
  "spacing.4": {
    "value": "1rem",
    "variable": "var(--silver-spacing-4)"
  },
  "spacing.5": {
    "value": "1.25rem",
    "variable": "var(--silver-spacing-5)"
  },
  "spacing.6": {
    "value": "1.5rem",
    "variable": "var(--silver-spacing-6)"
  },
  "spacing.7": {
    "value": "1.75rem",
    "variable": "var(--silver-spacing-7)"
  },
  "spacing.8": {
    "value": "2rem",
    "variable": "var(--silver-spacing-8)"
  },
  "spacing.9": {
    "value": "2.25rem",
    "variable": "var(--silver-spacing-9)"
  },
  "spacing.10": {
    "value": "2.5rem",
    "variable": "var(--silver-spacing-10)"
  },
  "spacing.11": {
    "value": "2.75rem",
    "variable": "var(--silver-spacing-11)"
  },
  "spacing.12": {
    "value": "3rem",
    "variable": "var(--silver-spacing-12)"
  },
  "spacing.14": {
    "value": "3.5rem",
    "variable": "var(--silver-spacing-14)"
  },
  "spacing.16": {
    "value": "4rem",
    "variable": "var(--silver-spacing-16)"
  },
  "spacing.20": {
    "value": "5rem",
    "variable": "var(--silver-spacing-20)"
  },
  "spacing.24": {
    "value": "6rem",
    "variable": "var(--silver-spacing-24)"
  },
  "spacing.28": {
    "value": "7rem",
    "variable": "var(--silver-spacing-28)"
  },
  "spacing.32": {
    "value": "8rem",
    "variable": "var(--silver-spacing-32)"
  },
  "spacing.36": {
    "value": "9rem",
    "variable": "var(--silver-spacing-36)"
  },
  "spacing.40": {
    "value": "10rem",
    "variable": "var(--silver-spacing-40)"
  },
  "spacing.44": {
    "value": "11rem",
    "variable": "var(--silver-spacing-44)"
  },
  "spacing.48": {
    "value": "12rem",
    "variable": "var(--silver-spacing-48)"
  },
  "spacing.52": {
    "value": "13rem",
    "variable": "var(--silver-spacing-52)"
  },
  "spacing.56": {
    "value": "14rem",
    "variable": "var(--silver-spacing-56)"
  },
  "spacing.60": {
    "value": "15rem",
    "variable": "var(--silver-spacing-60)"
  },
  "spacing.64": {
    "value": "16rem",
    "variable": "var(--silver-spacing-64)"
  },
  "spacing.72": {
    "value": "18rem",
    "variable": "var(--silver-spacing-72)"
  },
  "spacing.80": {
    "value": "20rem",
    "variable": "var(--silver-spacing-80)"
  },
  "spacing.96": {
    "value": "24rem",
    "variable": "var(--silver-spacing-96)"
  },
  "spacing.0.5": {
    "value": "0.125rem",
    "variable": "var(--silver-spacing-0\\.5)"
  },
  "spacing.1.5": {
    "value": "0.375rem",
    "variable": "var(--silver-spacing-1\\.5)"
  },
  "spacing.2.5": {
    "value": "0.625rem",
    "variable": "var(--silver-spacing-2\\.5)"
  },
  "spacing.3.5": {
    "value": "0.875rem",
    "variable": "var(--silver-spacing-3\\.5)"
  },
  "spacing.4.5": {
    "value": "1.125rem",
    "variable": "var(--silver-spacing-4\\.5)"
  },
  "spacing.5.5": {
    "value": "1.375rem",
    "variable": "var(--silver-spacing-5\\.5)"
  },
  "sizes.0": {
    "value": "0rem",
    "variable": "var(--silver-sizes-0)"
  },
  "sizes.1": {
    "value": "0.25rem",
    "variable": "var(--silver-sizes-1)"
  },
  "sizes.2": {
    "value": "0.5rem",
    "variable": "var(--silver-sizes-2)"
  },
  "sizes.3": {
    "value": "0.75rem",
    "variable": "var(--silver-sizes-3)"
  },
  "sizes.4": {
    "value": "1rem",
    "variable": "var(--silver-sizes-4)"
  },
  "sizes.5": {
    "value": "1.25rem",
    "variable": "var(--silver-sizes-5)"
  },
  "sizes.6": {
    "value": "1.5rem",
    "variable": "var(--silver-sizes-6)"
  },
  "sizes.7": {
    "value": "1.75rem",
    "variable": "var(--silver-sizes-7)"
  },
  "sizes.8": {
    "value": "2rem",
    "variable": "var(--silver-sizes-8)"
  },
  "sizes.9": {
    "value": "2.25rem",
    "variable": "var(--silver-sizes-9)"
  },
  "sizes.10": {
    "value": "2.5rem",
    "variable": "var(--silver-sizes-10)"
  },
  "sizes.11": {
    "value": "2.75rem",
    "variable": "var(--silver-sizes-11)"
  },
  "sizes.12": {
    "value": "3rem",
    "variable": "var(--silver-sizes-12)"
  },
  "sizes.14": {
    "value": "3.5rem",
    "variable": "var(--silver-sizes-14)"
  },
  "sizes.16": {
    "value": "4rem",
    "variable": "var(--silver-sizes-16)"
  },
  "sizes.20": {
    "value": "5rem",
    "variable": "var(--silver-sizes-20)"
  },
  "sizes.24": {
    "value": "6rem",
    "variable": "var(--silver-sizes-24)"
  },
  "sizes.28": {
    "value": "7rem",
    "variable": "var(--silver-sizes-28)"
  },
  "sizes.32": {
    "value": "8rem",
    "variable": "var(--silver-sizes-32)"
  },
  "sizes.36": {
    "value": "9rem",
    "variable": "var(--silver-sizes-36)"
  },
  "sizes.40": {
    "value": "10rem",
    "variable": "var(--silver-sizes-40)"
  },
  "sizes.44": {
    "value": "11rem",
    "variable": "var(--silver-sizes-44)"
  },
  "sizes.48": {
    "value": "12rem",
    "variable": "var(--silver-sizes-48)"
  },
  "sizes.52": {
    "value": "13rem",
    "variable": "var(--silver-sizes-52)"
  },
  "sizes.56": {
    "value": "14rem",
    "variable": "var(--silver-sizes-56)"
  },
  "sizes.60": {
    "value": "15rem",
    "variable": "var(--silver-sizes-60)"
  },
  "sizes.64": {
    "value": "16rem",
    "variable": "var(--silver-sizes-64)"
  },
  "sizes.72": {
    "value": "18rem",
    "variable": "var(--silver-sizes-72)"
  },
  "sizes.80": {
    "value": "20rem",
    "variable": "var(--silver-sizes-80)"
  },
  "sizes.96": {
    "value": "24rem",
    "variable": "var(--silver-sizes-96)"
  },
  "sizes.0.5": {
    "value": "0.125rem",
    "variable": "var(--silver-sizes-0\\.5)"
  },
  "sizes.1.5": {
    "value": "0.375rem",
    "variable": "var(--silver-sizes-1\\.5)"
  },
  "sizes.2.5": {
    "value": "0.625rem",
    "variable": "var(--silver-sizes-2\\.5)"
  },
  "sizes.3.5": {
    "value": "0.875rem",
    "variable": "var(--silver-sizes-3\\.5)"
  },
  "sizes.4.5": {
    "value": "1.125rem",
    "variable": "var(--silver-sizes-4\\.5)"
  },
  "sizes.5.5": {
    "value": "1.375rem",
    "variable": "var(--silver-sizes-5\\.5)"
  },
  "sizes.xs": {
    "value": "20rem",
    "variable": "var(--silver-sizes-xs)"
  },
  "sizes.sm": {
    "value": "24rem",
    "variable": "var(--silver-sizes-sm)"
  },
  "sizes.md": {
    "value": "28rem",
    "variable": "var(--silver-sizes-md)"
  },
  "sizes.lg": {
    "value": "32rem",
    "variable": "var(--silver-sizes-lg)"
  },
  "sizes.xl": {
    "value": "36rem",
    "variable": "var(--silver-sizes-xl)"
  },
  "sizes.2xl": {
    "value": "42rem",
    "variable": "var(--silver-sizes-2xl)"
  },
  "sizes.3xl": {
    "value": "48rem",
    "variable": "var(--silver-sizes-3xl)"
  },
  "sizes.4xl": {
    "value": "56rem",
    "variable": "var(--silver-sizes-4xl)"
  },
  "sizes.5xl": {
    "value": "64rem",
    "variable": "var(--silver-sizes-5xl)"
  },
  "sizes.6xl": {
    "value": "72rem",
    "variable": "var(--silver-sizes-6xl)"
  },
  "sizes.7xl": {
    "value": "80rem",
    "variable": "var(--silver-sizes-7xl)"
  },
  "sizes.8xl": {
    "value": "90rem",
    "variable": "var(--silver-sizes-8xl)"
  },
  "sizes.prose": {
    "value": "65ch",
    "variable": "var(--silver-sizes-prose)"
  },
  "sizes.full": {
    "value": "100%",
    "variable": "var(--silver-sizes-full)"
  },
  "sizes.min": {
    "value": "min-content",
    "variable": "var(--silver-sizes-min)"
  },
  "sizes.max": {
    "value": "max-content",
    "variable": "var(--silver-sizes-max)"
  },
  "sizes.fit": {
    "value": "fit-content",
    "variable": "var(--silver-sizes-fit)"
  },
  "sizes.breakpoint-sm": {
    "value": "640px",
    "variable": "var(--silver-sizes-breakpoint-sm)"
  },
  "sizes.breakpoint-md": {
    "value": "768px",
    "variable": "var(--silver-sizes-breakpoint-md)"
  },
  "sizes.breakpoint-lg": {
    "value": "1024px",
    "variable": "var(--silver-sizes-breakpoint-lg)"
  },
  "sizes.breakpoint-xl": {
    "value": "1280px",
    "variable": "var(--silver-sizes-breakpoint-xl)"
  },
  "sizes.breakpoint-2xl": {
    "value": "1536px",
    "variable": "var(--silver-sizes-breakpoint-2xl)"
  },
  "animations.spin": {
    "value": "spin 1s linear infinite",
    "variable": "var(--silver-animations-spin)"
  },
  "animations.ping": {
    "value": "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
    "variable": "var(--silver-animations-ping)"
  },
  "animations.pulse": {
    "value": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "variable": "var(--silver-animations-pulse)"
  },
  "animations.bounce": {
    "value": "bounce 1s infinite",
    "variable": "var(--silver-animations-bounce)"
  },
  "colors.current": {
    "value": "currentColor",
    "variable": "var(--silver-colors-current)"
  },
  "colors.black": {
    "value": "#000",
    "variable": "var(--silver-colors-black)"
  },
  "colors.white": {
    "value": "#fff",
    "variable": "var(--silver-colors-white)"
  },
  "colors.transparent": {
    "value": "rgb(0 0 0 / 0)",
    "variable": "var(--silver-colors-transparent)"
  },
  "colors.rose.50": {
    "value": "#fff1f2",
    "variable": "var(--silver-colors-rose-50)"
  },
  "colors.rose.100": {
    "value": "#ffe4e6",
    "variable": "var(--silver-colors-rose-100)"
  },
  "colors.rose.200": {
    "value": "#fecdd3",
    "variable": "var(--silver-colors-rose-200)"
  },
  "colors.rose.300": {
    "value": "#fda4af",
    "variable": "var(--silver-colors-rose-300)"
  },
  "colors.rose.400": {
    "value": "#fb7185",
    "variable": "var(--silver-colors-rose-400)"
  },
  "colors.rose.500": {
    "value": "#f43f5e",
    "variable": "var(--silver-colors-rose-500)"
  },
  "colors.rose.600": {
    "value": "#e11d48",
    "variable": "var(--silver-colors-rose-600)"
  },
  "colors.rose.700": {
    "value": "#be123c",
    "variable": "var(--silver-colors-rose-700)"
  },
  "colors.rose.800": {
    "value": "#9f1239",
    "variable": "var(--silver-colors-rose-800)"
  },
  "colors.rose.900": {
    "value": "#881337",
    "variable": "var(--silver-colors-rose-900)"
  },
  "colors.rose.950": {
    "value": "#4c0519",
    "variable": "var(--silver-colors-rose-950)"
  },
  "colors.pink.50": {
    "value": "#fdf2f8",
    "variable": "var(--silver-colors-pink-50)"
  },
  "colors.pink.100": {
    "value": "#fce7f3",
    "variable": "var(--silver-colors-pink-100)"
  },
  "colors.pink.200": {
    "value": "#fbcfe8",
    "variable": "var(--silver-colors-pink-200)"
  },
  "colors.pink.300": {
    "value": "#f9a8d4",
    "variable": "var(--silver-colors-pink-300)"
  },
  "colors.pink.400": {
    "value": "#f472b6",
    "variable": "var(--silver-colors-pink-400)"
  },
  "colors.pink.500": {
    "value": "#ec4899",
    "variable": "var(--silver-colors-pink-500)"
  },
  "colors.pink.600": {
    "value": "#db2777",
    "variable": "var(--silver-colors-pink-600)"
  },
  "colors.pink.700": {
    "value": "#be185d",
    "variable": "var(--silver-colors-pink-700)"
  },
  "colors.pink.800": {
    "value": "#9d174d",
    "variable": "var(--silver-colors-pink-800)"
  },
  "colors.pink.900": {
    "value": "#831843",
    "variable": "var(--silver-colors-pink-900)"
  },
  "colors.pink.950": {
    "value": "#500724",
    "variable": "var(--silver-colors-pink-950)"
  },
  "colors.fuchsia.50": {
    "value": "#fdf4ff",
    "variable": "var(--silver-colors-fuchsia-50)"
  },
  "colors.fuchsia.100": {
    "value": "#fae8ff",
    "variable": "var(--silver-colors-fuchsia-100)"
  },
  "colors.fuchsia.200": {
    "value": "#f5d0fe",
    "variable": "var(--silver-colors-fuchsia-200)"
  },
  "colors.fuchsia.300": {
    "value": "#f0abfc",
    "variable": "var(--silver-colors-fuchsia-300)"
  },
  "colors.fuchsia.400": {
    "value": "#e879f9",
    "variable": "var(--silver-colors-fuchsia-400)"
  },
  "colors.fuchsia.500": {
    "value": "#d946ef",
    "variable": "var(--silver-colors-fuchsia-500)"
  },
  "colors.fuchsia.600": {
    "value": "#c026d3",
    "variable": "var(--silver-colors-fuchsia-600)"
  },
  "colors.fuchsia.700": {
    "value": "#a21caf",
    "variable": "var(--silver-colors-fuchsia-700)"
  },
  "colors.fuchsia.800": {
    "value": "#86198f",
    "variable": "var(--silver-colors-fuchsia-800)"
  },
  "colors.fuchsia.900": {
    "value": "#701a75",
    "variable": "var(--silver-colors-fuchsia-900)"
  },
  "colors.fuchsia.950": {
    "value": "#4a044e",
    "variable": "var(--silver-colors-fuchsia-950)"
  },
  "colors.purple.50": {
    "value": "#faf5ff",
    "variable": "var(--silver-colors-purple-50)"
  },
  "colors.purple.100": {
    "value": "#f3e8ff",
    "variable": "var(--silver-colors-purple-100)"
  },
  "colors.purple.200": {
    "value": "#e9d5ff",
    "variable": "var(--silver-colors-purple-200)"
  },
  "colors.purple.300": {
    "value": "#d8b4fe",
    "variable": "var(--silver-colors-purple-300)"
  },
  "colors.purple.400": {
    "value": "#c084fc",
    "variable": "var(--silver-colors-purple-400)"
  },
  "colors.purple.500": {
    "value": "#a855f7",
    "variable": "var(--silver-colors-purple-500)"
  },
  "colors.purple.600": {
    "value": "#9333ea",
    "variable": "var(--silver-colors-purple-600)"
  },
  "colors.purple.700": {
    "value": "#7e22ce",
    "variable": "var(--silver-colors-purple-700)"
  },
  "colors.purple.800": {
    "value": "#6b21a8",
    "variable": "var(--silver-colors-purple-800)"
  },
  "colors.purple.900": {
    "value": "#581c87",
    "variable": "var(--silver-colors-purple-900)"
  },
  "colors.purple.950": {
    "value": "#3b0764",
    "variable": "var(--silver-colors-purple-950)"
  },
  "colors.violet.50": {
    "value": "#f5f3ff",
    "variable": "var(--silver-colors-violet-50)"
  },
  "colors.violet.100": {
    "value": "#ede9fe",
    "variable": "var(--silver-colors-violet-100)"
  },
  "colors.violet.200": {
    "value": "#ddd6fe",
    "variable": "var(--silver-colors-violet-200)"
  },
  "colors.violet.300": {
    "value": "#c4b5fd",
    "variable": "var(--silver-colors-violet-300)"
  },
  "colors.violet.400": {
    "value": "#a78bfa",
    "variable": "var(--silver-colors-violet-400)"
  },
  "colors.violet.500": {
    "value": "#8b5cf6",
    "variable": "var(--silver-colors-violet-500)"
  },
  "colors.violet.600": {
    "value": "#7c3aed",
    "variable": "var(--silver-colors-violet-600)"
  },
  "colors.violet.700": {
    "value": "#6d28d9",
    "variable": "var(--silver-colors-violet-700)"
  },
  "colors.violet.800": {
    "value": "#5b21b6",
    "variable": "var(--silver-colors-violet-800)"
  },
  "colors.violet.900": {
    "value": "#4c1d95",
    "variable": "var(--silver-colors-violet-900)"
  },
  "colors.violet.950": {
    "value": "#2e1065",
    "variable": "var(--silver-colors-violet-950)"
  },
  "colors.indigo.50": {
    "value": "#eef2ff",
    "variable": "var(--silver-colors-indigo-50)"
  },
  "colors.indigo.100": {
    "value": "#e0e7ff",
    "variable": "var(--silver-colors-indigo-100)"
  },
  "colors.indigo.200": {
    "value": "#c7d2fe",
    "variable": "var(--silver-colors-indigo-200)"
  },
  "colors.indigo.300": {
    "value": "#a5b4fc",
    "variable": "var(--silver-colors-indigo-300)"
  },
  "colors.indigo.400": {
    "value": "#818cf8",
    "variable": "var(--silver-colors-indigo-400)"
  },
  "colors.indigo.500": {
    "value": "#6366f1",
    "variable": "var(--silver-colors-indigo-500)"
  },
  "colors.indigo.600": {
    "value": "#4f46e5",
    "variable": "var(--silver-colors-indigo-600)"
  },
  "colors.indigo.700": {
    "value": "#4338ca",
    "variable": "var(--silver-colors-indigo-700)"
  },
  "colors.indigo.800": {
    "value": "#3730a3",
    "variable": "var(--silver-colors-indigo-800)"
  },
  "colors.indigo.900": {
    "value": "#312e81",
    "variable": "var(--silver-colors-indigo-900)"
  },
  "colors.indigo.950": {
    "value": "#1e1b4b",
    "variable": "var(--silver-colors-indigo-950)"
  },
  "colors.blue.50": {
    "value": "#eff6ff",
    "variable": "var(--silver-colors-blue-50)"
  },
  "colors.blue.100": {
    "value": "#dbeafe",
    "variable": "var(--silver-colors-blue-100)"
  },
  "colors.blue.200": {
    "value": "#bfdbfe",
    "variable": "var(--silver-colors-blue-200)"
  },
  "colors.blue.300": {
    "value": "#93c5fd",
    "variable": "var(--silver-colors-blue-300)"
  },
  "colors.blue.400": {
    "value": "#60a5fa",
    "variable": "var(--silver-colors-blue-400)"
  },
  "colors.blue.500": {
    "value": "#3b82f6",
    "variable": "var(--silver-colors-blue-500)"
  },
  "colors.blue.600": {
    "value": "#2563eb",
    "variable": "var(--silver-colors-blue-600)"
  },
  "colors.blue.700": {
    "value": "#1d4ed8",
    "variable": "var(--silver-colors-blue-700)"
  },
  "colors.blue.800": {
    "value": "#1e40af",
    "variable": "var(--silver-colors-blue-800)"
  },
  "colors.blue.900": {
    "value": "#1e3a8a",
    "variable": "var(--silver-colors-blue-900)"
  },
  "colors.blue.950": {
    "value": "#172554",
    "variable": "var(--silver-colors-blue-950)"
  },
  "colors.sky.50": {
    "value": "#f0f9ff",
    "variable": "var(--silver-colors-sky-50)"
  },
  "colors.sky.100": {
    "value": "#e0f2fe",
    "variable": "var(--silver-colors-sky-100)"
  },
  "colors.sky.200": {
    "value": "#bae6fd",
    "variable": "var(--silver-colors-sky-200)"
  },
  "colors.sky.300": {
    "value": "#7dd3fc",
    "variable": "var(--silver-colors-sky-300)"
  },
  "colors.sky.400": {
    "value": "#38bdf8",
    "variable": "var(--silver-colors-sky-400)"
  },
  "colors.sky.500": {
    "value": "#0ea5e9",
    "variable": "var(--silver-colors-sky-500)"
  },
  "colors.sky.600": {
    "value": "#0284c7",
    "variable": "var(--silver-colors-sky-600)"
  },
  "colors.sky.700": {
    "value": "#0369a1",
    "variable": "var(--silver-colors-sky-700)"
  },
  "colors.sky.800": {
    "value": "#075985",
    "variable": "var(--silver-colors-sky-800)"
  },
  "colors.sky.900": {
    "value": "#0c4a6e",
    "variable": "var(--silver-colors-sky-900)"
  },
  "colors.sky.950": {
    "value": "#082f49",
    "variable": "var(--silver-colors-sky-950)"
  },
  "colors.cyan.50": {
    "value": "#ecfeff",
    "variable": "var(--silver-colors-cyan-50)"
  },
  "colors.cyan.100": {
    "value": "#cffafe",
    "variable": "var(--silver-colors-cyan-100)"
  },
  "colors.cyan.200": {
    "value": "#a5f3fc",
    "variable": "var(--silver-colors-cyan-200)"
  },
  "colors.cyan.300": {
    "value": "#67e8f9",
    "variable": "var(--silver-colors-cyan-300)"
  },
  "colors.cyan.400": {
    "value": "#22d3ee",
    "variable": "var(--silver-colors-cyan-400)"
  },
  "colors.cyan.500": {
    "value": "#06b6d4",
    "variable": "var(--silver-colors-cyan-500)"
  },
  "colors.cyan.600": {
    "value": "#0891b2",
    "variable": "var(--silver-colors-cyan-600)"
  },
  "colors.cyan.700": {
    "value": "#0e7490",
    "variable": "var(--silver-colors-cyan-700)"
  },
  "colors.cyan.800": {
    "value": "#155e75",
    "variable": "var(--silver-colors-cyan-800)"
  },
  "colors.cyan.900": {
    "value": "#164e63",
    "variable": "var(--silver-colors-cyan-900)"
  },
  "colors.cyan.950": {
    "value": "#083344",
    "variable": "var(--silver-colors-cyan-950)"
  },
  "colors.teal.50": {
    "value": "#f0fdfa",
    "variable": "var(--silver-colors-teal-50)"
  },
  "colors.teal.100": {
    "value": "#ccfbf1",
    "variable": "var(--silver-colors-teal-100)"
  },
  "colors.teal.200": {
    "value": "#99f6e4",
    "variable": "var(--silver-colors-teal-200)"
  },
  "colors.teal.300": {
    "value": "#5eead4",
    "variable": "var(--silver-colors-teal-300)"
  },
  "colors.teal.400": {
    "value": "#2dd4bf",
    "variable": "var(--silver-colors-teal-400)"
  },
  "colors.teal.500": {
    "value": "#14b8a6",
    "variable": "var(--silver-colors-teal-500)"
  },
  "colors.teal.600": {
    "value": "#0d9488",
    "variable": "var(--silver-colors-teal-600)"
  },
  "colors.teal.700": {
    "value": "#0f766e",
    "variable": "var(--silver-colors-teal-700)"
  },
  "colors.teal.800": {
    "value": "#115e59",
    "variable": "var(--silver-colors-teal-800)"
  },
  "colors.teal.900": {
    "value": "#134e4a",
    "variable": "var(--silver-colors-teal-900)"
  },
  "colors.teal.950": {
    "value": "#042f2e",
    "variable": "var(--silver-colors-teal-950)"
  },
  "colors.emerald.50": {
    "value": "#ecfdf5",
    "variable": "var(--silver-colors-emerald-50)"
  },
  "colors.emerald.100": {
    "value": "#d1fae5",
    "variable": "var(--silver-colors-emerald-100)"
  },
  "colors.emerald.200": {
    "value": "#a7f3d0",
    "variable": "var(--silver-colors-emerald-200)"
  },
  "colors.emerald.300": {
    "value": "#6ee7b7",
    "variable": "var(--silver-colors-emerald-300)"
  },
  "colors.emerald.400": {
    "value": "#34d399",
    "variable": "var(--silver-colors-emerald-400)"
  },
  "colors.emerald.500": {
    "value": "#10b981",
    "variable": "var(--silver-colors-emerald-500)"
  },
  "colors.emerald.600": {
    "value": "#059669",
    "variable": "var(--silver-colors-emerald-600)"
  },
  "colors.emerald.700": {
    "value": "#047857",
    "variable": "var(--silver-colors-emerald-700)"
  },
  "colors.emerald.800": {
    "value": "#065f46",
    "variable": "var(--silver-colors-emerald-800)"
  },
  "colors.emerald.900": {
    "value": "#064e3b",
    "variable": "var(--silver-colors-emerald-900)"
  },
  "colors.emerald.950": {
    "value": "#022c22",
    "variable": "var(--silver-colors-emerald-950)"
  },
  "colors.green.50": {
    "value": "#f0fdf4",
    "variable": "var(--silver-colors-green-50)"
  },
  "colors.green.100": {
    "value": "#dcfce7",
    "variable": "var(--silver-colors-green-100)"
  },
  "colors.green.200": {
    "value": "#bbf7d0",
    "variable": "var(--silver-colors-green-200)"
  },
  "colors.green.300": {
    "value": "#86efac",
    "variable": "var(--silver-colors-green-300)"
  },
  "colors.green.400": {
    "value": "#4ade80",
    "variable": "var(--silver-colors-green-400)"
  },
  "colors.green.500": {
    "value": "#22c55e",
    "variable": "var(--silver-colors-green-500)"
  },
  "colors.green.600": {
    "value": "#16a34a",
    "variable": "var(--silver-colors-green-600)"
  },
  "colors.green.700": {
    "value": "#15803d",
    "variable": "var(--silver-colors-green-700)"
  },
  "colors.green.800": {
    "value": "#166534",
    "variable": "var(--silver-colors-green-800)"
  },
  "colors.green.900": {
    "value": "#14532d",
    "variable": "var(--silver-colors-green-900)"
  },
  "colors.green.950": {
    "value": "#052e16",
    "variable": "var(--silver-colors-green-950)"
  },
  "colors.lime.50": {
    "value": "#f7fee7",
    "variable": "var(--silver-colors-lime-50)"
  },
  "colors.lime.100": {
    "value": "#ecfccb",
    "variable": "var(--silver-colors-lime-100)"
  },
  "colors.lime.200": {
    "value": "#d9f99d",
    "variable": "var(--silver-colors-lime-200)"
  },
  "colors.lime.300": {
    "value": "#bef264",
    "variable": "var(--silver-colors-lime-300)"
  },
  "colors.lime.400": {
    "value": "#a3e635",
    "variable": "var(--silver-colors-lime-400)"
  },
  "colors.lime.500": {
    "value": "#84cc16",
    "variable": "var(--silver-colors-lime-500)"
  },
  "colors.lime.600": {
    "value": "#65a30d",
    "variable": "var(--silver-colors-lime-600)"
  },
  "colors.lime.700": {
    "value": "#4d7c0f",
    "variable": "var(--silver-colors-lime-700)"
  },
  "colors.lime.800": {
    "value": "#3f6212",
    "variable": "var(--silver-colors-lime-800)"
  },
  "colors.lime.900": {
    "value": "#365314",
    "variable": "var(--silver-colors-lime-900)"
  },
  "colors.lime.950": {
    "value": "#1a2e05",
    "variable": "var(--silver-colors-lime-950)"
  },
  "colors.yellow.50": {
    "value": "#fefce8",
    "variable": "var(--silver-colors-yellow-50)"
  },
  "colors.yellow.100": {
    "value": "#fef9c3",
    "variable": "var(--silver-colors-yellow-100)"
  },
  "colors.yellow.200": {
    "value": "#fef08a",
    "variable": "var(--silver-colors-yellow-200)"
  },
  "colors.yellow.300": {
    "value": "#fde047",
    "variable": "var(--silver-colors-yellow-300)"
  },
  "colors.yellow.400": {
    "value": "#facc15",
    "variable": "var(--silver-colors-yellow-400)"
  },
  "colors.yellow.500": {
    "value": "#eab308",
    "variable": "var(--silver-colors-yellow-500)"
  },
  "colors.yellow.600": {
    "value": "#ca8a04",
    "variable": "var(--silver-colors-yellow-600)"
  },
  "colors.yellow.700": {
    "value": "#a16207",
    "variable": "var(--silver-colors-yellow-700)"
  },
  "colors.yellow.800": {
    "value": "#854d0e",
    "variable": "var(--silver-colors-yellow-800)"
  },
  "colors.yellow.900": {
    "value": "#713f12",
    "variable": "var(--silver-colors-yellow-900)"
  },
  "colors.yellow.950": {
    "value": "#422006",
    "variable": "var(--silver-colors-yellow-950)"
  },
  "colors.amber.50": {
    "value": "#fffbeb",
    "variable": "var(--silver-colors-amber-50)"
  },
  "colors.amber.100": {
    "value": "#fef3c7",
    "variable": "var(--silver-colors-amber-100)"
  },
  "colors.amber.200": {
    "value": "#fde68a",
    "variable": "var(--silver-colors-amber-200)"
  },
  "colors.amber.300": {
    "value": "#fcd34d",
    "variable": "var(--silver-colors-amber-300)"
  },
  "colors.amber.400": {
    "value": "#fbbf24",
    "variable": "var(--silver-colors-amber-400)"
  },
  "colors.amber.500": {
    "value": "#f59e0b",
    "variable": "var(--silver-colors-amber-500)"
  },
  "colors.amber.600": {
    "value": "#d97706",
    "variable": "var(--silver-colors-amber-600)"
  },
  "colors.amber.700": {
    "value": "#b45309",
    "variable": "var(--silver-colors-amber-700)"
  },
  "colors.amber.800": {
    "value": "#92400e",
    "variable": "var(--silver-colors-amber-800)"
  },
  "colors.amber.900": {
    "value": "#78350f",
    "variable": "var(--silver-colors-amber-900)"
  },
  "colors.amber.950": {
    "value": "#451a03",
    "variable": "var(--silver-colors-amber-950)"
  },
  "colors.orange.50": {
    "value": "#fff7ed",
    "variable": "var(--silver-colors-orange-50)"
  },
  "colors.orange.100": {
    "value": "#ffedd5",
    "variable": "var(--silver-colors-orange-100)"
  },
  "colors.orange.200": {
    "value": "#fed7aa",
    "variable": "var(--silver-colors-orange-200)"
  },
  "colors.orange.300": {
    "value": "#fdba74",
    "variable": "var(--silver-colors-orange-300)"
  },
  "colors.orange.400": {
    "value": "#fb923c",
    "variable": "var(--silver-colors-orange-400)"
  },
  "colors.orange.500": {
    "value": "#f97316",
    "variable": "var(--silver-colors-orange-500)"
  },
  "colors.orange.600": {
    "value": "#ea580c",
    "variable": "var(--silver-colors-orange-600)"
  },
  "colors.orange.700": {
    "value": "#c2410c",
    "variable": "var(--silver-colors-orange-700)"
  },
  "colors.orange.800": {
    "value": "#9a3412",
    "variable": "var(--silver-colors-orange-800)"
  },
  "colors.orange.900": {
    "value": "#7c2d12",
    "variable": "var(--silver-colors-orange-900)"
  },
  "colors.orange.950": {
    "value": "#431407",
    "variable": "var(--silver-colors-orange-950)"
  },
  "colors.red.50": {
    "value": "#fef2f2",
    "variable": "var(--silver-colors-red-50)"
  },
  "colors.red.100": {
    "value": "#fee2e2",
    "variable": "var(--silver-colors-red-100)"
  },
  "colors.red.200": {
    "value": "#fecaca",
    "variable": "var(--silver-colors-red-200)"
  },
  "colors.red.300": {
    "value": "#fca5a5",
    "variable": "var(--silver-colors-red-300)"
  },
  "colors.red.400": {
    "value": "#f87171",
    "variable": "var(--silver-colors-red-400)"
  },
  "colors.red.500": {
    "value": "#ef4444",
    "variable": "var(--silver-colors-red-500)"
  },
  "colors.red.600": {
    "value": "#dc2626",
    "variable": "var(--silver-colors-red-600)"
  },
  "colors.red.700": {
    "value": "#b91c1c",
    "variable": "var(--silver-colors-red-700)"
  },
  "colors.red.800": {
    "value": "#991b1b",
    "variable": "var(--silver-colors-red-800)"
  },
  "colors.red.900": {
    "value": "#7f1d1d",
    "variable": "var(--silver-colors-red-900)"
  },
  "colors.red.950": {
    "value": "#450a0a",
    "variable": "var(--silver-colors-red-950)"
  },
  "colors.neutral.50": {
    "value": "#fafafa",
    "variable": "var(--silver-colors-neutral-50)"
  },
  "colors.neutral.100": {
    "value": "#f5f5f5",
    "variable": "var(--silver-colors-neutral-100)"
  },
  "colors.neutral.200": {
    "value": "#e5e5e5",
    "variable": "var(--silver-colors-neutral-200)"
  },
  "colors.neutral.300": {
    "value": "#d4d4d4",
    "variable": "var(--silver-colors-neutral-300)"
  },
  "colors.neutral.400": {
    "value": "#a3a3a3",
    "variable": "var(--silver-colors-neutral-400)"
  },
  "colors.neutral.500": {
    "value": "#737373",
    "variable": "var(--silver-colors-neutral-500)"
  },
  "colors.neutral.600": {
    "value": "#525252",
    "variable": "var(--silver-colors-neutral-600)"
  },
  "colors.neutral.700": {
    "value": "#404040",
    "variable": "var(--silver-colors-neutral-700)"
  },
  "colors.neutral.800": {
    "value": "#262626",
    "variable": "var(--silver-colors-neutral-800)"
  },
  "colors.neutral.900": {
    "value": "#171717",
    "variable": "var(--silver-colors-neutral-900)"
  },
  "colors.neutral.950": {
    "value": "#0a0a0a",
    "variable": "var(--silver-colors-neutral-950)"
  },
  "colors.stone.50": {
    "value": "#fafaf9",
    "variable": "var(--silver-colors-stone-50)"
  },
  "colors.stone.100": {
    "value": "#f5f5f4",
    "variable": "var(--silver-colors-stone-100)"
  },
  "colors.stone.200": {
    "value": "#e7e5e4",
    "variable": "var(--silver-colors-stone-200)"
  },
  "colors.stone.300": {
    "value": "#d6d3d1",
    "variable": "var(--silver-colors-stone-300)"
  },
  "colors.stone.400": {
    "value": "#a8a29e",
    "variable": "var(--silver-colors-stone-400)"
  },
  "colors.stone.500": {
    "value": "#78716c",
    "variable": "var(--silver-colors-stone-500)"
  },
  "colors.stone.600": {
    "value": "#57534e",
    "variable": "var(--silver-colors-stone-600)"
  },
  "colors.stone.700": {
    "value": "#44403c",
    "variable": "var(--silver-colors-stone-700)"
  },
  "colors.stone.800": {
    "value": "#292524",
    "variable": "var(--silver-colors-stone-800)"
  },
  "colors.stone.900": {
    "value": "#1c1917",
    "variable": "var(--silver-colors-stone-900)"
  },
  "colors.stone.950": {
    "value": "#0c0a09",
    "variable": "var(--silver-colors-stone-950)"
  },
  "colors.zinc.50": {
    "value": "#fafafa",
    "variable": "var(--silver-colors-zinc-50)"
  },
  "colors.zinc.100": {
    "value": "#f4f4f5",
    "variable": "var(--silver-colors-zinc-100)"
  },
  "colors.zinc.200": {
    "value": "#e4e4e7",
    "variable": "var(--silver-colors-zinc-200)"
  },
  "colors.zinc.300": {
    "value": "#d4d4d8",
    "variable": "var(--silver-colors-zinc-300)"
  },
  "colors.zinc.400": {
    "value": "#a1a1aa",
    "variable": "var(--silver-colors-zinc-400)"
  },
  "colors.zinc.500": {
    "value": "#71717a",
    "variable": "var(--silver-colors-zinc-500)"
  },
  "colors.zinc.600": {
    "value": "#52525b",
    "variable": "var(--silver-colors-zinc-600)"
  },
  "colors.zinc.700": {
    "value": "#3f3f46",
    "variable": "var(--silver-colors-zinc-700)"
  },
  "colors.zinc.800": {
    "value": "#27272a",
    "variable": "var(--silver-colors-zinc-800)"
  },
  "colors.zinc.900": {
    "value": "#18181b",
    "variable": "var(--silver-colors-zinc-900)"
  },
  "colors.zinc.950": {
    "value": "#09090b",
    "variable": "var(--silver-colors-zinc-950)"
  },
  "colors.gray.50": {
    "value": "#f9fafb",
    "variable": "var(--silver-colors-gray-50)"
  },
  "colors.gray.100": {
    "value": "#f3f4f6",
    "variable": "var(--silver-colors-gray-100)"
  },
  "colors.gray.200": {
    "value": "#e5e7eb",
    "variable": "var(--silver-colors-gray-200)"
  },
  "colors.gray.300": {
    "value": "#d1d5db",
    "variable": "var(--silver-colors-gray-300)"
  },
  "colors.gray.400": {
    "value": "#9ca3af",
    "variable": "var(--silver-colors-gray-400)"
  },
  "colors.gray.500": {
    "value": "#6b7280",
    "variable": "var(--silver-colors-gray-500)"
  },
  "colors.gray.600": {
    "value": "#4b5563",
    "variable": "var(--silver-colors-gray-600)"
  },
  "colors.gray.700": {
    "value": "#374151",
    "variable": "var(--silver-colors-gray-700)"
  },
  "colors.gray.800": {
    "value": "#1f2937",
    "variable": "var(--silver-colors-gray-800)"
  },
  "colors.gray.900": {
    "value": "#111827",
    "variable": "var(--silver-colors-gray-900)"
  },
  "colors.gray.950": {
    "value": "#030712",
    "variable": "var(--silver-colors-gray-950)"
  },
  "colors.slate.50": {
    "value": "#f8fafc",
    "variable": "var(--silver-colors-slate-50)"
  },
  "colors.slate.100": {
    "value": "#f1f5f9",
    "variable": "var(--silver-colors-slate-100)"
  },
  "colors.slate.200": {
    "value": "#e2e8f0",
    "variable": "var(--silver-colors-slate-200)"
  },
  "colors.slate.300": {
    "value": "#cbd5e1",
    "variable": "var(--silver-colors-slate-300)"
  },
  "colors.slate.400": {
    "value": "#94a3b8",
    "variable": "var(--silver-colors-slate-400)"
  },
  "colors.slate.500": {
    "value": "#64748b",
    "variable": "var(--silver-colors-slate-500)"
  },
  "colors.slate.600": {
    "value": "#475569",
    "variable": "var(--silver-colors-slate-600)"
  },
  "colors.slate.700": {
    "value": "#334155",
    "variable": "var(--silver-colors-slate-700)"
  },
  "colors.slate.800": {
    "value": "#1e293b",
    "variable": "var(--silver-colors-slate-800)"
  },
  "colors.slate.900": {
    "value": "#0f172a",
    "variable": "var(--silver-colors-slate-900)"
  },
  "colors.slate.950": {
    "value": "#020617",
    "variable": "var(--silver-colors-slate-950)"
  },
  "colors.silver-primary.50": {
    "value": "#e6ecf0",
    "variable": "var(--silver-colors-silver-primary-50)"
  },
  "colors.silver-primary.100": {
    "value": "#d0dbe3",
    "variable": "var(--silver-colors-silver-primary-100)"
  },
  "colors.silver-primary.200": {
    "value": "#a8bccb",
    "variable": "var(--silver-colors-silver-primary-200)"
  },
  "colors.silver-primary.300": {
    "value": "#7a9ab0",
    "variable": "var(--silver-colors-silver-primary-300)"
  },
  "colors.silver-primary.400": {
    "value": "#5d819b",
    "variable": "var(--silver-colors-silver-primary-400)"
  },
  "colors.silver-primary.500": {
    "value": "#547A95",
    "variable": "var(--silver-colors-silver-primary-500)"
  },
  "colors.silver-primary.600": {
    "value": "#45647a",
    "variable": "var(--silver-colors-silver-primary-600)"
  },
  "colors.silver-primary.700": {
    "value": "#374f61",
    "variable": "var(--silver-colors-silver-primary-700)"
  },
  "colors.silver-primary.800": {
    "value": "#283b48",
    "variable": "var(--silver-colors-silver-primary-800)"
  },
  "colors.silver-primary.900": {
    "value": "#1b2730",
    "variable": "var(--silver-colors-silver-primary-900)"
  },
  "colors.silver-neutral.50": {
    "value": "#e9ebee",
    "variable": "var(--silver-colors-silver-neutral-50)"
  },
  "colors.silver-neutral.100": {
    "value": "#d5d9de",
    "variable": "var(--silver-colors-silver-neutral-100)"
  },
  "colors.silver-neutral.200": {
    "value": "#b1bac3",
    "variable": "var(--silver-colors-silver-neutral-200)"
  },
  "colors.silver-neutral.300": {
    "value": "#8a97a4",
    "variable": "var(--silver-colors-silver-neutral-300)"
  },
  "colors.silver-neutral.400": {
    "value": "#708090",
    "variable": "var(--silver-colors-silver-neutral-400)"
  },
  "colors.silver-neutral.500": {
    "value": "#6A7B8C",
    "variable": "var(--silver-colors-silver-neutral-500)"
  },
  "colors.silver-neutral.600": {
    "value": "#576573",
    "variable": "var(--silver-colors-silver-neutral-600)"
  },
  "colors.silver-neutral.700": {
    "value": "#45505b",
    "variable": "var(--silver-colors-silver-neutral-700)"
  },
  "colors.silver-neutral.800": {
    "value": "#333b43",
    "variable": "var(--silver-colors-silver-neutral-800)"
  },
  "colors.silver-neutral.900": {
    "value": "#22272d",
    "variable": "var(--silver-colors-silver-neutral-900)"
  },
  "fonts.sans": {
    "value": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",
    "variable": "var(--silver-fonts-sans)"
  },
  "fonts.serif": {
    "value": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif",
    "variable": "var(--silver-fonts-serif)"
  },
  "fonts.body": {
    "value": "system-ui, -apple-system, sans-serif",
    "variable": "var(--silver-fonts-body)"
  },
  "fonts.mono": {
    "value": "ui-monospace, monospace",
    "variable": "var(--silver-fonts-mono)"
  },
  "radii.xs": {
    "value": "0.125rem",
    "variable": "var(--silver-radii-xs)"
  },
  "radii.xl": {
    "value": "0.75rem",
    "variable": "var(--silver-radii-xl)"
  },
  "radii.2xl": {
    "value": "1rem",
    "variable": "var(--silver-radii-2xl)"
  },
  "radii.3xl": {
    "value": "1.5rem",
    "variable": "var(--silver-radii-3xl)"
  },
  "radii.4xl": {
    "value": "2rem",
    "variable": "var(--silver-radii-4xl)"
  },
  "radii.sm": {
    "value": "0.25rem",
    "variable": "var(--silver-radii-sm)"
  },
  "radii.md": {
    "value": "0.375rem",
    "variable": "var(--silver-radii-md)"
  },
  "radii.lg": {
    "value": "0.5rem",
    "variable": "var(--silver-radii-lg)"
  },
  "radii.full": {
    "value": "9999px",
    "variable": "var(--silver-radii-full)"
  },
  "breakpoints.sm": {
    "value": "640px",
    "variable": "var(--silver-breakpoints-sm)"
  },
  "breakpoints.md": {
    "value": "768px",
    "variable": "var(--silver-breakpoints-md)"
  },
  "breakpoints.lg": {
    "value": "1024px",
    "variable": "var(--silver-breakpoints-lg)"
  },
  "breakpoints.xl": {
    "value": "1280px",
    "variable": "var(--silver-breakpoints-xl)"
  },
  "breakpoints.2xl": {
    "value": "1536px",
    "variable": "var(--silver-breakpoints-2xl)"
  },
  "colors.primary": {
    "value": "var(--silver-colors-silver-primary-500)",
    "variable": "var(--silver-colors-primary)"
  },
  "colors.primary.hover": {
    "value": "var(--silver-colors-silver-primary-600)",
    "variable": "var(--silver-colors-primary-hover)"
  },
  "colors.primary.active": {
    "value": "var(--silver-colors-silver-primary-700)",
    "variable": "var(--silver-colors-primary-active)"
  },
  "colors.primary.subtle": {
    "value": "var(--silver-colors-silver-primary-100)",
    "variable": "var(--silver-colors-primary-subtle)"
  },
  "colors.fg": {
    "value": "var(--silver-colors-fg)",
    "variable": "var(--silver-colors-fg)"
  },
  "colors.fg.muted": {
    "value": "var(--silver-colors-fg-muted)",
    "variable": "var(--silver-colors-fg-muted)"
  },
  "colors.bg": {
    "value": "var(--silver-colors-bg)",
    "variable": "var(--silver-colors-bg)"
  },
  "colors.bg.subtle": {
    "value": "var(--silver-colors-bg-subtle)",
    "variable": "var(--silver-colors-bg-subtle)"
  },
  "colors.border": {
    "value": "var(--silver-colors-border)",
    "variable": "var(--silver-colors-border)"
  },
  "colors.border.emphasized": {
    "value": "var(--silver-colors-border-emphasized)",
    "variable": "var(--silver-colors-border-emphasized)"
  },
  "colors.icon.primary": {
    "value": "var(--silver-colors-fg)",
    "variable": "var(--silver-colors-icon-primary)"
  },
  "colors.icon.secondary": {
    "value": "var(--silver-colors-fg-muted)",
    "variable": "var(--silver-colors-icon-secondary)"
  },
  "colors.icon.tertiary": {
    "value": "var(--silver-colors-icon-tertiary)",
    "variable": "var(--silver-colors-icon-tertiary)"
  },
  "colors.icon.disabled": {
    "value": "var(--silver-colors-icon-disabled)",
    "variable": "var(--silver-colors-icon-disabled)"
  },
  "colors.icon.accent": {
    "value": "var(--silver-colors-primary)",
    "variable": "var(--silver-colors-icon-accent)"
  },
  "colors.icon.success": {
    "value": "var(--silver-colors-green-600)",
    "variable": "var(--silver-colors-icon-success)"
  },
  "colors.icon.error": {
    "value": "var(--silver-colors-red-600)",
    "variable": "var(--silver-colors-icon-error)"
  },
  "colors.icon.warning": {
    "value": "var(--silver-colors-yellow-600)",
    "variable": "var(--silver-colors-icon-warning)"
  },
  "colors.icon.blue": {
    "value": "var(--silver-colors-blue-600)",
    "variable": "var(--silver-colors-icon-blue)"
  },
  "colors.icon.red": {
    "value": "var(--silver-colors-red-600)",
    "variable": "var(--silver-colors-icon-red)"
  },
  "colors.icon.green": {
    "value": "var(--silver-colors-green-600)",
    "variable": "var(--silver-colors-icon-green)"
  },
  "colors.icon.gray": {
    "value": "var(--silver-colors-silver-neutral-600)",
    "variable": "var(--silver-colors-icon-gray)"
  },
  "colors.icon.cyan": {
    "value": "var(--silver-colors-cyan-600)",
    "variable": "var(--silver-colors-icon-cyan)"
  },
  "colors.icon.teal": {
    "value": "var(--silver-colors-teal-600)",
    "variable": "var(--silver-colors-icon-teal)"
  },
  "colors.icon.yellow": {
    "value": "var(--silver-colors-yellow-600)",
    "variable": "var(--silver-colors-icon-yellow)"
  },
  "colors.icon.orange": {
    "value": "var(--silver-colors-orange-600)",
    "variable": "var(--silver-colors-icon-orange)"
  },
  "colors.icon.pink": {
    "value": "var(--silver-colors-pink-600)",
    "variable": "var(--silver-colors-icon-pink)"
  },
  "colors.icon.purple": {
    "value": "var(--silver-colors-purple-600)",
    "variable": "var(--silver-colors-icon-purple)"
  },
  "sizes.component.sm": {
    "value": "var(--silver-sizes-8)",
    "variable": "var(--silver-sizes-component-sm)"
  },
  "sizes.component.md": {
    "value": "var(--silver-sizes-10)",
    "variable": "var(--silver-sizes-component-md)"
  },
  "sizes.component.lg": {
    "value": "var(--silver-sizes-12)",
    "variable": "var(--silver-sizes-component-lg)"
  },
  "sizes.icon.sm": {
    "value": "var(--silver-sizes-4)",
    "variable": "var(--silver-sizes-icon-sm)"
  },
  "sizes.icon.md": {
    "value": "var(--silver-sizes-5)",
    "variable": "var(--silver-sizes-icon-md)"
  },
  "sizes.icon.lg": {
    "value": "var(--silver-sizes-6)",
    "variable": "var(--silver-sizes-icon-lg)"
  },
  "spacing.component.sm": {
    "value": "var(--silver-spacing-3)",
    "variable": "var(--silver-spacing-component-sm)"
  },
  "spacing.component.md": {
    "value": "var(--silver-spacing-4)",
    "variable": "var(--silver-spacing-component-md)"
  },
  "spacing.component.lg": {
    "value": "var(--silver-spacing-5)",
    "variable": "var(--silver-spacing-component-lg)"
  },
  "fontSizes.component.sm": {
    "value": "14px",
    "variable": "var(--silver-font-sizes-component-sm)"
  },
  "fontSizes.component.md": {
    "value": "14px",
    "variable": "var(--silver-font-sizes-component-md)"
  },
  "fontSizes.component.lg": {
    "value": "14px",
    "variable": "var(--silver-font-sizes-component-lg)"
  },
  "fontSizes.icon.sm": {
    "value": "var(--silver-sizes-icon-sm)",
    "variable": "var(--silver-font-sizes-icon-sm)"
  },
  "fontSizes.icon.md": {
    "value": "var(--silver-sizes-icon-md)",
    "variable": "var(--silver-font-sizes-icon-md)"
  },
  "fontSizes.icon.lg": {
    "value": "var(--silver-sizes-icon-lg)",
    "variable": "var(--silver-font-sizes-icon-lg)"
  },
  "radii.component.sm": {
    "value": "var(--silver-radii-sm)",
    "variable": "var(--silver-radii-component-sm)"
  },
  "radii.component.md": {
    "value": "var(--silver-radii-md)",
    "variable": "var(--silver-radii-component-md)"
  },
  "radii.component.lg": {
    "value": "var(--silver-radii-lg)",
    "variable": "var(--silver-radii-component-lg)"
  },
  "spacing.-1": {
    "value": "calc(var(--silver-spacing-1) * -1)",
    "variable": "var(--silver-spacing-1)"
  },
  "spacing.-2": {
    "value": "calc(var(--silver-spacing-2) * -1)",
    "variable": "var(--silver-spacing-2)"
  },
  "spacing.-3": {
    "value": "calc(var(--silver-spacing-3) * -1)",
    "variable": "var(--silver-spacing-3)"
  },
  "spacing.-4": {
    "value": "calc(var(--silver-spacing-4) * -1)",
    "variable": "var(--silver-spacing-4)"
  },
  "spacing.-5": {
    "value": "calc(var(--silver-spacing-5) * -1)",
    "variable": "var(--silver-spacing-5)"
  },
  "spacing.-6": {
    "value": "calc(var(--silver-spacing-6) * -1)",
    "variable": "var(--silver-spacing-6)"
  },
  "spacing.-7": {
    "value": "calc(var(--silver-spacing-7) * -1)",
    "variable": "var(--silver-spacing-7)"
  },
  "spacing.-8": {
    "value": "calc(var(--silver-spacing-8) * -1)",
    "variable": "var(--silver-spacing-8)"
  },
  "spacing.-9": {
    "value": "calc(var(--silver-spacing-9) * -1)",
    "variable": "var(--silver-spacing-9)"
  },
  "spacing.-10": {
    "value": "calc(var(--silver-spacing-10) * -1)",
    "variable": "var(--silver-spacing-10)"
  },
  "spacing.-11": {
    "value": "calc(var(--silver-spacing-11) * -1)",
    "variable": "var(--silver-spacing-11)"
  },
  "spacing.-12": {
    "value": "calc(var(--silver-spacing-12) * -1)",
    "variable": "var(--silver-spacing-12)"
  },
  "spacing.-14": {
    "value": "calc(var(--silver-spacing-14) * -1)",
    "variable": "var(--silver-spacing-14)"
  },
  "spacing.-16": {
    "value": "calc(var(--silver-spacing-16) * -1)",
    "variable": "var(--silver-spacing-16)"
  },
  "spacing.-20": {
    "value": "calc(var(--silver-spacing-20) * -1)",
    "variable": "var(--silver-spacing-20)"
  },
  "spacing.-24": {
    "value": "calc(var(--silver-spacing-24) * -1)",
    "variable": "var(--silver-spacing-24)"
  },
  "spacing.-28": {
    "value": "calc(var(--silver-spacing-28) * -1)",
    "variable": "var(--silver-spacing-28)"
  },
  "spacing.-32": {
    "value": "calc(var(--silver-spacing-32) * -1)",
    "variable": "var(--silver-spacing-32)"
  },
  "spacing.-36": {
    "value": "calc(var(--silver-spacing-36) * -1)",
    "variable": "var(--silver-spacing-36)"
  },
  "spacing.-40": {
    "value": "calc(var(--silver-spacing-40) * -1)",
    "variable": "var(--silver-spacing-40)"
  },
  "spacing.-44": {
    "value": "calc(var(--silver-spacing-44) * -1)",
    "variable": "var(--silver-spacing-44)"
  },
  "spacing.-48": {
    "value": "calc(var(--silver-spacing-48) * -1)",
    "variable": "var(--silver-spacing-48)"
  },
  "spacing.-52": {
    "value": "calc(var(--silver-spacing-52) * -1)",
    "variable": "var(--silver-spacing-52)"
  },
  "spacing.-56": {
    "value": "calc(var(--silver-spacing-56) * -1)",
    "variable": "var(--silver-spacing-56)"
  },
  "spacing.-60": {
    "value": "calc(var(--silver-spacing-60) * -1)",
    "variable": "var(--silver-spacing-60)"
  },
  "spacing.-64": {
    "value": "calc(var(--silver-spacing-64) * -1)",
    "variable": "var(--silver-spacing-64)"
  },
  "spacing.-72": {
    "value": "calc(var(--silver-spacing-72) * -1)",
    "variable": "var(--silver-spacing-72)"
  },
  "spacing.-80": {
    "value": "calc(var(--silver-spacing-80) * -1)",
    "variable": "var(--silver-spacing-80)"
  },
  "spacing.-96": {
    "value": "calc(var(--silver-spacing-96) * -1)",
    "variable": "var(--silver-spacing-96)"
  },
  "spacing.-0.5": {
    "value": "calc(var(--silver-spacing-0\\.5) * -1)",
    "variable": "var(--silver-spacing-0\\.5)"
  },
  "spacing.-1.5": {
    "value": "calc(var(--silver-spacing-1\\.5) * -1)",
    "variable": "var(--silver-spacing-1\\.5)"
  },
  "spacing.-2.5": {
    "value": "calc(var(--silver-spacing-2\\.5) * -1)",
    "variable": "var(--silver-spacing-2\\.5)"
  },
  "spacing.-3.5": {
    "value": "calc(var(--silver-spacing-3\\.5) * -1)",
    "variable": "var(--silver-spacing-3\\.5)"
  },
  "spacing.-4.5": {
    "value": "calc(var(--silver-spacing-4\\.5) * -1)",
    "variable": "var(--silver-spacing-4\\.5)"
  },
  "spacing.-5.5": {
    "value": "calc(var(--silver-spacing-5\\.5) * -1)",
    "variable": "var(--silver-spacing-5\\.5)"
  },
  "spacing.component.-sm": {
    "value": "calc(var(--silver-spacing-component-sm) * -1)",
    "variable": "var(--silver-spacing-component-sm)"
  },
  "spacing.component.-md": {
    "value": "calc(var(--silver-spacing-component-md) * -1)",
    "variable": "var(--silver-spacing-component-md)"
  },
  "spacing.component.-lg": {
    "value": "calc(var(--silver-spacing-component-lg) * -1)",
    "variable": "var(--silver-spacing-component-lg)"
  },
  "colors.colorPalette": {
    "value": "var(--silver-colors-color-palette)",
    "variable": "var(--silver-colors-color-palette)"
  },
  "colors.colorPalette.50": {
    "value": "var(--silver-colors-color-palette-50)",
    "variable": "var(--silver-colors-color-palette-50)"
  },
  "colors.colorPalette.100": {
    "value": "var(--silver-colors-color-palette-100)",
    "variable": "var(--silver-colors-color-palette-100)"
  },
  "colors.colorPalette.200": {
    "value": "var(--silver-colors-color-palette-200)",
    "variable": "var(--silver-colors-color-palette-200)"
  },
  "colors.colorPalette.300": {
    "value": "var(--silver-colors-color-palette-300)",
    "variable": "var(--silver-colors-color-palette-300)"
  },
  "colors.colorPalette.400": {
    "value": "var(--silver-colors-color-palette-400)",
    "variable": "var(--silver-colors-color-palette-400)"
  },
  "colors.colorPalette.500": {
    "value": "var(--silver-colors-color-palette-500)",
    "variable": "var(--silver-colors-color-palette-500)"
  },
  "colors.colorPalette.600": {
    "value": "var(--silver-colors-color-palette-600)",
    "variable": "var(--silver-colors-color-palette-600)"
  },
  "colors.colorPalette.700": {
    "value": "var(--silver-colors-color-palette-700)",
    "variable": "var(--silver-colors-color-palette-700)"
  },
  "colors.colorPalette.800": {
    "value": "var(--silver-colors-color-palette-800)",
    "variable": "var(--silver-colors-color-palette-800)"
  },
  "colors.colorPalette.900": {
    "value": "var(--silver-colors-color-palette-900)",
    "variable": "var(--silver-colors-color-palette-900)"
  },
  "colors.colorPalette.950": {
    "value": "var(--silver-colors-color-palette-950)",
    "variable": "var(--silver-colors-color-palette-950)"
  },
  "colors.colorPalette.hover": {
    "value": "var(--silver-colors-color-palette-hover)",
    "variable": "var(--silver-colors-color-palette-hover)"
  },
  "colors.colorPalette.active": {
    "value": "var(--silver-colors-color-palette-active)",
    "variable": "var(--silver-colors-color-palette-active)"
  },
  "colors.colorPalette.subtle": {
    "value": "var(--silver-colors-color-palette-subtle)",
    "variable": "var(--silver-colors-color-palette-subtle)"
  },
  "colors.colorPalette.muted": {
    "value": "var(--silver-colors-color-palette-muted)",
    "variable": "var(--silver-colors-color-palette-muted)"
  },
  "colors.colorPalette.emphasized": {
    "value": "var(--silver-colors-color-palette-emphasized)",
    "variable": "var(--silver-colors-color-palette-emphasized)"
  },
  "colors.colorPalette.primary": {
    "value": "var(--silver-colors-color-palette-primary)",
    "variable": "var(--silver-colors-color-palette-primary)"
  },
  "colors.colorPalette.secondary": {
    "value": "var(--silver-colors-color-palette-secondary)",
    "variable": "var(--silver-colors-color-palette-secondary)"
  },
  "colors.colorPalette.tertiary": {
    "value": "var(--silver-colors-color-palette-tertiary)",
    "variable": "var(--silver-colors-color-palette-tertiary)"
  },
  "colors.colorPalette.disabled": {
    "value": "var(--silver-colors-color-palette-disabled)",
    "variable": "var(--silver-colors-color-palette-disabled)"
  },
  "colors.colorPalette.accent": {
    "value": "var(--silver-colors-color-palette-accent)",
    "variable": "var(--silver-colors-color-palette-accent)"
  },
  "colors.colorPalette.success": {
    "value": "var(--silver-colors-color-palette-success)",
    "variable": "var(--silver-colors-color-palette-success)"
  },
  "colors.colorPalette.error": {
    "value": "var(--silver-colors-color-palette-error)",
    "variable": "var(--silver-colors-color-palette-error)"
  },
  "colors.colorPalette.warning": {
    "value": "var(--silver-colors-color-palette-warning)",
    "variable": "var(--silver-colors-color-palette-warning)"
  },
  "colors.colorPalette.blue": {
    "value": "var(--silver-colors-color-palette-blue)",
    "variable": "var(--silver-colors-color-palette-blue)"
  },
  "colors.colorPalette.red": {
    "value": "var(--silver-colors-color-palette-red)",
    "variable": "var(--silver-colors-color-palette-red)"
  },
  "colors.colorPalette.green": {
    "value": "var(--silver-colors-color-palette-green)",
    "variable": "var(--silver-colors-color-palette-green)"
  },
  "colors.colorPalette.gray": {
    "value": "var(--silver-colors-color-palette-gray)",
    "variable": "var(--silver-colors-color-palette-gray)"
  },
  "colors.colorPalette.cyan": {
    "value": "var(--silver-colors-color-palette-cyan)",
    "variable": "var(--silver-colors-color-palette-cyan)"
  },
  "colors.colorPalette.teal": {
    "value": "var(--silver-colors-color-palette-teal)",
    "variable": "var(--silver-colors-color-palette-teal)"
  },
  "colors.colorPalette.yellow": {
    "value": "var(--silver-colors-color-palette-yellow)",
    "variable": "var(--silver-colors-color-palette-yellow)"
  },
  "colors.colorPalette.orange": {
    "value": "var(--silver-colors-color-palette-orange)",
    "variable": "var(--silver-colors-color-palette-orange)"
  },
  "colors.colorPalette.pink": {
    "value": "var(--silver-colors-color-palette-pink)",
    "variable": "var(--silver-colors-color-palette-pink)"
  },
  "colors.colorPalette.purple": {
    "value": "var(--silver-colors-color-palette-purple)",
    "variable": "var(--silver-colors-color-palette-purple)"
  }
}

export function token(path, fallback) {
  return tokens[path]?.value || fallback
}

function tokenVar(path, fallback) {
  return tokens[path]?.variable || fallback
}

token.var = tokenVar