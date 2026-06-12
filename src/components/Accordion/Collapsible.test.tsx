import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Collapsible} from 'components/Accordion/Collapsible';

describe('Collapsible', () => {
  it('renders trigger and children', () => {
    render(
      <Collapsible trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    expect(screen.getByRole('button', {name: /Details/})).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('starts open by default', () => {
    render(
      <Collapsible trigger="Details">
        <p>Visible content</p>
      </Collapsible>,
    );

    expect(screen.getByRole('button', {name: /Details/})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Visible content')).toBeVisible();
  });

  it('starts collapsed when isDefaultOpen is false', () => {
    render(
      <Collapsible isDefaultOpen={false} trigger="Details">
        <p>Hidden content</p>
      </Collapsible>,
    );

    expect(screen.getByRole('button', {name: /Details/})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText('Hidden content')).not.toBeVisible();
  });

  it('toggles content on click', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Content')).not.toBeVisible();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content')).toBeVisible();
  });

  it('respects controlled isOpen and onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const {rerender} = render(
      <Collapsible isOpen={true} onOpenChange={onOpenChange} trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content')).toBeVisible();

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <Collapsible isOpen={false} onOpenChange={onOpenChange} trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Content')).not.toBeVisible();
  });

  it('toggles internal state and calls onOpenChange in uncontrolled mode', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Collapsible onOpenChange={onOpenChange} trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('activates via keyboard (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    trigger.focus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('forwards ref to the root element', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <Collapsible ref={ref} trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies className and style to the root element', () => {
    render(
      <Collapsible
        className="custom-class"
        data-testid="collapsible"
        style={{color: 'red'}}
        trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const root = screen.getByTestId('collapsible');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('applies data-testid to the root element', () => {
    render(
      <Collapsible data-testid="my-collapsible" trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    expect(screen.getByTestId('my-collapsible')).toBeInTheDocument();
  });

  it('links trigger to content panel via aria-controls', () => {
    render(
      <Collapsible data-testid="collapsible" trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    const panel = screen.getByRole('region');

    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('disables the trigger when isDisabled is true', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible isDisabled trigger="Details">
        <p>Content</p>
      </Collapsible>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
