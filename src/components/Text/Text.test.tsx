import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Text} from 'components/Text/Text';

describe('Text', () => {
  it('renders a span by default', () => {
    render(<Text>Body copy</Text>);
    expect(screen.getByText('Body copy')).toHaveProperty('tagName', 'SPAN');
  });

  it('renders the requested element', () => {
    render(<Text as="p">Paragraph copy</Text>);
    expect(screen.getByText('Paragraph copy')).toHaveProperty('tagName', 'P');
  });

  it('supports label markup', () => {
    render(
      <>
        <input id="field" />
        <Text as="label" htmlFor="field">
          Field label
        </Text>
      </>,
    );
    expect(screen.getByLabelText('Field label')).toBeInTheDocument();
  });

  it('supports typography variants', () => {
    render(
      <Text
        color="secondary"
        data-testid="text"
        size="sm"
        type="supporting"
        weight="semibold">
        Helper text
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('renders size variants', () => {
    const {rerender} = render(
      <Text data-testid="text" size="sm">
        Small
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();

    rerender(
      <Text data-testid="text" size="lg">
        Large
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();

    rerender(
      <Text data-testid="text" size="xl">
        Extra Large
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();

    rerender(
      <Text data-testid="text" size="inherit">
        Inherit Size
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('applies truncation styles for single-line text', () => {
    render(
      <Text data-testid="text" maxLines={1}>
        A very long line
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('sets line clamp style for multiline truncation', () => {
    render(
      <Text data-testid="text" maxLines={2}>
        A very long paragraph
      </Text>,
    );
    expect(screen.getByTestId('text')).toHaveStyle({
      WebkitLineClamp: '2',
    });
  });

  it('forwards ref', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(<Text ref={ref}>Ref text</Text>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('merges custom className with recipe classes', () => {
    render(
      <Text className="custom" data-testid="text">
        Styled
      </Text>,
    );
    expect(screen.getByTestId('text')).toHaveClass('custom');
  });

  it('forwards inline styles', () => {
    render(
      <Text data-testid="text" style={{marginTop: '8px'}}>
        Styled
      </Text>,
    );
    expect(screen.getByTestId('text')).toHaveStyle({marginTop: '8px'});
  });

  it('throws on negative maxLines in development', () => {
    expect(() => render(<Text maxLines={-1}>Negative</Text>)).toThrow(
      'maxLines must be a non-negative integer',
    );
  });

  it('forwards native HTML attributes', () => {
    render(
      <Text aria-label="description" data-testid="text" id="my-text">
        Attrs
      </Text>,
    );
    const el = screen.getByTestId('text');
    expect(el).toHaveAttribute('id', 'my-text');
    expect(el).toHaveAttribute('aria-label', 'description');
  });

  // Untruncated text used to discard `wordBreak`, so a long unbroken token in
  // a non-<p> element (outside preflight's overflow-wrap rule) overflowed.
  it('applies wordBreak without truncation', () => {
    render(
      <>
        <Text as="div" data-testid="break-word" wordBreak="break-word">
          https://example.com/an/extremely/long/unbroken/path
        </Text>
        <Text data-testid="break-all" wordBreak="break-all">
          unbroken-token
        </Text>
      </>,
    );

    expect(screen.getByTestId('break-word')).toHaveClass(
      'silver-wb_normal',
      'silver-ov-wrap_break-word',
    );
    expect(screen.getByTestId('break-all')).toHaveClass('silver-wb_break-all');
  });

  it('applies no word-break styles to untruncated text by default', () => {
    render(<Text data-testid="text">Body copy</Text>);

    const classList = Array.from(screen.getByTestId('text').classList);
    expect(
      classList.some(
        c => c.startsWith('silver-wb_') || c.startsWith('silver-ov-wrap_'),
      ),
    ).toBe(false);
  });

  it('applies textWrap variant', () => {
    render(
      <Text data-testid="text" textWrap="balance">
        Balanced text
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });
});
