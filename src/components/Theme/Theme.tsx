import {
  createElement,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';

export type ThemeMode = 'dark' | 'light' | 'system';

export type ThemePaletteName =
  | 'blue'
  | 'cyan'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

export type ThemePaletteStep =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

export type ThemePaletteReference =
  | `${ThemePaletteName}.${ThemePaletteStep}`
  | `${ThemePaletteName}-${ThemePaletteStep}`;

export type ThemeColorValue = ThemePaletteReference | (string & {});
type ThemeCssVariableName = `--silver-${string}`;
type ThemeCssVariables = Partial<Record<ThemeCssVariableName, string>>;

export interface ThemeColorTokens {
  bg?: ThemeColorValue;
  bgGhostActive?: ThemeColorValue;
  bgGhostHover?: ThemeColorValue;
  bgHover?: ThemeColorValue;
  bgSelected?: ThemeColorValue;
  bgSubtle?: ThemeColorValue;
  border?: ThemeColorValue;
  borderEmphasized?: ThemeColorValue;
  destructive?: ThemeColorValue;
  destructiveActive?: ThemeColorValue;
  destructiveFg?: ThemeColorValue;
  destructiveHover?: ThemeColorValue;
  fg?: ThemeColorValue;
  fgDisabled?: ThemeColorValue;
  fgMuted?: ThemeColorValue;
  fgOnPrimary?: ThemeColorValue;
  iconAccent?: ThemeColorValue;
  iconBlue?: ThemeColorValue;
  iconCyan?: ThemeColorValue;
  iconDisabled?: ThemeColorValue;
  iconError?: ThemeColorValue;
  iconGray?: ThemeColorValue;
  iconGreen?: ThemeColorValue;
  iconInfo?: ThemeColorValue;
  iconOrange?: ThemeColorValue;
  iconPink?: ThemeColorValue;
  iconPrimary?: ThemeColorValue;
  iconPurple?: ThemeColorValue;
  iconRed?: ThemeColorValue;
  iconSecondary?: ThemeColorValue;
  iconSuccess?: ThemeColorValue;
  iconTeal?: ThemeColorValue;
  iconTertiary?: ThemeColorValue;
  iconWarning?: ThemeColorValue;
  iconYellow?: ThemeColorValue;
  overlayScrim?: ThemeColorValue;
  overlayScrimStrong?: ThemeColorValue;
  overlayScrimSubtle?: ThemeColorValue;
  presenceError?: ThemeColorValue;
  presenceNeutral?: ThemeColorValue;
  presenceSuccess?: ThemeColorValue;
  primary?: ThemeColorValue;
  primaryActive?: ThemeColorValue;
  primaryHover?: ThemeColorValue;
  primarySubtle?: ThemeColorValue;
  skeleton?: ThemeColorValue;
  skeletonShimmer?: ThemeColorValue;
  statusDisabledSolid?: ThemeColorValue;
  statusDisabledSolidFg?: ThemeColorValue;
  statusErrorBorder?: ThemeColorValue;
  statusErrorBorderHover?: ThemeColorValue;
  statusErrorFg?: ThemeColorValue;
  statusErrorSolid?: ThemeColorValue;
  statusErrorSolidFg?: ThemeColorValue;
  statusInfoFg?: ThemeColorValue;
  statusInfoSolid?: ThemeColorValue;
  statusInfoSolidFg?: ThemeColorValue;
  statusNeutralSolid?: ThemeColorValue;
  statusNeutralSolidFg?: ThemeColorValue;
  statusSuccessBorder?: ThemeColorValue;
  statusSuccessBorderHover?: ThemeColorValue;
  statusSuccessFg?: ThemeColorValue;
  statusSuccessSolid?: ThemeColorValue;
  statusSuccessSolidFg?: ThemeColorValue;
  statusWarningBorder?: ThemeColorValue;
  statusWarningBorderHover?: ThemeColorValue;
  statusWarningFg?: ThemeColorValue;
  statusWarningSolid?: ThemeColorValue;
  statusWarningSolidFg?: ThemeColorValue;
  surfaceBlue?: ThemeColorValue;
  surfaceBlueAccent?: ThemeColorValue;
  surfaceBlueFg?: ThemeColorValue;
  surfaceBlueHover?: ThemeColorValue;
  surfaceCyan?: ThemeColorValue;
  surfaceCyanAccent?: ThemeColorValue;
  surfaceCyanFg?: ThemeColorValue;
  surfaceCyanHover?: ThemeColorValue;
  surfaceGray?: ThemeColorValue;
  surfaceGrayAccent?: ThemeColorValue;
  surfaceGrayFg?: ThemeColorValue;
  surfaceGrayHover?: ThemeColorValue;
  surfaceGreen?: ThemeColorValue;
  surfaceGreenAccent?: ThemeColorValue;
  surfaceGreenFg?: ThemeColorValue;
  surfaceGreenHover?: ThemeColorValue;
  surfaceOrange?: ThemeColorValue;
  surfaceOrangeAccent?: ThemeColorValue;
  surfaceOrangeFg?: ThemeColorValue;
  surfaceOrangeHover?: ThemeColorValue;
  surfacePink?: ThemeColorValue;
  surfacePinkAccent?: ThemeColorValue;
  surfacePinkFg?: ThemeColorValue;
  surfacePinkHover?: ThemeColorValue;
  surfacePurple?: ThemeColorValue;
  surfacePurpleAccent?: ThemeColorValue;
  surfacePurpleFg?: ThemeColorValue;
  surfacePurpleHover?: ThemeColorValue;
  surfaceRed?: ThemeColorValue;
  surfaceRedAccent?: ThemeColorValue;
  surfaceRedFg?: ThemeColorValue;
  surfaceRedHover?: ThemeColorValue;
  surfaceTeal?: ThemeColorValue;
  surfaceTealAccent?: ThemeColorValue;
  surfaceTealFg?: ThemeColorValue;
  surfaceTealHover?: ThemeColorValue;
  surfaceYellow?: ThemeColorValue;
  surfaceYellowAccent?: ThemeColorValue;
  surfaceYellowFg?: ThemeColorValue;
  surfaceYellowHover?: ThemeColorValue;
  track?: ThemeColorValue;
  trackDisabled?: ThemeColorValue;
  trackEmphasized?: ThemeColorValue;
}

export interface ThemeFontTokens {
  body?: string;
  mono?: string;
}

export interface ThemeFontSizeTokens {
  componentLg?: string;
  componentMd?: string;
  componentSm?: string;
  iconLg?: string;
  iconMd?: string;
  iconSm?: string;
}

export interface ThemeRadiusTokens {
  componentLg?: string;
  componentMd?: string;
  componentSm?: string;
  lg?: string;
  md?: string;
  sm?: string;
}

export interface ThemeShadowTokens {
  focus?: string;
  focusError?: string;
  focusSuccess?: string;
  focusWarning?: string;
}

export interface ThemeSizeTokens {
  componentLg?: string;
  componentMd?: string;
  componentSm?: string;
  iconLg?: string;
  iconMd?: string;
  iconSm?: string;
}

export interface ThemeSpacingTokens {
  componentLg?: string;
  componentMd?: string;
  componentSm?: string;
  focusOffset?: string;
  focusOffsetLoose?: string;
  focusOffsetTight?: string;
}

export interface ThemeTokens {
  colors?: ThemeColorTokens;
  fonts?: ThemeFontTokens;
  fontSizes?: ThemeFontSizeTokens;
  radii?: ThemeRadiusTokens;
  shadows?: ThemeShadowTokens;
  sizes?: ThemeSizeTokens;
  spacing?: ThemeSpacingTokens;
}

export interface ThemeProps extends HTMLAttributes<HTMLElement> {
  /**
   * HTML element type to render.
   * @default 'div'
   */
  as?: ElementType;
  /**
   * Theme content.
   */
  children?: ReactNode;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Theme mode. System mode omits data-theme and follows existing CSS/media
   * query behavior.
   * @default 'system'
   */
  mode?: ThemeMode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Friendly token overrides mapped to Silver CSS custom properties.
   */
  tokens?: ThemeTokens;
}

const colorTokenVariables: Record<
  keyof ThemeColorTokens,
  ThemeCssVariableName
> = {
  bg: '--silver-colors-bg',
  bgGhostActive: '--silver-colors-bg-ghost-active',
  bgGhostHover: '--silver-colors-bg-ghost-hover',
  bgHover: '--silver-colors-bg-hover',
  bgSelected: '--silver-colors-bg-selected',
  bgSubtle: '--silver-colors-bg-subtle',
  border: '--silver-colors-border',
  borderEmphasized: '--silver-colors-border-emphasized',
  destructive: '--silver-colors-destructive',
  destructiveActive: '--silver-colors-destructive-active',
  destructiveFg: '--silver-colors-destructive-fg',
  destructiveHover: '--silver-colors-destructive-hover',
  fg: '--silver-colors-fg',
  fgDisabled: '--silver-colors-fg-disabled',
  fgMuted: '--silver-colors-fg-muted',
  fgOnPrimary: '--silver-colors-fg-on-primary',
  primary: '--silver-colors-primary',
  primaryActive: '--silver-colors-primary-active',
  primaryHover: '--silver-colors-primary-hover',
  primarySubtle: '--silver-colors-primary-subtle',
  iconAccent: '--silver-colors-icon-accent',
  iconBlue: '--silver-colors-icon-blue',
  iconCyan: '--silver-colors-icon-cyan',
  iconDisabled: '--silver-colors-icon-disabled',
  iconError: '--silver-colors-icon-error',
  iconGray: '--silver-colors-icon-gray',
  iconGreen: '--silver-colors-icon-green',
  iconInfo: '--silver-colors-icon-info',
  iconOrange: '--silver-colors-icon-orange',
  iconPink: '--silver-colors-icon-pink',
  iconPrimary: '--silver-colors-icon-primary',
  iconPurple: '--silver-colors-icon-purple',
  iconRed: '--silver-colors-icon-red',
  iconSecondary: '--silver-colors-icon-secondary',
  iconSuccess: '--silver-colors-icon-success',
  iconTeal: '--silver-colors-icon-teal',
  iconTertiary: '--silver-colors-icon-tertiary',
  iconWarning: '--silver-colors-icon-warning',
  iconYellow: '--silver-colors-icon-yellow',
  overlayScrim: '--silver-colors-overlay-scrim',
  overlayScrimStrong: '--silver-colors-overlay-scrim-strong',
  overlayScrimSubtle: '--silver-colors-overlay-scrim-subtle',
  presenceError: '--silver-colors-presence-error',
  presenceNeutral: '--silver-colors-presence-neutral',
  presenceSuccess: '--silver-colors-presence-success',
  skeleton: '--silver-colors-skeleton',
  skeletonShimmer: '--silver-colors-skeleton-shimmer',
  statusDisabledSolid: '--silver-colors-status-disabled-solid',
  statusDisabledSolidFg: '--silver-colors-status-disabled-solid-fg',
  statusErrorBorder: '--silver-colors-status-error-border',
  statusErrorBorderHover: '--silver-colors-status-error-border-hover',
  statusErrorFg: '--silver-colors-status-error-fg',
  statusErrorSolid: '--silver-colors-status-error-solid',
  statusErrorSolidFg: '--silver-colors-status-error-solid-fg',
  statusInfoFg: '--silver-colors-status-info-fg',
  statusInfoSolid: '--silver-colors-status-info-solid',
  statusInfoSolidFg: '--silver-colors-status-info-solid-fg',
  statusNeutralSolid: '--silver-colors-status-neutral-solid',
  statusNeutralSolidFg: '--silver-colors-status-neutral-solid-fg',
  statusSuccessBorder: '--silver-colors-status-success-border',
  statusSuccessBorderHover: '--silver-colors-status-success-border-hover',
  statusSuccessFg: '--silver-colors-status-success-fg',
  statusSuccessSolid: '--silver-colors-status-success-solid',
  statusSuccessSolidFg: '--silver-colors-status-success-solid-fg',
  statusWarningBorder: '--silver-colors-status-warning-border',
  statusWarningBorderHover: '--silver-colors-status-warning-border-hover',
  statusWarningFg: '--silver-colors-status-warning-fg',
  statusWarningSolid: '--silver-colors-status-warning-solid',
  statusWarningSolidFg: '--silver-colors-status-warning-solid-fg',
  surfaceBlue: '--silver-colors-surface-blue',
  surfaceBlueAccent: '--silver-colors-surface-blue-accent',
  surfaceBlueFg: '--silver-colors-surface-blue-fg',
  surfaceBlueHover: '--silver-colors-surface-blue-hover',
  surfaceCyan: '--silver-colors-surface-cyan',
  surfaceCyanAccent: '--silver-colors-surface-cyan-accent',
  surfaceCyanFg: '--silver-colors-surface-cyan-fg',
  surfaceCyanHover: '--silver-colors-surface-cyan-hover',
  surfaceGray: '--silver-colors-surface-gray',
  surfaceGrayAccent: '--silver-colors-surface-gray-accent',
  surfaceGrayFg: '--silver-colors-surface-gray-fg',
  surfaceGrayHover: '--silver-colors-surface-gray-hover',
  surfaceGreen: '--silver-colors-surface-green',
  surfaceGreenAccent: '--silver-colors-surface-green-accent',
  surfaceGreenFg: '--silver-colors-surface-green-fg',
  surfaceGreenHover: '--silver-colors-surface-green-hover',
  surfaceOrange: '--silver-colors-surface-orange',
  surfaceOrangeAccent: '--silver-colors-surface-orange-accent',
  surfaceOrangeFg: '--silver-colors-surface-orange-fg',
  surfaceOrangeHover: '--silver-colors-surface-orange-hover',
  surfacePink: '--silver-colors-surface-pink',
  surfacePinkAccent: '--silver-colors-surface-pink-accent',
  surfacePinkFg: '--silver-colors-surface-pink-fg',
  surfacePinkHover: '--silver-colors-surface-pink-hover',
  surfacePurple: '--silver-colors-surface-purple',
  surfacePurpleAccent: '--silver-colors-surface-purple-accent',
  surfacePurpleFg: '--silver-colors-surface-purple-fg',
  surfacePurpleHover: '--silver-colors-surface-purple-hover',
  surfaceRed: '--silver-colors-surface-red',
  surfaceRedAccent: '--silver-colors-surface-red-accent',
  surfaceRedFg: '--silver-colors-surface-red-fg',
  surfaceRedHover: '--silver-colors-surface-red-hover',
  surfaceTeal: '--silver-colors-surface-teal',
  surfaceTealAccent: '--silver-colors-surface-teal-accent',
  surfaceTealFg: '--silver-colors-surface-teal-fg',
  surfaceTealHover: '--silver-colors-surface-teal-hover',
  surfaceYellow: '--silver-colors-surface-yellow',
  surfaceYellowAccent: '--silver-colors-surface-yellow-accent',
  surfaceYellowFg: '--silver-colors-surface-yellow-fg',
  surfaceYellowHover: '--silver-colors-surface-yellow-hover',
  track: '--silver-colors-track',
  trackDisabled: '--silver-colors-track-disabled',
  trackEmphasized: '--silver-colors-track-emphasized',
};

const fontTokenVariables: Record<keyof ThemeFontTokens, ThemeCssVariableName> =
  {
    body: '--silver-fonts-body',
    mono: '--silver-fonts-mono',
  };

const fontSizeTokenVariables: Record<
  keyof ThemeFontSizeTokens,
  ThemeCssVariableName
> = {
  componentLg: '--silver-font-sizes-component-lg',
  componentMd: '--silver-font-sizes-component-md',
  componentSm: '--silver-font-sizes-component-sm',
  iconLg: '--silver-font-sizes-icon-lg',
  iconMd: '--silver-font-sizes-icon-md',
  iconSm: '--silver-font-sizes-icon-sm',
};

const radiusTokenVariables: Record<
  keyof ThemeRadiusTokens,
  ThemeCssVariableName
> = {
  componentLg: '--silver-radii-component-lg',
  componentMd: '--silver-radii-component-md',
  componentSm: '--silver-radii-component-sm',
  lg: '--silver-radii-lg',
  md: '--silver-radii-md',
  sm: '--silver-radii-sm',
};

const shadowTokenVariables: Record<
  keyof ThemeShadowTokens,
  ThemeCssVariableName
> = {
  focus: '--silver-shadows-focus',
  focusError: '--silver-shadows-focus-error',
  focusSuccess: '--silver-shadows-focus-success',
  focusWarning: '--silver-shadows-focus-warning',
};

const sizeTokenVariables: Record<keyof ThemeSizeTokens, ThemeCssVariableName> =
  {
    componentLg: '--silver-sizes-component-lg',
    componentMd: '--silver-sizes-component-md',
    componentSm: '--silver-sizes-component-sm',
    iconLg: '--silver-sizes-icon-lg',
    iconMd: '--silver-sizes-icon-md',
    iconSm: '--silver-sizes-icon-sm',
  };

const spacingTokenVariables: Record<
  keyof ThemeSpacingTokens,
  ThemeCssVariableName
> = {
  componentLg: '--silver-spacing-component-lg',
  componentMd: '--silver-spacing-component-md',
  componentSm: '--silver-spacing-component-sm',
  focusOffset: '--silver-spacing-focus-offset',
  focusOffsetLoose: '--silver-spacing-focus-offset-loose',
  focusOffsetTight: '--silver-spacing-focus-offset-tight',
};

const paletteReferencePattern =
  /^(blue|cyan|gray|green|orange|pink|purple|red|teal|yellow)[.-](50|100|200|300|400|500|600|700|800|900)$/;

function resolveThemeColorValue(value: ThemeColorValue): string {
  const match = paletteReferencePattern.exec(value);

  if (match == null) {
    return value;
  }

  const [, paletteName, paletteStep] = match;
  return `var(--silver-colors-${paletteName}-${paletteStep})`;
}

function assignTokenVariables<TTokenName extends string>(
  style: ThemeCssVariables,
  tokens: Partial<Record<TTokenName, string>> | undefined,
  variables: Record<TTokenName, ThemeCssVariableName>,
  resolveValue: (value: string) => string = value => value,
): void {
  if (tokens == null) {
    return;
  }

  for (const tokenName of Object.keys(variables) as TTokenName[]) {
    const value = tokens[tokenName];

    if (value != null) {
      style[variables[tokenName]] = resolveValue(value);
    }
  }
}

function createThemeStyle(
  tokens: ThemeTokens | undefined,
  style: CSSProperties | undefined,
): CSSProperties {
  const themeStyle: CSSProperties & ThemeCssVariables = {};

  assignTokenVariables(
    themeStyle,
    tokens?.colors,
    colorTokenVariables,
    resolveThemeColorValue,
  );
  assignTokenVariables(themeStyle, tokens?.fontSizes, fontSizeTokenVariables);
  assignTokenVariables(themeStyle, tokens?.fonts, fontTokenVariables);
  assignTokenVariables(themeStyle, tokens?.radii, radiusTokenVariables);
  assignTokenVariables(themeStyle, tokens?.shadows, shadowTokenVariables);
  assignTokenVariables(themeStyle, tokens?.sizes, sizeTokenVariables);
  assignTokenVariables(themeStyle, tokens?.spacing, spacingTokenVariables);

  return {
    ...themeStyle,
    ...style,
  };
}

/**
 * Scoped Silver UI theme provider backed by CSS custom properties.
 */
export function Theme({
  as: Element = 'div',
  children,
  className,
  'data-testid': dataTestId,
  mode = 'system',
  ref,
  style,
  tokens,
  ...htmlProps
}: ThemeProps): React.JSX.Element {
  const themeStyle = createThemeStyle(tokens, style);

  return createElement(
    Element,
    {
      ...htmlProps,
      className: cx(className),
      'data-testid': dataTestId,
      'data-theme': mode === 'system' ? undefined : mode,
      ref,
      style: themeStyle,
    },
    children,
  );
}

Theme.displayName = 'Theme';
