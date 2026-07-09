'use client';

import {Check, Copy} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {Card} from 'components/Card';
import {codeBlockRecipe} from 'components/CodeBlock/CodeBlock.recipe';
import {Divider} from 'components/Divider';
import type {SpacingToken} from 'internal/spacingTokens';
import {token} from 'styled-system/tokens';
import {cx} from 'utils/cx';

export type CodeBlockContainer = 'card' | 'section' | 'inline';
export type CodeBlockSize = 'sm' | 'md';

export interface CodeBlockProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Source code to display.
   */
  code: string;
  /**
   * Container presentation style. Use `'inline'` for a compact, single-line
   * snippet (e.g. an install command) with the copy button rendered inline;
   * line numbers, titles, and `maxHeight` do not apply to inline blocks.
   * @default 'card'
   */
  container?: CodeBlockContainer;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether to show a copy button.
   * @default true
   */
  hasCopyButton?: boolean;
  /**
   * Whether to render line numbers.
   * @default false
   */
  hasLineNumbers?: boolean;
  /**
   * One-based line numbers to visually highlight.
   */
  highlightLines?: number[];
  /**
   * Whether long lines should wrap.
   * @default false
   */
  isWrapped?: boolean;
  /**
   * Accessible label for the code block.
   */
  label?: string;
  /**
   * Maximum scrollable body height. Numbers are treated as pixels.
   */
  maxHeight?: number | string;
  /**
   * Called after code is successfully copied.
   */
  onCopy?: () => void;
  /**
   * Inner padding step.
   * @default 4
   */
  padding?: SpacingToken;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: CodeBlockSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Optional header title.
   */
  title?: string;
  /**
   * Width of the code block. Accepts any CSS width value.
   * @default 'fit-content'
   */
  width?: string;
}

function getLines(code: string): string[] {
  const lines = code.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function getLineEntries(code: string): {lineNumber: number; text: string}[] {
  return getLines(code).map((text, index) => ({
    lineNumber: index + 1,
    text,
  }));
}

function getGroupLabel({
  label,
  title,
}: {
  label?: string;
  title?: string;
}): string {
  if (label != null) {
    return label;
  }

  if (title != null && title.length > 0) {
    return `${title} code block`;
  }

  return 'Code block';
}

/**
 * Read-only source code display.
 */
export function CodeBlock({
  className,
  code,
  container = 'card',
  'data-testid': dataTestId,
  hasCopyButton = true,
  hasLineNumbers = false,
  highlightLines,
  isWrapped = false,
  label,
  maxHeight,
  onCopy,
  padding = 4,
  ref,
  size = 'md',
  style,
  title,
  width = 'fit-content',
}: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const copiedResetTimeoutRef = useRef<number | null>(null);
  const lines = useMemo(() => getLineEntries(code), [code]);
  const highlightLineKey = highlightLines?.join(',');
  const highlightedLines = useMemo(
    () =>
      highlightLineKey == null || highlightLineKey.length === 0
        ? null
        : new Set(highlightLineKey.split(',').map(Number)),
    [highlightLineKey],
  );
  const isInline = container === 'inline';
  const showHeader = !isInline && title != null;
  const groupLabel = getGroupLabel({label, title});

  const classes = codeBlockRecipe({
    container,
    size,
    isWrapped,
    hasFloatingCopy: !showHeader && hasCopyButton,
  });

  useEffect(() => {
    return () => {
      if (copiedResetTimeoutRef.current != null) {
        window.clearTimeout(copiedResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      if (copiedResetTimeoutRef.current != null) {
        window.clearTimeout(copiedResetTimeoutRef.current);
      }
      copiedResetTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedResetTimeoutRef.current = null;
      }, 2000);
    } catch {
      // Clipboard failures leave the copied state unchanged.
    }
  }, [code, onCopy]);

  const paddingToken = token(`spacing.${padding}`);
  const codeStyle: CSSProperties = {
    ['--cb-padding' as string]: paddingToken,
    padding: paddingToken,
  };

  const rootStyle: CSSProperties = isInline
    ? {...style}
    : {
        width,
        minWidth: width === 'fit-content' ? 'min(100%, 400px)' : undefined,
        maxWidth: width === 'fit-content' ? '100%' : undefined,
        ...style,
      };
  const scrollStyle: CSSProperties | undefined =
    maxHeight == null
      ? undefined
      : {
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        };
  // `role="group"` rather than `"region"`: a named region is a landmark, and a
  // page of code blocks would publish one per block (axe: landmark-unique).
  const scrollRegionProps = {
    'aria-label': `${groupLabel} scroll area`,
    role: 'group',
    tabIndex: 0,
  } as const;

  const copyLabel = copied ? 'Copied' : 'Copy code';
  const copyButton = hasCopyButton ? (
    <Button
      icon={copied ? Check : Copy}
      isIconOnly
      label={copyLabel}
      onClick={() => {
        void handleCopy();
      }}
      size="sm"
      tooltip={copyLabel}
      variant="ghost"
    />
  ) : null;

  if (isInline) {
    return (
      <Card
        aria-label={groupLabel}
        className={cx(classes.root, className)}
        data-container={container}
        data-size={size}
        data-testid={dataTestId}
        padding={1}
        ref={ref}
        role="group"
        style={rootStyle}>
        <code
          className={classes.inlineCode}
          data-testid={dataTestId == null ? undefined : `${dataTestId}-code`}>
          {code}
        </code>
        {copyButton != null ? (
          <>
            <Divider
              className={classes.inlineDivider}
              height="auto"
              isFullBleed
              orientation="vertical"
            />
            {copyButton}
          </>
        ) : null}
      </Card>
    );
  }

  return (
    <Card
      aria-label={groupLabel}
      className={cx(classes.root, className)}
      data-container={container}
      data-size={size}
      data-testid={dataTestId}
      ref={ref}
      // `role="group"`, matching the inline container: a named `region` would
      // make every code block on the page a landmark (axe: landmark-unique).
      role="group"
      style={rootStyle}
      variant={container === 'section' ? 'section' : 'default'}>
      {showHeader ? (
        <div className={classes.header}>
          <div className={classes.headerTitle}>{title}</div>
          {copyButton}
        </div>
      ) : null}
      <div
        {...scrollRegionProps}
        className={classes.scroll}
        data-testid={dataTestId == null ? undefined : `${dataTestId}-scroll`}
        style={scrollStyle}>
        <div className={classes.body}>
          {hasLineNumbers ? (
            <div aria-hidden="true" className={classes.gutter}>
              {lines.map(line => (
                <div className={classes.gutterLine} key={line.lineNumber}>
                  {line.lineNumber}
                </div>
              ))}
            </div>
          ) : null}
          <pre className={classes.pre}>
            <code
              className={classes.code}
              data-testid={
                dataTestId == null ? undefined : `${dataTestId}-code`
              }
              data-wrapped={isWrapped ? '' : undefined}
              style={codeStyle}>
              {lines.map(line => (
                <span
                  className={classes.line}
                  data-highlighted={
                    highlightedLines?.has(line.lineNumber) ? '' : undefined
                  }
                  data-line={line.lineNumber}
                  key={line.lineNumber}>
                  {line.text.length === 0 ? '\u200b' : line.text}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
      {!showHeader && copyButton != null ? (
        <div className={classes.copyButtonFloating} data-cb-copy="">
          {copyButton}
        </div>
      ) : null}
    </Card>
  );
}

CodeBlock.displayName = 'CodeBlock';
