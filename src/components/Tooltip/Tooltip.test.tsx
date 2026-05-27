import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useRef} from 'react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Tooltip} from './Tooltip';

const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const showPopoverMock = vi.fn(function (this: HTMLElement) {
  popoverOpenState.set(this, true);
});
const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  popoverOpenState.set(this, false);
});

beforeAll(() => {
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;

  HTMLElement.prototype.matches = function (selector: string): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }

    if (selector === ':focus-visible') {
      return true;
    }

    return Element.prototype.matches.call(this, selector);
  };
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'matches');
  Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
  Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
});

describe('Tooltip', () => {
  it('renders trigger element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button', {name: 'Trigger'})).toBeInTheDocument();
  });

  it('calls onOpenChange when shown via hover', async () => {
    const onOpenChange = vi.fn();

    render(
      <Tooltip content="Tooltip text" onOpenChange={onOpenChange} delay={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('sets aria-describedby on element children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveAttribute(
      'id',
      trigger.getAttribute('aria-describedby'),
    );
  });

  it('renders text children as a focusable trigger', () => {
    render(<Tooltip content="Tooltip text">Trigger text</Tooltip>);

    const trigger = screen.getByText('Trigger text');
    expect(trigger).toHaveAttribute('tabIndex', '0');
    expect(trigger).toHaveAttribute('aria-describedby');
  });

  it('supports controlled open state', async () => {
    showPopoverMock.mockClear();
    const {rerender} = render(
      <Tooltip content="Controlled tooltip" isOpen={false}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(showPopoverMock).not.toHaveBeenCalled();

    rerender(
      <Tooltip content="Controlled tooltip" isOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });
  });

  it('shows on mount when isDefaultOpen is true', async () => {
    showPopoverMock.mockClear();
    render(
      <Tooltip content="Default open tooltip" isDefaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });
  });

  it('attaches to an external anchor ref', () => {
    function Fixture(): React.JSX.Element {
      const ref = useRef<HTMLButtonElement>(null);

      return (
        <>
          <button ref={ref} type="button">
            External trigger
          </button>
          <Tooltip anchorRef={ref} content="External tooltip" />
        </>
      );
    }

    render(<Fixture />);

    expect(
      screen.getByRole('button', {name: 'External trigger'}),
    ).toHaveAttribute('aria-describedby');
  });
});
