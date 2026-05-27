import {
  createElement,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
  type Ref,
} from 'react';
import {css, cx} from 'styled-system/css';
import {mergeRefs} from '../../lib/mergeRefs';
import {Tooltip, type TooltipProps} from '../Tooltip';
import type {TextColor, TextDisplay, TextWordBreak, TextWrap} from './Text';
import {headingRecipe} from './Text.recipe';
import {useTruncation} from './useTruncation';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingType = 'display-1' | 'display-2' | 'display-3';
export type HeadingTruncateTooltipPlacement = NonNullable<
  TooltipProps['placement']
>;

type NativeHeadingProps = Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'children' | 'color' | 'style'
>;

export interface HeadingProps extends NativeHeadingProps {
  level: HeadingLevel;
  type?: HeadingType;
  accessibilityLevel?: HeadingLevel;
  color?: TextColor;
  display?: TextDisplay;
  maxLines?: number;
  hasTruncateTooltip?: boolean | HeadingTruncateTooltipPlacement;
  wordBreak?: TextWordBreak;
  textWrap?: TextWrap;
  hasCapsize?: boolean;
  hasStrikethrough?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLHeadingElement>;
}

const levelToElement = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

const tooltipContentClassName = css({
  maxW: '80',
  wordBreak: 'break-word',
});

function getMaxLinesVariant(maxLines: number): 'none' | 'one' | 'multiple' {
  if (maxLines === 1) {
    return 'one';
  }

  if (maxLines > 1) {
    return 'multiple';
  }

  return 'none';
}

export function Heading({
  level,
  type,
  accessibilityLevel,
  color = 'primary',
  display = 'block',
  maxLines = 0,
  hasTruncateTooltip = true,
  wordBreak,
  textWrap,
  hasCapsize = false,
  hasStrikethrough = false,
  children,
  className,
  style,
  ref,
  ...props
}: HeadingProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const truncation = useTruncation({maxLines});
  const resolvedWordBreak =
    wordBreak ?? (maxLines === 1 ? 'break-all' : 'break-word');
  const resolvedDisplay = maxLines > 0 || hasCapsize ? 'block' : display;
  const tooltipPlacement =
    typeof hasTruncateTooltip === 'string' ? hasTruncateTooltip : 'above';
  const isTooltipEnabled =
    maxLines > 0 && hasTruncateTooltip !== false && truncation.isTruncated;
  const lineClampStyle: CSSProperties | undefined =
    maxLines > 1 ? {WebkitLineClamp: maxLines} : undefined;
  const ariaLevel =
    accessibilityLevel != null && accessibilityLevel !== level
      ? accessibilityLevel
      : undefined;

  const element = createElement(
    levelToElement[level],
    {
      ...props,
      ref: mergeRefs(ref, truncation.ref, headingRef),
      'aria-level': ariaLevel,
      className: cx(
        headingRecipe({
          level,
          type,
          color,
          display: resolvedDisplay,
          wordBreak: maxLines > 0 ? resolvedWordBreak : undefined,
          textWrap,
          hasCapsize,
          hasStrikethrough,
          maxLines: getMaxLinesVariant(maxLines),
        }),
        className,
      ),
      style: {...lineClampStyle, ...style},
      title: isTooltipEnabled ? truncation.fullText : undefined,
    },
    children,
  );

  return (
    <>
      {element}
      {isTooltipEnabled ? (
        <Tooltip
          anchorRef={headingRef}
          content={
            <span className={tooltipContentClassName}>
              {truncation.fullText}
            </span>
          }
          placement={tooltipPlacement}
        />
      ) : null}
    </>
  );
}

Heading.displayName = 'Heading';
