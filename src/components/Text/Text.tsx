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
  as?: TextElement;
  children: ReactNode;
  className?: string;
  color?: TextColor;
  'data-testid'?: string;
  display?: TextDisplay;
  hasCapsize?: boolean;
  hasStrikethrough?: boolean;
  hasTabularNumbers?: boolean;
  hasTruncateTooltip?: boolean | TruncateTooltipPlacement;
  maxLines?: number;
  ref?: Ref<HTMLElement>;
  size?: TextSize;
  style?: CSSProperties;
  textWrap?: TextWrap;
  type?: TextType;
  weight?: TextWeight;
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
