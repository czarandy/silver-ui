import {Check, Copy} from 'lucide-react';
import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

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
   * Whether to show the language label when `language` is not plaintext.
   * @default true
   */
  hasLanguageLabel?: boolean;
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
   * Language identifier used for the optional label.
   * @default 'plaintext'
   */
  language?: string;
  /**
   * Maximum scrollable body height. Numbers are treated as pixels.
   */
  maxHeight?: number | string;
  /**
   * Called after code is successfully copied.
   */
  onCopy?: () => void;
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
  title?: ReactNode;
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
    borderWidth: '1px',
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
    borderBlockEndWidth: '1px',
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
    borderInlineEndWidth: '1px',
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
    p: '4',
    color: 'fg',
    fontFamily: 'mono',
    tabSize: 2,
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
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
    bg: 'primary.subtle',
    mx: '-4',
    px: '4',
  }),
  copyButton: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    w: '7',
    h: '7',
    borderWidth: 0,
    borderRadius: 'sm',
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    _hover: {
      bg: 'surface.gray.hover',
      color: 'fg',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    '& > svg': {
      w: '4',
      h: '4',
    },
  }),
  copyButtonFloating: css({
    position: 'absolute',
    insetBlockStart: '2',
    insetInlineEnd: '2',
  }),
} as const;

function getLines(code: string): string[] {
  const lines = code.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function getLineEntries(
  code: string,
): {id: string; lineNumber: number; text: string}[] {
  const occurrences = new Map<string, number>();
  let lineNumber = 0;

  return getLines(code).map(text => {
    lineNumber += 1;
    const occurrence = (occurrences.get(text) ?? 0) + 1;
    occurrences.set(text, occurrence);

    return {
      id: `${text}:${occurrence}`,
      lineNumber,
      text,
    };
  });
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
  hasLanguageLabel = true,
  hasLineNumbers = false,
  highlightLines,
  isWrapped = false,
  language = 'plaintext',
  maxHeight,
  onCopy,
  ref,
  size = 'md',
  style,
  title,
  width = 'fit-content',
}: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => getLineEntries(code), [code]);
  const highlightedLines = useMemo(
    () => (highlightLines == null ? null : new Set(highlightLines)),
    [highlightLines],
  );
  const languageLabel =
    hasLanguageLabel && language !== 'plaintext' ? language : null;
  const showHeader = title != null || languageLabel != null;
  const sizeClassName = size === 'sm' ? styles.sizeSm : styles.sizeMd;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failures leave the copied state unchanged.
    }
  }, [code, onCopy]);

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

  const copyButton = hasCopyButton ? (
    <button
      aria-label={copied ? 'Copied' : 'Copy code'}
      className={cx(
        styles.copyButton,
        !showHeader && styles.copyButtonFloating,
      )}
      onClick={() => {
        void handleCopy();
      }}
      type="button">
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  ) : null;

  return (
    <div
      className={cx(
        styles.root,
        container === 'card' ? styles.card : styles.section,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      {showHeader ? (
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            {title}
            {title != null && languageLabel != null ? ' - ' : null}
            {languageLabel}
          </div>
          {copyButton}
        </div>
      ) : null}
      <div className={styles.scroll} style={scrollStyle}>
        <div className={styles.body}>
          {hasLineNumbers ? (
            <div
              aria-hidden="true"
              className={cx(styles.gutter, sizeClassName)}>
              {lines.map(line => (
                <div className={styles.gutterLine} key={line.id}>
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
                isWrapped && styles.codeWrapped,
              )}>
              {lines.map(line => (
                <span
                  className={cx(
                    styles.line,
                    highlightedLines?.has(line.lineNumber) &&
                      styles.lineHighlighted,
                  )}
                  data-line={line.lineNumber}
                  key={line.id}>
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
