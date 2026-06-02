import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

/**
 * Styled block quotation with an optional citation footer.
 */
export interface BlockquoteProps {
  /**
   * Quoted content.
   */
  children: ReactNode;
  /**
   * Citation text rendered in a footer below the quote.
   */
  cite?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the blockquote element.
   */
  ref?: Ref<HTMLQuoteElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    borderInlineStartWidth: '2px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'border.emphasized',
    ps: '4',
    color: 'fg.muted',
    m: 0,
  }),
  cite: css({
    display: 'block',
    mt: '2',
    fontSize: 'sm',
    lineHeight: 'normal',
    fontStyle: 'normal',
  }),
} as const;

/**
 * Styled block quotation with an optional citation footer.
 */
export function Blockquote({
  children,
  cite,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: BlockquoteProps): React.JSX.Element {
  return (
    <blockquote
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
      {cite != null ? (
        <footer>
          <cite className={styles.cite}>{cite}</cite>
        </footer>
      ) : null}
    </blockquote>
  );
}

Blockquote.displayName = 'Blockquote';
