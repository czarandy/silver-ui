import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useRef} from 'react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {Popover} from './Popover';

const showPopoverMock = vi.fn();
const hidePopoverMock = vi.fn();

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
