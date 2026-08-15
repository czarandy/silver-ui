import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CheckboxCard} from 'components/Card/CheckboxCard';
import {RadioCard} from 'components/Card/RadioCard';
import {CheckboxGroup} from 'components/CheckboxGroup';
import {RadioGroup} from 'components/RadioGroup';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CheckboxCard', () => {
  it('selects from the card surface and submits through CheckboxGroup', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState<string[]>([]);
      return (
        <form data-testid="form">
          <CheckboxGroup
            htmlName="imports"
            label="Items to import"
            onChange={setValue}
            value={value}>
            <CheckboxCard
              color="blue"
              data-testid="documents-card"
              label="Documents"
              padding={4}
              value="documents">
              <span>Document files</span>
            </CheckboxCard>
          </CheckboxGroup>
        </form>
      );
    }

    render(<Example />);
    await user.click(screen.getByText('Document files'));

    expect(screen.getByRole('checkbox', {name: 'Documents'})).toBeChecked();
    expect(screen.getByTestId('documents-card')).toHaveClass(
      'silver-bg_surface.blue',
      'silver-bd-c_primary',
      'silver-p_4',
    );
    expect(screen.getByTestId('documents-card')).not.toHaveClass(
      'silver-bdr_inherit',
    );
    expect(
      Array.from(new FormData(screen.getByTestId('form')).entries()),
    ).toEqual([['imports', 'documents']]);
  });

  it('supports native keyboard activation on the clipped checkbox', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState<string[]>([]);
      return (
        <CheckboxGroup label="Items" onChange={setValue} value={value}>
          <CheckboxCard label="Documents" value="documents">
            Documents
          </CheckboxCard>
        </CheckboxGroup>
      );
    }

    render(<Example />);
    const checkbox = screen.getByRole('checkbox', {name: 'Documents'});
    checkbox.focus();
    await user.keyboard(' ');
    expect(checkbox).toBeChecked();
  });

  it('notifies CheckboxGroup exactly once for one surface click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CheckboxGroup label="Items" onChange={onChange} value={[]}>
        <CheckboxCard label="Documents" value="documents">
          Document files
        </CheckboxCard>
      </CheckboxGroup>,
    );

    await user.click(screen.getByText('Document files'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(['documents']);
  });

  it('keeps nested controls and their labels independent', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onButtonClick = vi.fn();

    render(
      <CheckboxGroup label="Items" onChange={onChange} value={[]}>
        <CheckboxCard label="Documents" value="documents">
          <button onClick={onButtonClick} type="button">
            Preview
          </button>
          <label htmlFor="nested-option">Include metadata</label>
          <input id="nested-option" type="checkbox" />
        </CheckboxCard>
      </CheckboxGroup>,
    );

    await user.click(screen.getByRole('button', {name: 'Preview'}));
    await user.click(screen.getByText('Include metadata'));
    expect(onButtonClick).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('checkbox', {name: 'Include metadata'}),
    ).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not select while card text is selected', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup label="Items" onChange={onChange} value={[]}>
        <CheckboxCard label="Documents" value="documents">
          <span data-testid="selected-text">Selectable description</span>
        </CheckboxCard>
      </CheckboxGroup>,
    );
    const selectedText = screen.getByTestId('selected-text');
    vi.spyOn(window, 'getSelection').mockReturnValue({
      anchorNode: selectedText,
      focusNode: selectedText,
      isCollapsed: false,
      toString: () => 'Selectable description',
    } as unknown as Selection);

    fireEvent.click(selectedText);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('honors item disabled state without blocking nested controls', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onNestedClick = vi.fn();
    render(
      <CheckboxGroup label="Items" onChange={onChange} value={[]}>
        <CheckboxCard
          data-testid="disabled-card"
          isDisabled
          label="Documents"
          value="documents">
          <span>Documents</span>
          <button onClick={onNestedClick} type="button">
            Details
          </button>
        </CheckboxCard>
      </CheckboxGroup>,
    );

    expect(screen.getByRole('checkbox', {name: 'Documents'})).toBeDisabled();
    expect(screen.getByTestId('disabled-card')).toHaveAttribute(
      'data-clickable-disabled',
      'true',
    );
    await user.click(screen.getByText('Documents'));
    await user.click(screen.getByRole('button', {name: 'Details'}));
    expect(onChange).not.toHaveBeenCalled();
    expect(onNestedClick).toHaveBeenCalledOnce();
  });

  it('inherits disabled state from CheckboxGroup', () => {
    render(
      <CheckboxGroup isDisabled label="Items" onChange={() => {}} value={[]}>
        <CheckboxCard label="Documents" value="documents">
          Documents
        </CheckboxCard>
      </CheckboxGroup>,
    );

    expect(screen.getByRole('checkbox', {name: 'Documents'})).toBeDisabled();
  });

  it('forwards root customization and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();
    render(
      <CheckboxGroup label="Items" onChange={() => {}} value={[]}>
        <CheckboxCard
          className="custom-card"
          data-testid="card"
          label="Documents"
          ref={ref}
          style={{width: 360}}
          value="documents">
          Documents
        </CheckboxCard>
      </CheckboxGroup>,
    );

    const root = screen.getByTestId('card');
    expect(root).toHaveClass('custom-card');
    expect(root).toHaveStyle({width: '360px'});
    expect(ref).toHaveBeenCalledWith(root);
    expect(screen.getByRole('checkbox', {name: 'Documents'})).toHaveClass(
      'silver-pos_absolute',
      'silver-ov_hidden',
    );
  });

  it('throws outside CheckboxGroup', () => {
    expect(() =>
      render(
        <CheckboxCard label="Documents" value="documents">
          Documents
        </CheckboxCard>,
      ),
    ).toThrow('CheckboxCard must be used within a CheckboxGroup');
  });
});

