import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {TreeView} from 'components/TreeView/TreeView';
import type {TreeViewItemData} from 'components/TreeView/types';

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

  it('toggles expandable rows with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<TreeView items={nestedItems} />);

    const parentRow = screen.getByRole('treeitem', {name: /Parent/});
    act(() => {
      parentRow.focus();
    });

    await user.keyboard('{Enter}');
    expect(screen.getByText('Child 1')).toBeInTheDocument();

    await user.keyboard(' ');
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('supports tree keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<TreeView items={expandedItems} />);

    const parent = screen.getByRole('treeitem', {name: /Parent/});
    let childOne = screen.getByRole('treeitem', {name: /Child 1/});
    let childTwo = screen.getByRole('treeitem', {name: /Child 2/});

    expect(parent).toHaveAttribute('tabindex', '0');
    expect(childOne).toHaveAttribute('tabindex', '-1');

    act(() => {
      parent.focus();
    });
    await user.keyboard('{ArrowDown}');
    expect(childOne).toHaveFocus();
    await waitFor(() => {
      expect(childOne).toHaveAttribute('tabindex', '0');
      expect(parent).toHaveAttribute('tabindex', '-1');
    });

    childOne = screen.getByRole('treeitem', {name: /Child 1/});
    childTwo = screen.getByRole('treeitem', {name: /Child 2/});
    fireEvent.keyDown(childOne, {key: 'ArrowDown'});
    await waitFor(() => {
      expect(childTwo).toHaveFocus();
    });

    childOne = screen.getByRole('treeitem', {name: /Child 1/});
    childTwo = screen.getByRole('treeitem', {name: /Child 2/});
    fireEvent.keyDown(childTwo, {key: 'ArrowUp'});
    await waitFor(() => {
      expect(childOne).toHaveFocus();
    });

    childOne = screen.getByRole('treeitem', {name: /Child 1/});
    childTwo = screen.getByRole('treeitem', {name: /Child 2/});
    fireEvent.keyDown(childOne, {key: 'End'});
    await waitFor(() => {
      expect(childTwo).toHaveFocus();
    });

    childTwo = screen.getByRole('treeitem', {name: /Child 2/});
    fireEvent.keyDown(childTwo, {key: 'Home'});
    await waitFor(() => {
      expect(parent).toHaveFocus();
    });
  });

  it('expands, collapses, and moves focus with horizontal arrow keys', async () => {
    const user = userEvent.setup();
    render(<TreeView items={nestedItems} />);

    const parent = screen.getByRole('treeitem', {name: /Parent/});
    act(() => {
      parent.focus();
    });

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(parent).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    const childOne = screen.getByRole('treeitem', {name: /Child 1/});
    expect(childOne).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(parent).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('reverses horizontal tree navigation under an inherited RTL direction', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <TreeView items={nestedItems} />
      </div>,
    );

    const parent = screen.getByRole('treeitem', {name: /Parent/});
    act(() => {
      parent.focus();
    });

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(parent).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    const childOne = screen.getByRole('treeitem', {name: /Child 1/});
    expect(childOne).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(parent).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  it('supports type-ahead navigation', async () => {
    const user = userEvent.setup();
    render(<TreeView items={simpleItems} />);

    act(() => {
      screen.getByRole('treeitem', {name: /Item A/}).focus();
    });
    await user.keyboard('i');
    expect(screen.getByRole('treeitem', {name: /Item B/})).toHaveFocus();
  });

  describe('type-ahead', () => {
    const fruitItems: TreeViewItemData[] = [
      {id: 'banana', label: 'Banana'},
      {id: 'blueberry', label: 'Blueberry'},
      {id: 'cherry', label: 'Cherry'},
    ];

    function focusItem(name: RegExp): void {
      act(() => {
        screen.getByRole('treeitem', {name}).focus();
      });
    }

    it('matches on the full string typed in quick succession', async () => {
      const user = userEvent.setup();
      render(<TreeView items={fruitItems} />);

      focusItem(/Cherry/);
      // "b" wraps to Banana; "bl" then narrows to Blueberry.
      await user.keyboard('bl');

      expect(screen.getByRole('treeitem', {name: /Blueberry/})).toHaveFocus();
    });

    it('cycles through items sharing a first character on repeated presses', async () => {
      const user = userEvent.setup();
      render(<TreeView items={fruitItems} />);

      focusItem(/Banana/);

      await user.keyboard('b');
      expect(screen.getByRole('treeitem', {name: /Blueberry/})).toHaveFocus();

      await user.keyboard('b');
      expect(screen.getByRole('treeitem', {name: /Banana/})).toHaveFocus();
    });

    it('ignores characters typed with a modifier held', async () => {
      const user = userEvent.setup();
      render(<TreeView items={fruitItems} />);

      focusItem(/Banana/);
      await user.keyboard('{Control>}b{/Control}');

      expect(screen.getByRole('treeitem', {name: /Banana/})).toHaveFocus();
    });
  });

  it('hides the visual focus state when focus leaves the tree', async () => {
    render(
      <>
        <TreeView items={simpleItems} />
        <button type="button">Outside</button>
      </>,
    );

    const item = screen.getByRole('treeitem', {name: /Item A/});
    /* eslint-disable testing-library/no-node-access -- visual focus class is applied to the rendered row wrapper */
    const row = screen.getByText('Item A').closest('.silver-tree-view-item');
    /* eslint-enable testing-library/no-node-access */

    act(() => {
      item.focus();
    });
    await waitFor(() => {
      expect(row?.className).toContain('silver-ring-w_focus');
    });

    act(() => {
      screen.getByRole('button', {name: 'Outside'}).focus();
    });
    await waitFor(() => {
      expect(row?.className).not.toContain('silver-ring-w_focus');
    });
  });

  it('keeps pointer-focused items active without showing the focus ring', async () => {
    const user = userEvent.setup();
    render(<TreeView items={simpleItems} />);

    const itemA = screen.getByRole('treeitem', {name: /Item A/});
    const itemB = screen.getByRole('treeitem', {name: /Item B/});
    /* eslint-disable testing-library/no-node-access -- visual focus class is applied to the rendered row wrapper */
    const rowB = screen.getByText('Item B').closest('.silver-tree-view-item');
    /* eslint-enable testing-library/no-node-access */

    await user.click(screen.getByText('Item B'));

    await waitFor(() => {
      expect(itemA).toHaveAttribute('tabindex', '-1');
      expect(itemB).toHaveAttribute('tabindex', '0');
    });
    expect(rowB?.className).not.toContain('silver-ring-w_focus');
  });

  it('renders nested child groups', () => {
    render(<TreeView items={expandedItems} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('renders action items as buttons and calls onClick once', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TreeView items={[{id: 'a', label: 'Clickable', onClick}]} />);

    const button = screen.getByRole('button', {name: 'Clickable'});
    expect(button.tagName).toBe('BUTTON');

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders link items as anchors', () => {
    render(
      <TreeView
        items={[{href: '/docs', id: 'a', label: 'Docs', target: '_blank'}]}
      />,
    );

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('prevents disabled link navigation', () => {
    render(
      <TreeView
        items={[{href: '/docs', id: 'docs', isDisabled: true, label: 'Docs'}]}
      />,
    );
    const link = screen.getByRole('link', {name: 'Docs'});
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('sets the disabled state without exposing selection semantics', () => {
    render(
      <TreeView
        items={[
          {
            id: 'a',
            isDisabled: true,
            label: 'Disabled',
          },
        ]}
      />,
    );

    const item = screen.getByRole('treeitem', {name: /Disabled/});
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).not.toHaveAttribute('aria-selected');
  });

  describe('controlled selection', () => {
    it('renders one selected item from the root selection state', () => {
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={simpleItems}
          onSelectionChange={onSelectionChange}
          selectedKey="b"
        />,
      );

      expect(screen.getByRole('treeitem', {name: /Item A/})).toHaveAttribute(
        'aria-selected',
        'false',
      );
      expect(screen.getByRole('treeitem', {name: /Item B/})).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tree')).not.toHaveAttribute(
        'aria-multiselectable',
      );
    });

    it('requests a change without updating rendered selection', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      const {rerender} = render(
        <TreeView
          items={simpleItems}
          onSelectionChange={onSelectionChange}
          selectedKey="a"
        />,
      );

      await user.click(screen.getByText('Item B'));

      expect(onSelectionChange).toHaveBeenCalledExactlyOnceWith('b');
      expect(screen.getByRole('treeitem', {name: /Item A/})).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('treeitem', {name: /Item B/})).toHaveAttribute(
        'aria-selected',
        'false',
      );

      rerender(
        <TreeView
          items={simpleItems}
          onSelectionChange={onSelectionChange}
          selectedKey="b"
        />,
      );
      expect(screen.getByRole('treeitem', {name: /Item B/})).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('renders no selection for null and unknown keys', () => {
      const onSelectionChange = vi.fn();
      const {rerender} = render(
        <TreeView
          items={simpleItems}
          onSelectionChange={onSelectionChange}
          selectedKey={null}
        />,
      );

      for (const item of screen.getAllByRole('treeitem')) {
        expect(item).toHaveAttribute('aria-selected', 'false');
      }

      rerender(
        <TreeView
          items={simpleItems}
          onSelectionChange={onSelectionChange}
          selectedKey="missing"
        />,
      );
      for (const item of screen.getAllByRole('treeitem')) {
        expect(item).toHaveAttribute('aria-selected', 'false');
      }
    });

    it('selects a branch row without expanding and toggles without selecting', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={nestedItems}
          onSelectionChange={onSelectionChange}
          selectedKey={null}
        />,
      );

      await user.click(screen.getByText('Parent'));
      expect(onSelectionChange).toHaveBeenCalledWith('parent');
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();

      onSelectionChange.mockClear();
      await user.click(
        screen.getByRole('button', {name: 'Toggle Parent children'}),
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('runs item actions and selection exactly once', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={[{id: 'action', label: 'Action', onClick}]}
          onSelectionChange={onSelectionChange}
          selectedKey={null}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Action'}));

      expect(onClick).toHaveBeenCalledOnce();
      expect(onSelectionChange).toHaveBeenCalledExactlyOnceWith('action');
    });

    it('uses Enter and Space to select branches without toggling them', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={nestedItems}
          onSelectionChange={onSelectionChange}
          selectedKey={null}
        />,
      );

      const parent = screen.getByRole('treeitem', {name: /Parent/});
      act(() => {
        parent.focus();
      });

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenNthCalledWith(1, 'parent');
      expect(onSelectionChange).toHaveBeenNthCalledWith(2, 'parent');
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });

    it('moves focus with arrows and typeahead without selecting', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={[
            {id: 'apple', label: 'Apple'},
            {id: 'banana', label: 'Banana'},
            {id: 'cherry', label: 'Cherry'},
          ]}
          onSelectionChange={onSelectionChange}
          selectedKey="apple"
        />,
      );

      act(() => {
        screen.getByRole('treeitem', {name: /Apple/}).focus();
      });
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('treeitem', {name: /Banana/})).toHaveFocus();
      await user.keyboard('c');
      expect(screen.getByRole('treeitem', {name: /Cherry/})).toHaveFocus();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('does not select disabled items', () => {
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={[{id: 'disabled', isDisabled: true, label: 'Disabled'}]}
          onSelectionChange={onSelectionChange}
          selectedKey="disabled"
        />,
      );

      const item = screen.getByRole('treeitem', {name: /Disabled/});
      expect(item).not.toHaveAttribute('aria-selected');
      fireEvent.click(screen.getByText('Disabled'));
      fireEvent.keyDown(item, {key: 'Enter'});
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('uses a visible enabled selection as the initial roving tab stop', () => {
      const onSelectionChange = vi.fn();
      render(
        <TreeView
          items={expandedItems}
          onSelectionChange={onSelectionChange}
          selectedKey="child-2"
        />,
      );

      expect(screen.getByRole('treeitem', {name: /Parent/})).toHaveAttribute(
        'tabindex',
        '-1',
      );
      expect(screen.getByRole('treeitem', {name: /Child 2/})).toHaveAttribute(
        'tabindex',
        '0',
      );
    });

    it('falls back to the first enabled item for unusable selections', () => {
      const onSelectionChange = vi.fn();
      const fallbackItems: TreeViewItemData[] = [
        {id: 'first', label: 'First'},
        {
          children: [{id: 'hidden', label: 'Hidden'}],
          id: 'collapsed',
          label: 'Collapsed',
        },
        {id: 'disabled', isDisabled: true, label: 'Disabled'},
      ];
      const {rerender} = render(
        <TreeView
          items={fallbackItems}
          onSelectionChange={onSelectionChange}
          selectedKey="hidden"
        />,
      );

      const first = screen.getByRole('treeitem', {name: /First/});
      expect(first).toHaveAttribute('tabindex', '0');

      for (const selectedKey of ['disabled', 'missing', null]) {
        rerender(
          <TreeView
            items={fallbackItems}
            onSelectionChange={onSelectionChange}
            selectedKey={selectedKey}
          />,
        );
        expect(first).toHaveAttribute('tabindex', '0');
      }
    });

    it('preserves focused roving state when the controlled value differs', async () => {
      const user = userEvent.setup();
      render(
        <TreeView
          items={simpleItems}
          onSelectionChange={vi.fn()}
          selectedKey="a"
        />,
      );

      await user.click(screen.getByText('Item B'));

      await waitFor(() => {
        expect(screen.getByRole('treeitem', {name: /Item B/})).toHaveAttribute(
          'tabindex',
          '0',
        );
      });
      expect(screen.getByRole('treeitem', {name: /Item A/})).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });

  it('does not trigger disabled item actions or toggles', () => {
    const onClick = vi.fn();

    render(
      <TreeView
        items={[
          {
            id: 'action',
            isDisabled: true,
            label: 'Disabled action',
            onClick,
          },
          {
            children: [{id: 'child', label: 'Child'}],
            id: 'parent',
            isDisabled: true,
            label: 'Disabled parent',
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Disabled action'}));
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Disabled parent'));
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('renders deeply nested trees with nested groups and indentation', () => {
    render(
      <TreeView
        items={[
          {
            children: [
              {
                children: [
                  {
                    children: [{id: 'level-4', label: 'Level 4'}],
                    id: 'level-3',
                    isExpanded: true,
                    label: 'Level 3',
                  },
                ],
                id: 'level-2',
                isExpanded: true,
                label: 'Level 2',
              },
            ],
            id: 'level-1',
            isExpanded: true,
            label: 'Level 1',
          },
        ]}
      />,
    );

    expect(screen.getAllByRole('treeitem')).toHaveLength(4);
    expect(screen.getAllByRole('group')).toHaveLength(3);

    /* eslint-disable testing-library/no-node-access -- indentation is applied to the visual row wrapper */
    const levelFourRow = screen
      .getByText('Level 4')
      .closest('.silver-tree-view-item');
    /* eslint-enable testing-library/no-node-access */
    expect(levelFourRow).toHaveStyle({marginLeft: 'calc(3 * 16px + 24px)'});
  });

  it('applies density-specific row classes', () => {
    const {rerender} = render(
      <TreeView data-testid="tree" density="balanced" items={simpleItems} />,
    );

    /* eslint-disable testing-library/no-node-access -- density is a visual class on the row wrapper */
    const balancedRow = screen
      .getByTestId('tree')
      .querySelector('.silver-tree-view-item');
    /* eslint-enable testing-library/no-node-access */
    const balancedClassName = balancedRow?.className;

    rerender(
      <TreeView data-testid="tree" density="compact" items={simpleItems} />,
    );

    /* eslint-disable testing-library/no-node-access -- density is a visual class on the row wrapper */
    const compactRow = screen
      .getByTestId('tree')
      .querySelector('.silver-tree-view-item');
    /* eslint-enable testing-library/no-node-access */
    const compactClassName = compactRow?.className;

    rerender(
      <TreeView data-testid="tree" density="spacious" items={simpleItems} />,
    );

    /* eslint-disable testing-library/no-node-access -- density is a visual class on the row wrapper */
    const spaciousRow = screen
      .getByTestId('tree')
      .querySelector('.silver-tree-view-item');
    /* eslint-enable testing-library/no-node-access */
    const spaciousClassName = spaciousRow?.className;

    expect(balancedClassName).not.toEqual(compactClassName);
    expect(compactClassName).not.toEqual(spaciousClassName);
  });

  it('passes through className, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <TreeView
        className="custom-tree"
        data-testid="tree"
        items={simpleItems}
        ref={ref}
      />,
    );

    const tree = screen.getByTestId('tree');
    expect(tree).toHaveClass('custom-tree');
    expect(ref).toHaveBeenCalledWith(tree);
  });

  it('forwards the style prop to the root element', () => {
    render(
      <TreeView
        data-testid="tree"
        items={simpleItems}
        style={{maxWidth: '320px'}}
      />,
    );

    expect(screen.getByTestId('tree')).toHaveStyle({maxWidth: '320px'});
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

    await user.click(
      screen.getByRole('button', {name: 'Toggle Parent children'}),
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('provides a separate child toggle for link branches', async () => {
    const user = userEvent.setup();
    render(
      <TreeView
        items={[
          {
            children: [{id: 'child', label: 'Child'}],
            href: '/parent',
            id: 'parent',
            label: 'Parent',
          },
        ]}
      />,
    );

    expect(screen.getByRole('link', {name: 'Parent'})).toHaveAttribute(
      'href',
      '/parent',
    );
    await user.click(
      screen.getByRole('button', {name: 'Toggle Parent children'}),
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('toggles child visibility with keyboard without firing item action', async () => {
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

    const parent = screen.getByRole('treeitem', {name: 'Parent'});
    act(() => {
      parent.focus();
    });

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();

    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
  });
});
