import {render, screen} from '@testing-library/react';
import {Inbox} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {EmptyState} from './EmptyState';

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

  it('renders at the default heading level 3', () => {
    render(<EmptyState title="Empty" />);

    expect(
      screen.getByRole('heading', {level: 3, name: 'Empty'}),
    ).toBeInTheDocument();
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
