import type {CSSProperties, ReactNode, Ref} from 'react';
import {highlightRecipe} from 'components/Highlight/Highlight.recipe';

/**
 * Props for highlighting literal query matches within a string.
 */
export interface HighlightProps {
  /**
   * Text in which query matches are highlighted.
   */
  children: string;
  /**
   * Additional CSS class names applied to the root span.
   */
  className?: string;
  /**
   * Test ID applied to the root span.
   */
  'data-testid'?: string;
  /**
   * Literal substring or substrings to highlight. Matching is
   * case-insensitive; empty and whitespace-only queries are ignored.
   */
  query: string | string[];
  /**
   * Ref forwarded to the root span.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the root span.
   */
  style?: CSSProperties;
}

const markClassName = highlightRecipe();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeQueries(query: string | string[]): string[] {
  const queries = Array.isArray(query) ? query : [query];
  const seen = new Set<string>();

  return queries
    .map(value => value.trim())
    .filter(value => {
      const normalizedValue = value.toLowerCase();
      if (normalizedValue === '' || seen.has(normalizedValue)) {
        return false;
      }
      seen.add(normalizedValue);
      return true;
    })
    .sort((a, b) => b.length - a.length);
}

function highlightMatches(
  children: string,
  query: string | string[],
): ReactNode {
  const queries = normalizeQueries(query);
  if (queries.length === 0) {
    return children;
  }

  const matcher = new RegExp(queries.map(escapeRegExp).join('|'), 'giu');
  const content: ReactNode[] = [];
  let cursor = 0;

  for (const match of children.matchAll(matcher)) {
    const index = match.index;
    const value = match[0];

    if (index > cursor) {
      content.push(children.slice(cursor, index));
    }
    content.push(
      <mark className={markClassName} key={`${index}-${value.length}`}>
        {value}
      </mark>,
    );
    cursor = index + value.length;
  }

  if (content.length === 0) {
    return children;
  }
  if (cursor < children.length) {
    content.push(children.slice(cursor));
  }

  return content;
}

/**
 * Highlights case-insensitive literal query matches with semantic mark
 * elements while preserving the original text.
 */
export function Highlight({
  children,
  className,
  'data-testid': dataTestId,
  query,
  ref,
  style,
}: HighlightProps): React.JSX.Element {
  return (
    <span
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {highlightMatches(children, query)}
    </span>
  );
}

Highlight.displayName = 'Highlight';
