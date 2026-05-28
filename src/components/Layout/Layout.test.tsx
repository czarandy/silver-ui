import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Layout} from './Layout';
import {LayoutContent} from './LayoutContent';
import {LayoutHeader} from './LayoutHeader';
import {LayoutPanel} from './LayoutPanel';

describe('Layout', () => {
  it('renders header, start, content, end, and footer slots', () => {
    render(
      <Layout
        content={<LayoutContent>Content</LayoutContent>}
        end={<LayoutPanel>End</LayoutPanel>}
        footer={<LayoutHeader>Footer</LayoutHeader>}
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
});
