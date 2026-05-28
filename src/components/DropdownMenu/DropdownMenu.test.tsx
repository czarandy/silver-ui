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
          {icon: <Edit />, label: 'Edit', onClick: onEdit},
          {type: 'divider'},
          {icon: <Trash2 />, isDisabled: true, label: 'Delete'},
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
});
