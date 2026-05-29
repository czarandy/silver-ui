import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Layout} from './Layout';
import {LayoutContent} from './LayoutContent';
import {LayoutFooter} from './LayoutFooter';
import {LayoutHeader} from './LayoutHeader';
import {LayoutPanel} from './LayoutPanel';

describe('Layout', () => {
  it('renders header, start, content, end, and footer slots', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        end={<LayoutPanel>End</LayoutPanel>}
        footer={<LayoutFooter>Footer</LayoutFooter>}
        header={<LayoutHeader>Header</LayoutHeader>}
        start={<LayoutPanel>Start</LayoutPanel>}
      />,
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Layout
        className="custom-layout"
        content={<LayoutContent>Content</LayoutContent>}
        data-testid="layout"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveClass('custom-layout');
    expect(layout).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies padding class when padding is provided', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        data-testid="layout"
        padding={6}
      />,
    );

    expect(screen.getByTestId('layout')).toHaveClass('silver-p_6');
  });

  it('applies the auto height variant class', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        data-testid="layout"
        height="auto"
      />,
    );

    expect(screen.getByTestId('layout')).toHaveClass('silver-min-h_100%');
  });

  it('does not render DOM wrappers for omitted slots', () => {
    render(<Layout content={<LayoutContent>Only content</LayoutContent>} />);

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('enables dividers on child regions when hasDividers is true', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        footer={<LayoutFooter data-testid="footer">Footer</LayoutFooter>}
        hasDividers
        header={<LayoutHeader data-testid="header">Header</LayoutHeader>}
        start={<LayoutPanel data-testid="panel">Panel</LayoutPanel>}
      />,
    );

    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-divider',
      'true',
    );
    expect(screen.getByTestId('footer')).toHaveAttribute(
      'data-divider',
      'true',
    );
  });
});

describe('LayoutContent', () => {
  it('adds the scrollable class when isScrollable is true', () => {
    render(
      <LayoutContent data-testid="content" isScrollable>
        Scrollable
      </LayoutContent>,
    );

    expect(screen.getByTestId('content')).toHaveClass('silver-ov_auto');
  });

  it('does not add the scrollable class when isScrollable is false', () => {
    render(
      <LayoutContent data-testid="content" isScrollable={false}>
        Not scrollable
      </LayoutContent>,
    );

    expect(screen.getByTestId('content')).not.toHaveClass('silver-ov_auto');
  });

  it('applies padding class for the given padding value', () => {
    render(
      <LayoutContent data-testid="content" padding={6}>
        Padded
      </LayoutContent>,
    );

    expect(screen.getByTestId('content')).toHaveClass('silver-p_6');
  });

  it('auto-applies role="region" when label is provided', () => {
    render(
      <LayoutContent data-testid="content" label="Main content">
        Content
      </LayoutContent>,
    );

    expect(screen.getByTestId('content')).toHaveAttribute('role', 'region');
  });

  it('does not apply role="region" when label is omitted', () => {
    render(<LayoutContent data-testid="content">Content</LayoutContent>);

    expect(screen.getByTestId('content')).not.toHaveAttribute('role');
  });

  it('forwards className, style, ref, data-testid, and id', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <LayoutContent
        className="custom"
        data-testid="content"
        id="main"
        ref={ref}
        style={{color: 'red'}}>
        Content
      </LayoutContent>,
    );

    const el = screen.getByTestId('content');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(el).toHaveAttribute('id', 'main');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('LayoutHeader', () => {
  it('renders as a header element', () => {
    render(<LayoutHeader data-testid="header">Header</LayoutHeader>);

    expect(screen.getByTestId('header').tagName).toBe('HEADER');
  });

  it('adds data-divider when hasDividers is set on Layout', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        header={<LayoutHeader data-testid="header">Header</LayoutHeader>}
      />,
    );

    expect(screen.getByTestId('header')).toHaveAttribute(
      'data-divider',
      'true',
    );
  });

  it('applies height as inline style', () => {
    render(
      <LayoutHeader data-testid="header" height={64}>
        Header
      </LayoutHeader>,
    );

    expect(screen.getByTestId('header')).toHaveStyle({height: '64px'});
  });

  it('forwards className, style, ref, and data-testid', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <LayoutHeader
        className="custom"
        data-testid="header"
        ref={ref}
        style={{color: 'red'}}>
        Header
      </LayoutHeader>,
    );

    const el = screen.getByTestId('header');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('LayoutFooter', () => {
  it('renders as a footer element', () => {
    render(<LayoutFooter data-testid="footer">Footer</LayoutFooter>);

    expect(screen.getByTestId('footer').tagName).toBe('FOOTER');
  });

  it('applies divider on the block-start edge when hasDividers is set', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        footer={<LayoutFooter data-testid="footer">Footer</LayoutFooter>}
      />,
    );

    expect(screen.getByTestId('footer')).toHaveAttribute(
      'data-divider',
      'true',
    );
  });

  it('forwards className, style, ref, and data-testid', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <LayoutFooter
        className="custom"
        data-testid="footer"
        ref={ref}
        style={{color: 'red'}}>
        Footer
      </LayoutFooter>,
    );

    const el = screen.getByTestId('footer');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('LayoutPanel', () => {
  it('applies width as inline style', () => {
    render(
      <LayoutPanel data-testid="panel" width={300}>
        Panel
      </LayoutPanel>,
    );

    expect(screen.getByTestId('panel')).toHaveStyle({width: '300px'});
  });

  it('applies end-edge divider class when inside a start slot', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        start={<LayoutPanel data-testid="panel">Start panel</LayoutPanel>}
      />,
    );

    expect(screen.getByTestId('panel')).toHaveClass('silver-bd-e-w_1px');
  });

  it('adds the scrollable class when isScrollable is true', () => {
    render(
      <LayoutPanel data-testid="panel" isScrollable>
        Scrollable
      </LayoutPanel>,
    );

    expect(screen.getByTestId('panel')).toHaveClass('silver-ov_auto');
  });

  it('does not add the scrollable class when isScrollable is false', () => {
    render(
      <LayoutPanel data-testid="panel" isScrollable={false}>
        Not scrollable
      </LayoutPanel>,
    );

    expect(screen.getByTestId('panel')).not.toHaveClass('silver-ov_auto');
  });

  it('auto-applies role="region" when label is provided', () => {
    render(
      <LayoutPanel data-testid="panel" label="Side panel">
        Panel
      </LayoutPanel>,
    );

    expect(screen.getByTestId('panel')).toHaveAttribute('role', 'region');
  });

  it('forwards className, style, ref, and data-testid', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <LayoutPanel
        className="custom"
        data-testid="panel"
        ref={ref}
        style={{color: 'red'}}>
        Panel
      </LayoutPanel>,
    );

    const el = screen.getByTestId('panel');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
