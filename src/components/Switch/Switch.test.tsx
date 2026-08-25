import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ShieldCheck, type LucideProps} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Switch} from 'components/Switch/Switch';
import {switchRecipe} from 'components/Switch/Switch.recipe';
import {necessityIndicatorRecipe} from 'internal/NecessityIndicator.recipe';
import {SizeContext} from 'internal/SizeContext';
import {assertNonNull} from 'internal/testHelpers';
import {css} from 'styled-system/css';

function LabelIcon(props: LucideProps): React.JSX.Element {
  return <ShieldCheck {...props} data-testid="label-icon" />;
}

function getControl(testId: string): HTMLElement {
  const control =
    // eslint-disable-next-line testing-library/no-node-access -- geometry classes live on the control wrapper around the input.
    screen.getByTestId(testId).parentElement;
  if (control == null) {
    throw new Error(`No control wrapper for ${testId}`);
  }
  return control;
}

function getThumb(testId: string): HTMLElement {
  const thumb =
    // eslint-disable-next-line testing-library/no-node-access -- the thumb is decorative and has no accessible role.
    getControl(testId).querySelector<HTMLElement>('[data-switch-track] > span');
  if (thumb == null) {
    throw new Error(`No thumb for ${testId}`);
  }
  return thumb;
}

describe('Switch', () => {
  it('does not show pointer press feedback when read-only', () => {
    render(
      <Switch
        isReadOnly
        isSelected
        label="Notifications"
        onChange={() => {}}
      />,
    );

    const input = screen.getByRole('switch', {name: 'Notifications'});
    const pointerEventsClass = switchRecipe({isReadOnly: true})
      .input?.split(' ')
      .find(className => className.includes('pointer-events_none'));

    expect(input).toHaveAttribute('aria-readonly', 'true');
    expect(input).toHaveClass(assertNonNull(pointerEventsClass));
  });

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

  it('keeps visually hidden labels accessible without hiding the description', () => {
    render(
      <Switch
        description="Receive account alerts."
        isLabelHidden
        isSelected={false}
        label="Notifications"
        onChange={() => {}}
      />,
    );

    const control = screen.getByRole('switch', {name: 'Notifications'});
    const description = screen.getByText('Receive account alerts.');
    const visuallyHiddenClass = css({clipPath: 'inset(50%)'});

    expect(control).toHaveAttribute('aria-describedby', description.id);
    expect(description).toBeVisible();
    expect(
      // eslint-disable-next-line testing-library/no-node-access -- the regression is specifically that no visually-hidden ancestor wraps the description.
      description.closest(`[class~="${visuallyHiddenClass}"]`),
    ).toBeNull();
  });

  it.each(['default', 'spread'] as const)(
    'does not reserve label space with %s spacing when the label is hidden',
    labelSpacing => {
      render(
        <Switch
          data-testid="notifications"
          isLabelHidden
          isSelected={false}
          label="Notifications"
          labelSpacing={labelSpacing}
          onChange={() => {}}
        />,
      );

      expect(
        screen.getByRole('switch', {name: 'Notifications'}),
      ).toBeInTheDocument();
      const control = getControl('notifications');
      /* eslint-disable testing-library/no-node-access -- the regression is the
         row's direct-child layout: only the control may remain in flex flow. */
      const row = control.parentElement;
      const field = row?.parentElement;
      const visuallyHiddenClass = css({position: 'absolute'});
      const hiddenLabel = screen
        .getByText('Notifications')
        .closest(`[class~="${visuallyHiddenClass}"]`);

      expect(hiddenLabel?.parentElement).toBe(row);
      expect(
        [...(row?.children ?? [])].filter(
          child => !child.classList.contains(visuallyHiddenClass),
        ),
      ).toEqual([control]);
      expect(field).toHaveClass(css({w: 'fit-content'}));
      expect(row).not.toHaveClass(css({w: 'full'}));
      /* eslint-enable testing-library/no-node-access */
    },
  );

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

  it('renders required and optional indicators with shared styling', () => {
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

    expect(screen.getByText('Required')).toHaveClass(
      necessityIndicatorRecipe(),
    );
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

  it.each([
    ['sm' as const, 'silver-w_8', 'silver-h_5', 12],
    ['md' as const, 'silver-w_10', 'silver-h_6', 16],
    ['lg' as const, 'silver-w_12', 'silver-h_7', 20],
  ])(
    'sizes the control and thumb travel for size %s',
    (size, widthClass, heightClass, travel) => {
      render(
        <Switch
          data-testid="sized"
          isSelected
          label="Notifications"
          onChange={() => {}}
          size={size}
        />,
      );

      const control = getControl('sized');
      expect(control).toHaveClass(widthClass);
      expect(control).toHaveClass(heightClass);
      expect(getThumb('sized')).toHaveClass(
        `silver---switch-thumb-travel_${travel}px`,
      );
    },
  );

  it('defaults to the medium size', () => {
    render(
      <Switch
        data-testid="default-size"
        isSelected={false}
        label="Notifications"
        onChange={() => {}}
      />,
    );

    const control = getControl('default-size');
    expect(control).toHaveClass('silver-w_10');
    expect(control).toHaveClass('silver-h_6');
  });

  it('inherits the ambient size', () => {
    render(
      <SizeContext value="lg">
        <Switch
          data-testid="ambient"
          isSelected={false}
          label="Notifications"
          onChange={() => {}}
        />
      </SizeContext>,
    );

    const control = getControl('ambient');
    expect(control).toHaveClass('silver-w_12');
    expect(control).toHaveClass('silver-h_7');
  });

  it('prefers an explicit size over the ambient size', () => {
    render(
      <SizeContext value="lg">
        <Switch
          data-testid="override"
          isSelected={false}
          label="Notifications"
          onChange={() => {}}
          size="sm"
        />
      </SizeContext>,
    );

    const control = getControl('override');
    expect(control).toHaveClass('silver-w_8');
    expect(control).toHaveClass('silver-h_5');
  });

  it('scales the loading spinner to the thumb', () => {
    render(
      <Switch
        data-testid="loading"
        isLoading
        isSelected
        label="Notifications"
        onChange={() => {}}
        size="sm"
      />,
    );

    expect(getThumb('loading')).toHaveClass(
      '[&_[data-switch-spinner]]:silver---spinner-size_12px',
    );
    expect(
      // eslint-disable-next-line testing-library/no-node-access -- the spinner is decorative markup inside the thumb.
      getThumb('loading').querySelector('[data-switch-spinner]'),
    ).toBeInTheDocument();
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
