import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Text} from './Text';

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
});
