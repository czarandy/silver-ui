import {render, screen} from '@testing-library/react';
import {Inbox} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {EmptyState} from 'components/EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders title, description, illustration, and actions', () => {
    render(
      <EmptyState
        actions={<Button label="Create" />}
        description="Create an item to get started."
        illustration={<Inbox />}
        title="No items"
      />,
    );

    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'No items'})).toBeInTheDocument();
    expect(
      screen.getByText('Create an item to get started.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Create'})).toBeInTheDocument();
  });

  it('renders the description in a div wrapper with paragraph role', () => {
    render(
      <EmptyState
        description="Create an item to get started."
        title="No items"
      />,
    );

    const description = screen.getByText('Create an item to get started.');
    expect(description.tagName).toBe('DIV');
    expect(description).toHaveAttribute('role', 'paragraph');
    // eslint-disable-next-line testing-library/no-node-access
    expect(description.closest('p')).toBeNull();
  });

  it('labels the region with the heading via aria-labelledby', () => {
    render(<EmptyState title="No items" />);

    const region = screen.getByRole('region');
    const heading = screen.getByRole('heading', {name: 'No items'});
    expect(region).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <EmptyState
        className="custom-empty"
        data-testid="empty"
        ref={ref}
        style={{maxWidth: 300}}
        title="Nothing here"
      />,
    );

    const root = screen.getByTestId('empty');
    expect(root).toHaveClass('custom-empty');
    expect(root).toHaveStyle({maxWidth: '300px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards native DOM props and allows overriding the default role', () => {
    const handleClick = vi.fn();

    render(
      <EmptyState
        aria-live="polite"
        data-source="search"
        data-testid="empty"
        onClick={handleClick}
        role="status"
        title="Nothing here"
      />,
    );

    const root = screen.getByTestId('empty');
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(root).toHaveAttribute('data-source', 'search');
    expect(root).toHaveAttribute('role', 'status');

    root.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders at the default heading level 4', () => {
    render(<EmptyState title="Empty" />);

    expect(
      screen.getByRole('heading', {level: 4, name: 'Empty'}),
    ).toBeInTheDocument();
  });

  it('uses the reduced illustration, spacing, and text sizing', () => {
    const {container} = render(
      <EmptyState
        data-testid="empty"
        description="Create an item to get started."
        illustration={<Inbox />}
        title="No items"
      />,
    );

    expect(screen.getByTestId('empty')).toHaveClass('silver-gap_2');
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const illustration = container.querySelector('[aria-hidden="true"]');
    expect(illustration).toHaveClass('silver-w_12', 'silver-h_12');
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('heading').parentElement).toHaveClass(
      'silver-max-w_420px',
    );
    expect(screen.getByText('Create an item to get started.')).toHaveClass(
      'silver-fs_sm',
    );
  });

  it('renders at a custom heading level', () => {
    render(<EmptyState headingLevel={2} title="Empty" />);

    expect(
      screen.getByRole('heading', {level: 2, name: 'Empty'}),
    ).toBeInTheDocument();
  });

  it('renders with only title and illustration', () => {
    render(
      <EmptyState
        data-testid="empty"
        illustration={<Inbox />}
        title="No items"
      />,
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'No items'})).toBeInTheDocument();
    expect(screen.queryByText(/create/i)).not.toBeInTheDocument();
  });

  it('hides the illustration from assistive technology', () => {
    const {container} = render(
      <EmptyState illustration={<Inbox />} title="No items" />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const iconContainer = container.querySelector('[aria-hidden="true"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders without an illustration', () => {
    render(<EmptyState data-testid="empty" title="No items" />);

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'No items'})).toBeInTheDocument();
  });

  it('applies compact styling', () => {
    render(
      <EmptyState
        actions={<Button label="Create" />}
        data-testid="empty"
        isCompact
        title="Nothing here"
      />,
    );

    const root = screen.getByTestId('empty');
    expect(root).toHaveClass('silver-gap_2');
    expect(root).toHaveClass('silver-px_4');
    expect(root).toHaveClass('silver-py_4');
    expect(screen.getByRole('button', {name: 'Create'})).toBeInTheDocument();
  });
});
