import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Search, type LucideProps} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {inputRecipe} from 'components/Field/inputStyles';
import {InputGroup} from 'components/InputGroup';
import {TextInput} from 'components/TextInput/TextInput';

function SearchIcon(props: LucideProps): React.JSX.Element {
  return <Search {...props} data-testid="search-icon" />;
}

describe('TextInput', () => {
  const noop = () => {};

  it('calls onChange with text values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextInput label="Name" onChange={onChange} value="" />);

    await user.type(screen.getByRole('textbox', {name: 'Name'}), 'A');
    expect(onChange).toHaveBeenCalledWith('A', expect.anything());
  });

  it('clears values when hasClear is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextInput hasClear label="Name" onChange={onChange} value="Ada" />);

    await user.click(screen.getByRole('button', {name: 'Clear Name'}));
    expect(onChange).toHaveBeenCalledWith('', null);
  });

  it('renders a disabled input', () => {
    render(<TextInput isDisabled label="Name" onChange={noop} value="" />);

    expect(screen.getByRole('textbox', {name: 'Name'})).toBeDisabled();
  });

  it('sets aria-invalid when status is error', () => {
    render(
      <TextInput
        label="Email"
        onChange={noop}
        status={{message: 'Invalid', type: 'error'}}
        value=""
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Email'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid');
  });

  it('links description to input via aria-describedby', () => {
    render(
      <TextInput
        description="Enter your full name"
        label="Name"
        onChange={noop}
        value=""
      />,
    );

    const input = screen.getByRole('textbox', {name: 'Name'});
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Enter your full name')).toHaveAttribute(
      'id',
      describedBy,
    );
  });

  it('calls onEnter when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();

    render(
      <TextInput label="Search" onChange={noop} onEnter={onEnter} value="" />,
    );

    screen.getByRole('textbox', {name: 'Search'}).focus();
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it('does not call onEnter while composing', () => {
    const onEnter = vi.fn();

    render(
      <TextInput label="Search" onChange={noop} onEnter={onEnter} value="" />,
    );

    const input = screen.getByRole('textbox', {name: 'Search'});
    fireEvent.keyDown(input, {isComposing: true, key: 'Enter'});
    fireEvent.keyDown(input, {key: 'Enter', keyCode: 229});

    expect(onEnter).not.toHaveBeenCalled();
  });

  it('forwards onKeyDown events', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(
      <TextInput
        label="Input"
        onChange={noop}
        onKeyDown={onKeyDown}
        value=""
      />,
    );

    screen.getByRole('textbox', {name: 'Input'}).focus();
    await user.keyboard('a');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('sets aria-busy when loading', () => {
    render(<TextInput isLoading label="Search" onChange={noop} value="" />);

    expect(screen.getByRole('textbox', {name: 'Search'})).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(element: HTMLInputElement | null) => void>();

    render(<TextInput label="Name" onChange={noop} ref={ref} value="" />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('forwards className and style to the field root', () => {
    const {container} = render(
      <TextInput
        className="custom-field"
        label="Name"
        onChange={noop}
        style={{marginBottom: '8px'}}
        value=""
      />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- className/style land on the Field root, which has no role or testid
    const root = container.querySelector('.custom-field');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({marginBottom: '8px'});
    expect(root).toHaveTextContent('Name');
  });

  it('applies the type prop', () => {
    render(
      <TextInput
        data-testid="input"
        label="Password"
        onChange={noop}
        type="password"
        value=""
      />,
    );

    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });

  it('renders a tel input for phone number entry', () => {
    render(
      <TextInput
        autoComplete="tel"
        label="Phone number"
        onChange={noop}
        type="tel"
        value=""
      />,
    );

    const input = screen.getByRole('textbox', {name: 'Phone number'});
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('autocomplete', 'tel');
  });

  it('does not reformat the value typed into a tel input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TextInput
        label="Phone number"
        onChange={onChange}
        type="tel"
        value=""
      />,
    );

    await user.type(screen.getByRole('textbox', {name: 'Phone number'}), '(');

    expect(onChange).toHaveBeenCalledWith('(', expect.anything());
  });

  it('renders placeholder text', () => {
    render(
      <TextInput
        label="Name"
        onChange={noop}
        placeholder="John Doe"
        value=""
      />,
    );

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<TextInput hasClear label="Name" onChange={noop} value="" />);

    expect(
      screen.queryByRole('button', {name: 'Clear Name'}),
    ).not.toBeInTheDocument();
  });

  it('does not show clear button when disabled', () => {
    render(
      <TextInput
        hasClear
        isDisabled
        label="Name"
        onChange={noop}
        value="Ada"
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Name'}),
    ).not.toBeInTheDocument();
  });

  it('renders a start icon', () => {
    render(
      <TextInput
        data-testid="input"
        label="Search"
        onChange={noop}
        startIcon={SearchIcon}
        value=""
      />,
    );

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <TextInput
        endContent={<span data-testid="end">suffix</span>}
        label="Amount"
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('sets native required attribute', () => {
    render(
      <TextInput
        data-testid="input"
        isRequired
        label="Name"
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('applies data-testid to the input', () => {
    render(
      <TextInput
        data-testid="my-input"
        label="Name"
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('my-input')).toBeInTheDocument();
  });

  it('applies the autoComplete attribute', () => {
    render(
      <TextInput autoComplete="email" label="Email" onChange={noop} value="" />,
    );

    expect(screen.getByRole('textbox', {name: 'Email'})).toHaveAttribute(
      'autocomplete',
      'email',
    );
  });

  it('applies htmlName to the input', () => {
    render(
      <TextInput htmlName="username" label="Name" onChange={noop} value="" />,
    );

    expect(screen.getByRole('textbox', {name: 'Name'})).toHaveAttribute(
      'name',
      'username',
    );
  });

  it('calls onFocus and onBlur handlers', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(
      <TextInput
        label="Name"
        onBlur={onBlur}
        onChange={noop}
        onFocus={onFocus}
        value=""
      />,
    );

    const input = screen.getByRole('textbox', {name: 'Name'});
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('visually hides the label when isLabelHidden is true', () => {
    render(<TextInput isLabelHidden label="Name" onChange={noop} value="" />);

    // The label stays accessible even though it is visually hidden.
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'Name'})).toBeInTheDocument();
  });

  it('renders a label icon', () => {
    render(
      <TextInput
        label="Search"
        labelIcon={SearchIcon}
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders label tooltip content', () => {
    render(
      <TextInput
        label="Name"
        labelTooltip="Your full legal name."
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Your full legal name.',
    );
  });

  describe('inside an InputGroup', () => {
    it('exposes the label via aria-label rather than a field label', () => {
      render(
        <InputGroup label="Website">
          <TextInput isLabelHidden label="URL" onChange={noop} value="" />
        </InputGroup>,
      );

      const input = screen.getByRole('textbox', {name: 'URL'});
      expect(input).toHaveAttribute('aria-label', 'URL');
      // The group renders the field label, so no <label> is tied to the input.
      // eslint-disable-next-line testing-library/no-node-access
      expect(input.closest('label')).toBeNull();
    });

    it('is disabled when the group is disabled even if its own isDisabled is false', () => {
      render(
        <InputGroup isDisabled label="Website">
          <TextInput isLabelHidden label="URL" onChange={noop} value="" />
        </InputGroup>,
      );

      expect(screen.getByRole('textbox', {name: 'URL'})).toBeDisabled();
    });

    it('hides the clear button when the group is disabled', () => {
      render(
        <InputGroup isDisabled label="Website">
          <TextInput
            hasClear
            isLabelHidden
            label="URL"
            onChange={noop}
            value="acme"
          />
        </InputGroup>,
      );

      expect(
        screen.queryByRole('button', {name: 'Clear URL'}),
      ).not.toBeInTheDocument();
    });

    it('applies the group status type to the input wrapper', () => {
      render(
        <InputGroup label="Website" status={{message: 'Bad', type: 'error'}}>
          <TextInput isLabelHidden label="URL" onChange={noop} value="" />
        </InputGroup>,
      );

      const input = screen.getByRole('textbox', {name: 'URL'});
      // eslint-disable-next-line testing-library/no-node-access
      expect(input.parentElement).toHaveClass(inputRecipe({status: 'error'}));
      // Group status styling must not flag the field as invalid.
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('forwards className and style to the wrapper instead of a field', () => {
      const {container} = render(
        <InputGroup label="Website">
          <TextInput
            className="custom-wrapper"
            isLabelHidden
            label="URL"
            onChange={noop}
            style={{maxWidth: 200}}
            value=""
          />
        </InputGroup>,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const wrapper = container.querySelector('.custom-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveStyle({maxWidth: '200px'});
      expect(wrapper).toContainElement(screen.getByRole('textbox'));
    });
  });
});
