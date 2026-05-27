import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {MouseEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Button} from './Button';

describe('Button', () => {
  it('renders label as visible text', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders variants', () => {
    const {rerender} = render(<Button label="Primary" variant="primary" />);
    expect(screen.getByRole('button', {name: 'Primary'})).toBeInTheDocument();

    rerender(<Button label="Secondary" variant="secondary" />);
    expect(screen.getByRole('button', {name: 'Secondary'})).toBeInTheDocument();

    rerender(<Button label="Ghost" variant="ghost" />);
    expect(screen.getByRole('button', {name: 'Ghost'})).toBeInTheDocument();

    rerender(<Button label="Destructive" variant="destructive" />);
    expect(
      screen.getByRole('button', {name: 'Destructive'}),
    ).toBeInTheDocument();
  });

  it('renders icon-only button with aria-label', () => {
    render(
      <Button
        label="Settings"
        icon={<span data-testid="icon">Icon</span>}
        isIconOnly
      />,
    );

    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon and label together', () => {
    render(<Button label="Settings" icon={<span data-testid="icon" />} />);

    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).not.toHaveAttribute('aria-label');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders endContent after the label', () => {
    render(
      <Button label="Inbox" endContent={<span data-testid="end">3</span>} />,
    );

    const button = screen.getByRole('button', {name: 'Inbox'});
    expect(button).toHaveTextContent('Inbox');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('does not render endContent for icon-only buttons', () => {
    render(
      <Button
        label="Settings"
        icon={<span data-testid="icon" />}
        endContent={<span data-testid="end">3</span>}
        isIconOnly
      />,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('end')).not.toBeInTheDocument();
  });

  it('shows loading state and suppresses clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label="Submit" isLoading onClick={onClick} />);

    const button = screen.getByRole('button', {name: 'Submit'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label="Test" onClick={onClick} />);

    await user.click(screen.getByRole('button', {name: 'Test'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('fires onClick before clickAction', async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    const onClick = vi.fn(() => {
      order.push('onClick');
    });
    const clickAction = vi.fn(() => {
      order.push('clickAction');
    });

    render(<Button label="Test" onClick={onClick} clickAction={clickAction} />);

    await user.click(screen.getByRole('button', {name: 'Test'}));
    expect(order).toEqual(['onClick', 'clickAction']);
  });

  it('does not call clickAction when onClick prevents default', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => {
      event.preventDefault();
    });
    const clickAction = vi.fn();

    render(<Button label="Test" onClick={onClick} clickAction={clickAction} />);

    await user.click(screen.getByRole('button', {name: 'Test'}));
    expect(clickAction).not.toHaveBeenCalled();
  });

  it('forwards ref', () => {
    const ref = vi.fn<(el: HTMLButtonElement | null) => void>();
    render(<Button label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('applies custom className and style', () => {
    render(
      <Button label="Test" className="custom-class" style={{color: 'red'}} />,
    );

    const button = screen.getByRole('button', {name: 'Test'});
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('can be disabled', () => {
    render(<Button label="Test" isDisabled />);
    expect(screen.getByRole('button', {name: 'Test'})).toBeDisabled();
  });

  it('uses aria-disabled when tooltip is present on a disabled button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();

    render(
      <Button
        label="Test"
        tooltip="Reason disabled"
        isDisabled
        onClick={onClick}
        onKeyDown={onKeyDown}
      />,
    );

    const button = screen.getByRole('button', {name: 'Test'});
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('title', 'Reason disabled');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();

    button.focus();
    await user.keyboard('{Enter}');
    expect(onKeyDown).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it('defaults type to button and passes form attributes', () => {
    render(
      <Button
        label="Submit"
        data-testid="my-button"
        form="form-id"
        name="intent"
        type="submit"
        value="save"
      />,
    );

    const button = screen.getByTestId('my-button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'form-id');
    expect(button).toHaveAttribute('name', 'intent');
    expect(button).toHaveValue('save');
  });
});
