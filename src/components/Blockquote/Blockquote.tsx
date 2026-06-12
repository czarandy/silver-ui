import type {CSSProperties, ReactNode, Ref} from 'react';
import {blockquoteRecipe} from 'components/Blockquote/Blockquote.recipe';
import {cx} from 'internal/cx';
import isReactNode from '../../internal/isReactNode';

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
  const classes = blockquoteRecipe();

  return (
    <blockquote
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
      {isReactNode(cite) ? (
        <footer>
          <cite className={classes.cite}>{cite}</cite>
        </footer>
      ) : null}
    </blockquote>
  );
}

Blockquote.displayName = 'Blockquote';
