import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Item} from 'components/Item/Item';
import {LinkProvider} from 'components/Link';

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

describe('Item', () => {
  it('renders label and description', () => {
    render(<Item description="Supporting text" label="Settings" />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Supporting text')).toBeInTheDocument();
  });

  it('renders startContent, endContent, leadingContent, trailingContent', () => {
    render(
      <Item
        data-testid="item"
        endContent={<span data-testid="end">T</span>}
        label="Project"
        leadingContent={<span data-testid="leading">1.</span>}
        startContent={<span data-testid="start">M</span>}
        trailingContent={<span data-testid="trailing">X</span>}
      />,
    );

    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('leading')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByTestId('trailing')).toBeInTheDocument();
  });

  it('renders leadingContent before startContent', () => {
    render(
      <Item
        data-testid="item"
        label="Project"
        leadingContent={<span>1.</span>}
        startContent={<span>M</span>}
      />,
    );

    expect(screen.getByTestId('item')).toHaveTextContent(/^1\.MProject/u);
  });

  it('renders trailingContent after the interactive content', () => {
    render(
      <Item
        data-testid="item"
        endContent={<span>E</span>}
        label="Project"
        onClick={() => {}}
        startContent={<span>S</span>}
        trailingContent={<span>T</span>}
      />,
    );

    // Trailing content sits outside and after the interactive area, whose own
    // slots render in start -> label -> end order.
    expect(screen.getByTestId('item')).toHaveTextContent(/^SProjectET$/u);
    expect(screen.getByRole('button')).toHaveTextContent(/^SProjectE$/u);
  });

  it('fires onClick from the invisible button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Item label="Clickable" onClick={onClick} />);

    const button = screen.getByRole('button', {name: 'Clickable'});
    expect(button.tagName).toBe('BUTTON');

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the invisible button when disabled', () => {
    render(<Item isDisabled label="Disabled" onClick={() => {}} />);

    expect(screen.getByRole('button', {name: 'Disabled'})).toBeDisabled();
  });

  it('marks disabled links as aria-disabled and removes them from tab order', () => {
    render(<Item href="/docs" isDisabled label="Disabled link" />);

    const link = screen.getByRole('link', {name: 'Disabled link'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('renders href items as anchors', () => {
    render(<Item href="/docs" label="Docs" />);

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('does not double-dim end content when disabled', () => {
    // Disabling dims the content wrapper via opacity, which compounds through
    // the tree. The nested end-content slots must not add their own opacity, or
    // they would render at half the intended dimming. The wrapper span should
    // therefore carry identical classes whether or not the item is disabled.
    render(
      <>
        <Item
          endContent={<span data-testid="enabled-end">T</span>}
          label="Enabled"
        />
        <Item
          endContent={<span data-testid="disabled-end">T</span>}
          isDisabled
          label="Disabled"
        />
        <Item
          endContent={<span data-testid="enabled-inline">T</span>}
          endContentPosition="inline"
          label="Enabled inline"
        />
        <Item
          endContent={<span data-testid="disabled-inline">T</span>}
          endContentPosition="inline"
          isDisabled
          label="Disabled inline"
        />
      </>,
    );

    /* eslint-disable testing-library/no-node-access -- the end-content wrapper span has no role or testid */
    expect(screen.getByTestId('disabled-end').parentElement).toHaveAttribute(
      'class',
      screen.getByTestId('enabled-end').parentElement?.getAttribute('class') ??
        '',
    );
    expect(screen.getByTestId('disabled-inline').parentElement).toHaveAttribute(
      'class',
      screen
        .getByTestId('enabled-inline')
        .parentElement?.getAttribute('class') ?? '',
    );
    /* eslint-enable testing-library/no-node-access */
  });

  it('renders a link and adds safe rel for blank targets', () => {
    render(<Item href="/docs" label="Docs" target="_blank" />);

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('passes href as to for custom link components', () => {
    render(
      <LinkProvider component={RouterLink}>
        <Item href="/settings" label="Settings" />
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'data-to',
      '/settings',
    );
  });

  it('sets selected and disabled state attributes on the root', () => {
    render(
      <Item
        data-testid="item"
        isDisabled
        isSelected
        label="Selected"
        role="option"
      />,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('item')).toHaveAttribute('aria-selected', 'true');
  });

  it('does not set aria-selected without a selectable role', () => {
    render(<Item data-testid="item" isSelected label="Selected" />);

    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-selected');
  });

  it('applies selected styling', () => {
    render(
      <>
        <Item data-testid="default" label="Default" />
        <Item data-testid="selected" isSelected label="Selected" />
      </>,
    );

    expect(screen.getByTestId('selected')).not.toHaveAttribute(
      'class',
      screen.getByTestId('default').getAttribute('class') ?? '',
    );
  });

  it('applies highlighted styling', () => {
    render(
      <>
        <Item data-testid="default" label="Default" />
        <Item data-testid="highlighted" isHighlighted label="Highlighted" />
      </>,
    );

    expect(screen.getByTestId('highlighted')).not.toHaveAttribute(
      'class',
      screen.getByTestId('default').getAttribute('class') ?? '',
    );
  });

  it('applies start alignment styling', () => {
    render(
      <>
        <Item data-testid="center" label="Center aligned" />
        <Item align="start" data-testid="start" label="Start aligned" />
      </>,
    );

    expect(screen.getByTestId('start')).not.toHaveAttribute(
      'class',
      screen.getByTestId('center').getAttribute('class') ?? '',
    );
  });

  it('passes explicit truncation line counts to text content', () => {
    render(
      <Item
        description="A long description"
        descriptionLines={3}
        label="A long label"
        labelLines={2}
      />,
    );

    expect(screen.getByText('A long label')).toHaveStyle({
      WebkitLineClamp: '2',
    });
    expect(screen.getByText('A long description')).toHaveStyle({
      WebkitLineClamp: '3',
    });
  });

  it('auto-truncates string label and description to one line', () => {
    render(<Item description="Description" label="Label" />);

    expect(screen.getByText('Label')).not.toHaveStyle({
      WebkitLineClamp: '2',
    });
    expect(screen.getByText('Description')).not.toHaveStyle({
      WebkitLineClamp: '2',
    });
    expect(screen.getByText('Label')).not.toHaveStyle({
      WebkitLineClamp: '3',
    });
  });

  it('forwards aria-current to the link element', () => {
    render(<Item aria-current="page" href="/home" label="Home" />);

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('forwards aria-current to the button element', () => {
    render(<Item aria-current="page" label="Home" onClick={() => {}} />);

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('fires onClick on link clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Item href="/home" label="Home" onClick={onClick} />);

    await user.click(screen.getByRole('link', {name: 'Home'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not double-fire when the inner interactive element is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Item label="Clickable" onClick={onClick} />);

    await user.click(screen.getByRole('button', {name: 'Clickable'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire the row action when a nested native control is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onNestedClick = vi.fn();

    render(
      <Item
        label="Row"
        onClick={onClick}
        trailingContent={
          <button onClick={onNestedClick} type="button">
            Delete
          </button>
        }
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onNestedClick).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not fire the row action when a nested custom interactive element is clicked', async () => {
    // The old implementation only matched native interactive tags, so a custom
    // control like role="button" would wrongly also trigger the row action.
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onNestedClick = vi.fn();

    render(
      <Item
        label="Row"
        onClick={onClick}
        trailingContent={
          <div
            onClick={onNestedClick}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}>
            Action
          </div>
        }
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Action'}));
    expect(onNestedClick).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fires the row action when non-interactive content is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Item label="Row" leadingContent={<span>Lead</span>} onClick={onClick} />,
    );

    await user.click(screen.getByText('Lead'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders the requested root element with the as prop', () => {
    render(
      <>
        <Item as="li" data-testid="li-item" label="List item" />
        <Item as="span" data-testid="span-item" label="Span item" />
      </>,
    );

    expect(screen.getByTestId('li-item').tagName).toBe('LI');
    expect(screen.getByTestId('span-item').tagName).toBe('SPAN');
  });

  it('applies className and style to the root element', () => {
    render(
      <Item
        className="custom-item"
        data-testid="item"
        label="Styled"
        style={{color: 'red'}}
      />,
    );

    expect(screen.getByTestId('item')).toHaveClass('custom-item');
    expect(screen.getByTestId('item')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    });
  });

  it('uses root click handling when role is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Item
        data-testid="option"
        label="Option"
        onClick={onClick}
        role="option"
      />,
    );

    expect(screen.getByRole('option', {name: 'Option'})).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Option'}),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId('option'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('uses linkComponent for link rendering', () => {
    render(
      <Item href="/settings" label="Settings" linkComponent={RouterLink} />,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'data-to',
      '/settings',
    );
  });

  it('linkComponent overrides LinkProvider', () => {
    function ProviderLink({
      children,
      ref,
      ...props
    }: ComponentPropsWithRef<'a'>): React.JSX.Element {
      return (
        <a data-provider ref={ref} {...props}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={ProviderLink}>
        <Item href="/settings" label="Settings" linkComponent={RouterLink} />
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toHaveAttribute('data-to');
    expect(link).not.toHaveAttribute('data-provider');
  });
});
