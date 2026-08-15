import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Highlight} from 'components/Highlight/Highlight';
import {highlightRecipe} from 'components/Highlight/Highlight.recipe';

function getMarks(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('mark'));
}

describe('Highlight', () => {
  it('highlights every case-insensitive match while preserving source casing', () => {
    const {container} = render(
      <Highlight query="result">Result and result</Highlight>,
    );

    const marks = getMarks(container);
    expect(marks.map(mark => mark.textContent)).toEqual(['Result', 'result']);
    expect(marks[0]).toHaveClass(highlightRecipe());
    expect(container).toHaveTextContent('Result and result');
  });

  it('matches multiple literal queries with longer terms taking precedence', () => {
    const {container} = render(
      <Highlight query={['cat', 'catalog', 'CAT', '[x]', ' ']}>
        Catalog cat [x] CATALOG
      </Highlight>,
    );

    expect(getMarks(container).map(mark => mark.textContent)).toEqual([
      'Catalog',
      'cat',
      '[x]',
      'CATALOG',
    ]);
  });

  it('ignores empty queries and renders unmatched text without marks', () => {
    const {container, rerender} = render(
      <Highlight query={['', '   ']}>Unchanged text</Highlight>,
    );

    expect(getMarks(container)).toHaveLength(0);
    expect(container).toHaveTextContent('Unchanged text');

    rerender(<Highlight query="missing">Unchanged text</Highlight>);
    expect(getMarks(container)).toHaveLength(0);
  });

  it('does not fold diacritics', () => {
    const {container} = render(
      <Highlight query="cafe">Visit the café</Highlight>,
    );

    expect(getMarks(container)).toHaveLength(0);
  });

  it('forwards root props and ref to an inline span', () => {
    const ref = vi.fn();
    render(
      <Highlight
        className="custom"
        data-testid="highlight"
        query="text"
        ref={ref}
        style={{opacity: 0.5}}>
        Some text
      </Highlight>,
    );

    const root = screen.getByTestId('highlight');
    expect(root.tagName).toBe('SPAN');
    expect(root).toHaveClass('custom');
    expect(root).toHaveStyle({opacity: '0.5'});
    expect(ref).toHaveBeenCalledWith(root);
  });
});
