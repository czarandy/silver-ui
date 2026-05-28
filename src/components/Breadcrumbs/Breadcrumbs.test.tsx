import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('auto-detects the last item as current', async () => {
    render(
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem data-testid="last-item">Last Item</BreadcrumbItem>
      </Breadcrumbs>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('last-item')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
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
});
