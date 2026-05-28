import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {List} from './List';
import {ListItem} from './ListItem';

describe('List', () => {
  it('renders a semantic list with list items', () => {
    render(
      <List>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('associates the header with the list', () => {
    render(
      <List header="Team members">
        <ListItem label="Ada" />
      </List>,
    );

    expect(
      screen.getByRole('list', {name: 'Team members'}),
    ).toBeInTheDocument();
  });

  it('renders ordered lists with a start value', () => {
    render(
      <List listStyle="decimal" start={3}>
        <ListItem label="Third" />
      </List>,
    );

    expect(screen.getByRole('list')).toHaveAttribute('start', '3');
  });

  it('passes state and slots through list items', () => {
    render(
      <List hasDividers>
        <ListItem
          data-testid="item"
          description="Supporting text"
          endContent={<span data-testid="end">E</span>}
          isSelected
          label="Settings"
          startContent={<span data-testid="start">S</span>}
        />
      </List>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Supporting text')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports clickable list items', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <List>
        <ListItem label="Clickable" onClick={onClick} />
      </List>,
    );

    await user.click(screen.getByRole('button', {name: 'Clickable'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports link list items', () => {
    render(
      <List>
        <ListItem href="/docs" label="Docs" />
      </List>,
    );

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'href',
      '/docs',
    );
  });
});
