import {
  createElement,
  useRef,
  type AllHTMLAttributes,
  type CSSProperties,
  type JSX,
  type ReactNode,
  type Ref,
} from 'react';
import {css, cx} from 'styled-system/css';
import {mergeRefs} from '../../internal/mergeRefs';
import {Tooltip, type TooltipProps} from '../Tooltip';
import {textRecipe} from './Text.recipe';
import {useTruncation} from './useTruncation';

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
export type TextElement = 'span' | 'p' | 'div' | 'label' | 'h1' | 'h2' | 'h3';
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
   * Whether to apply capsize leading-trim adjustments.
   * @default false
   */
  hasCapsize?: boolean;
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

type TextElementProps = AllHTMLAttributes<HTMLElement> & {
  'data-testid'?: string;
  ref?: Ref<HTMLElement>;
};

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

const styles = {
  tooltipContent: css({
    maxW: '80',
    wordBreak: 'break-word',
  }),
};

function getMaxLinesVariant(maxLines: number): 'none' | 'one' | 'multiple' {
  if (maxLines === 1) {
    return 'one';
  }

  if (maxLines > 1) {
    return 'multiple';
  }

  return 'none';
}

/**
 * Renders styled text with optional truncation, tooltip, and typographic presets.
 */
export function Text({
  type = 'body',
  size,
  color,
  weight,
  display = 'inline',
  maxLines = 0,
  hasTruncateTooltip = true,
  wordBreak,
  textWrap,
  hasCapsize = false,
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
  const resolvedWordBreak =
    wordBreak ?? (maxLines === 1 ? 'break-all' : 'break-word');
  const resolvedDisplay = maxLines > 0 || hasCapsize ? 'block' : display;
  const tooltipPlacement =
    typeof hasTruncateTooltip === 'string' ? hasTruncateTooltip : 'above';
  const isTooltipEnabled =
    maxLines > 0 && hasTruncateTooltip !== false && truncation.isTruncated;
  const lineClampStyle: CSSProperties | undefined =
    maxLines > 1 ? {WebkitLineClamp: maxLines} : undefined;

  const elementProps: TextElementProps = {
    ...props,
    ref: mergeRefs(ref, truncation.ref, textRef),
    'data-testid': dataTestId,
    className: cx(
      textRecipe({
        type,
        size,
        color: resolvedColor,
        weight,
        display: resolvedDisplay,
        wordBreak: maxLines > 0 ? resolvedWordBreak : undefined,
        textWrap,
        hasCapsize,
        hasStrikethrough,
        hasTabularNumbers,
        maxLines: getMaxLinesVariant(maxLines),
      }),
      className,
    ),
    style: {...lineClampStyle, ...style},
    title: isTooltipEnabled ? truncation.fullText : undefined,
  };

  const element = createElement(Component, elementProps, children);

  return (
    <>
      {element}
      {isTooltipEnabled ? (
        <Tooltip
          anchorRef={textRef}
          content={
            <span className={styles.tooltipContent}>{truncation.fullText}</span>
          }
          placement={tooltipPlacement}
        />
      ) : null}
    </>
  );
}

Text.displayName = 'Text';
