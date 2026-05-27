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
        type="supporting"
        size="sm"
        color="secondary"
        weight="semibold"
        data-testid="text">
        Helper text
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('applies truncation styles for single-line text', () => {
    render(
      <Text maxLines={1} data-testid="text">
        A very long line
      </Text>,
    );
    expect(screen.getByTestId('text')).toBeInTheDocument();
  });

  it('sets line clamp style for multiline truncation', () => {
    render(
      <Text maxLines={2} data-testid="text">
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
