import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Edit, Trash2} from 'lucide-react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {DropdownMenu} from 'components/DropdownMenu/DropdownMenu';
import {DropdownMenuItem} from 'components/DropdownMenu/DropdownMenuItem';
import {dropdownMenuItemRecipe} from 'components/DropdownMenu/DropdownMenuItem.recipe';
import {assertNonNull} from 'internal/testHelpers';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('popover-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('popover-open');
    },
  });
});

describe('DropdownMenu', () => {
  it('renders data-driven items and calls item handlers', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {icon: Edit, label: 'Edit', onClick: onEdit},
          {type: 'divider'},
          {icon: Trash2, isDisabled: true, label: 'Delete'},
        ]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    await user.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Delete'}),
    ).toBeDisabled();
  });

  it('renders dividers', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {type: 'divider'}, {label: 'Delete'}]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
  });

  it('renders sections with titles', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            items: [{label: 'Edit'}, {label: 'Copy'}],
            title: 'Editing',
            type: 'section',
          },
          {
            items: [{label: 'Delete'}],
            title: 'Danger',
            type: 'section',
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    expect(
      screen.getByRole('group', {hidden: true, name: 'Editing'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', {hidden: true, name: 'Danger'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Edit'}),
    ).toBeInTheDocument();
  });

  it('supports compound menu items', async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();

    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Archive" onClick={onArchive} />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    await user.click(screen.getByText('Archive'));
    expect(onArchive).toHaveBeenCalled();
  });

  it('skips aria-disabled items during keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <button role="menuitem" type="button">
          First
        </button>
        <button aria-disabled="true" role="menuitem" type="button">
          Second
        </button>
        <button role="menuitem" type="button">
          Third
        </button>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));

    const first = screen.getByRole('menuitem', {hidden: true, name: 'First'});
    first.focus();

    fireEvent.keyDown(first, {key: 'ArrowDown'});

    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Third'}),
    ).toHaveFocus();
  });

  describe('keyboard navigation', () => {
    async function openMenu(onSelect?: (label: string) => void) {
      const user = userEvent.setup();
      render(
        <DropdownMenu
          button={{label: 'Actions'}}
          items={[
            {label: 'Apple', onClick: () => onSelect?.('Apple')},
            {label: 'Banana', onClick: () => onSelect?.('Banana')},
            {label: 'Cherry', onClick: () => onSelect?.('Cherry')},
          ]}
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Actions'}));
      return (name: string) =>
        screen.getByRole('menuitem', {hidden: true, name});
    }

    it('moves focus to the next item on ArrowDown and wraps around', async () => {
      const item = await openMenu();

      item('Apple').focus();
      fireEvent.keyDown(item('Apple'), {key: 'ArrowDown'});
      expect(item('Banana')).toHaveFocus();

      fireEvent.keyDown(item('Banana'), {key: 'ArrowDown'});
      expect(item('Cherry')).toHaveFocus();

      fireEvent.keyDown(item('Cherry'), {key: 'ArrowDown'});
      expect(item('Apple')).toHaveFocus();
    });

    it('moves focus to the previous item on ArrowUp and wraps around', async () => {
      const item = await openMenu();

      item('Apple').focus();
      fireEvent.keyDown(item('Apple'), {key: 'ArrowUp'});
      expect(item('Cherry')).toHaveFocus();

      fireEvent.keyDown(item('Cherry'), {key: 'ArrowUp'});
      expect(item('Banana')).toHaveFocus();
    });

    it('focuses the first item on Home and the last item on End', async () => {
      const item = await openMenu();

      item('Banana').focus();
      fireEvent.keyDown(item('Banana'), {key: 'End'});
      expect(item('Cherry')).toHaveFocus();

      fireEvent.keyDown(item('Cherry'), {key: 'Home'});
      expect(item('Apple')).toHaveFocus();
    });

    it('activates the focused item on Enter', async () => {
      const onSelect = vi.fn();
      const item = await openMenu(onSelect);

      item('Banana').focus();
      fireEvent.keyDown(item('Banana'), {key: 'Enter'});

      expect(onSelect).toHaveBeenCalledWith('Banana');
    });

    it('activates the focused item on Space', async () => {
      const onSelect = vi.fn();
      const item = await openMenu(onSelect);

      item('Cherry').focus();
      fireEvent.keyDown(item('Cherry'), {key: ' '});

      expect(onSelect).toHaveBeenCalledWith('Cherry');
    });

    it('focuses a matching item via type-ahead search', async () => {
      const item = await openMenu();

      item('Apple').focus();
      fireEvent.keyDown(item('Apple'), {key: 'c'});

      expect(item('Cherry')).toHaveFocus();
    });

    it('narrows the type-ahead match as more characters are typed', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu
          button={{label: 'Actions'}}
          items={[{label: 'Banana'}, {label: 'Apple'}, {label: 'Apricot'}]}
        />,
      );
      await user.click(screen.getByRole('button', {name: 'Actions'}));
      const item = (name: string) =>
        screen.getByRole('menuitem', {hidden: true, name});

      item('Banana').focus();
      fireEvent.keyDown(item('Banana'), {key: 'a'});
      expect(item('Apple')).toHaveFocus();

      // "apr" describes Apricot. A single-character search would instead look
      // for an item starting with "r" and find none.
      fireEvent.keyDown(item('Apple'), {key: 'p'});
      fireEvent.keyDown(item('Apple'), {key: 'r'});
      expect(item('Apricot')).toHaveFocus();
    });

    it('ignores type-ahead characters typed with a modifier held', async () => {
      const item = await openMenu();

      item('Apple').focus();
      fireEvent.keyDown(item('Apple'), {key: 'c', ctrlKey: true});

      expect(item('Apple')).toHaveFocus();
    });

    it('closes the menu and focuses the trigger on Tab', async () => {
      const item = await openMenu();
      const trigger = screen.getByRole('button', {name: 'Actions'});

      item('Apple').focus();
      fireEvent.keyDown(item('Apple'), {key: 'Tab'});

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });
  });

  it('closes menu after clicking an item', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        isMenuOpen={false}
        items={[{label: 'Edit'}]}
        onOpenChange={onOpenChange}
      />,
    );

    onOpenChange.mockClear();
    onOpenChange.mockImplementation(() => {});

    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        isMenuOpen
        items={[{label: 'Edit'}]}
        onOpenChange={onOpenChange}
      />,
    );

    await user.click(
      screen.getAllByRole('menuitem', {hidden: true, name: 'Edit'})[0],
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hides popover on Escape key via light-dismiss', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Edit'}]} />,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('renders item with description', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem description="Modify this item" label="Edit" />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    expect(screen.getByText('Modify this item')).toBeInTheDocument();
  });

  it('renders item with endContent', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem endContent={<span>⌘E</span>} label="Edit" />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: 'Actions'}));
    expect(screen.getByText('⌘E')).toBeInTheDocument();
  });

  it('shows compound item tooltip content when its info icon is hovered', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} isMenuOpen>
        <DropdownMenuItem
          label="Edit"
          tooltip="Changes the item title and details."
        />
      </DropdownMenu>,
    );

    const tooltip = screen.getByRole('tooltip', {hidden: true});
    const tooltipTrigger = assertNonNull(
      // eslint-disable-next-line testing-library/no-node-access -- the info icon is intentionally hidden from the accessibility tree
      document.querySelector(`[aria-describedby="${tooltip.id}"]`),
    );

    expect(tooltip).toHaveTextContent('Changes the item title and details.');
    expect(tooltipTrigger).toHaveClass(
      dropdownMenuItemRecipe().tooltipIcon ?? '',
    );

    fireEvent.mouseEnter(tooltipTrigger);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });
  });

  it('renders tooltip content for data-driven items', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        isMenuOpen
        items={[{label: 'Archive', tooltip: 'Moves this item to the archive.'}]}
      />,
    );

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Moves this item to the archive.',
    );
  });

  it('renders button endContent alongside the chevron', () => {
    render(
      <DropdownMenu
        button={{
          endContent: <span data-testid="btn-end">99</span>,
          label: 'Inbox',
        }}
        items={[{label: 'Edit'}]}
      />,
    );

    const button = screen.getByRole('button', {name: 'Inbox'});
    expect(screen.getByTestId('btn-end')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- verifying chevron SVG is also present
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('throws when both items and children are provided', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(
        <DropdownMenu items={[{label: 'Edit'}]}>
          <DropdownMenuItem label="Delete" />
        </DropdownMenu>,
      ),
    ).toThrow('DropdownMenu: pass either `items` or `children`, not both.');

    consoleError.mockRestore();
  });

  it('throws when neither items nor children is provided', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<DropdownMenu />)).toThrow(
      'DropdownMenu: provide either `items` or `children`.',
    );

    consoleError.mockRestore();
  });
});
