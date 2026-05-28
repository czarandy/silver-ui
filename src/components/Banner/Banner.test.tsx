import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Banner} from './Banner';

describe('Banner', () => {
  it('renders title and description with the correct role', () => {
    render(
      <Banner
        description="Additional details"
        status="warning"
        title="Warning"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Warning');
    expect(screen.getByText('Additional details')).toBeInTheDocument();
  });

  it('renders status as role status for non-urgent banners', () => {
    render(<Banner status="success" title="Saved" />);

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('dismisses itself and calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Banner
        data-testid="banner"
        isDismissable
        onDismiss={onDismiss}
        status="info"
        title="Dismiss me"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByTestId('banner')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('toggles collapsible content', async () => {
    const user = userEvent.setup();

    render(
      <Banner status="info" title="Details">
        <div>Extra content</div>
      </Banner>,
    );

    expect(screen.queryByText('Extra content')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Expand'}));
    expect(screen.getByText('Extra content')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Collapse'}));
    expect(screen.queryByText('Extra content')).not.toBeInTheDocument();
  });

  it('renders content expanded by default', () => {
    render(
      <Banner isDefaultExpanded status="info" title="Details">
        <div>Extra content</div>
      </Banner>,
    );

    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Banner
        className="custom-banner"
        data-testid="banner"
        ref={ref}
        status="info"
        style={{color: 'red'}}
        title="Banner"
      />,
    );

    const banner = screen.getByTestId('banner');
    expect(banner).toHaveClass('custom-banner');
    expect(banner).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
