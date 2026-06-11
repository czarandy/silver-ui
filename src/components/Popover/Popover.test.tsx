import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useRef} from 'react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {token} from 'styled-system/tokens';
import {assertNonNull} from '../../internal/testHelpers';
import {Button} from '../Button';
import {Popover} from './Popover';

const showPopoverMock = vi.fn();
const hidePopoverMock = vi.fn();

// jsdom lacks a ToggleEvent constructor; fake the `newState` the layer reads.
function closeToggleEvent(): Event {
  const event = new Event('toggle');
  Object.assign(event, {newState: 'closed', oldState: 'open'});
  return event;
}

async function nextAnimationFrame(): Promise<void> {
  await new Promise(resolve => {
    requestAnimationFrame(() => resolve(undefined));
  });
}

// The native popover element carries the `toggle` listener but has no
// accessible role to query by, so reach for the `[popover]` attribute directly.
function getPopoverElement(): Element {
  return assertNonNull(document.querySelector('[popover]'));
}

beforeAll(() => {
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
  Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
});

describe('Popover', () => {
  it('attaches dialog trigger attributes to a button child', () => {
    render(
      <Popover content={<div>Popover content</div>} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    const trigger = screen.getByRole('button', {name: 'Open'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-controls');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens when the trigger is clicked', async () => {
    showPopoverMock.mockClear();

    render(
      <Popover content={<div>Popover content</div>} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });
  });

  it('closes when the trigger is clicked again', async () => {
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();

    render(
      <Popover content={<div>Popover content</div>} label="Actions">
        <Button label="Toggle" />
      </Popover>,
    );

    const trigger = screen.getByRole('button', {name: 'Toggle'});
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(hidePopoverMock).toHaveBeenCalled();
    });
  });

  it('does not reopen when a trigger click follows a light-dismiss close', async () => {
    showPopoverMock.mockClear();

    render(
      <Popover content={<div>Popover content</div>} label="Actions">
        <Button label="Toggle" />
      </Popover>,
    );

    const trigger = screen.getByRole('button', {name: 'Toggle'});
    fireEvent.click(trigger);
    await waitFor(() => expect(showPopoverMock).toHaveBeenCalledTimes(1));

    // Native light dismiss: the browser closes the popover (firing `toggle`)
    // before the trigger's own click handler runs in the same gesture.
    fireEvent(getPopoverElement(), closeToggleEvent());
    fireEvent.click(trigger);

    // The guard must swallow that click so the popover stays closed.
    expect(showPopoverMock).toHaveBeenCalledTimes(1);
  });

  it('reopens on a later trigger click once the dismiss frame passes', async () => {
    showPopoverMock.mockClear();

    render(
      <Popover content={<div>Popover content</div>} label="Actions">
        <Button label="Toggle" />
      </Popover>,
    );

    const trigger = screen.getByRole('button', {name: 'Toggle'});
    fireEvent.click(trigger);
    await waitFor(() => expect(showPopoverMock).toHaveBeenCalledTimes(1));

    fireEvent(getPopoverElement(), closeToggleEvent());

    // The guard clears on the next animation frame, so a genuine later click
    // opens the popover again.
    await nextAnimationFrame();
    fireEvent.click(trigger);

    await waitFor(() => expect(showPopoverMock).toHaveBeenCalledTimes(2));
  });

  it('supports controlled isOpen', async () => {
    showPopoverMock.mockClear();

    const {rerender} = render(
      <Popover content={<div>Content</div>} isOpen={false} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    expect(showPopoverMock).not.toHaveBeenCalled();

    rerender(
      <Popover content={<div>Content</div>} isOpen label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });
  });

  it('does not open when isEnabled is false', () => {
    showPopoverMock.mockClear();

    render(
      <Popover content={<div>Content</div>} isEnabled={false} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    expect(showPopoverMock).not.toHaveBeenCalled();
  });

  it('attaches to an external anchor ref', () => {
    function Fixture(): React.JSX.Element {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={ref} type="button">
            External
          </button>
          <Popover
            anchorRef={ref}
            content={<div>External content</div>}
            label="External actions"
          />
        </>
      );
    }

    render(<Fixture />);

    expect(screen.getByRole('button', {name: 'External'})).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('applies className, style, and data-testid to the content', () => {
    render(
      <Popover
        className="custom-popover"
        content={<div>Content</div>}
        data-testid="popover"
        label="Actions"
        style={{color: 'red'}}>
        <Button label="Open" />
      </Popover>,
    );

    const popover = screen.getByTestId('popover');
    expect(popover).toHaveClass('custom-popover');
    expect(popover).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('renders an auto (light-dismiss) popover when isDismissable defaults', () => {
    render(
      <Popover content={<div>Content</div>} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    expect(getPopoverElement()).toHaveAttribute('popover', 'auto');
  });

  it('renders a manual popover when isDismissable is false', () => {
    render(
      <Popover
        content={<div>Content</div>}
        isDismissable={false}
        label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    expect(getPopoverElement()).toHaveAttribute('popover', 'manual');
  });

  it('moves focus to the first focusable element when opened', async () => {
    showPopoverMock.mockClear();

    render(
      <Popover content={<button type="button">Inside</button>} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));

    // The popover content is `display:none` until shown (and `showPopover` is
    // mocked), so query it with `hidden: true`. Focus still moves to it.
    await waitFor(() =>
      expect(
        screen.getByRole('button', {hidden: true, name: 'Inside'}),
      ).toHaveFocus(),
    );
  });

  it('does not move focus when hasAutoFocus is false', async () => {
    showPopoverMock.mockClear();

    render(
      <Popover
        content={<button type="button">Inside</button>}
        hasAutoFocus={false}
        label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    const trigger = screen.getByRole('button', {name: 'Open'});
    trigger.focus();
    fireEvent.click(trigger);

    // Give the auto-focus animation frame a chance to run before asserting it
    // did not steal focus.
    await nextAnimationFrame();
    expect(
      screen.getByRole('button', {hidden: true, name: 'Inside'}),
    ).not.toHaveFocus();
  });

  it('renders a keyboard-accessible close button that hides the popover', async () => {
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();

    render(
      <Popover content={<div>Content</div>} label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    await waitFor(() => expect(showPopoverMock).toHaveBeenCalled());

    fireEvent.click(
      screen.getByRole('button', {hidden: true, name: 'Close popover'}),
    );
    await waitFor(() => expect(hidePopoverMock).toHaveBeenCalled());
  });

  it('honors a custom closeButtonLabel', () => {
    render(
      <Popover
        closeButtonLabel="Dismiss"
        content={<div>Content</div>}
        label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    expect(
      screen.getByRole('button', {hidden: true, name: 'Dismiss'}),
    ).toBeInTheDocument();
  });

  it('omits the close button when hasCloseButton is false', () => {
    render(
      <Popover
        content={<div>Content</div>}
        hasCloseButton={false}
        label="Actions">
        <Button label="Open" />
      </Popover>,
    );

    expect(
      screen.queryByRole('button', {hidden: true, name: 'Close popover'}),
    ).not.toBeInTheDocument();
  });

  it('exposes a menu role on the content and trigger when role is "menu"', () => {
    render(
      <Popover content={<div>Content</div>} label="Actions" role="menu">
        <Button label="Open" />
      </Popover>,
    );

    expect(screen.getByRole('button', {name: 'Open'})).toHaveAttribute(
      'aria-haspopup',
      'menu',
    );
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('applies padding to the content', () => {
    render(
      <Popover
        content={<div>Content</div>}
        data-testid="popover"
        label="Actions"
        padding={4}>
        <Button label="Open" />
      </Popover>,
    );

    expect(screen.getByTestId('popover')).toHaveStyle({
      padding: token('spacing.4'),
    });
  });

  it('forwards ref to the content element', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <Popover content={<div>Content</div>} label="Actions" ref={ref}>
        <Button label="Open" />
      </Popover>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
