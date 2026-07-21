import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ShieldCheck, type LucideProps} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Switch} from 'components/Switch/Switch';

function LabelIcon(props: LucideProps): React.JSX.Element {
  return <ShieldCheck {...props} data-testid="label-icon" />;
}

describe('Switch', () => {
  it('submits its checked value with htmlName', () => {
    render(
      <form data-testid="form">
        <Switch
          htmlName="notifications"
          isSelected
          label="Notifications"
          onChange={() => {}}
        />
        <Switch
          htmlName="digest"
          isSelected={false}
          label="Digest"
          onChange={() => {}}
        />
        <Switch
          htmlName="disabled"
          isDisabled
          isSelected
          label="Disabled"
          onChange={() => {}}
        />
      </form>,
    );

    const formData = new FormData(screen.getByTestId('form'));
    expect(formData.get('notifications')).toBe('on');
    expect(formData.has('digest')).toBe(false);
    expect(formData.has('disabled')).toBe(false);
  });

  it('calls onChange with the next checked value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Switch isSelected={false} label="Notifications" onChange={onChange} />,
    );

    await user.click(screen.getByRole('switch', {name: 'Notifications'}));
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const [isSelected, setIsSelected] = useState(false);
      return (
        <Switch
          isSelected={isSelected}
          label="Notifications"
          onChange={setIsSelected}
        />
      );
    }

    render(<Fixture />);
    await user.click(screen.getByRole('switch', {name: 'Notifications'}));
    expect(screen.getByRole('switch', {name: 'Notifications'})).toBeChecked();
  });

  it('applies disabled and loading states', () => {
    render(
      <Switch
        isDisabled
        isLoading
        isSelected
        label="Notifications"
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('switch', {name: 'Notifications'})).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('does not disable the switch when loading', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Switch
        isLoading
        isSelected={false}
        label="Notifications"
        onChange={onChange}
      />,
    );

    const control = screen.getByRole('switch', {name: 'Notifications'});
    expect(control).toBeEnabled();
    expect(control).toHaveAttribute('aria-busy', 'true');

    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('keeps visually hidden labels accessible', () => {
    render(
      <Switch
        isLabelHidden
        isSelected={false}
        label="Notifications"
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('switch', {name: 'Notifications'}),
    ).toBeInTheDocument();
  });

  it('renders the label before the switch when labelPosition is start', () => {
    render(
      <Switch
        isSelected={false}
        label="Notifications"
        labelPosition="start"
        onChange={() => {}}
      />,
    );

    const label = screen.getByText('Notifications');
    const control = screen.getByRole('switch', {name: 'Notifications'});

    expect(label.compareDocumentPosition(control) & 4).toBe(4);
  });

  it('applies spread layout styling', () => {
    render(
      <>
        <Switch
          data-testid="default"
          isSelected={false}
          label="Default"
          onChange={() => {}}
        />
        <Switch
          data-testid="spread"
          isSelected={false}
          label="Spread"
          labelSpacing="spread"
          onChange={() => {}}
        />
      </>,
    );

    const getFieldElement = (testId: string): HTMLElement | undefined =>
      // eslint-disable-next-line testing-library/no-node-access -- visual layout class is applied above the input.
      screen.getByTestId(testId).parentElement?.parentElement?.parentElement ??
      undefined;
    const defaultField = getFieldElement('default');
    const spreadField = getFieldElement('spread');

    expect(spreadField).not.toHaveAttribute(
      'class',
      defaultField?.getAttribute('class') ?? '',
    );
  });

  it('renders status messages and marks error status invalid', () => {
    render(
      <>
        <Switch
          isSelected={false}
          label="Error setting"
          onChange={() => {}}
          status={{message: 'Fix this setting.', type: 'error'}}
        />
        <Switch
          isSelected
          label="Warning setting"
          onChange={() => {}}
          status={{message: 'Check this setting.', type: 'warning'}}
        />
        <Switch
          isSelected
          label="Success setting"
          onChange={() => {}}
          status={{message: 'Looks good.', type: 'success'}}
        />
      </>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Fix this setting.');
    expect(screen.getByRole('switch', {name: 'Error setting'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getAllByRole('status')).toHaveLength(2);
    expect(screen.getByText('Check this setting.')).toBeInTheDocument();
    expect(screen.getByText('Looks good.')).toBeInTheDocument();
  });

  it('associates description with the switch', () => {
    render(
      <Switch
        description="Receive account alerts."
        isSelected
        label="Notifications"
        onChange={() => {}}
      />,
    );

    const description = screen.getByText('Receive account alerts.');
    expect(description).toHaveAttribute('id');
    expect(screen.getByRole('switch', {name: 'Notifications'})).toHaveAttribute(
      'aria-describedby',
      description.id,
    );
  });

  it('treats an empty-string description as absent', () => {
    render(
      <Switch
        description=""
        isSelected
        label="Notifications"
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('switch', {name: 'Notifications'}),
    ).not.toHaveAttribute('aria-describedby');
  });

  it('renders required and optional text', () => {
    render(
      <>
        <Switch
          isRequired
          isSelected
          label="Required setting"
          onChange={() => {}}
        />
        <Switch
          isOptional
          isSelected={false}
          label="Optional setting"
          onChange={() => {}}
        />
      </>,
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders label tooltip content', () => {
    render(
      <Switch
        isSelected
        label="Notifications"
        labelTooltip="Controls all notification delivery."
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Controls all notification delivery.',
    );
  });

  it('renders label icons', () => {
    render(
      <Switch
        isSelected
        label="Security alerts"
        labelIcon={LabelIcon}
        onChange={() => {}}
      />,
    );

    expect(screen.getByTestId('label-icon')).toBeInTheDocument();
  });

  it('calls focus and blur handlers', () => {
    const onBlur = vi.fn();
    const onFocus = vi.fn();

    render(
      <Switch
        isSelected={false}
        label="Notifications"
        onBlur={onBlur}
        onChange={() => {}}
        onFocus={onFocus}
      />,
    );

    const control = screen.getByRole('switch', {name: 'Notifications'});
    fireEvent.focus(control);
    fireEvent.blur(control);

    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('applies data-testid to the input', () => {
    render(
      <Switch
        data-testid="notifications"
        isSelected
        label="Notifications"
        onChange={() => {}}
      />,
    );

    expect(screen.getByTestId('notifications')).toBe(
      screen.getByRole('switch', {name: 'Notifications'}),
    );
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Switch
        isDisabled
        isSelected={false}
        label="Notifications"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('switch', {name: 'Notifications'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards ref to the input', () => {
    const ref = vi.fn<(element: HTMLInputElement | null) => void>();

    render(
      <Switch
        isSelected={false}
        label="Notifications"
        onChange={() => {}}
        ref={ref}
      />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });
});
