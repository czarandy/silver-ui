import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {TreeView} from './TreeView';
import type {TreeViewItemData} from './types';

const simpleItems: TreeViewItemData[] = [
  {id: 'a', label: 'Item A'},
  {id: 'b', label: 'Item B'},
];

const nestedItems: TreeViewItemData[] = [
  {
    children: [
      {id: 'child-1', label: 'Child 1'},
      {id: 'child-2', label: 'Child 2'},
    ],
    id: 'parent',
    label: 'Parent',
  },
  {id: 'sibling', label: 'Sibling'},
];

const expandedItems: TreeViewItemData[] = [
  {
    children: [
      {id: 'child-1', label: 'Child 1'},
      {id: 'child-2', label: 'Child 2'},
    ],
    id: 'parent',
    isExpanded: true,
    label: 'Parent',
  },
];

describe('TreeView', () => {
  it('renders a tree with treeitems', () => {
    render(<TreeView items={simpleItems} />);

    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });

  it('renders a labelled header', () => {
    render(<TreeView header={<span>File Tree</span>} items={simpleItems} />);

    const tree = screen.getByRole('tree');
    expect(screen.getByText('File Tree')).toBeInTheDocument();
    expect(tree).toHaveAttribute('aria-labelledby');
  });

  it('renders descriptions and start/end content', () => {
    render(
      <TreeView
        items={[
          {
            description: 'Description text',
            endContent: <span data-testid="end">3</span>,
            id: 'item',
            label: 'Label',
            startContent: <span data-testid="start">S</span>,
          },
        ]}
      />,
    );

    expect(screen.getByText('Description text')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('does not render children by default and expands on row click', async () => {
    const user = userEvent.setup();
    render(<TreeView items={nestedItems} />);

    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    expect(screen.getByRole('treeitem', {name: /Parent/})).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await user.click(screen.getByText('Parent'));

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByRole('treeitem', {name: /Parent/})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('renders initially expanded children and collapses on click', async () => {
    const user = userEvent.setup();
    render(<TreeView items={expandedItems} />);

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    await user.click(screen.getByText('Parent'));
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('renders nested child groups', () => {
    render(<TreeView items={expandedItems} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders action items as buttons and calls onClick once', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TreeView items={[{id: 'a', label: 'Clickable', onClick}]} />);

    await user.click(screen.getByRole('button', {name: 'Clickable'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders link items as anchors', () => {
    render(<TreeView items={[{href: '/docs', id: 'a', label: 'Docs'}]} />);

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'href',
      '/docs',
    );
  });

  it('sets disabled and selected states', () => {
    render(
      <TreeView
        items={[
          {
            id: 'a',
            isDisabled: true,
            isSelected: true,
            label: 'Selected',
          },
        ]}
      />,
    );

    const item = screen.getByRole('treeitem', {name: /Selected/});
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute('aria-selected', 'true');
  });

  it('separates item click from child toggle when both exist', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <TreeView
        items={[
          {
            children: [{id: 'child', label: 'Child'}],
            id: 'parent',
            label: 'Parent',
            onClick,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Parent'}));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Toggle children'}));
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