describe('RadioCard', () => {
  it('selects from the card surface and submits through RadioGroup', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState('free');
      return (
        <form data-testid="form">
          <RadioGroup
            htmlName="plan"
            label="Plan"
            onChange={setValue}
            value={value}>
            <RadioCard label="Free" value="free">
              Free plan
            </RadioCard>
            <RadioCard data-testid="pro-card" label="Pro" value="pro">
              Pro plan
            </RadioCard>
          </RadioGroup>
        </form>
      );
    }

    render(<Example />);
    await user.click(screen.getByText('Pro plan'));

    expect(screen.getByRole('radio', {name: 'Free'})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: 'Pro'})).toBeChecked();
    expect(screen.getByTestId('pro-card')).toHaveClass('silver-bd-c_primary');
    expect(
      Array.from(new FormData(screen.getByTestId('form')).entries()),
    ).toEqual([['plan', 'pro']]);
  });

  it('preserves native arrow-key navigation', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState('free');
      return (
        <RadioGroup label="Plan" onChange={setValue} value={value}>
          <RadioCard label="Free" value="free">
            Free
          </RadioCard>
          <RadioCard label="Pro" value="pro">
            Pro
          </RadioCard>
        </RadioGroup>
      );
    }

    render(<Example />);
    screen.getByRole('radio', {name: 'Free'}).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', {name: 'Pro'})).toBeChecked();
  });

  it('inherits required, disabled, and read-only group semantics', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const {rerender} = render(
      <RadioGroup
        isReadOnly
        isRequired
        label="Plan"
        onChange={onChange}
        value="free">
        <RadioCard label="Free" value="free">
          Free plan
        </RadioCard>
        <RadioCard label="Pro" value="pro">
          Pro plan
        </RadioCard>
      </RadioGroup>,
    );

    const pro = screen.getByRole('radio', {name: 'Pro'});
    expect(pro).toBeEnabled();
    expect(pro).toBeRequired();
    await user.click(screen.getByText('Pro plan'));
    pro.focus();
    await user.keyboard(' ');
    expect(onChange).not.toHaveBeenCalled();
    expect(pro).not.toBeChecked();

    rerender(
      <RadioGroup isDisabled label="Plan" onChange={onChange} value="free">
        <RadioCard label="Free" value="free">
          Free plan
        </RadioCard>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', {name: 'Free'})).toBeDisabled();
  });

  it('throws outside RadioGroup', () => {
    expect(() =>
      render(
        <RadioCard label="Free" value="free">
          Free
        </RadioCard>,
      ),
    ).toThrow('RadioCard must be used within a RadioGroup');
  });
});
