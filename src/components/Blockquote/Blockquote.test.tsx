import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Blockquote} from 'components/Blockquote/Blockquote';

describe('Blockquote', () => {
  it('renders children in a blockquote element', () => {
    render(<Blockquote>A quoted statement.</Blockquote>);
    const element = screen.getByRole('blockquote');
    expect(element.tagName).toBe('BLOCKQUOTE');
    expect(element).toHaveTextContent('A quoted statement.');
  });

  it('renders without cite by default', () => {
    render(<Blockquote data-testid="bq">Quote</Blockquote>);
    expect(screen.getByTestId('bq')).not.toHaveTextContent('—');
  });

  it('renders cite in a footer > cite structure', () => {
    render(
      <Blockquote cite="Steve Jobs" data-testid="bq">
        Design is not just what it looks like.
      </Blockquote>,
    );

    const bq = screen.getByTestId('bq');
    // eslint-disable-next-line testing-library/no-node-access -- verifying semantic HTML structure
    const cite = bq.querySelector('footer > cite');
    expect(cite).toBeInTheDocument();
    expect(cite).toHaveTextContent('Steve Jobs');
  });

  it('renders cite as ReactNode', () => {
    render(
      <Blockquote
        cite={<span data-testid="custom-cite">Custom attribution</span>}>
        Quote
      </Blockquote>,
    );
    expect(screen.getByTestId('custom-cite')).toHaveTextContent(
      'Custom attribution',
    );
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Blockquote ref={ref}>Quote</Blockquote>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('applies className, style, and data-testid', () => {
    render(
      <Blockquote className="custom" data-testid="bq" style={{color: 'red'}}>
        Quote
      </Blockquote>,
    );
    const element = screen.getByTestId('bq');
    expect(element).toHaveClass('custom');
    expect(element).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('renders ReactNode children', () => {
    render(
      <Blockquote>
        <p data-testid="child-p">Paragraph inside blockquote</p>
      </Blockquote>,
    );
    expect(screen.getByTestId('child-p')).toBeInTheDocument();
  });
});
