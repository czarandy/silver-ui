import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Heart, Star} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {ToggleButton} from 'components/ToggleButton/ToggleButton';
import {ToggleButtonGroup} from 'components/ToggleButton/ToggleButtonGroup';

describe('ToggleButton', () => {
  it('renders label as visible text', () => {
    render(<ToggleButton label="Bold" />);
    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
  });

  it('sets aria-pressed from isSelected', () => {
    const {rerender} = render(<ToggleButton isSelected={false} label="Bold" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<ToggleButton isSelected label="Bold" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with the next state and originating event', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButton isSelected={false} label="Bold" onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', {name: 'Bold'}));
    expect(onChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({type: 'click'}),
    );
  });

  it('lets onChange veto the toggle via the event', async () => {
    const user = userEvent.setup();

    function Vetoable() {
      const [isSelected, setIsSelected] = useState(false);
      return (
        <ToggleButton
          isSelected={isSelected}
          label="Bold"
          onChange={(next, event) => {
            // Modifier-key gating: only toggle when the shift key is held.
            if (!event.shiftKey) {
              return;
            }
            setIsSelected(next);
          }}
        />
      );
    }

    render(<Vetoable />);
    const button = screen.getByRole('button', {name: 'Bold'});

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.keyboard('{Shift>}');
    await user.click(button);
    await user.keyboard('{/Shift}');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders selectedIcon when selected', () => {
    render(
      <ToggleButton
        icon={Star}
        isIconOnly
        isSelected
        label="Favorite"
        selectedIcon={Heart}
      />,
    );

    const button = screen.getByRole('button', {name: 'Favorite'});
    // eslint-disable-next-line testing-library/no-node-access -- no testing-library query for SVG class
    expect(button.querySelector('.lucide-heart')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- no testing-library query for SVG class
    expect(button.querySelector('.lucide-star')).not.toBeInTheDocument();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleButton isDisabled label="Bold" onChange={onChange} />);

    await user.click(screen.getByRole('button', {name: 'Bold'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets aria-busy and disables the button when isLoading is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleButton isLoading label="Sync" onChange={onChange} />);

    const button = screen.getByRole('button', {name: 'Sync'});
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-label', 'Sync');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('replaces icon with spinner when icon-only and loading', () => {
    render(<ToggleButton icon={Star} isIconOnly isLoading label="Favorite" />);

    const button = screen.getByRole('button', {name: 'Favorite'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    // Icon should be replaced by spinner
    // eslint-disable-next-line testing-library/no-node-access -- verifying spinner presence in icon slot
    expect(button.querySelector('[role="status"]')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- no testing-library query for SVG class
    expect(button.querySelector('.lucide-star')).not.toBeInTheDocument();
  });

  it('renders a tooltip when tooltip prop is provided', () => {
    render(<ToggleButton label="Favorite" tooltip="Add to favorites" />);

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Add to favorites',
    );
  });

  it('sets aria-label and hides label text when isIconOnly is true', () => {
    render(<ToggleButton icon={Star} isIconOnly label="Favorite" />);

    const button = screen.getByRole('button', {name: 'Favorite'});
    expect(button).toHaveAttribute('aria-label', 'Favorite');
  });

  it('does not set aria-label when isIconOnly is false', () => {
    render(<ToggleButton label="Bold" />);

    expect(screen.getByRole('button', {name: 'Bold'})).not.toHaveAttribute(
      'aria-label',
    );
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLButtonElement | null) => void>();

    render(
      <ToggleButton
        className="custom"
        data-testid="toggle"
        label="Bold"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const button = screen.getByTestId('toggle');
    expect(button).toHaveClass('custom');
    expect(button).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});

describe('ToggleButtonGroup', () => {
  function SingleGroup() {
    const [value, setValue] = useState<string | null>('list');
    return (
      <ToggleButtonGroup label="View mode" onChange={setValue} value={value}>
        <ToggleButton isIconOnly label="List" value="list" />
        <ToggleButton isIconOnly label="Grid" value="grid" />
      </ToggleButtonGroup>
    );
  }

  function MultipleGroup() {
    const [value, setValue] = useState<string[]>(['bold']);
    return (
      <ToggleButtonGroup
        label="Formatting"
        onChange={setValue}
        type="multiple"
        value={value}>
        <ToggleButton isIconOnly label="Bold" value="bold" />
        <ToggleButton isIconOnly label="Italic" value="italic" />
      </ToggleButtonGroup>
    );
  }

  it('renders a labelled group', () => {
    render(<SingleGroup />);
    expect(screen.getByRole('group', {name: 'View mode'})).toBeInTheDocument();
  });

  it('defaults to horizontal orientation', () => {
    render(
      <ToggleButtonGroup label="View mode" onChange={() => {}} value="a">
        <ToggleButton isIconOnly label="A" value="a" />
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'View mode'})).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );
  });

  it('sets vertical orientation and applies the vertical CSS class', () => {
    render(
      <ToggleButtonGroup
        label="View mode"
        onChange={() => {}}
        orientation="vertical"
        value="a">
        <ToggleButton isIconOnly label="A" value="a" />
      </ToggleButtonGroup>,
    );

    const group = screen.getByRole('group', {name: 'View mode'});
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveClass('silver-flex-d_column');
  });

  it('supports single selection and deselection', async () => {
    const user = userEvent.setup();
    render(<SingleGroup />);

    expect(screen.getByRole('button', {name: 'List'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', {name: 'Grid'}));
    expect(screen.getByRole('button', {name: 'Grid'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', {name: 'Grid'}));
    expect(screen.getByRole('button', {name: 'Grid'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('forwards the originating event to the group onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleButtonGroup label="View mode" onChange={onChange} value="list">
        <ToggleButton isIconOnly label="List" value="list" />
        <ToggleButton isIconOnly label="Grid" value="grid" />
      </ToggleButtonGroup>,
    );

    await user.click(screen.getByRole('button', {name: 'Grid'}));
    expect(onChange).toHaveBeenCalledWith(
      'grid',
      expect.objectContaining({type: 'click'}),
    );
  });

  it('supports multiple selection', async () => {
    const user = userEvent.setup();
    render(<MultipleGroup />);

    await user.click(screen.getByRole('button', {name: 'Italic'}));
    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Italic'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('disables all buttons when isDisabled is set on the group', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleButtonGroup
        isDisabled
        label="View mode"
        onChange={onChange}
        value="list">
        <ToggleButton isIconOnly label="List" value="list" />
        <ToggleButton isIconOnly label="Grid" value="grid" />
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'View mode'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', {name: 'List'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Grid'})).toBeDisabled();

    await user.click(screen.getByRole('button', {name: 'Grid'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects isDisabled on an individual button inside an enabled group', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleButtonGroup label="View mode" onChange={onChange} value="list">
        <ToggleButton isIconOnly label="List" value="list" />
        <ToggleButton isDisabled isIconOnly label="Grid" value="grid" />
      </ToggleButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'List'})).toBeEnabled();
    expect(screen.getByRole('button', {name: 'Grid'})).toBeDisabled();

    await user.click(screen.getByRole('button', {name: 'Grid'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('throws when a button inside a group has no value', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <ToggleButtonGroup label="View mode" onChange={() => {}} value="a">
          <ToggleButton isIconOnly label="A" value="a" />
          <ToggleButton isIconOnly label="No Value" />
        </ToggleButtonGroup>,
      );
    }).toThrow('`value` prop is required');

    errorSpy.mockRestore();
  });

  it('forwards className, style, data-testid, and ref on the group', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <ToggleButtonGroup
        className="custom-group"
        data-testid="group"
        label="Test"
        onChange={() => {}}
        ref={ref}
        style={{color: 'red'}}
        value="a">
        <ToggleButton isIconOnly label="A" value="a" />
      </ToggleButtonGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveClass('custom-group');
    expect(group).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('propagates size from group to child buttons', () => {
    render(
      <ToggleButtonGroup
        label="View mode"
        onChange={() => {}}
        size="sm"
        value="a">
        <ToggleButton data-testid="btn-a" isIconOnly label="A" value="a" />
        <ToggleButton data-testid="btn-b" isIconOnly label="B" value="b" />
      </ToggleButtonGroup>,
    );

    expect(screen.getByTestId('btn-a')).toHaveClass('silver-h_component.sm');
    expect(screen.getByTestId('btn-b')).toHaveClass('silver-h_component.sm');
  });

  it('allows a child button to override the group size', () => {
    render(
      <ToggleButtonGroup
        label="View mode"
        onChange={() => {}}
        size="sm"
        value="a">
        <ToggleButton data-testid="btn-a" isIconOnly label="A" value="a" />
        <ToggleButton
          data-testid="btn-b"
          isIconOnly
          label="B"
          size="lg"
          value="b"
        />
      </ToggleButtonGroup>,
    );

    expect(screen.getByTestId('btn-a')).toHaveClass('silver-h_component.sm');
    expect(screen.getByTestId('btn-b')).toHaveClass('silver-h_component.lg');
  });
});
