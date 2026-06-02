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
import {css} from 'styled-system/css';
import {token} from 'styled-system/tokens';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import type {SpacingStep} from '../Layout/types';

export type CodeBlockContainer = 'card' | 'section';
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
   * Container presentation style.
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
   * Accessible label for the code block region.
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
  padding?: SpacingStep;
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

const styles = {
  root: css({
    position: 'relative',
    isolation: 'isolate',
    display: 'flex',
    flexDirection: 'column',
    color: 'fg',
    overflow: 'hidden',
    boxSizing: 'border-box',
  }),
  card: css({
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border',
    borderRadius: 'md',
  }),
  section: css({
    borderWidth: 0,
    borderRadius: 0,
  }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3',
    px: '4',
    py: '2',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  headerTitle: css({
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'fg.muted',
    fontFamily: 'mono',
    fontSize: 'xs',
    fontWeight: 'medium',
  }),
  scroll: css({
    overflow: 'auto',
  }),
  body: css({
    display: 'flex',
    minW: 'fit-content',
  }),
  gutter: css({
    flexShrink: 0,
    py: '3',
    ps: '4',
    pe: '3',
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    color: 'fg.muted',
    textAlign: 'end',
    userSelect: 'none',
  }),
  gutterLine: css({
    fontFamily: 'mono',
    lineHeight: '1.5rem',
  }),
  pre: css({
    m: 0,
    flex: 1,
    minW: 0,
  }),
  code: css({
    display: 'flex',
    flexDirection: 'column',
    color: 'fg',
    fontFamily: 'mono',
    tabSize: 2,
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
  }),
  codeWithFloatingCopy: css({
    pe: '12',
  }),
  codeWrapped: css({
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  }),
  sizeSm: css({
    fontSize: 'xs',
    lineHeight: '1.5rem',
  }),
  sizeMd: css({
    fontSize: 'sm',
    lineHeight: '1.5rem',
  }),
  line: css({
    display: 'block',
    minH: '1.5rem',
  }),
  lineHighlighted: css({
    bg: 'bg.selected',
    mx: 'calc(var(--cb-padding) * -1)',
    px: 'var(--cb-padding)',
  }),
  copyButtonFloating: css({
    position: 'absolute',
    top: '3',
    right: '3',
  }),
} as const;

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

function getRegionLabel({
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
  const showHeader = title != null;
  const sizeClassName = size === 'sm' ? styles.sizeSm : styles.sizeMd;
  const regionLabel = getRegionLabel({label, title});

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

  const rootStyle: CSSProperties = {
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
  const scrollRegionProps = {
    'aria-label': `${regionLabel} scroll area`,
    role: 'region',
    tabIndex: 0,
  } as const;

  const copyLabel = copied ? 'Copied' : 'Copy code';
  const copyButton = hasCopyButton ? (
    <Button
      className={!showHeader ? styles.copyButtonFloating : undefined}
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

  return (
    <div
      aria-label={regionLabel}
      className={cx(
        styles.root,
        container === 'card' ? styles.card : styles.section,
        className,
      )}
      data-container={container}
      data-size={size}
      data-testid={dataTestId}
      ref={ref}
      role="region"
      style={rootStyle}>
      {showHeader ? (
        <div className={styles.header}>
          <div className={styles.headerTitle}>{title}</div>
          {copyButton}
        </div>
      ) : null}
      <div
        {...scrollRegionProps}
        className={styles.scroll}
        data-testid={dataTestId == null ? undefined : `${dataTestId}-scroll`}
        style={scrollStyle}>
        <div className={styles.body}>
          {hasLineNumbers ? (
            <div
              aria-hidden="true"
              className={cx(styles.gutter, sizeClassName)}>
              {lines.map(line => (
                <div className={styles.gutterLine} key={line.lineNumber}>
                  {line.lineNumber}
                </div>
              ))}
            </div>
          ) : null}
          <pre className={styles.pre}>
            <code
              className={cx(
                styles.code,
                sizeClassName,
                !showHeader && hasCopyButton && styles.codeWithFloatingCopy,
                isWrapped && styles.codeWrapped,
              )}
              data-testid={
                dataTestId == null ? undefined : `${dataTestId}-code`
              }
              data-wrapped={isWrapped ? '' : undefined}
              style={codeStyle}>
              {lines.map(line => (
                <span
                  className={cx(
                    styles.line,
                    highlightedLines?.has(line.lineNumber) &&
                      styles.lineHighlighted,
                  )}
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
      {!showHeader ? copyButton : null}
    </div>
  );
}

CodeBlock.displayName = 'CodeBlock';
