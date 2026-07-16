import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Search, User} from 'lucide-react';
import {useState} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Select} from 'components/Select/Select';
import {SelectOption} from 'components/Select/SelectOption';
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

describe('Select', () => {
  it('submits the selected value with htmlName', () => {
    render(
      <form data-testid="form">
        <Select
          htmlName="fruit"
          label="Fruit"
          onChange={() => {}}
          options={['Apple', 'Banana']}
          value="Banana"
        />
        <Select
          htmlName="empty"
          label="Empty"
          onChange={() => {}}
          options={['Apple', 'Banana']}
          value={null}
        />
        <Select
          htmlName="disabled"
          isDisabled
          label="Disabled"
          onChange={() => {}}
          options={['Apple', 'Banana']}
          value="Apple"
        />
      </form>,
    );

    const formData = new FormData(screen.getByTestId('form'));
    expect(formData.get('fruit')).toBe('Banana');
    expect(formData.has('empty')).toBe(false);
    expect(formData.has('disabled')).toBe(false);
  });

  it('selects an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Fruit"
        onChange={onChange}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Fruit'}));
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('Banana');
  });

  it('opens when clicking the dropdown icon area', async () => {
    const user = userEvent.setup();

    const {container} = render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- chevron icon is decorative and has no accessible role
    const chevron = container.querySelector('.lucide-chevron-down');
    expect(chevron).toBeInTheDocument();

    if (chevron == null) {
      throw new Error('Expected chevron icon to render');
    }

    await user.click(chevron);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('clears the selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        hasClear
        label="Fruit"
        onChange={onChange}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Fruit'}));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('supports custom option rendering', async () => {
    const user = userEvent.setup();

    render(
      <Select
        hasSearch
        label="User"
        onChange={() => {}}
        options={[{label: 'Ada Lovelace', value: 'ada'}]}
        renderOption={option => (
          <SelectOption
            description="Engineer"
            label={option.label ?? option.value}
          />
        )}
        value="ada"
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'User'}));

    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {hidden: true, name: 'Search User'}),
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation and selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Fruit"
        onChange={onChange}
        options={['Apple', 'Banana', 'Cherry']}
        value="Apple"
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute(
      'aria-controls',
      screen.getByRole('listbox', {hidden: true, name: 'Fruit options'}).id,
    );
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-activedescendant');
    expect(
      screen.getByRole('option', {hidden: true, name: 'Apple'}),
    ).toHaveAttribute('id', trigger.getAttribute('aria-activedescendant'));

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('Banana');
  });

  it('selects options by typing while closed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="State"
        onChange={onChange}
        options={[
          {label: 'Colorado', value: 'CO'},
          {isDisabled: true, label: 'California disabled', value: 'disabled'},
          {label: 'California', value: 'CA'},
        ]}
        value={null}
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'State'});
    trigger.focus();
    await user.keyboard('ca');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).toHaveBeenLastCalledWith('CA');
  });

  it('cycles through options starting with the same typed character', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function MonthSelect() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Select
          label="Month"
          onChange={nextValue => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          options={['January', 'March', 'May']}
          value={value}
        />
      );
    }

    render(<MonthSelect />);

    const trigger = screen.getByRole('combobox', {name: 'Month'});
    trigger.focus();

    await user.keyboard('m');
    expect(onChange).toHaveBeenLastCalledWith('March');

    await user.keyboard('m');
    expect(onChange).toHaveBeenLastCalledWith('May');
    expect(onChange).toHaveBeenCalledTimes(2);
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
        <Select
          label="Fruit"
          onChange={() => {}}
          options={Array.from({length: 30}, (_, index) => `Fruit ${index + 1}`)}
          value={null}
        />,
      );

      const trigger = screen.getByRole('combobox', {name: 'Fruit'});
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

  it('closes with Escape from the keyboard', async () => {
    const user = userEvent.setup();

    render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores navigation and commit keys while composing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Fruit"
        onChange={onChange}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
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
      <Select
        hasSearch
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana', 'Cherry']}
        value={null}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Fruit'}));

    const search = screen.getByLabelText('Search Fruit');
    const listbox = screen.getByRole('listbox', {
      hidden: true,
      name: 'Fruit options',
    });
    expect(search).toHaveAttribute('aria-controls', listbox.id);

    await user.type(search, 'ba');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    expect(search).toHaveAttribute('aria-activedescendant');
    expect(
      screen.getByRole('option', {hidden: true, name: 'Banana'}),
    ).toHaveAttribute('id', search.getAttribute('aria-activedescendant'));
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();

    render(
      <Select
        isDisabled
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
    expect(trigger).toBeDisabled();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows loading state and disables the trigger', () => {
    render(
      <Select
        isLoading
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-busy', 'true');
  });

  it('renders sections and dividers and selects section options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Person"
        onChange={onChange}
        options={[
          {
            title: 'Engineering',
            type: 'section',
            options: [
              {label: 'Ada Lovelace', value: 'ada'},
              {label: 'Grace Hopper', value: 'grace'},
            ],
          },
          {type: 'divider'},
          {
            title: 'Science',
            type: 'section',
            options: [{label: 'Katherine Johnson', value: 'katherine'}],
          },
        ]}
        value={null}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Person'}));

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    const engineeringGroup = screen.getByRole('group', {
      hidden: true,
      name: 'Engineering',
    });
    const engineeringHeading = screen.getByText('Engineering');
    expect(engineeringGroup).toHaveAttribute(
      'aria-labelledby',
      engineeringHeading.id,
    );
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();

    await user.click(screen.getByText('Katherine Johnson'));
    expect(onChange).toHaveBeenCalledWith('katherine');
  });

  it('renders multiple dividers without duplicate key warnings', async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      render(
        <Select
          label="Fruit"
          onChange={() => {}}
          options={[
            'Apple',
            {type: 'divider'},
            'Banana',
            {type: 'divider'},
            'Cherry',
          ]}
          value={null}
        />,
      );

      await user.click(screen.getByRole('combobox', {name: 'Fruit'}));

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

  it('renders a start icon', () => {
    const {container} = render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        startIcon={Search}
        value="Apple"
      />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- lucide icons are decorative SVGs
    expect(container.querySelector('.lucide-search')).toBeInTheDocument();
  });

  it('renders validation status and aria-invalid', () => {
    render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        status={{message: 'Choose a fruit', type: 'error'}}
        value={null}
      />,
    );

    expect(screen.getByText('Choose a fruit')).toBeInTheDocument();
    expect(screen.getByRole('combobox', {name: 'Fruit'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders placeholder text when no value is selected', () => {
    render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        placeholder="Pick fruit"
        value={null}
      />,
    );

    expect(screen.getByText('Pick fruit')).toBeInTheDocument();
  });

  it('does not select disabled options', () => {
    const onChange = vi.fn();

    render(
      <Select
        label="Fruit"
        onChange={onChange}
        options={[
          {label: 'Apple', value: 'apple'},
          {isDisabled: true, label: 'Banana', value: 'banana'},
        ]}
        value="apple"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', {name: 'Fruit'}));
    fireEvent.click(screen.getByText('Banana'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards ref to the combobox button', () => {
    const ref = vi.fn<(el: HTMLButtonElement | null) => void>();

    render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        ref={ref}
        value="Apple"
      />,
    );

    expect(ref).toHaveBeenCalledWith(
      screen.getByRole('combobox', {name: 'Fruit'}),
    );
  });

  it('forwards className and style to the field root', () => {
    const {container} = render(
      <Select
        className="custom-field"
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        style={{marginBottom: '8px'}}
        value="Apple"
      />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- className/style land on the Field root, which has no role or testid
    const root = container.querySelector('.custom-field');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({marginBottom: '8px'});
    expect(root).toHaveTextContent('Fruit');
  });

  it('renders description with aria-describedby', () => {
    render(
      <Select
        description="Choose your favorite fruit"
        label="Fruit"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        value={null}
      />,
    );

    expect(screen.getByText('Choose your favorite fruit')).toBeInTheDocument();
    const combobox = screen.getByRole('combobox', {name: 'Fruit'});
    const describedById = assertNonNull(
      combobox.getAttribute('aria-describedby'),
    );
    // eslint-disable-next-line testing-library/no-node-access -- verifying aria-describedby target content
    expect(document.getElementById(describedById)).toHaveTextContent(
      'Choose your favorite fruit',
    );
  });

  it('renders label tooltip', () => {
    render(
      <Select
        label="Fruit"
        labelTooltip="Pick one fruit from the list"
        onChange={() => {}}
        options={['Apple', 'Banana']}
        value={null}
      />,
    );

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Pick one fruit from the list',
    );
  });
});

describe('SelectOption', () => {
  it('renders label, description, icon, end content, and passthrough props', () => {
    const ref = vi.fn();
    const {container} = render(
      <SelectOption
        className="custom-option"
        data-testid="option-layout"
        description="Engineer"
        endContent={<span>Admin</span>}
        icon={User}
        label="Ada Lovelace"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const option = screen.getByTestId('option-layout');
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(option).toHaveClass('custom-option');
    expect(option).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(option);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- lucide icons are decorative SVGs
    expect(container.querySelector('.lucide-user')).toBeInTheDocument();
  });
});
