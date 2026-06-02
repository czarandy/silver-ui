import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Rocket} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Icon} from '../Icon';
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

  it('maps error status to alert role', () => {
    render(<Alert status="error" title="Error occurred" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Error occurred');
  });

  it('maps info status to status role', () => {
    render(<Alert status="info" title="FYI" />);

    expect(screen.getByRole('status')).toHaveTextContent('FYI');
  });

  it('renders description when provided', () => {
    render(
      <Alert description="Some helpful context" status="info" title="Title" />,
    );

    expect(screen.getByText('Some helpful context')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<Alert status="info" title="Title only" />);

    expect(screen.queryByText('Some helpful context')).not.toBeInTheDocument();
  });

  it('renders endContent in the header', () => {
    render(
      <Alert
        endContent={<button type="button">Action</button>}
        status="info"
        title="With end content"
      />,
    );

    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('renders custom icon instead of default', () => {
    render(
      <Alert
        icon={<Icon data-testid="custom-icon" icon={Rocket} />}
        status="success"
        title="Custom"
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
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

  it('dismisses without onDismiss callback', async () => {
    const user = userEvent.setup();

    render(
      <Alert
        data-testid="alert"
        isDismissable
        status="info"
        title="Dismiss me"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('does not show dismiss button when isDismissable is false', () => {
    render(<Alert status="info" title="Not dismissable" />);

    expect(
      screen.queryByRole('button', {name: 'Dismiss'}),
    ).not.toBeInTheDocument();
  });

  it('toggles collapsible content', async () => {
    const user = userEvent.setup();

    render(
      <Alert status="info" title="Details">
        <div>Extra content</div>
      </Alert>,
    );

    const expandBtn = screen.getByRole('button', {name: 'Expand'});
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Extra content')).not.toBeInTheDocument();

    await user.click(expandBtn);
    expect(screen.getByRole('button', {name: 'Collapse'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Extra content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Collapse'}));
    expect(screen.getByRole('button', {name: 'Expand'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
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

  it('ignores isDefaultExpanded when there are no children', () => {
    render(
      <Alert
        data-testid="alert"
        isDefaultExpanded
        status="info"
        title="No children"
      />,
    );

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Expand'}),
    ).not.toBeInTheDocument();
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
