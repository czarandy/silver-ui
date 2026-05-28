import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {generatePageRange, Pagination} from './Pagination';

describe('generatePageRange', () => {
  it('returns all pages when the total fits', () => {
    expect(generatePageRange(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('shows right ellipsis near the start', () => {
    expect(generatePageRange(1, 10, 1)).toEqual([1, 2, 3, 4, 5, '...', 10]);
  });

  it('shows left ellipsis near the end', () => {
    expect(generatePageRange(10, 10, 1)).toEqual([1, '...', 6, 7, 8, 9, 10]);
  });

  it('shows both ellipses in the middle', () => {
    expect(generatePageRange(5, 10, 1)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });
});

describe('Pagination', () => {
  it('renders a navigation landmark', () => {
    render(<Pagination onChange={() => {}} page={1} totalPages={5} />);
    expect(
      screen.getByRole('navigation', {name: 'Pagination'}),
    ).toBeInTheDocument();
  });

  it('renders page buttons and marks the current page', () => {
    render(<Pagination onChange={() => {}} page={3} totalPages={5} />);
    expect(screen.getByRole('button', {name: 'Go to page 3'})).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('button', {name: 'Go to page 1'}),
    ).not.toHaveAttribute('aria-current');
  });

  it('calls onChange when selecting a page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={1} totalPages={5} />);

    await user.click(screen.getByRole('button', {name: 'Go to page 3'}));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('disables previous and next buttons at boundaries', () => {
    const {rerender} = render(
      <Pagination onChange={() => {}} page={1} totalPages={5} />,
    );
    expect(
      screen.getByRole('button', {name: 'Go to previous page'}),
    ).toBeDisabled();

    rerender(<Pagination onChange={() => {}} page={5} totalPages={5} />);
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeDisabled();
  });

  it('renders count variant', () => {
    render(
      <Pagination
        onChange={() => {}}
        page={5}
        pageSize={10}
        totalItems={45}
        variant="count"
      />,
    );
    expect(screen.getByText('41-45 of 45')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(
      <Pagination
        onChange={() => {}}
        page={3}
        totalPages={10}
        variant="compact"
      />,
    );
    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });

  it('renders dots variant', () => {
    render(
      <Pagination onChange={() => {}} page={2} totalPages={5} variant="dots" />,
    );
    const group = screen.getByRole('group', {name: 'Page indicators'});
    expect(within(group).getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('button', {name: 'Go to page 2'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('returns null for empty totals', () => {
    render(<Pagination onChange={() => {}} page={1} totalItems={0} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
