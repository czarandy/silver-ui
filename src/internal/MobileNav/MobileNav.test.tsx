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
