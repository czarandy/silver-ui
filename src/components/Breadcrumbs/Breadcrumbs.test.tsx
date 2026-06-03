import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Home, type LucideProps} from 'lucide-react';
import type {ReactNode, Ref} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {LinkProvider} from '../Link';
import {BreadcrumbItem} from './BreadcrumbItem';
import {Breadcrumbs} from './Breadcrumbs';

function CustomLink({
  children,
  ref,
  ...props
}: {
  children?: ReactNode;
  href?: string;
  ref?: Ref<HTMLAnchorElement>;
  to?: string;
}): React.JSX.Element {
  return (
    <a data-custom-link href={props.href ?? props.to} ref={ref}>
      {children}
    </a>
  );
}

function HomeIcon(props: LucideProps): React.JSX.Element {
  return <Home {...props} data-testid="home-icon" />;
}

describe('Breadcrumbs', () => {
  it('renders a labelled navigation landmark with an ordered list', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'Breadcrumb',
    );
    expect(screen.getByRole('list').tagName).toBe('OL');
  });

  it('renders links, buttons, current items, and separators', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Breadcrumbs separator=">">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem onClick={onClick}>Projects</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'href',
      '/',
    );
    await user.click(screen.getByRole('button', {name: 'Projects'}));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByText('>')).toHaveLength(3);
  });

  it('marks an item as current when isCurrent is set', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Last Item</BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByText('Last Item')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('uses custom link components from props or provider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem as={CustomLink} href="/projects">
            Projects
          </BreadcrumbItem>
          <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
        </Breadcrumbs>
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'data-custom-link',
    );
    expect(screen.getByRole('link', {name: 'Projects'})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('applies className, style, data-testid, and ref to the nav', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(
      <Breadcrumbs
        className="custom-breadcrumbs"
        data-testid="breadcrumbs"
        ref={ref}
        style={{color: 'red'}}>
        <BreadcrumbItem>Only item</BreadcrumbItem>
      </Breadcrumbs>,
    );

    const nav = screen.getByTestId('breadcrumbs');
    expect(nav).toHaveClass('custom-breadcrumbs');
    expect(nav).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('applies a custom label to the navigation landmark', () => {
    render(
      <Breadcrumbs label="File path">
        <BreadcrumbItem href="/">Root</BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'File path',
    );
  });

  it('renders items with the supporting variant', () => {
    render(
      <Breadcrumbs data-testid="nav" variant="supporting">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Page</BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
    expect(screen.getByText('Page')).toHaveAttribute('aria-current', 'page');
  });

  it('renders a startIcon on a breadcrumb item', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem data-testid="item" href="/" startIcon={HomeIcon}>
          Home
        </BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('renders onClick items as buttons with type="button"', () => {
    const onClick = vi.fn();

    render(
      <Breadcrumbs>
        <BreadcrumbItem onClick={onClick}>Projects</BreadcrumbItem>
      </Breadcrumbs>,
    );

    const button = screen.getByRole('button', {name: 'Projects'});
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards ref on BreadcrumbItem', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/" ref={ref}>
          Home
        </BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('applies className and style to BreadcrumbItem', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem
          className="custom-item"
          data-testid="item"
          href="/"
          style={{color: 'blue'}}>
          Home
        </BreadcrumbItem>
      </Breadcrumbs>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('custom-item');
    expect(item).toHaveStyle({color: 'rgb(0, 0, 255)'});
  });

  it('does not auto-apply isCurrent when an explicit isCurrent exists', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Projects</BreadcrumbItem>
        <BreadcrumbItem href="/details">Details</BreadcrumbItem>
      </Breadcrumbs>,
    );

    expect(screen.getByText('Projects')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', {name: 'Details'})).not.toHaveAttribute(
      'aria-current',
    );
  });
});
