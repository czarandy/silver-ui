import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Settings} from 'lucide-react';
import {describe, expect, it} from 'vitest';
import {Avatar} from 'components/Avatar';
import type {ButtonSize} from 'components/Button';
import {Divider} from 'components/Divider';
import {DropdownMenu} from 'components/DropdownMenu/DropdownMenu';
import {DropdownMenuItem} from 'components/DropdownMenu/DropdownMenuItem';

// Real-layout tests for the checkable-item gutter. jsdom evaluates neither
// `:has()` nor layout, so it cannot show whether labels line up.

function labelLeft(text: string): number {
  return screen.getByText(text).getBoundingClientRect().left;
}

async function openMenu(size: ButtonSize): Promise<void> {
  render(
    <DropdownMenu button={{label: 'Options', size}}>
      <DropdownMenuItem
        isSelected
        label="Checked toggle"
        selectionMode="checkbox"
      />
      <DropdownMenuItem label="Unchecked toggle" selectionMode="checkbox" />
      <DropdownMenuItem isSelected label="Radio choice" selectionMode="radio" />
      <Divider />
      <DropdownMenuItem label="Plain action" />
      <DropdownMenuItem icon={Settings} label="Icon action" />
    </DropdownMenu>,
  );
  await userEvent.setup().click(screen.getByRole('button', {name: 'Options'}));
  await screen.findByRole('menuitem', {name: 'Plain action'});
}

describe('DropdownMenu checkable items', () => {
  it.each<ButtonSize>(['sm', 'md', 'lg'])(
    'line up every label in a %s menu, checked or not',
    async size => {
      await openMenu(size);

      const left = labelLeft('Checked toggle');
      expect(labelLeft('Unchecked toggle')).toBeCloseTo(left, 0);
      expect(labelLeft('Radio choice')).toBeCloseTo(left, 0);
      expect(labelLeft('Plain action')).toBeCloseTo(left, 0);
    },
  );

  it('space a compound Divider like the data-driven one', async () => {
    await openMenu('md');

    const separator = screen.getByRole('separator');
    const above = screen
      .getByRole('menuitemradio', {name: 'Radio choice'})
      .getBoundingClientRect();
    const below = screen
      .getByRole('menuitem', {name: 'Plain action'})
      .getBoundingClientRect();
    const box = separator.getBoundingClientRect();
    // `my: 1` plus the list's `gap: 0.5` on each side.
    expect(box.top - above.bottom).toBeCloseTo(6, 0);
    expect(below.top - box.bottom).toBeCloseTo(6, 0);
  });

  it('leave plain items unindented when the menu has no checkable items', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" />
        <DropdownMenuItem icon={Settings} label="Settings" />
      </DropdownMenu>,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', {name: 'Actions'}));
    const edit = await screen.findByRole('menuitem', {name: 'Edit'});

    expect(labelLeft('Edit') - edit.getBoundingClientRect().left).toBeCloseTo(
      8,
      0,
    );
  });
});

describe('DropdownMenu start content', () => {
  it.each<ButtonSize>(['sm', 'md', 'lg'])(
    'fit an xsmall Avatar in a %s menu row, centered on the label',
    async size => {
      render(
        <DropdownMenu button={{label: 'Assign to', size}}>
          <DropdownMenuItem icon={Settings} label="Icon action" />
          <DropdownMenuItem
            label="Ada Lovelace"
            startContent={
              <Avatar data-testid="avatar" name="Ada Lovelace" size="xsmall" />
            }
          />
          <DropdownMenuItem
            isSelected
            label="Grace Hopper"
            selectionMode="radio"
            startContent={<Avatar name="Grace Hopper" size="xsmall" />}
          />
        </DropdownMenu>,
      );
      await userEvent
        .setup()
        .click(screen.getByRole('button', {name: 'Assign to'}));
      const avatarItem = await screen.findByRole('menuitem', {
        name: 'Ada Lovelace',
      });
      const iconItem = screen.getByRole('menuitem', {name: 'Icon action'});

      expect(avatarItem.getBoundingClientRect().height).toBeCloseTo(
        iconItem.getBoundingClientRect().height,
        0,
      );
      const avatar = screen.getByTestId('avatar').getBoundingClientRect();
      const label = screen.getByText('Ada Lovelace').getBoundingClientRect();
      expect(avatar.top + avatar.height / 2).toBeCloseTo(
        label.top + label.height / 2,
        0,
      );
      // A checkable item's indicator gutter keeps both labels in one column.
      expect(labelLeft('Grace Hopper')).toBeCloseTo(
        labelLeft('Ada Lovelace'),
        0,
      );
    },
  );
});
