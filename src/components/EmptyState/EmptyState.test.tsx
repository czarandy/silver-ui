import {render, screen} from '@testing-library/react';
import {Inbox} from 'lucide-react';
import {describe, expect, it} from 'vitest';
import {Button} from '../Button';
import {EmptyState} from './EmptyState';

describe('EmptyState', () => {
  it('renders title, description, icon, and actions', () => {
    render(
      <EmptyState
        actions={<Button label="Create" />}
        description="Create an item to get started."
        icon={<Inbox />}
        title="No items"
      />,
    );

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'No items'})).toBeInTheDocument();
    expect(
      screen.getByText('Create an item to get started.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Create'})).toBeInTheDocument();
  });

  it('applies root props', () => {
    render(
      <EmptyState
        className="custom-empty"
        data-testid="empty"
        title="Nothing here"
      />,
    );

    expect(screen.getByTestId('empty')).toHaveClass('custom-empty');
  });
});
