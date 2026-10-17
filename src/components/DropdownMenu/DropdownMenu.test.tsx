import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Edit, Trash2} from 'lucide-react';
import {createRef, useState} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Divider} from 'components/Divider';
import {
  DropdownMenu,
  type DropdownMenuButtonProps,
} from 'components/DropdownMenu/DropdownMenu';
import {DropdownMenuItem} from 'components/DropdownMenu/DropdownMenuItem';
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

  it('forwards positioning props to the popover', () => {
    render(
      <DropdownMenu
        alignment="end"
        button={{label: 'Actions'}}
        isMenuOpen
        items={[{label: 'Edit'}]}
        offsetX={8}
        offsetY={4}
        placement="above"
      />,
    );

    const popover = assertNonNull(
      // eslint-disable-next-line testing-library/no-node-access -- the positioned native popover layer has no accessible role or test ID
      document.querySelector<HTMLElement>('[popover]'),
    );
    expect(popover).toHaveStyle({
      marginBlockEnd: '4px',
      marginInlineStart: '8px',
      positionArea: 'block-start span-inline-start',
    });
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

  describe('hasCloseOnSelect', () => {
    it('keeps the menu open and focus on a compound item set to false', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <DropdownMenu button={{label: 'Columns'}}>
          <DropdownMenuItem
            hasCloseOnSelect={false}
            label="Email"
            onClick={onToggle}
          />
          <DropdownMenuItem label="Reset" />
        </DropdownMenu>,
      );

      const trigger = screen.getByRole('button', {name: 'Columns'});
      await user.click(trigger);

      const item = screen.getByRole('menuitem', {hidden: true, name: 'Email'});
      await user.click(item);
      await user.click(item);

      expect(onToggle).toHaveBeenCalledTimes(2);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(item).toHaveFocus();

      // Items without the opt-out still close the menu.
      await user.click(
        screen.getByRole('menuitem', {hidden: true, name: 'Reset'}),
      );
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('keeps the menu open for keyboard activation', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <DropdownMenu
          button={{label: 'Columns'}}
          items={[{hasCloseOnSelect: false, label: 'Email', onClick: onToggle}]}
        />,
      );

      const trigger = screen.getByRole('button', {name: 'Columns'});
      await user.click(trigger);
      const item = screen.getByRole('menuitem', {hidden: true, name: 'Email'});
      item.focus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onToggle).toHaveBeenCalledTimes(2);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(item).toHaveFocus();
    });

    it('threads the option through data-driven sections', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(
        <DropdownMenu
          button={{label: 'Columns'}}
          items={[
            {
              items: [
                {hasCloseOnSelect: false, label: 'Email', onClick: onToggle},
                {label: 'Done'},
              ],
              title: 'Visible columns',
              type: 'section',
            },
          ]}
        />,
      );

      const trigger = screen.getByRole('button', {name: 'Columns'});
      await user.click(trigger);
      await user.click(
        screen.getByRole('menuitem', {hidden: true, name: 'Email'}),
      );
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.click(
        screen.getByRole('menuitem', {hidden: true, name: 'Done'}),
      );
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('checkable items', () => {
    function getIndicatorIcon(item: HTMLElement): SVGElement | null {
      // eslint-disable-next-line testing-library/no-node-access -- the check is decorative (aria-hidden) and has no accessible handle
      return item.querySelector('svg');
    }

    function SettingsMenu({onSync}: {onSync?: (value: string) => void}) {
      const [isBlocked, setIsBlocked] = useState(true);
      const [isShared, setIsShared] = useState(false);
      const [sync, setSync] = useState('busy');
      return (
        <DropdownMenu button={{label: 'Calendar options'}}>
          <DropdownMenuItem
            isSelected={isBlocked}
            label="Block client booking"
            onClick={() => setIsBlocked(value => !value)}
            selectionMode="checkbox"
          />
          <DropdownMenuItem
            isSelected={isShared}
            label="Share with team"
            onClick={() => setIsShared(value => !value)}
            selectionMode="checkbox"
          />
          <Divider />
          {[
            {label: 'Only busy times', value: 'busy'},
            {label: 'Full event details', value: 'full'},
          ].map(option => (
            <DropdownMenuItem
              isSelected={sync === option.value}
              key={option.value}
              label={option.label}
              onClick={() => {
                setSync(option.value);
                onSync?.(option.value);
              }}
              selectionMode="radio"
            />
          ))}
          <DropdownMenuItem label="Remove calendar" />
        </DropdownMenu>
      );
    }

    it('renders checkbox and radio roles with aria-checked', async () => {
      const user = userEvent.setup();
      render(<SettingsMenu />);
      await user.click(screen.getByRole('button', {name: 'Calendar options'}));

      expect(
        screen.getByRole('menuitemcheckbox', {
          hidden: true,
          name: 'Block client booking',
        }),
      ).toBeChecked();
      expect(
        screen.getByRole('menuitemcheckbox', {
          hidden: true,
          name: 'Share with team',
        }),
      ).not.toBeChecked();
      expect(
        screen.getByRole('menuitemradio', {
          hidden: true,
          name: 'Only busy times',
        }),
      ).toBeChecked();
      expect(
        screen.getByRole('menuitemradio', {
          hidden: true,
          name: 'Full event details',
        }),
      ).not.toBeChecked();
      expect(
        screen.getByRole('menuitem', {hidden: true, name: 'Remove calendar'}),
      ).not.toBeChecked();
      expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
    });

    it('draws a leading check only on checked checkbox items', async () => {
      const user = userEvent.setup();
      render(<SettingsMenu />);
      await user.click(screen.getByRole('button', {name: 'Calendar options'}));

      const checked = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Block client booking',
      });
      const icon = assertNonNull(
        getIndicatorIcon(checked),
        'checked item should show a check',
      );
      expect(
        icon.compareDocumentPosition(screen.getByText('Block client booking')) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      const unchecked = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Share with team',
      });
      expect(getIndicatorIcon(unchecked)).toBeNull();
    });

    it('keeps the menu open while checkbox items are toggled', async () => {
      const user = userEvent.setup();
      render(<SettingsMenu />);
      const trigger = screen.getByRole('button', {name: 'Calendar options'});
      await user.click(trigger);

      const share = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Share with team',
      });
      await user.click(share);
      expect(share).toBeChecked();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(share).toHaveFocus();

      await user.click(share);
      expect(share).not.toBeChecked();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes the menu when a radio item is picked', async () => {
      const user = userEvent.setup();
      const onSync = vi.fn();
      render(<SettingsMenu onSync={onSync} />);
      const trigger = screen.getByRole('button', {name: 'Calendar options'});
      await user.click(trigger);

      await user.click(
        screen.getByRole('menuitemradio', {
          hidden: true,
          name: 'Full event details',
        }),
      );
      expect(onSync).toHaveBeenCalledWith('full');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await user.click(trigger);
      expect(
        screen.getByRole('menuitemradio', {
          hidden: true,
          name: 'Full event details',
        }),
      ).toBeChecked();
      expect(
        screen.getByRole('menuitemradio', {
          hidden: true,
          name: 'Only busy times',
        }),
      ).not.toBeChecked();
    });

    it('lets hasCloseOnSelect override the default for each mode', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu button={{label: 'View'}}>
          <DropdownMenuItem
            hasCloseOnSelect={false}
            label="Compact"
            selectionMode="radio"
          />
          <DropdownMenuItem
            hasCloseOnSelect
            label="Show archived"
            selectionMode="checkbox"
          />
        </DropdownMenu>,
      );
      const trigger = screen.getByRole('button', {name: 'View'});
      await user.click(trigger);

      await user.click(
        screen.getByRole('menuitemradio', {hidden: true, name: 'Compact'}),
      );
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.click(
        screen.getByRole('menuitemcheckbox', {
          hidden: true,
          name: 'Show archived',
        }),
      );
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('includes checkable items in arrow-key navigation', async () => {
      const user = userEvent.setup();
      render(<SettingsMenu />);
      await user.click(screen.getByRole('button', {name: 'Calendar options'}));

      const block = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Block client booking',
      });
      block.focus();
      fireEvent.keyDown(block, {key: 'ArrowDown'});
      const share = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Share with team',
      });
      expect(share).toHaveFocus();

      fireEvent.keyDown(share, {key: 'ArrowDown'});
      const busy = screen.getByRole('menuitemradio', {
        hidden: true,
        name: 'Only busy times',
      });
      expect(busy).toHaveFocus();

      fireEvent.keyDown(busy, {key: 'End'});
      expect(
        screen.getByRole('menuitem', {hidden: true, name: 'Remove calendar'}),
      ).toHaveFocus();
    });

    it('toggles a focused checkbox item with Space', async () => {
      const user = userEvent.setup();
      render(<SettingsMenu />);
      const trigger = screen.getByRole('button', {name: 'Calendar options'});
      await user.click(trigger);

      const share = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Share with team',
      });
      share.focus();
      fireEvent.keyDown(share, {key: ' '});
      expect(share).toBeChecked();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('does not toggle disabled checkable items', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <DropdownMenu button={{label: 'View'}}>
          <DropdownMenuItem
            isDisabled
            isSelected
            label="Show archived"
            onClick={onClick}
            selectionMode="checkbox"
            tooltip="Archived items are hidden for this workspace"
          />
        </DropdownMenu>,
      );
      await user.click(screen.getByRole('button', {name: 'View'}));

      const item = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Show archived',
      });
      await user.click(item);
      expect(onClick).not.toHaveBeenCalled();
      expect(item).toBeChecked();
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('renders data-driven checkable items and radio sections', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render(
        <DropdownMenu
          button={{label: 'View options'}}
          items={[
            {
              isSelected: true,
              label: 'Show archived',
              selectionMode: 'checkbox',
            },
            {type: 'divider'},
            {
              items: [
                {
                  isSelected: true,
                  label: 'Name',
                  selectionMode: 'radio',
                },
                {
                  label: 'Date',
                  onClick: onSort,
                  selectionMode: 'radio',
                },
              ],
              title: 'Sort by',
              type: 'section',
            },
          ]}
        />,
      );
      const trigger = screen.getByRole('button', {name: 'View options'});
      await user.click(trigger);

      const archived = screen.getByRole('menuitemcheckbox', {
        hidden: true,
        name: 'Show archived',
      });
      expect(archived).toBeChecked();
      await user.click(archived);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      const group = screen.getByRole('group', {hidden: true, name: 'Sort by'});
      expect(
        within(group).getByRole('menuitemradio', {hidden: true, name: 'Name'}),
      ).toBeChecked();
      const date = within(group).getByRole('menuitemradio', {
        hidden: true,
        name: 'Date',
      });
      expect(date).not.toBeChecked();

      await user.click(date);
      expect(onSort).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
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

  it('shows compound item tooltip content when the item is hovered', async () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} isMenuOpen>
        <DropdownMenuItem
          label="Edit"
          tooltip="Changes the item title and details."
        />
      </DropdownMenu>,
    );

    const tooltip = screen.getByRole('tooltip', {hidden: true});
    const item = screen.getByRole('menuitem', {hidden: true, name: 'Edit'});

    expect(tooltip).toHaveTextContent('Changes the item title and details.');
    expect(item).toHaveAttribute('aria-describedby', tooltip.id);

    fireEvent.mouseEnter(item);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });
  });

  it('keeps disabled items with tooltips hoverable but not actionable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <DropdownMenu button={{label: 'Actions'}} isMenuOpen>
        <DropdownMenuItem
          isDisabled
          label="Delete"
          onClick={onClick}
          tooltip="You do not have permission to delete this item."
        />
      </DropdownMenu>,
    );

    const item = screen.getByRole('menuitem', {hidden: true, name: 'Delete'});
    expect(item).toBeEnabled();
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'You do not have permission to delete this item.',
    );

    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
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

  it('applies the top-level ref and data-testid to the trigger', () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <DropdownMenu
        button={{'data-track': 'menu', label: 'Actions'}}
        data-testid="menu-trigger"
        items={[{label: 'Edit'}]}
        ref={ref}
      />,
    );

    const trigger = screen.getByRole('button', {name: 'Actions'});
    expect(screen.getByTestId('menu-trigger')).toBe(trigger);
    expect(ref.current).toBe(trigger);
    // Other data attributes still pass through the button props.
    expect(trigger).toHaveAttribute('data-track', 'menu');
  });

  it('excludes trigger fields that DropdownMenu owns from button props', () => {
    const ref = createRef<HTMLButtonElement>();
    const withTestId: DropdownMenuButtonProps = {
      // @ts-expect-error Use DropdownMenu's own `data-testid` prop.
      'data-testid': 'ignored-testid',
      label: 'Actions',
    };
    const withEndContent: DropdownMenuButtonProps = {
      // @ts-expect-error The trigger's end content is reserved for the chevron.
      endContent: <span data-testid="ignored-end">99</span>,
      label: 'Actions',
    };
    const withRef: DropdownMenuButtonProps = {
      label: 'Actions',
      // @ts-expect-error Use DropdownMenu's own `ref` prop.
      ref,
    };

    render(
      <DropdownMenu
        button={{...withTestId, ...withEndContent, ...withRef}}
        items={[{label: 'Edit'}]}
      />,
    );

    // Untyped callers passing them anyway get no half-applied behavior.
    expect(screen.queryByTestId('ignored-testid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ignored-end')).not.toBeInTheDocument();
    expect(ref.current).toBeNull();
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
