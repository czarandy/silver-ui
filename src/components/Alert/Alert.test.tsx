import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Rocket} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Alert} from 'components/Alert/Alert';
import {Button} from 'components/Button';
import {Icon} from 'components/Icon';

/**
 * The status colours a `primary` end action reads from live on the header slot,
 * which carries no role or text of its own to query by.
 */
function alertHeader(): HTMLElement {
  // eslint-disable-next-line testing-library/no-node-access -- the header slot is the element under test and has no queryable role of its own
  const header = screen.getByTestId('alert').firstElementChild;
  if (!(header instanceof HTMLElement)) {
    throw new Error('Alert header not found');
  }
  return header;
}

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

  it('renders title and description in div wrappers, not <p>', () => {
    render(<Alert description="Details" status="info" title="Heads up" />);

    expect(screen.getByText('Heads up').tagName).toBe('DIV');

    const description = screen.getByText('Details');
    expect(description.tagName).toBe('DIV');
    expect(description).toHaveAttribute('role', 'paragraph');
  });

  it('renders block-level description content without invalid <p> nesting', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <Alert
        description={
          <ul>
            <li>one</li>
            <li>two</li>
          </ul>
        }
        status="info"
        title="With list"
      />,
    );

    // Block content nests legally inside a <div>, so React emits no
    // validateDOMNesting warning (which previously fired for <p><ul>…).
    expect(consoleError).not.toHaveBeenCalled();

    const list = screen.getByRole('list');
    // eslint-disable-next-line testing-library/no-node-access
    expect(list.closest('p')).toBeNull();
    expect(screen.getByText('one')).toBeInTheDocument();

    consoleError.mockRestore();
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

  it('fills a primary end action with the status foreground', () => {
    render(
      <Alert
        data-testid="alert"
        endContent={<Button label="Upgrade" size="sm" variant="primary" />}
        status="info"
        title="Trial ending"
      />,
    );

    expect(alertHeader()).toHaveClass(
      'silver---silver-button-primary-bg_var(--silver-colors-surface-blue-fg)',
    );
  });

  it('retints a primary end action per status', () => {
    render(
      <Alert
        data-testid="alert"
        endContent={<Button label="Retry" size="sm" variant="primary" />}
        status="error"
        title="Payment failed"
      />,
    );

    expect(alertHeader()).toHaveClass(
      'silver---silver-button-primary-bg_var(--silver-colors-surface-red-fg)',
    );
  });

  // The fill follows the theme (dark on light, light on dark), so the label has
  // to invert with it. `fg.onPrimary` is tuned against the accent and stays
  // near-white in both themes, which disappeared on a dark theme's light fill.
  it('labels a primary end action with the theme-inverting neutral', () => {
    render(
      <Alert
        data-testid="alert"
        endContent={<Button label="Upgrade" size="sm" variant="primary" />}
        status="warning"
        title="Trial ending"
      />,
    );

    expect(alertHeader()).toHaveClass(
      'silver---silver-button-primary-fg_var(--silver-colors-bg)',
    );
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

    // The content stays mounted while collapsed (so child state and the
    // aria-controls target are preserved) but is hidden from view.
    const expandBtn = screen.getByRole('button', {name: 'Expand'});
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Extra content')).not.toBeVisible();

    await user.click(expandBtn);
    expect(screen.getByRole('button', {name: 'Collapse'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Extra content')).toBeVisible();

    await user.click(screen.getByRole('button', {name: 'Collapse'}));
    expect(screen.getByRole('button', {name: 'Expand'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText('Extra content')).not.toBeVisible();
  });

  it('keeps the aria-controls target in the DOM while collapsed', () => {
    render(
      <Alert status="info" title="Details">
        <div>Extra content</div>
      </Alert>,
    );

    // The expand button references the body via aria-controls; because the body
    // subtree stays mounted while collapsed, that reference is never dangling.
    expect(screen.getByRole('button', {name: 'Expand'})).toHaveAttribute(
      'aria-controls',
    );
    expect(screen.getByText('Extra content')).toBeInTheDocument();
  });

  it('preserves collapsible child state across collapse and expand', async () => {
    const user = userEvent.setup();

    render(
      <Alert isDefaultExpanded status="info" title="Details">
        <input aria-label="Note" />
      </Alert>,
    );

    await user.type(screen.getByLabelText('Note'), 'hello');
    await user.click(screen.getByRole('button', {name: 'Collapse'}));
    await user.click(screen.getByRole('button', {name: 'Expand'}));

    expect(screen.getByLabelText('Note')).toHaveValue('hello');
  });

  it('renders content expanded by default', () => {
    render(
      <Alert isDefaultExpanded status="info" title="Details">
        <div>Extra content</div>
      </Alert>,
    );

    expect(screen.getByText('Extra content')).toBeVisible();
  });

  it('rounds the body bottom corners for the card container', () => {
    render(
      <Alert
        container="card"
        data-testid="alert"
        isDefaultExpanded
        status="info"
        title="Details">
        Body
      </Alert>,
    );

    expect(screen.getByText('Body')).toHaveClass('silver-bdr-b_lg');
  });

  it('omits the body bottom corner radius for the section container', () => {
    render(
      <Alert
        container="section"
        data-testid="alert"
        isDefaultExpanded
        status="info"
        title="Details">
        Body
      </Alert>,
    );

    expect(screen.getByText('Body')).not.toHaveClass('silver-bdr-b_lg');
  });

  it('applies the padding prop to the collapsible body', () => {
    render(
      <Alert
        data-testid="alert"
        isDefaultExpanded
        padding={6}
        status="info"
        title="Details">
        Body
      </Alert>,
    );

    const body = screen.getByText('Body');
    expect(body).toHaveClass('silver-px_6');
    expect(body).toHaveClass('silver-py_6');
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
