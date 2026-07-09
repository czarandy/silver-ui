import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useCallback} from 'react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Tooltip} from 'components/Tooltip/Tooltip';
import {useTooltip} from 'components/Tooltip/useTooltip';
import {createPopoverFocusShim} from 'internal/testHelpers';

const shim = createPopoverFocusShim();
const {hidePopover: hidePopoverMock, showPopover: showPopoverMock} = shim;

beforeAll(shim.install);
afterAll(shim.uninstall);

describe('Tooltip', () => {
  it('renders trigger element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button', {name: 'Trigger'})).toBeInTheDocument();
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

  it('hides tooltip on mouse leave', async () => {
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();

    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });

    fireEvent.mouseLeave(trigger);

    await waitFor(() => {
      expect(hidePopoverMock).toHaveBeenCalled();
    });
  });

  it('dismisses tooltip on Escape key', async () => {
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();

    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}));

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });

    fireEvent.keyDown(document, {key: 'Escape'});

    await waitFor(() => {
      expect(hidePopoverMock).toHaveBeenCalled();
    });
  });

  it('does not show tooltip when isEnabled is false', async () => {
    showPopoverMock.mockClear();

    render(
      <Tooltip content="Tooltip text" delay={0} isEnabled={false}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}));

    await new Promise(resolve => {
      setTimeout(resolve, 50);
    });

    expect(showPopoverMock).not.toHaveBeenCalled();
  });

  it('useTooltip hook attaches to a ref', () => {
    function Fixture(): React.JSX.Element {
      const handleShow = useCallback(() => {}, []);
      const handleHide = useCallback(() => {}, []);
      const tooltip = useTooltip({
        placement: 'above',
        onShow: handleShow,
        onHide: handleHide,
      });

      return (
        <>
          <button
            aria-describedby={tooltip.describedBy}
            ref={tooltip.ref}
            type="button">
            External trigger
          </button>
          {tooltip.renderTooltip('Hook tooltip')}
        </>
      );
    }

    render(<Fixture />);

    expect(
      screen.getByRole('button', {name: 'External trigger'}),
    ).toHaveAttribute('aria-describedby');
  });

  it('keeps tooltip visible during hideDelay', () => {
    vi.useFakeTimers();
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();

    render(
      <Tooltip content="Tooltip text" delay={0} hideDelay={300}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Trigger'});
    fireEvent.mouseEnter(trigger);

    // delay=0 still uses setTimeout(fn, 0); advance to trigger show.
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(showPopoverMock).toHaveBeenCalled();

    fireEvent.mouseLeave(trigger);

    // Tooltip should still be visible before hideDelay elapses.
    vi.advanceTimersByTime(100);
    expect(hidePopoverMock).not.toHaveBeenCalled();

    // After the full hideDelay, it should hide.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(hidePopoverMock).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('applies alignment to the tooltip layer', () => {
    render(
      <Tooltip alignment="start" content="Tooltip text" placement="above">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole('tooltip', {hidden: true});
    expect(tooltip).toHaveStyle({positionArea: 'top span-right'});
  });
});
