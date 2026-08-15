import {createEvent, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput} from 'components/CheckboxInput';
import {RadioGroup} from 'components/RadioGroup/RadioGroup';
import {RadioGroupItem} from 'components/RadioGroup/RadioGroupItem';

/**
 * Panda emits width and height as atomic classes, so comparing them is how two
 * controls are checked for occupying the same box.
 */
function boxSizeClasses(element: Element | null): string[] {
  return Array.from(element?.classList ?? [])
    .filter(name => /^silver-[wh]_/.test(name))
    .sort();
}

describe('RadioGroup', () => {
  it('submits the selected value with htmlName', () => {
    render(
      <form data-testid="form">
        <RadioGroup
          htmlName="notificationPreference"
          label="Notification preference"
          onChange={() => {}}
          value="email">
          <RadioGroupItem label="Email" value="email" />
          <RadioGroupItem label="SMS" value="sms" />
        </RadioGroup>
      </form>,
    );

    const formData = new FormData(screen.getByTestId('form'));
    expect(Array.from(formData.entries())).toEqual([
      ['notificationPreference', 'email'],
    ]);
  });

  it('calls onChange with the selected item value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <RadioGroup
        label="Notification preference"
        onChange={onChange}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem label="SMS" value="sms" />
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(onChange).toHaveBeenCalledWith('sms');
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState('email');
      return (
        <RadioGroup
          label="Notification preference"
          onChange={setValue}
          value={value}>
          <RadioGroupItem label="Email" value="email" />
          <RadioGroupItem label="SMS" value="sms" />
        </RadioGroup>
      );
    }

    render(<Example />);

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(screen.getByRole('radio', {name: 'Email'})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: 'SMS'})).toBeChecked();
  });

  it('applies disabled state from the group', () => {
    render(
      <RadioGroup
        isDisabled
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', {name: 'Email'})).toBeDisabled();
  });

  it('disables a single item independently', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem isDisabled label="SMS" value="sms" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', {name: 'Email'})).toBeEnabled();
    expect(screen.getByRole('radio', {name: 'SMS'})).toBeDisabled();
  });

  it('keeps read-only items enabled and exposes read-only semantics', () => {
    render(
      <RadioGroup
        isReadOnly
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem label="SMS" value="sms" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-readonly',
      'true',
    );
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeEnabled();
    }
  });

  it('blocks selection changes when isReadOnly is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <RadioGroup
        isReadOnly
        label="Notification preference"
        onChange={onChange}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem label="SMS" value="sms" />
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', {name: 'Email'})).toBeChecked();
    expect(screen.getByRole('radio', {name: 'SMS'})).not.toBeChecked();
  });

  it('blocks keyboard selection changes when isReadOnly is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <RadioGroup
        isReadOnly
        label="Notification preference"
        onChange={onChange}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem label="SMS" value="sms" />
      </RadioGroup>,
    );

    screen.getByRole('radio', {name: 'Email'}).focus();
    await user.keyboard('{ArrowDown}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', {name: 'Email'})).toBeChecked();
    expect(screen.getByRole('radio', {name: 'SMS'})).not.toBeChecked();
  });

  it('prevents the native radio toggle when isReadOnly is true', () => {
    render(
      <RadioGroup
        isReadOnly
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem label="SMS" value="sms" />
      </RadioGroup>,
    );

    const clickEvent = createEvent.click(
      screen.getByRole('radio', {name: 'SMS'}),
    );
    fireEvent(screen.getByRole('radio', {name: 'SMS'}), clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('sets aria-invalid and renders error message', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        status={{type: 'error', message: 'Selection required'}}
        value="">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('sets aria-required on the radiogroup and inputs', () => {
    render(
      <RadioGroup
        isRequired
        label="Notification preference"
        onChange={() => {}}
        value="">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup')).toBeRequired();
    expect(screen.getByRole('radio', {name: 'Email'})).toBeRequired();
  });

  it('renders item description with aria-describedby', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem
          description="We will send to your primary address"
          label="Email"
          value="email"
        />
      </RadioGroup>,
    );

    expect(
      screen.getByText('We will send to your primary address'),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: 'Email'})).toHaveAttribute(
      'aria-describedby',
    );
  });

  it('treats an empty-string item description as absent', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem description="" label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', {name: 'Email'})).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  it('throws when RadioGroupItem is used outside RadioGroup', () => {
    expect(() =>
      render(<RadioGroupItem label="Orphan" value="orphan" />),
    ).toThrow('RadioGroupItem must be used within a RadioGroup');
  });

  it('sets aria-orientation to horizontal', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        orientation="horizontal"
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <RadioGroup
        className="custom-class"
        data-testid="rg"
        label="Notification preference"
        onChange={() => {}}
        ref={ref}
        style={{maxWidth: 400}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    const root = screen.getByTestId('rg');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({maxWidth: '400px'});
    expect(ref).toHaveBeenCalledWith(root);
  });

  it('renders startContent on a radio item', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem
          label="Email"
          startContent={<span data-testid="start-icon">📧</span>}
          value="email"
        />
      </RadioGroup>,
    );

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders endContent on a radio item', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem
          endContent={<span data-testid="end-badge">Recommended</span>}
          label="Email"
          value="email"
        />
      </RadioGroup>,
    );

    expect(screen.getByTestId('end-badge')).toBeInTheDocument();
  });

  it('spaces vertical radio items with the shared group gap', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup')).toHaveClass('silver-gap_2');
  });

  it('spaces horizontal radio items with the shared group gaps', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        orientation="horizontal"
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup')).toHaveClass(
      'silver-cg_4',
      'silver-rg_2',
    );
  });

  it('renders radio rows without padding so the control sits on the leading edge', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    // The row is the presentational `Item` wrapper, which has no role or
    // consumer-facing test ID of its own.
    // eslint-disable-next-line testing-library/no-node-access -- verifying the presentational Item wrapper
    const row = screen.getByRole('radio', {name: 'Email'}).closest('div');
    expect(row).toHaveClass('silver-p_0');
  });

  describe.each(['sm', 'md', 'lg'] as const)(
    'size %s alignment with CheckboxInput',
    size => {
      it('gives the radio control the same box as the checkbox control', () => {
        render(
          <>
            <CheckboxInput
              label="Accept"
              onChange={() => {}}
              size={size}
              value={false}
            />
            <RadioGroup
              label="Notification preference"
              onChange={() => {}}
              size={size}
              value="email">
              <RadioGroupItem label="Email" value="email" />
            </RadioGroup>
          </>,
        );

        // The wrappers are what `Item` lays out, so a size difference between
        // them offsets every label in a form that mixes the two controls.
        /* eslint-disable testing-library/no-node-access -- the control wrappers are presentational */
        const checkboxBox = screen.getByRole('checkbox').nextElementSibling;
        const radioWrap = screen.getByRole('radio').parentElement;
        /* eslint-enable testing-library/no-node-access */

        expect(boxSizeClasses(radioWrap)).toEqual(boxSizeClasses(checkboxBox));
        expect(boxSizeClasses(radioWrap)).not.toHaveLength(0);
      });
    },
  );
});
