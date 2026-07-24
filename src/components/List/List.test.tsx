import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {List} from 'components/List/List';
import {listItemRecipe, listRecipe} from 'components/List/List.recipe';
import {ListItem} from 'components/List/ListItem';
import {assertNonNull} from 'internal/testHelpers';

const classesOf = (className: string | undefined): string[] =>
  assertNonNull(className).split(' ');

describe('List', () => {
  it('renders a semantic list with list items', () => {
    render(
      <List>
        <ListItem label="Item 1" />
        <ListItem label="Item 2" />
      </List>,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('associates the header with the list via aria-labelledby', () => {
    render(
      <List header="Team members">
        <ListItem label="Ada" />
      </List>,
    );

    const heading = screen.getByText('Team members');
    const list = screen.getByRole('list', {name: 'Team members'});
    expect(list).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('renders ordered lists with a start value', () => {
    render(
      <List listStyle="decimal" start={3}>
        <ListItem label="Third" />
      </List>,
    );

    expect(screen.getByRole('list')).toHaveAttribute('start', '3');
  });

  it('passes state and slots through list items', () => {
    render(
      <List hasDividers>
        <ListItem
          data-testid="item"
          description="Supporting text"
          endContent={<span data-testid="end">E</span>}
          isSelected
          label="Settings"
          startContent={<span data-testid="start">S</span>}
        />
      </List>,
    );

    expect(screen.getByTestId('item')).toHaveClass('silver-bg_bg.hover');
    expect(screen.getByTestId('item')).not.toHaveClass('silver-bg_bg.selected');
    expect(screen.getByText('Supporting text')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports clickable list items', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <List>
        <ListItem label="Clickable" onClick={onClick} />
      </List>,
    );

    const button = screen.getByRole('button', {name: 'Clickable'});
    expect(button.tagName).toBe('BUTTON');

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports link list items', () => {
    render(
      <List>
        <ListItem href="/docs" label="Docs" />
      </List>,
    );

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('renders with default none list style', () => {
    render(
      <List data-testid="list">
        <ListItem label="Item" />
      </List>,
    );

    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  it('tightens item padding for marker lists but not plain lists', () => {
    const markerClasses = classesOf(listRecipe({hasMarkers: true}).list);
    const plainClasses = classesOf(listRecipe({hasMarkers: false}).list);
    const markerOnly = markerClasses.filter(
      className => !plainClasses.includes(className),
    );
    expect(markerOnly.length).toBeGreaterThan(0);

    const {rerender} = render(
      <List data-testid="list" listStyle="disc">
        <ListItem label="Item" />
      </List>,
    );
    expect(screen.getByTestId('list')).toHaveClass(...markerClasses);

    rerender(
      <List data-testid="list">
        <ListItem label="Item" />
      </List>,
    );
    for (const className of markerOnly) {
      expect(screen.getByTestId('list')).not.toHaveClass(className);
    }
  });

  it('sizes the disc marker container off the label typography', () => {
    render(
      <List listStyle="disc">
        <ListItem data-testid="item" label="Item" />
      </List>,
    );

    const item = screen.getByTestId('item');
    // eslint-disable-next-line testing-library/no-node-access -- the marker is presentational, so there is no query for it
    const markerContainer = assertNonNull(item.querySelector('span'));
    expect(markerContainer).toHaveClass(
      ...classesOf(listItemRecipe().markerContainer),
    );
    // The container must carry the label typography and baseline-align, not
    // derive its geometry from the ambient font: inside an Alert description
    // the inherited size is `sm` while the label renders `md`, which used to
    // push the dot off the first line. Baseline anchoring also keeps the dot
    // seated where the platform font draws its own bullets.
    expect(markerContainer).toHaveClass('silver-fs_md', 'silver-as_baseline');
  });

  it('renders circle markers', () => {
    render(
      <List data-testid="list" listStyle="circle">
        <ListItem label="Item" />
      </List>,
    );

    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  it('renders disabled list items', () => {
    render(
      <List>
        <ListItem isDisabled label="Disabled item" onClick={() => {}} />
      </List>,
    );

    expect(screen.getByRole('button', {name: 'Disabled item'})).toBeDisabled();
  });

  it('prevents clicks on disabled items', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <List>
        <ListItem isDisabled label="Disabled" onClick={onClick} />
      </List>,
    );

    await user.click(screen.getByRole('button', {name: 'Disabled'}));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards data-testid to the list element', () => {
    render(
      <List data-testid="my-list">
        <ListItem label="Item" />
      </List>,
    );

    expect(screen.getByTestId('my-list')).toBeInTheDocument();
  });

  it('forwards className, style, and ref on List', () => {
    const ref =
      vi.fn<(el: HTMLUListElement | HTMLOListElement | null) => void>();

    render(
      <List
        className="custom-list"
        data-testid="list"
        ref={ref}
        style={{maxWidth: 400}}>
        <ListItem label="Item" />
      </List>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('custom-list');
    expect(list).toHaveStyle({maxWidth: '400px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards className, style, and ref on ListItem', () => {
    const ref = vi.fn<(el: HTMLLIElement | null) => void>();

    render(
      <List>
        <ListItem
          className="custom-item"
          data-testid="item"
          label="Item"
          ref={ref}
          style={{color: 'red'}}
        />
      </List>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('custom-item');
    expect(item).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLLIElement));
  });

  it('renders link items with target and rel', () => {
    render(
      <List>
        <ListItem
          href="https://example.com"
          label="External"
          rel="noopener noreferrer"
          target="_blank"
        />
      </List>,
    );

    const link = screen.getByRole('link', {name: 'External'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders ListItem outside of List context with defaults', () => {
    render(<ListItem data-testid="standalone" label="Standalone" />);

    expect(screen.getByTestId('standalone')).toBeInTheDocument();
    expect(screen.getByText('Standalone')).toBeInTheDocument();
  });
});
