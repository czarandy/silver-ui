import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxGroup} from 'components/CheckboxGroup/CheckboxGroup';
import {CheckboxGroupItem} from 'components/CheckboxGroup/CheckboxGroupItem';

describe('CheckboxGroup', () => {
  it('calls onChange with the selected item added', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={onChange}
        value={['email']}>
        <CheckboxGroupItem label="Email" value="email" />
        <CheckboxGroupItem label="SMS" value="sms" />
      </CheckboxGroup>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'SMS'}));

    expect(onChange).toHaveBeenCalledWith(['email', 'sms']);
  });

  it('calls onChange with the selected item removed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={onChange}
        value={['email', 'sms']}>
        <CheckboxGroupItem label="Email" value="email" />
        <CheckboxGroupItem label="SMS" value="sms" />
      </CheckboxGroup>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Email'}));

    expect(onChange).toHaveBeenCalledWith(['sms']);
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState(['email']);
      return (
        <CheckboxGroup
          label="Notification channels"
          onChange={setValue}
          value={value}>
          <CheckboxGroupItem label="Email" value="email" />
          <CheckboxGroupItem label="SMS" value="sms" />
        </CheckboxGroup>
      );
    }

    render(<Example />);

    await user.click(screen.getByRole('checkbox', {name: 'SMS'}));

    expect(screen.getByRole('checkbox', {name: 'Email'})).toBeChecked();
    expect(screen.getByRole('checkbox', {name: 'SMS'})).toBeChecked();
  });

  it('applies disabled state from the group', () => {
    render(
      <CheckboxGroup
        isDisabled
        label="Notification channels"
        onChange={() => {}}
        value={['email']}>
        <CheckboxGroupItem label="Email" value="email" />
      </CheckboxGroup>,
    );

    expect(screen.getByRole('checkbox', {name: 'Email'})).toBeDisabled();
  });

  it('disables a single item independently', () => {
    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={() => {}}
        value={['email']}>
        <CheckboxGroupItem label="Email" value="email" />
        <CheckboxGroupItem isDisabled label="SMS" value="sms" />
      </CheckboxGroup>,
    );

    expect(screen.getByRole('checkbox', {name: 'Email'})).toBeEnabled();
    expect(screen.getByRole('checkbox', {name: 'SMS'})).toBeDisabled();
  });

  it('sets aria-invalid and renders error message', () => {
    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={() => {}}
        status={{type: 'error', message: 'Selection required'}}
        value={[]}>
        <CheckboxGroupItem label="Email" value="email" />
      </CheckboxGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('renders required indicator on the group label', () => {
    render(
      <CheckboxGroup
        isRequired
        label="Notification channels"
        onChange={() => {}}
        value={[]}>
        <CheckboxGroupItem label="Email" value="email" />
      </CheckboxGroup>,
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders group description with aria-describedby', () => {
    render(
      <CheckboxGroup
        description="Choose any channels that apply"
        label="Notification channels"
        onChange={() => {}}
        value={[]}>
        <CheckboxGroupItem label="Email" value="email" />
      </CheckboxGroup>,
    );

    expect(
      screen.getByText('Choose any channels that apply'),
    ).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-describedby');
  });

  it('renders item description with aria-describedby', () => {
    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={() => {}}
        value={['email']}>
        <CheckboxGroupItem
          description="We will send to your primary address"
          label="Email"
          value="email"
        />
      </CheckboxGroup>,
    );

    expect(
      screen.getByText('We will send to your primary address'),
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', {name: 'Email'})).toHaveAttribute(
      'aria-describedby',
    );
  });

  it('throws when CheckboxGroupItem is used outside CheckboxGroup', () => {
    expect(() =>
      render(<CheckboxGroupItem label="Orphan" value="orphan" />),
    ).toThrow('CheckboxGroupItem must be used within a CheckboxGroup');
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <CheckboxGroup
        className="custom-class"
        data-testid="cg"
        label="Notification channels"
        onChange={() => {}}
        ref={ref}
        style={{maxWidth: 400}}
        value={['email']}>
        <CheckboxGroupItem label="Email" value="email" />
      </CheckboxGroup>,
    );

    const root = screen.getByTestId('cg');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({maxWidth: '400px'});
    expect(ref).toHaveBeenCalledWith(root);
  });

  it('does not add gaps between horizontal checkbox items', () => {
    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={() => {}}
        orientation="horizontal"
        value={['email']}>
        <CheckboxGroupItem label="Email" value="email" />
      </CheckboxGroup>,
    );

    expect(screen.getByRole('group')).toHaveClass('silver-cg_0', 'silver-rg_0');
  });

  it('renders startContent on a checkbox item', () => {
    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={() => {}}
        value={['email']}>
        <CheckboxGroupItem
          label="Email"
          startContent={<span data-testid="start-icon">Mail</span>}
          value="email"
        />
      </CheckboxGroup>,
    );

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders endContent on a checkbox item', () => {
    render(
      <CheckboxGroup
        label="Notification channels"
        onChange={() => {}}
        value={['email']}>
        <CheckboxGroupItem
          endContent={<span data-testid="end-badge">Recommended</span>}
          label="Email"
          value="email"
        />
      </CheckboxGroup>,
    );

    expect(screen.getByTestId('end-badge')).toBeInTheDocument();
  });

  it('sets name and value attributes on checkbox inputs', () => {
    render(
      <form data-testid="form">
        <CheckboxGroup
          htmlName="channels"
          label="Notification channels"
          onChange={() => {}}
          value={['email']}>
          <CheckboxGroupItem label="Email" value="email" />
        </CheckboxGroup>
      </form>,
    );

    expect(screen.getByRole('checkbox', {name: 'Email'})).toHaveAttribute(
      'name',
      'channels',
    );
    expect(new FormData(screen.getByTestId('form')).get('channels')).toBe(
      'email',
    );
  });
});
