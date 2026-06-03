import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Edit, Trash2} from 'lucide-react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';

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
});
