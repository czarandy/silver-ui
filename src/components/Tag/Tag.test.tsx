import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Star} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Tag} from 'components/Tag/Tag';
import {tagRecipe} from 'components/Tag/Tag.recipe';
import {assertNonNull} from 'internal/testHelpers';

describe('Tag', () => {
  it('renders a label', () => {
    render(<Tag label="Urgent" />);

    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders as a button when onClick is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Tag label="Filter" onClick={onClick} />);

    const button = screen.getByRole('button', {name: 'Filter'});
    expect(button.tagName).toBe('BUTTON');

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as a button with a remove button when both onClick and onRemove are provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(<Tag label="Tag" onClick={onClick} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', {name: 'Tag'}));
    expect(onClick).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', {name: 'Remove Tag'}));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not trigger onClick when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(<Tag label="Tag" onClick={onClick} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', {name: 'Remove Tag'}));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onRemove from the remove button', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<Tag label="Urgent" onRemove={onRemove} />);

    await user.click(screen.getByRole('button', {name: 'Remove Urgent'}));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('renders as a link when href is provided', () => {
    render(<Tag href="/filters/open" label="Open" />);

    const link = screen.getByRole('link', {name: 'Open'});
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/filters/open');
  });

  it('disables button interactions when isDisabled is true', () => {
    const onClick = vi.fn();

    render(<Tag isDisabled label="Disabled" onClick={onClick} />);

    expect(screen.getByRole('button', {name: 'Disabled'})).toBeDisabled();
  });

  it('disables the remove button when isDisabled is true', () => {
    render(<Tag isDisabled label="Tag" onRemove={vi.fn()} />);

    expect(screen.getByRole('button', {name: 'Remove Tag'})).toBeDisabled();
  });

  it('applies the specified size class', () => {
    const {rerender} = render(
      <Tag data-testid="tag" label="Small" size="sm" />,
    );

    expect(screen.getByTestId('tag')).toHaveClass('silver-min-h_6');

    rerender(<Tag data-testid="tag" label="Large" size="lg" />);

    expect(screen.getByTestId('tag')).toHaveClass('silver-min-h_10');
  });

  it('applies the specified color class', () => {
    render(<Tag color="blue" data-testid="tag" label="Blue" />);

    expect(screen.getByTestId('tag')).toBeInTheDocument();
  });

  it('visually hides the label when isLabelHidden is true', () => {
    render(<Tag data-testid="tag" isLabelHidden label="Hidden" />);

    const tag = screen.getByTestId('tag');
    expect(tag).toHaveTextContent('Hidden');
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('applies aria-description when description is provided', () => {
    render(
      <Tag data-testid="tag" description="High priority item" label="Urgent" />,
    );

    expect(screen.getByTestId('tag')).toHaveAttribute(
      'aria-description',
      'High priority item',
    );
  });

  it('renders an icon alongside the label', () => {
    render(<Tag data-testid="tag" icon={Star} label="Starred" />);

    // eslint-disable-next-line testing-library/no-node-access -- verifying decorative svg presence
    expect(screen.getByTestId('tag').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Starred')).toBeInTheDocument();
  });

  it('renders endContent after the label', () => {
    render(
      <Tag endContent={<span data-testid="end">Extra</span>} label="Tag" />,
    );

    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders startContent before the label', () => {
    render(
      <Tag
        label="Tag"
        startContent={<span data-testid="start">Before</span>}
      />,
    );

    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(<Tag label="Tag" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('forwards ref to a button when onClick is provided', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(<Tag label="Tag" onClick={vi.fn()} ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('applies className, style, and data-testid', () => {
    render(
      <Tag
        className="custom-tag"
        data-testid="tag"
        label="Tag"
        style={{color: 'red'}}
      />,
    );

    const tag = screen.getByTestId('tag');
    expect(tag).toHaveClass('custom-tag');
    expect(tag).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('renders a tooltip when tooltip prop is provided', () => {
    render(<Tag data-testid="tag" label="Design" tooltip="Design category" />);

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Design category',
    );
  });

  it('applies the specified color recipe class', () => {
    render(<Tag color="blue" data-testid="tag" label="Blue" />);

    const classes = tagRecipe({color: 'blue'});
    expect(screen.getByTestId('tag')).toHaveClass(assertNonNull(classes.root));
  });

  it('activates a clickable tag via keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Tag label="Keyboard" onClick={onClick} />);

    const button = screen.getByRole('button', {name: 'Keyboard'});
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders a link and remove button as siblings when href and onRemove are provided', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<Tag href="/filters" label="Filter" onRemove={onRemove} />);

    expect(screen.getByRole('link', {name: 'Filter'})).toHaveAttribute(
      'href',
      '/filters',
    );
    await user.click(screen.getByRole('button', {name: 'Remove Filter'}));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not trigger onClick when remove is clicked on an href + onClick + onRemove tag', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(
      <Tag
        href="/filters"
        label="Filter"
        onClick={onClick}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Remove Filter'}));
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('wraps onClick + onRemove in a labelled group', () => {
    render(
      <Tag
        data-testid="tag"
        label="Filter"
        onClick={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const group = screen.getByRole('group', {name: 'Filter'});
    expect(group).toBe(screen.getByTestId('tag'));
  });

  it('wraps href + onRemove in a labelled group', () => {
    render(
      <Tag
        data-testid="tag"
        href="/filters"
        label="Filter"
        onRemove={vi.fn()}
      />,
    );

    const group = screen.getByRole('group', {name: 'Filter'});
    expect(group).toBe(screen.getByTestId('tag'));
  });

  it('retains color background when rendered as a clickable button', () => {
    render(
      <Tag
        color="blue"
        data-testid="tag"
        label="Clickable"
        onClick={vi.fn()}
      />,
    );

    const tag = screen.getByTestId('tag');
    const classes = tagRecipe({color: 'blue', isRootInteractive: true});
    expect(tag).toHaveClass(assertNonNull(classes.root));
    // The blue color's background must not be overridden by isRootInteractive.
    expect(tag).toHaveClass('silver-bg_surface.blue');
  });

  it('triggers onClick when endContent is clicked in onClick + onRemove mode', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Tag
        endContent={<span data-testid="end">Extra</span>}
        label="Tag"
        onClick={onClick}
        onRemove={vi.fn()}
      />,
    );

    await user.click(screen.getByTestId('end'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
