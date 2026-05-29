import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Heart, Star} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {ToggleButton} from './ToggleButton';
import {ToggleButtonGroup} from './ToggleButtonGroup';

describe('ToggleButton', () => {
  it('renders label as visible text', () => {
    render(<ToggleButton label="Bold" />);
    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
  });

  it('renders children instead of label when provided', () => {
    render(<ToggleButton label="Toggle bold">Custom content</ToggleButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Custom content');
  });

  it('sets aria-pressed from isSelected', () => {
    const {rerender} = render(<ToggleButton isSelected={false} label="Bold" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<ToggleButton isSelected label="Bold" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with the next state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButton isSelected={false} label="Bold" onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', {name: 'Bold'}));
    expect(onChange).toHaveBeenCalledWith(true);
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
    render(
      <ToggleButton
        data-testid="sync"
        isLoading
        label="Sync"
        onChange={onChange}
      />,
    );

    const button = screen.getByTestId('sync');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onChange).not.toHaveBeenCalled();
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
});
