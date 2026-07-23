import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Pagination} from 'components/Pagination/Pagination';
import {SizeContext} from 'internal/SizeContext';

describe('Pagination', () => {
  it('inherits the ambient size', () => {
    render(
      <SizeContext value="lg">
        <Pagination onChange={() => {}} page={1} totalPages={2} />
      </SizeContext>,
    );

    expect(screen.getByRole('button', {name: 'Go to next page'})).toHaveClass(
      'silver-h_component.lg',
    );
  });

  it('renders a navigation landmark', () => {
    render(<Pagination onChange={() => {}} page={1} totalPages={5} />);
    expect(
      screen.getByRole('navigation', {name: 'Pagination'}),
    ).toBeInTheDocument();
  });

  it('mirrors previous and next chevrons in RTL', () => {
    render(
      <div dir="rtl">
        <Pagination onChange={() => {}} page={3} totalPages={5} />
      </div>,
    );

    const previousButton = screen.getByRole('button', {
      name: 'Go to previous page',
    });
    const nextButton = screen.getByRole('button', {name: 'Go to next page'});
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    const previousIcon = previousButton.querySelector('svg');
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    const nextIcon = nextButton.querySelector('svg');

    expect(previousIcon).toHaveClass(
      'lucide-chevron-left',
      'rtl:silver-trf_scaleX(-1)',
    );
    expect(nextIcon).toHaveClass(
      'lucide-chevron-right',
      'rtl:silver-trf_scaleX(-1)',
    );
  });

  it('renders page buttons and marks the current page', () => {
    render(<Pagination onChange={() => {}} page={3} totalPages={5} />);
    expect(
      screen.getByRole('button', {name: 'Page 3, current page'}),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', {name: 'Go to page 1'}),
    ).not.toHaveAttribute('aria-current');
  });

  it('shows visible page numbers as button text', () => {
    render(<Pagination onChange={() => {}} page={1} totalPages={3} />);
    const btn = screen.getByRole('button', {name: 'Go to page 2'});
    expect(btn).toHaveTextContent('2');
  });

  it('calls onChange when selecting a page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={1} totalPages={5} />);

    await user.click(screen.getByRole('button', {name: 'Go to page 3'}));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when clicking the current page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={3} totalPages={5} />);

    await user.click(
      screen.getByRole('button', {name: 'Page 3, current page'}),
    );
    expect(onChange).not.toHaveBeenCalled();
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

  it('returns null for empty totals', () => {
    render(<Pagination onChange={() => {}} page={1} totalItems={0} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('disables all controls when isDisabled is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Pagination isDisabled onChange={onChange} page={3} totalPages={5} />,
    );

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }

    await user.click(screen.getByRole('button', {name: 'Go to page 4'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('enables next button when hasMore is true without totalPages', () => {
    render(<Pagination hasMore onChange={() => {}} page={1} variant="none" />);
    expect(screen.getByRole('button', {name: 'Go to next page'})).toBeEnabled();
  });

  it('disables next button when hasMore is false without totalPages', () => {
    render(
      <Pagination
        hasMore={false}
        onChange={() => {}}
        page={1}
        variant="none"
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeDisabled();
  });

  it('derives totalPages from totalItems and pageSize', () => {
    render(
      <Pagination onChange={() => {}} page={1} pageSize={10} totalItems={45} />,
    );
    expect(
      screen.getByRole('button', {name: 'Go to page 5'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Go to page 6'}),
    ).not.toBeInTheDocument();
  });

  it('wires siblingCount to page range', () => {
    render(
      <Pagination
        onChange={() => {}}
        page={10}
        siblingCount={2}
        totalPages={20}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Go to page 8'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to page 12'}),
    ).toBeInTheDocument();
  });

  it('renders none variant with only prev/next buttons', () => {
    render(
      <Pagination onChange={() => {}} page={3} totalPages={5} variant="none" />,
    );
    expect(
      screen.getByRole('button', {name: 'Go to previous page'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Go to page/}),
    ).not.toBeInTheDocument();
  });

  it('clamps page above totalPages', () => {
    render(<Pagination onChange={() => {}} page={10} totalPages={5} />);
    expect(
      screen.getByRole('button', {name: 'Page 5, current page'}),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', {name: 'Go to next page'}),
    ).toBeDisabled();
  });

  it('clamps page below 1', () => {
    render(<Pagination onChange={() => {}} page={0} totalPages={5} />);
    expect(
      screen.getByRole('button', {name: 'Page 1, current page'}),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', {name: 'Go to previous page'}),
    ).toBeDisabled();
  });

  it('supports keyboard activation of page buttons', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={1} totalPages={5} />);

    const pageButton = screen.getByRole('button', {name: 'Go to page 3'});
    pageButton.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('forwards ref to the navigation element', () => {
    const ref: React.RefObject<HTMLElement | null> = {current: null};
    render(
      <Pagination onChange={() => {}} page={1} ref={ref} totalPages={5} />,
    );
    expect(ref.current).toBe(
      screen.getByRole('navigation', {name: 'Pagination'}),
    );
  });

  it('applies className to the navigation element', () => {
    render(
      <Pagination
        className="custom-class"
        onChange={() => {}}
        page={1}
        totalPages={5}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveClass('custom-class');
  });

  it('applies style to the navigation element', () => {
    render(
      <Pagination
        onChange={() => {}}
        page={1}
        style={{marginTop: '16px'}}
        totalPages={5}
      />,
    );
    expect(screen.getByRole('navigation')).toHaveStyle({marginTop: '16px'});
  });

  it('calls onChange with page - 1 when clicking previous', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={3} totalPages={5} />);

    await user.click(screen.getByRole('button', {name: 'Go to previous page'}));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with page + 1 when clicking next', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} page={3} totalPages={5} />);

    await user.click(screen.getByRole('button', {name: 'Go to next page'}));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('uses custom label for the navigation landmark', () => {
    render(
      <Pagination
        label="Results pagination"
        onChange={() => {}}
        page={1}
        totalPages={5}
      />,
    );
    expect(
      screen.getByRole('navigation', {name: 'Results pagination'}),
    ).toBeInTheDocument();
  });

  it('applies data-testid to the navigation element', () => {
    render(
      <Pagination
        data-testid="my-pagination"
        onChange={() => {}}
        page={1}
        totalPages={5}
      />,
    );
    expect(screen.getByTestId('my-pagination')).toBe(
      screen.getByRole('navigation'),
    );
  });

  it('clamps negative siblingCount to zero', () => {
    render(
      <Pagination
        onChange={() => {}}
        page={5}
        siblingCount={-3}
        totalPages={10}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Go to page 1'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to page 10'}),
    ).toBeInTheDocument();
  });

  it('guards pageSize of zero by treating it as 1', () => {
    render(
      <Pagination
        onChange={() => {}}
        page={1}
        pageSize={0}
        totalItems={45}
        variant="count"
      />,
    );
    expect(screen.getByText('1-1 of 45')).toBeInTheDocument();
  });
});
