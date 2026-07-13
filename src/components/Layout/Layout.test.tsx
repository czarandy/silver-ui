import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {DialogContext} from 'components/Dialog/DialogContext';
import {Layout, type LayoutProps} from 'components/Layout/Layout';
import {layoutHeaderRecipe} from 'components/Layout/Layout.recipe';
import {LayoutContent} from 'components/Layout/LayoutContent';
import {LayoutFooter} from 'components/Layout/LayoutFooter';
import {LayoutHeader} from 'components/Layout/LayoutHeader';
import {LayoutPanel} from 'components/Layout/LayoutPanel';

describe('Layout', () => {
  it('renders header, start, content, end, and footer slots', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        end={<LayoutPanel>End</LayoutPanel>}
        footer={
          <LayoutFooter primaryButton={<button type="button">Done</button>} />
        }
        header={<LayoutHeader title="Header" />}
        start={<LayoutPanel>Start</LayoutPanel>}
      />,
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
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
        footer={
          <LayoutFooter
            data-testid="footer"
            primaryButton={<button type="button">Save</button>}
          />
        }
        hasDividers
        header={<LayoutHeader data-testid="header" title="Header" />}
        start={<LayoutPanel data-testid="panel">Panel</LayoutPanel>}
      />,
    );

    expect(screen.getByTestId('header')).toHaveClass('silver-bd-be-w_default');
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

describe('Layout region padding', () => {
  const renderLayout = (props: Partial<LayoutProps> = {}) =>
    render(
      <Layout
        content={<LayoutContent data-testid="content">Content</LayoutContent>}
        footer={
          <LayoutFooter primaryButton={<button type="button">Ok</button>} />
        }
        header={<LayoutHeader title="Header" />}
        {...props}
      />,
    );

  it('keeps the content padding when dividers separate the regions', () => {
    renderLayout({hasDividers: true});

    const content = screen.getByTestId('content');
    expect(content).not.toHaveClass('silver-pbs_0');
    expect(content).not.toHaveClass('silver-pbe_0');
  });

  it('drops the content padding against a header and a footer without dividers', () => {
    renderLayout({hasDividers: false});

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('silver-pbs_0');
    expect(content).toHaveClass('silver-pbe_0');
  });

  it('only drops the padding on edges that actually meet a region', () => {
    renderLayout({footer: undefined, hasDividers: false});

    const content = screen.getByTestId('content');
    expect(content).toHaveClass('silver-pbs_0');
    // No footer, so the block-end padding still insets the content from the
    // surface's bottom edge.
    expect(content).not.toHaveClass('silver-pbe_0');
  });

  it('leaves a standalone LayoutContent untouched', () => {
    render(<LayoutContent data-testid="content">Content</LayoutContent>);

    const content = screen.getByTestId('content');
    expect(content).not.toHaveClass('silver-pbs_0');
    expect(content).not.toHaveClass('silver-pbe_0');
  });
});

describe('LayoutHeader', () => {
  it('renders as a header element with a title', () => {
    render(<LayoutHeader data-testid="header" title="My Title" />);

    expect(screen.getByTestId('header').tagName).toBe('HEADER');
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 4, name: 'My Title'})).toBe(
      screen.getByText('My Title'),
    );
  });

  it('applies the configured heading level to the title', () => {
    render(<LayoutHeader level={2} title="My Title" />);

    expect(
      screen.getByRole('heading', {level: 2, name: 'My Title'}),
    ).toBeInTheDocument();
  });

  it('applies the configured accessibility level to the title', () => {
    render(<LayoutHeader accessibilityLevel={4} level={2} title="My Title" />);

    const heading = screen.getByRole('heading', {
      level: 4,
      name: 'My Title',
    });
    expect(heading).toHaveProperty('tagName', 'H2');
    expect(heading).toHaveAttribute('aria-level', '4');
  });

  it('renders subtitle when provided', () => {
    render(<LayoutHeader subtitle="Supporting text" title="Title" />);

    expect(screen.getByText('Supporting text')).toBeInTheDocument();
  });

  it('renders startContent and endContent', () => {
    render(
      <LayoutHeader
        endContent={<span data-testid="end">End</span>}
        startContent={<span data-testid="start">Start</span>}
        title="Title"
      />,
    );

    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('adds divider class when hasDividers context is true', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        header={<LayoutHeader data-testid="header" title="Header" />}
      />,
    );

    expect(screen.getByTestId('header')).toHaveClass('silver-bd-be-w_default');
  });

  it('applies height as inline style', () => {
    render(<LayoutHeader data-testid="header" height={64} title="Header" />);

    expect(screen.getByTestId('header')).toHaveStyle({height: '64px'});
  });

  it('trims the title and subtitle leading against the header padding', () => {
    const {titleArea} = layoutHeaderRecipe({align: 'start', hasDivider: false});

    expect(titleArea).toContain(
      '[&_>_*]:silver-text-box_trim-both_cap_alphabetic',
    );
    // The trimmed leading no longer separates the title from the subtitle, so
    // the gap replacing it is scoped to the same feature query.
    expect(titleArea).toContain(
      '[@supports_(text-box-trim:_trim-both)]:silver-gap_4',
    );
  });

  it('offsets the Dialog close button to match the trimmed title', () => {
    render(
      <DialogContext value={{onOpenChange: vi.fn(), titleId: 'title'}}>
        <LayoutHeader title="Header" />
      </DialogContext>,
    );

    const closeButton = screen.getByRole('button', {name: 'Close'});

    expect(closeButton).toHaveClass('silver-mbs_-2');
    // Both block margins, so a subtitle-less header's height stays driven by
    // the title rather than by the taller close button.
    expect(closeButton).toHaveClass(
      '[@supports_(text-box-trim:_trim-both)]:silver-my_-3',
    );
  });

  it('does not render a close button outside a Dialog', () => {
    render(<LayoutHeader title="Header" />);

    expect(
      screen.queryByRole('button', {name: 'Close'}),
    ).not.toBeInTheDocument();
  });

  it('renders a Dialog close button that calls onOpenChange(false)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DialogContext value={{onOpenChange, titleId: 'title'}}>
        <LayoutHeader title="Header" />
      </DialogContext>,
    );

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('wires the title to the Dialog via titleId and autofocus', () => {
    render(
      <DialogContext value={{onOpenChange: vi.fn(), titleId: 'dialog-title'}}>
        <LayoutHeader title="Header" />
      </DialogContext>,
    );

    const heading = screen.getByRole('heading', {name: 'Header'});
    expect(heading).toHaveAttribute('id', 'dialog-title');
    expect(heading).toHaveAttribute('data-dialog-autofocus', 'true');
  });

  it('forwards className, style, ref, and data-testid', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <LayoutHeader
        className="custom"
        data-testid="header"
        ref={ref}
        style={{color: 'red'}}
        title="Header"
      />,
    );

    const el = screen.getByTestId('header');
    expect(el).toHaveClass('custom');
    expect(el).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('LayoutFooter', () => {
  it('renders as a footer element', () => {
    render(
      <LayoutFooter
        data-testid="footer"
        primaryButton={<button type="button">Done</button>}
      />,
    );

    expect(screen.getByTestId('footer').tagName).toBe('FOOTER');
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders primaryButton and secondaryButton', () => {
    render(
      <LayoutFooter
        primaryButton={<button type="button">Save</button>}
        secondaryButton={<button type="button">Cancel</button>}
      />,
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders startContent', () => {
    render(
      <LayoutFooter
        primaryButton={<button type="button">Save</button>}
        startContent={<span data-testid="start">Help</span>}
      />,
    );

    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders startContent alone without requiring action buttons', () => {
    render(
      <LayoutFooter startContent={<span data-testid="start">Saved</span>} />,
    );

    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies divider on the block-start edge when hasDividers is set', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        footer={
          <LayoutFooter
            data-testid="footer"
            primaryButton={<button type="button">Save</button>}
          />
        }
      />,
    );

    expect(screen.getByTestId('footer')).toHaveAttribute(
      'data-divider',
      'true',
    );
  });

  it('renders custom children while preserving the layout divider shell', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        footer={
          <LayoutFooter data-testid="footer">
            <div data-testid="custom-footer">Custom footer</div>
          </LayoutFooter>
        }
      />,
    );

    expect(screen.getByTestId('custom-footer')).toHaveTextContent(
      'Custom footer',
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
        primaryButton={<button type="button">Done</button>}
        ref={ref}
        style={{color: 'red'}}
      />,
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

    expect(screen.getByTestId('panel')).toHaveClass('silver-bd-e-w_default');
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
