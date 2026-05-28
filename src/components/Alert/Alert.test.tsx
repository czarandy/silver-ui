import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Alert} from './Alert';

describe('Alert', () => {
  it('renders title and description with the correct role', () => {
    render(
      <Alert
        description="Additional details"
        status="warning"
        title="Warning"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Warning');
    expect(screen.getByText('Additional details')).toBeInTheDocument();
  });

  it('renders non-urgent statuses as role status', () => {
    render(<Alert status="success" title="Saved" />);

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });

  it('dismisses itself and calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Alert
        data-testid="alert"
        isDismissable
        onDismiss={onDismiss}
        status="info"
        title="Dismiss me"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('toggles collapsible content', async () => {
    const user = userEvent.setup();

    render(
      <Alert status="info" title="Details">
        <div>Extra content</div>
      </Alert>,
    );

    expect(screen.queryByText('Extra content')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Expand'}));
    expect(screen.getByText('Extra content')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Collapse'}));
    expect(screen.queryByText('Extra content')).not.toBeInTheDocument();
  });

  it('renders content expanded by default', () => {
    render(
      <Alert isDefaultExpanded status="info" title="Details">
        <div>Extra content</div>
      </Alert>,
    );

    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Alert
        className="custom-alert"
        data-testid="alert"
        ref={ref}
        status="info"
        style={{color: 'red'}}
        title="Alert"
      />,
    );

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('custom-alert');
    expect(alert).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
