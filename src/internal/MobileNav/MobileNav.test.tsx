import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {MobileNav} from './MobileNav';

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'open', {
    configurable: true,
    get(this: HTMLDialogElement) {
      return this.hasAttribute('open');
    },
  });
});

describe('MobileNav', () => {
  it('renders dialog content when open', () => {
    render(
      <MobileNav data-testid="nav" header="Menu" isOpen>
        <a href="/home">Home</a>
      </MobileNav>,
    );

    expect(screen.getByTestId('nav')).toHaveAttribute('open');
    expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
  });

  it('calls onOpenChange when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <MobileNav header="Menu" isOpen onOpenChange={onOpenChange}>
        Content
      </MobileNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Close navigation'}));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const onOpenChange = vi.fn();

    render(
      <MobileNav header="Menu" isOpen onOpenChange={onOpenChange}>
        Content
      </MobileNav>,
    );

    const dialog = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', {cancelable: true});
    dialog.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on backdrop click', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <MobileNav header="Menu" isOpen onOpenChange={onOpenChange}>
        Content
      </MobileNav>,
    );

    // Clicking the dialog element itself (not a child) simulates a backdrop
    // click, since `event.target === event.currentTarget` for the dialog.
    await user.click(screen.getByRole('dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on click inside the drawer', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <MobileNav header="Menu" isOpen onOpenChange={onOpenChange}>
        <button type="button">Inside</button>
      </MobileNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Inside'}));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('applies side="start" styles to the drawer', () => {
    render(
      <MobileNav data-testid="nav" isOpen side="start">
        Content
      </MobileNav>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying CSS class on drawer wrapper
    const drawer = screen.getByTestId('nav').firstElementChild as HTMLElement;
    expect(drawer).toHaveClass('silver-inset-s_0');
  });

  it('applies side="end" styles to the drawer', () => {
    render(
      <MobileNav data-testid="nav" isOpen side="end">
        Content
      </MobileNav>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying CSS class on drawer wrapper
    const drawer = screen.getByTestId('nav').firstElementChild as HTMLElement;
    expect(drawer).toHaveClass('silver-inset-e_0');
  });

  it('applies RTL-aware transform for side="start"', () => {
    render(
      <MobileNav data-testid="nav" isOpen side="start">
        Content
      </MobileNav>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying CSS class on drawer wrapper
    const drawer = screen.getByTestId('nav').firstElementChild as HTMLElement;
    // LTR: slides off to the left
    expect(drawer).toHaveClass('silver-trf_translateX(-100%)');
    // RTL: slides off to the right
    expect(drawer).toHaveClass('rtl:silver-trf_translateX(100%)');
  });

  it('applies size prop as max-width on the drawer', () => {
    render(
      <MobileNav data-testid="nav" isOpen size={400}>
        Content
      </MobileNav>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying inline style on drawer wrapper
    const drawer = screen.getByTestId('nav').firstElementChild as HTMLElement;
    expect(drawer).toHaveStyle({maxWidth: '400px'});
  });

  it('accepts size as a string', () => {
    render(
      <MobileNav data-testid="nav" isOpen size="50vw">
        Content
      </MobileNav>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying inline style on drawer wrapper
    const drawer = screen.getByTestId('nav').firstElementChild as HTMLElement;
    expect(drawer).toHaveStyle({maxWidth: '50vw'});
  });

  it('restores previous body overflow when closed', () => {
    document.body.style.overflow = 'scroll';

    const {rerender} = render(
      <MobileNav header="Menu" isOpen onOpenChange={() => {}}>
        Content
      </MobileNav>,
    );

    expect(document.body).toHaveStyle({overflow: 'hidden'});

    rerender(
      <MobileNav header="Menu" isOpen={false} onOpenChange={() => {}}>
        Content
      </MobileNav>,
    );

    expect(document.body).toHaveStyle({overflow: 'scroll'});
    document.body.style.overflow = '';
  });
});
