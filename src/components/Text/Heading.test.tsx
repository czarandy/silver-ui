import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Heading} from './Heading';

describe('Heading', () => {
  it('renders the semantic heading for the requested level', () => {
    render(<Heading level={1}>Page title</Heading>);
    expect(
      screen.getByRole('heading', {level: 1, name: 'Page title'}),
    ).toBeInTheDocument();
  });

  it('renders all heading levels', () => {
    const {rerender} = render(<Heading level={2}>Section</Heading>);
    expect(screen.getByRole('heading', {level: 2})).toHaveProperty(
      'tagName',
      'H2',
    );

    rerender(<Heading level={6}>Subsection</Heading>);
    expect(screen.getByRole('heading', {level: 6})).toHaveProperty(
      'tagName',
      'H6',
    );
  });

  it('sets aria-level when accessibilityLevel differs', () => {
    render(
      <Heading accessibilityLevel={3} level={2}>
        Sidebar section
      </Heading>,
    );
    expect(screen.getByText('Sidebar section')).toHaveAttribute(
      'aria-level',
      '3',
    );
  });

  it('supports display type variants', () => {
    render(
      <Heading data-testid="heading" level={1} type="display-1">
        Hero
      </Heading>,
    );
    expect(screen.getByTestId('heading')).toBeInTheDocument();
  });

  it('sets line clamp style for multiline truncation', () => {
    render(
      <Heading data-testid="heading" level={3} maxLines={2}>
        A very long heading
      </Heading>,
    );
    expect(screen.getByTestId('heading')).toHaveStyle({
      WebkitLineClamp: '2',
    });
  });

  it('forwards ref', () => {
    const ref = vi.fn<(element: HTMLHeadingElement | null) => void>();
    render(
      <Heading level={2} ref={ref}>
        Ref heading
      </Heading>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLHeadingElement));
  });
});
