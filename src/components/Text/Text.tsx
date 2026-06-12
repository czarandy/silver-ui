import {
  useRef,
  type AllHTMLAttributes,
  type CSSProperties,
  type JSX,
  type ReactNode,
  type Ref,
} from 'react';
import {textRecipe} from 'components/Text/Text.recipe';
import {getMaxLinesVariant} from 'components/Text/Text.utils';
import {useTruncation} from 'components/Text/useTruncation';
import {useTooltip} from 'components/Tooltip';
import type {TooltipProps} from 'components/Tooltip';
import {cx} from 'internal/cx';
import {mergeRefs} from 'internal/mergeRefs';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';

export type TextType =
  | 'body'
  | 'large'
  | 'label'
  | 'supporting'
  | 'code'
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'inherit';
export type TextSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | 'inherit';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'placeholder'
  | 'active'
  | 'inherit';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'inherit';
export type TextDisplay = 'inline' | 'block';
export type TextElement = 'span' | 'p' | 'div' | 'label';
export type TextWordBreak = 'break-word' | 'break-all';
export type TextWrap = 'wrap' | 'nowrap' | 'balance' | 'pretty';
export type TruncateTooltipPlacement = NonNullable<TooltipProps['placement']>;

type NativeTextProps = Omit<
  AllHTMLAttributes<HTMLElement>,
  'children' | 'color' | 'size' | 'style'
>;

export interface TextProps extends NativeTextProps {
  /**
   * HTML element to render.
   * @default 'span'
   */
  as?: TextElement;
  /**
   * Text content.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the element.
   */
  className?: string;
  /**
   * Text color token.
   */
  color?: TextColor;
  /**
   * Test ID applied to the element.
   */
  'data-testid'?: string;
  /**
   * Display mode of the element.
   * @default 'inline'
   */
  display?: TextDisplay;
  /**
   * Whether to render text with a strikethrough line.
   * @default false
   */
  hasStrikethrough?: boolean;
  /**
   * Whether to use tabular (monospaced) number figures.
   * @default false
   */
  hasTabularNumbers?: boolean;
  /**
   * Whether to show a tooltip when text is truncated, or the tooltip placement.
   * @default true
   */
  hasTruncateTooltip?: boolean | TruncateTooltipPlacement;
  /**
   * Maximum number of visible lines before truncation. 0 disables truncation.
   * @default 0
   */
  maxLines?: number;
  /**
   * Ref forwarded to the rendered element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Font size token.
   */
  size?: TextSize;
  /**
   * Inline styles applied to the element.
   */
  style?: CSSProperties;
  /**
   * CSS text-wrap value.
   */
  textWrap?: TextWrap;
  /**
   * Typographic preset that determines font size and line height.
   * @default 'body'
   */
  type?: TextType;
  /**
   * Font weight.
   */
  weight?: TextWeight;
  /**
   * Word-break strategy.
   */
  wordBreak?: TextWordBreak;
}

const defaultColorByType: Record<TextType, TextColor> = {
  body: 'primary',
  large: 'primary',
  label: 'primary',
  supporting: 'secondary',
  code: 'primary',
  'display-1': 'primary',
  'display-2': 'primary',
  'display-3': 'primary',
  inherit: 'inherit',
};

function BaseText({
  type = 'body',
  size,
  color,
  weight,
  display = 'inline',
  maxLines: _maxLines,
  hasTruncateTooltip: _hasTruncateTooltip,
  wordBreak: _wordBreak,
  textWrap,
  hasStrikethrough = false,
  hasTabularNumbers = false,
  as: Component = 'span',
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  ...props
}: TextProps): JSX.Element {
  const resolvedColor = color ?? defaultColorByType[type];

  return (
    <Component
      {...props}
      className={cx(
        textRecipe({
          type,
          size,
          color: resolvedColor,
          weight,
          display,
          textWrap,
          hasStrikethrough,
          hasTabularNumbers,
          maxLines: 'none',
        }),
        className,
      )}
      data-testid={dataTestId}
      ref={ref as Ref<never>}
      style={style}>
      {children}
    </Component>
  );
}

function TruncatedText({
  type = 'body',
  size,
  color,
  weight,
  display: _display,
  maxLines = 1,
  hasTruncateTooltip = true,
  wordBreak,
  textWrap,
  hasStrikethrough = false,
  hasTabularNumbers = false,
  as: Component = 'span',
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  ...props
}: TextProps): JSX.Element {
  const textRef = useRef<HTMLElement>(null);
  const truncation = useTruncation({maxLines});
  const resolvedColor = color ?? defaultColorByType[type];
  const resolvedWordBreak = wordBreak ?? 'break-word';
  const tooltipPlacement =
    typeof hasTruncateTooltip === 'string' ? hasTruncateTooltip : 'above';
  const isTooltipEnabled =
    hasTruncateTooltip !== false && truncation.isTruncated;

  const tooltip = useTooltip({
    placement: tooltipPlacement,
    isEnabled: isTooltipEnabled,
  });

  const tooltipRef = tooltip.ref;
  const tooltipDescribedBy = tooltip.describedBy;

  useIsomorphicLayoutEffect(() => {
    const element = textRef.current;
    if (element == null) {
      return;
    }

    tooltipRef(element);
    const existing = element.getAttribute('aria-describedby');
    element.setAttribute(
      'aria-describedby',
      [existing, tooltipDescribedBy].filter(Boolean).join(' '),
    );

    return () => {
      tooltipRef(null);
      if (existing != null) {
        element.setAttribute('aria-describedby', existing);
      } else {
        element.removeAttribute('aria-describedby');
      }
    };
  }, [tooltipRef, tooltipDescribedBy]);

  const lineClampStyle: CSSProperties | undefined =
    maxLines > 1 ? {WebkitLineClamp: maxLines} : undefined;

  return (
    <>
      <Component
        {...props}
        className={cx(
          textRecipe({
            type,
            size,
            color: resolvedColor,
            weight,
            display: 'block',
            wordBreak: resolvedWordBreak,
            textWrap,
            hasStrikethrough,
            hasTabularNumbers,
            maxLines: getMaxLinesVariant(maxLines),
          }),
          className,
        )}
        data-testid={dataTestId}
        ref={mergeRefs(ref, truncation.ref, textRef)}
        style={{...style, ...lineClampStyle}}>
        {children}
      </Component>
      {isTooltipEnabled
        ? tooltip.renderTooltip(truncation.fullText, {
            contentStyle: {
              maxWidth: truncation.elementWidth || undefined,
            },
          })
        : null}
    </>
  );
}

/**
 * Renders styled text with optional truncation, tooltip, and typographic presets.
 */
export function Text(props: TextProps): JSX.Element {
  let {maxLines = 0} = props;

  if (process.env.NODE_ENV !== 'production') {
    if (maxLines < 0) {
      throw new Error(
        `Text: maxLines must be a non-negative integer, received ${maxLines}.`,
      );
    }
  }

  maxLines = Math.max(0, maxLines);

  if (maxLines > 0) {
    return <TruncatedText {...props} maxLines={maxLines} />;
  }

  return <BaseText {...props} />;
}

Text.displayName = 'Text';
