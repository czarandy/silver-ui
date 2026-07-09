import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Home} from 'lucide-react';
import type {ComponentPropsWithRef, ReactNode, Ref} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button/Button';
import {LinkProvider} from 'components/Link';

function ToBasedRouterLink({
  to,
  children,
  ref,
  ...props
}: {
  to?: string;
  href?: string;
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}): React.JSX.Element {
  return (
    <a data-router-link data-to={to} href={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

describe('Button', () => {
  it('renders label as visible text', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('defaults type to button', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button', {name: 'Click me'})).toHaveAttribute(
      'type',
      'button',
    );
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
    render(<Button icon={Home} isIconOnly label="Settings" />);

    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
    // eslint-disable-next-line testing-library/no-node-access -- verifying icon SVG presence
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders icon and label together', () => {
    render(<Button icon={Home} label="Settings" />);

    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).not.toHaveAttribute('aria-label');
    // eslint-disable-next-line testing-library/no-node-access -- verifying icon SVG presence
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('renders endContent after the label', () => {
    render(
      <Button endContent={<span data-testid="end">3</span>} label="Inbox" />,
    );

    const button = screen.getByRole('button', {name: 'Inbox'});
    expect(button).toHaveAttribute('aria-label', 'Inbox');
    expect(button).toHaveTextContent('Inbox');
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders startContent before the label', () => {
    render(
      <Button
        label="Status"
        startContent={<span data-testid="start">●</span>}
      />,
    );

    const button = screen.getByRole('button', {name: 'Status'});
    expect(button).toHaveAttribute('aria-label', 'Status');
    expect(button).toHaveTextContent('Status');
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders startContent between icon and label', () => {
    render(
      <Button
        icon={Home}
        label="Dashboard"
        startContent={<span data-testid="start">★</span>}
      />,
    );

    const button = screen.getByRole('button', {name: 'Dashboard'});
    // eslint-disable-next-line testing-library/no-node-access -- verifying icon SVG presence
    expect(button.querySelector('svg')).toBeInTheDocument();
    const startContent = screen.getByTestId('start');
    expect(startContent).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- verifying DOM order
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access -- verifying DOM order
    const iconSpan = icon?.closest('span');
    expect(iconSpan).toBeInTheDocument();
    if (iconSpan == null) {
      throw new Error('Expected icon wrapper span to exist.');
    }
    expect(iconSpan.compareDocumentPosition(startContent)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('does not render startContent for icon-only buttons', () => {
    render(
      <Button
        icon={Home}
        isIconOnly
        label="Settings"
        startContent={<span data-testid="start">●</span>}
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying icon SVG presence
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByTestId('start')).not.toBeInTheDocument();
  });

  it('does not render endContent for icon-only buttons', () => {
    render(
      <Button
        endContent={<span data-testid="end">3</span>}
        icon={Home}
        isIconOnly
        label="Settings"
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying icon SVG presence
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByTestId('end')).not.toBeInTheDocument();
  });

  it('shows loading state and suppresses clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button isLoading label="Submit" onClick={onClick} />);

    const button = screen.getByRole('button', {name: 'Submit'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Submit');
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveTextContent('Loading');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders loading spinner after endContent', () => {
    render(
      <Button
        endContent={<span data-testid="end-content">End</span>}
        isLoading
        label="Submit"
      />,
    );

    const endContent = screen.getByTestId('end-content');
    const spinner = screen.getByRole('status', {hidden: true, name: 'Loading'});
    expect(endContent.compareDocumentPosition(spinner)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('replaces icon with spinner when icon-only and loading', () => {
    render(<Button icon={Home} isIconOnly isLoading label="Refresh" />);

    const button = screen.getByRole('button', {name: 'Refresh'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    // Icon should be replaced by spinner
    // eslint-disable-next-line testing-library/no-node-access -- verifying spinner presence in icon slot
    expect(button.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('falls back to a button when loading with href', () => {
    render(<Button href="/docs" isLoading label="Docs" />);

    expect(screen.getByRole('button', {name: 'Docs'})).toBeDisabled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button label="Test" onClick={onClick} />);

    await user.click(screen.getByRole('button', {name: 'Test'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards ref', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(<Button label="Test" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('applies custom className and style', () => {
    render(
      <Button className="custom-class" label="Test" style={{color: 'red'}} />,
    );

    const button = screen.getByRole('button', {name: 'Test'});
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('renders size variants', () => {
    const {rerender} = render(<Button label="Small" size="sm" />);
    expect(screen.getByRole('button', {name: 'Small'})).toHaveClass(
      'silver-h_component.sm',
      'silver-fs_component.sm',
    );

    rerender(<Button label="Medium" size="md" />);
    expect(screen.getByRole('button', {name: 'Medium'})).toHaveClass(
      'silver-h_component.md',
      'silver-fs_component.md',
    );

    rerender(<Button label="Large" size="lg" />);
    expect(screen.getByRole('button', {name: 'Large'})).toHaveClass(
      'silver-h_component.lg',
      'silver-fs_component.lg',
    );
  });

  it('can be disabled', () => {
    render(<Button isDisabled label="Test" />);
    expect(screen.getByRole('button', {name: 'Test'})).toBeDisabled();
  });

  it('uses aria-disabled when tooltip is present on a disabled button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();

    render(
      <Button
        isDisabled
        label="Test"
        onClick={onClick}
        onKeyDown={onKeyDown}
        tooltip="Reason disabled"
      />,
    );

    const button = screen.getByRole('button', {name: 'Test'});
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass(
      '[&[aria-disabled="true"]]:silver-pointer-events_auto',
    );
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Reason disabled',
    );

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();

    button.focus();
    await user.keyboard('{Enter}');
    expect(onKeyDown).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it('defaults the tooltip to the label for icon-only buttons', () => {
    render(<Button icon={Home} isIconOnly label="Settings" />);

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Settings',
    );
  });

  it('lets an explicit tooltip override the icon-only default', () => {
    render(
      <Button
        icon={Home}
        isIconOnly
        label="Settings"
        tooltip="Open settings"
      />,
    );

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Open settings',
    );
  });

  it('does not add a default tooltip when the label is visible', () => {
    render(<Button icon={Home} label="Settings" />);

    expect(
      screen.queryByRole('tooltip', {hidden: true}),
    ).not.toBeInTheDocument();
  });

  it('defaults type to button and passes form attributes', () => {
    render(
      <Button
        data-testid="my-button"
        form="form-id"
        label="Submit"
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

  it('renders as a link when href is provided', () => {
    render(<Button href="/docs" label="Docs" />);

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'href',
      '/docs',
    );
  });

  it('forwards target and rel when rendered as a link', () => {
    render(
      <Button
        href="https://example.com"
        label="Docs"
        rel="noreferrer"
        target="_blank"
      />,
    );

    const link = screen.getByRole('link', {name: 'Docs (opens in new tab)'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('adds safe rel defaults for target blank link buttons', () => {
    render(<Button href="https://example.com" label="Docs" target="_blank" />);

    const link = screen.getByRole('link', {name: 'Docs (opens in new tab)'});
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles click events when rendered as a link', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button href="/docs" label="Docs" onClick={onClick} />);

    await user.click(screen.getByRole('link', {name: 'Docs'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('handles keyboard events when rendered as a link', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(<Button href="/docs" label="Docs" onKeyDown={onKeyDown} />);

    screen.getByRole('link', {name: 'Docs'}).focus();
    await user.keyboard('{Escape}');
    expect(onKeyDown).toHaveBeenCalledOnce();
  });

  it('as prop overrides LinkProvider for link buttons', () => {
    function ProviderLink({
      children,
      ref,
      ...props
    }: ComponentPropsWithRef<'a'>): React.JSX.Element {
      return (
        <a data-provider-link ref={ref} {...props}>
          {children}
        </a>
      );
    }

    function DirectLink({
      children,
      ref,
      ...props
    }: ComponentPropsWithRef<'a'>): React.JSX.Element {
      return (
        <a data-direct-link ref={ref} {...props}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={ProviderLink}>
        <Button as={DirectLink} href="/docs" label="Docs" />
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveAttribute('data-direct-link');
    expect(link).not.toHaveAttribute('data-provider-link');
  });

  it('passes href and to to custom link components', () => {
    render(<Button as={ToBasedRouterLink} href="/docs" label="Docs" />);

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-to', '/docs');
  });

  it('uses LinkProvider component for link buttons', () => {
    function CustomLink({
      children,
      ref,
      ...props
    }: ComponentPropsWithRef<'a'>): React.JSX.Element {
      return (
        <a data-custom-link ref={ref} {...props}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={CustomLink}>
        <Button href="/docs" label="Docs" />
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('falls back to button when link button is disabled', () => {
    render(<Button href="/docs" isDisabled label="Docs" />);

    expect(screen.getByRole('button', {name: 'Docs'})).toBeDisabled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('passes through ARIA trigger attributes', () => {
    render(
      <Button
        aria-controls="menu-1"
        aria-expanded={true}
        aria-haspopup="menu"
        label="Open menu"
      />,
    );

    const button = screen.getByRole('button', {name: 'Open menu'});
    expect(button).toHaveAttribute('aria-controls', 'menu-1');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('passes through aria-pressed for toggle buttons', () => {
    render(<Button aria-pressed={true} label="Bold" />);

    const button = screen.getByRole('button', {name: 'Bold'});
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('passes through aria-describedby and aria-labelledby', () => {
    render(
      <Button
        aria-describedby="help-text"
        aria-labelledby="ext-label"
        label="Action"
      />,
    );

    const button = screen.getByRole('button', {name: 'Action'});
    expect(button).toHaveAttribute('aria-describedby', 'help-text');
    expect(button).toHaveAttribute('aria-labelledby', 'ext-label');
  });

  it('passes ARIA attributes through to link buttons', () => {
    render(
      <Button
        aria-describedby="help-text"
        aria-expanded={false}
        href="/settings"
        label="Settings"
      />,
    );

    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toHaveAttribute('aria-describedby', 'help-text');
    expect(link).toHaveAttribute('aria-expanded', 'false');
  });
});
