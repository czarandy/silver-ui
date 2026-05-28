import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('sets aria-pressed from isPressed', () => {
    const {rerender} = render(<ToggleButton isPressed={false} label="Bold" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<ToggleButton isPressed label="Bold" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onPressedChange with the next state', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <ToggleButton
        isPressed={false}
        label="Bold"
        onPressedChange={onPressedChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Bold'}));
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('renders pressedIcon when pressed', () => {
    render(
      <ToggleButton
        icon={<span data-testid="outline-icon">Outline</span>}
        isIconOnly
        isPressed
        label="Favorite"
        pressedIcon={<span data-testid="filled-icon">Filled</span>}
      />,
    );

    expect(screen.getByTestId('filled-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('outline-icon')).not.toBeInTheDocument();
  });

  it('does not call onPressedChange when disabled', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <ToggleButton
        isDisabled
        label="Bold"
        onPressedChange={onPressedChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Bold'}));
    expect(onPressedChange).not.toHaveBeenCalled();
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
});
