import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {MultiSelect} from 'components/MultiSelect/MultiSelect';
import {SelectOption} from 'components/Select';
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

describe('MultiSelect', () => {
  it('toggles an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));
    await user.click(screen.getByText('Email'));

    expect(onChange).toHaveBeenCalledWith(['Name', 'Email']);
  });

  it('deselects an already selected option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email']}
        value={['Name', 'Email']}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));
    await user.click(screen.getByText('Email'));

    expect(onChange).toHaveBeenCalledWith(['Name']);
  });

  it('clears all selected options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        hasClear
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Columns'}));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('supports keyboard navigation and selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email', 'Role']}
        value={['Name']}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute(
      'aria-controls',
      screen.getByRole('listbox', {hidden: true, name: 'Columns options'}).id,
    );
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-activedescendant');
    expect(
      screen.getByRole('option', {hidden: true, name: 'Name'}),
    ).toHaveAttribute('id', trigger.getAttribute('aria-activedescendant'));

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Name', 'Email']);
  });

  it('scrolls the highlighted option into view during keyboard navigation', async () => {
    const user = userEvent.setup();
    const scrolled: HTMLElement[] = [];
    const scrollSpy = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(function scrollIntoView(this: HTMLElement) {
        scrolled.push(this);
      });

    try {
      render(
        <MultiSelect
          label="Columns"
          onChange={() => {}}
          options={Array.from(
            {length: 30},
            (_, index) => `Column ${index + 1}`,
          )}
          value={[]}
        />,
      );

      const trigger = screen.getByRole('combobox', {name: 'Columns'});
      trigger.focus();

      // Open, then arrow well past the visible fold.
      await user.keyboard('{ArrowDown}');
      for (let index = 0; index < 20; index++) {
        await user.keyboard('{ArrowDown}');
      }

      const activeId = assertNonNull(
        trigger.getAttribute('aria-activedescendant'),
      );
      // eslint-disable-next-line testing-library/no-node-access -- verifying the active option element was scrolled into view
      const activeOption = document.getElementById(activeId);
      expect(scrolled).toContain(activeOption);
      expect(scrollSpy).toHaveBeenCalledWith({block: 'nearest'});
    } finally {
      scrollSpy.mockRestore();
    }
  });

  it('keeps the current option highlighted after keyboard selection', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email', 'Role']}
        value={[]}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    const highlightedId = trigger.getAttribute('aria-activedescendant');
    const highlightedOption = screen.getByRole('option', {
      hidden: true,
      name: 'Email',
    });

    expect(highlightedOption).toHaveAttribute('id', highlightedId);

    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-activedescendant', highlightedId);
    expect(highlightedOption).toHaveAttribute('tabindex', '0');
  });

  it('supports Home, End, and Escape keyboard behavior', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email', 'Role']}
        value={[]}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    expect(
      screen.getByRole('option', {hidden: true, name: 'Role'}),
    ).toHaveAttribute('id', trigger.getAttribute('aria-activedescendant'));

    await user.keyboard('{Home}');
    expect(
      screen.getByRole('option', {hidden: true, name: 'Name'}),
    ).toHaveAttribute('id', trigger.getAttribute('aria-activedescendant'));

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores navigation and commit keys while composing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const highlightedId = trigger.getAttribute('aria-activedescendant');

    fireEvent.keyDown(trigger, {isComposing: true, key: 'ArrowDown'});
    expect(trigger).toHaveAttribute('aria-activedescendant', highlightedId);

    fireEvent.keyDown(trigger, {isComposing: true, key: 'Enter'});
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(trigger, {isComposing: true, key: 'Escape'});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('filters options when search is enabled', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect
        hasSearch
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email', 'Role']}
        value={[]}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));

    const search = screen.getByLabelText('Search Columns');
    const listbox = screen.getByRole('listbox', {
      hidden: true,
      name: 'Columns options',
    });
    expect(search).toHaveAttribute('aria-controls', listbox.id);

    await user.type(search, 'ro');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
    expect(search).toHaveAttribute('aria-activedescendant');
    expect(
      screen.getByRole('option', {hidden: true, name: 'Role'}),
    ).toHaveAttribute('id', search.getAttribute('aria-activedescendant'));
  });

  it('selects and deselects all enabled options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function ControlledMultiSelect() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <MultiSelect
          hasSelectAll
          label="Columns"
          onChange={nextValue => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          options={[
            {label: 'Name', value: 'name'},
            {label: 'Email', value: 'email'},
            {isDisabled: true, label: 'Status', value: 'status'},
          ]}
          value={value}
        />
      );
    }

    render(<ControlledMultiSelect />);

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));
    await user.click(screen.getByText('Select all'));
    expect(onChange).toHaveBeenLastCalledWith(['name', 'email']);
    expect(screen.getByText('2 selected')).toBeInTheDocument();

    await user.click(screen.getByText('Select all'));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByText('Select...')).toBeInTheDocument();
  });

  it('selects and deselects only visible options when search is filtered', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function ControlledMultiSelect() {
      const [value, setValue] = useState<string[]>(['user']);
      return (
        <MultiSelect
          hasSearch
          hasSelectAll
          label="Roles"
          onChange={nextValue => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          options={[
            {label: 'Administrator', value: 'administrator'},
            {label: 'Admin Assistant', value: 'admin-assistant'},
            {isDisabled: true, label: 'Admin Audit', value: 'admin-audit'},
            {label: 'User', value: 'user'},
          ]}
          value={value}
        />
      );
    }

    render(<ControlledMultiSelect />);

    await user.click(screen.getByRole('combobox', {name: 'Roles'}));
    await user.type(screen.getByLabelText('Search Roles'), 'admin');
    await user.click(screen.getByText('Select all'));

    expect(onChange).toHaveBeenLastCalledWith([
      'user',
      'administrator',
      'admin-assistant',
    ]);

    await user.click(screen.getByText('Select all'));
    expect(onChange).toHaveBeenLastCalledWith(['user']);
  });

  it('does not select disabled options', () => {
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={[
          {label: 'Name', value: 'name'},
          {isDisabled: true, label: 'Email', value: 'email'},
        ]}
        value={[]}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', {name: 'Columns'}));
    fireEvent.click(screen.getByText('Email'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders trigger display modes', () => {
    const options = [
      {label: 'Name', value: 'name'},
      {label: 'Email', value: 'email'},
    ];

    const {rerender} = render(
      <MultiSelect
        label="Columns"
        onChange={() => {}}
        options={options}
        value={['name', 'email']}
      />,
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();

    rerender(
      <MultiSelect
        label="Columns"
        onChange={() => {}}
        options={options}
        triggerDisplay="labels"
        value={['name', 'email']}
      />,
    );
    expect(screen.getByText('Name, Email')).toBeInTheDocument();

    rerender(
      <MultiSelect
        label="Columns"
        maxBadges={1}
        onChange={() => {}}
        options={options}
        triggerDisplay="badges"
        value={['name', 'email']}
      />,
    );
    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    expect(within(trigger).getByText('Name')).toBeInTheDocument();
    expect(within(trigger).getByText('+1')).toBeInTheDocument();
  });

  it('renders sections and dividers and selects section options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={[
          {
            title: 'Visible',
            type: 'section',
            options: [
              {label: 'Name', value: 'name'},
              {label: 'Email', value: 'email'},
            ],
          },
          {type: 'divider'},
          {
            title: 'Metadata',
            type: 'section',
            options: [{label: 'Status', value: 'status'}],
          },
        ]}
        value={[]}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));

    expect(screen.getByText('Visible')).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    const visibleGroup = screen.getByRole('group', {
      hidden: true,
      name: 'Visible',
    });
    const visibleHeading = screen.getByText('Visible');
    expect(visibleGroup).toHaveAttribute('aria-labelledby', visibleHeading.id);
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();

    await user.click(screen.getByText('Status'));
    expect(onChange).toHaveBeenCalledWith(['status']);
  });

  it('renders multiple dividers without duplicate key warnings', async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      render(
        <MultiSelect
          label="Columns"
          onChange={() => {}}
          options={[
            'Name',
            {type: 'divider'},
            'Email',
            {type: 'divider'},
            'Role',
          ]}
          value={[]}
        />,
      );

      await user.click(screen.getByRole('combobox', {name: 'Columns'}));

      expect(screen.getAllByRole('separator', {hidden: true})).toHaveLength(2);
      const messages = consoleError.mock.calls
        .flat()
        .map(message => String(message))
        .join('\n');
      expect(messages).not.toContain(
        'Encountered two children with the same key',
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('shows loading state and disables the trigger', () => {
    render(
      <MultiSelect
        isLoading
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-busy', 'true');
  });

  it('does not open and hides the clear button when disabled', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect
        hasClear
        isDisabled
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    expect(trigger).toBeDisabled();
    expect(
      screen.queryByRole('button', {name: 'Clear Columns'}),
    ).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports custom option rendering', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect
        hasSearch
        label="Columns"
        onChange={() => {}}
        options={[{label: 'Name', value: 'name'}]}
        value={[]}>
        {option => (
          <SelectOption
            description="Visible column"
            label={option.label ?? option.value}
          />
        )}
      </MultiSelect>,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));

    expect(screen.getByText('Visible column')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {hidden: true, name: 'Search Columns'}),
    ).toBeInTheDocument();
  });

  it('forwards refs to the combobox button', () => {
    const ref = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email']}
        ref={ref}
        value={[]}
      />,
    );

    expect(ref).toHaveBeenCalledWith(
      screen.getByRole('combobox', {name: 'Columns'}),
    );
  });

  it('forwards className and style to the field root', () => {
    const {container} = render(
      <MultiSelect
        className="custom-field"
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email']}
        style={{marginBottom: '8px'}}
        value={[]}
      />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- className/style land on the Field root, which has no role or testid
    const root = container.querySelector('.custom-field');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({marginBottom: '8px'});
    expect(root).toHaveTextContent('Columns');
  });

  it('opens the dropdown on mount when isDefaultOpen is set', () => {
    render(
      <MultiSelect
        isDefaultOpen
        label="Columns"
        onChange={() => {}}
        options={['Name', 'Email']}
        value={[]}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Columns'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('listbox', {hidden: true, name: 'Columns options'}),
    ).toBeInTheDocument();
  });
});
