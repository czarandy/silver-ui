import {
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {useIsomorphicLayoutEffect} from '../../internal/useIsomorphicLayoutEffect';
import type {TooltipProps} from '../Tooltip';
import {useTooltip} from '../Tooltip';
import type {TextColor, TextDisplay, TextWordBreak, TextWrap} from './Text';
import {headingRecipe} from './Text.recipe';
import {getMaxLinesVariant} from './Text.utils';
import {useTruncation} from './useTruncation';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTruncateTooltipPlacement = NonNullable<
  TooltipProps['placement']
>;

type NativeHeadingProps = Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'children' | 'color' | 'style'
>;

export interface HeadingProps extends NativeHeadingProps {
  /**
   * Overrides the ARIA heading level independently of the rendered element.
   */
  accessibilityLevel?: HeadingLevel;
  /**
   * Heading content.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the heading.
   */
  className?: string;
  /**
   * Text color token.
   * @default 'primary'
   */
  color?: TextColor;
  /**
   * Test ID applied to the heading.
   */
  'data-testid'?: string;
  /**
   * Display mode of the heading.
   * @default 'block'
   */
  display?: TextDisplay;
  /**
   * Whether to render text with a strikethrough line.
   * @default false
   */
  hasStrikethrough?: boolean;
  /**
   * Whether to show a tooltip when text is truncated, or the tooltip placement.
   * @default true
   */
  hasTruncateTooltip?: boolean | HeadingTruncateTooltipPlacement;
  /**
   * Semantic heading level that determines the rendered h1-h6 element.
   */
  level: HeadingLevel;
  /**
   * Maximum number of visible lines before truncation. 0 disables truncation.
   * @default 0
   */
  maxLines?: number;
  /**
   * Ref forwarded to the heading element.
   */
  ref?: Ref<HTMLHeadingElement>;
  /**
   * Inline styles applied to the heading.
   */
  style?: CSSProperties;
  /**
   * CSS text-wrap value.
   */
  textWrap?: TextWrap;
  /**
   * Word-break strategy.
   */
  wordBreak?: TextWordBreak;
}

const levelToElement = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
} as const;

function BaseHeading({
  level,
  accessibilityLevel,
  color = 'primary',
  display = 'block',
  maxLines: _maxLines,
  hasTruncateTooltip: _hasTruncateTooltip,
  wordBreak: _wordBreak,
  textWrap,
  hasStrikethrough = false,
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  ...props
}: HeadingProps): JSX.Element {
  const Component = levelToElement[level];
  const ariaLevel =
    accessibilityLevel != null && accessibilityLevel !== level
      ? accessibilityLevel
      : undefined;

  return (
    <Component
      {...props}
      aria-level={ariaLevel}
      className={cx(
        headingRecipe({
          level,
          color,
          display,
          textWrap,
          hasStrikethrough,
          maxLines: 'none',
        }),
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </Component>
  );
}

function TruncatedHeading({
  level,
  accessibilityLevel,
  color = 'primary',
  display: _display,
  maxLines = 1,
  hasTruncateTooltip = true,
  wordBreak,
  textWrap,
  hasStrikethrough = false,
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  ...props
}: HeadingProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const truncation = useTruncation({maxLines});
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
    const element = headingRef.current;
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
  const Component = levelToElement[level];
  const ariaLevel =
    accessibilityLevel != null && accessibilityLevel !== level
      ? accessibilityLevel
      : undefined;

  return (
    <>
      <Component
        {...props}
        aria-level={ariaLevel}
        className={cx(
          headingRecipe({
            level,
            color,
            display: 'block',
            wordBreak: resolvedWordBreak,
            textWrap,
            hasStrikethrough,
            maxLines: getMaxLinesVariant(maxLines),
          }),
          className,
        )}
        data-testid={dataTestId}
        ref={mergeRefs(ref, truncation.ref, headingRef)}
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
 * Renders a semantic heading element (h1-h6) with typographic styling and optional truncation.
 */
export function Heading(props: HeadingProps): JSX.Element {
  let {maxLines = 0} = props;

  if (process.env.NODE_ENV !== 'production') {
    if (maxLines < 0) {
      throw new Error(
        `Heading: maxLines must be a non-negative integer, received ${maxLines}.`,
      );
    }
  }

  maxLines = Math.max(0, maxLines);

  if (maxLines > 0) {
    return <TruncatedHeading {...props} maxLines={maxLines} />;
  }

  return <BaseHeading {...props} />;
}

Heading.displayName = 'Heading';
