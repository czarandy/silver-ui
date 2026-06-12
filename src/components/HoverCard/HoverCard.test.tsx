import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {HoverCard} from 'components/HoverCard/HoverCard';

const showPopoverMock = vi.fn();
const hidePopoverMock = vi.fn();

beforeAll(() => {
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: '(hover: none)',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  });
});

afterAll(() => {
  Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
  Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
  Reflect.deleteProperty(window, 'matchMedia');
});

describe('HoverCard', () => {
  it('renders text triggers as focusable content', () => {
    render(<HoverCard content="Details">Hover target</HoverCard>);

    const trigger = screen.getByText('Hover target');
    expect(trigger).toHaveAttribute('tabIndex', '0');
    expect(trigger).toHaveAttribute('aria-describedby');
  });

  it('sets aria-describedby on element children', () => {
    render(
      <HoverCard content="Details">
        <Button label="Hover" />
      </HoverCard>,
    );

    expect(screen.getByRole('button', {name: 'Hover'})).toHaveAttribute(
      'aria-describedby',
    );
  });

  it('opens on hover', async () => {
    showPopoverMock.mockClear();

    render(
      <HoverCard content="Details" delay={0}>
        <Button label="Hover" />
      </HoverCard>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Hover'}));

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });
  });

  it('closes on mouse leave', async () => {
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();

    render(
      <HoverCard content="Details" delay={0} hideDelay={0}>
        <Button label="Hover" />
      </HoverCard>,
    );

    const trigger = screen.getByRole('button', {name: 'Hover'});
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });

    fireEvent.mouseLeave(trigger);

    await waitFor(() => {
      expect(hidePopoverMock).toHaveBeenCalled();
    });
  });

  it('does not open when isEnabled is false', async () => {
    showPopoverMock.mockClear();

    render(
      <HoverCard content="Details" delay={0} isEnabled={false}>
        <Button label="Hover" />
      </HoverCard>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', {name: 'Hover'}));

    await new Promise(r => setTimeout(r, 50));
    expect(showPopoverMock).not.toHaveBeenCalled();
  });

  it('opens on focus for text triggers', async () => {
    showPopoverMock.mockClear();
    const user = userEvent.setup();

    render(
      <HoverCard content="Details" delay={0}>
        Hover target
      </HoverCard>,
    );

    await user.tab();

    await waitFor(() => {
      expect(showPopoverMock).toHaveBeenCalled();
    });
  });

  it('does not open on focus when focusTrigger is never', async () => {
    showPopoverMock.mockClear();

    render(
      <HoverCard content="Details" delay={0} focusTrigger="never">
        Hover target
      </HoverCard>,
    );

    fireEvent.focus(screen.getByText('Hover target'));

    await new Promise(r => setTimeout(r, 50));
    expect(showPopoverMock).not.toHaveBeenCalled();
  });

  it('applies className, style, and data-testid to text triggers', () => {
    render(
      <HoverCard
        className="custom-hover"
        content="Details"
        data-testid="hover-trigger"
        style={{color: 'red'}}>
        Hover target
      </HoverCard>,
    );

    const trigger = screen.getByTestId('hover-trigger');
    expect(trigger).toHaveClass('custom-hover');
    expect(trigger).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('applies placement to the hover card layer', () => {
    render(
      <HoverCard content="Details" placement="below">
        Hover target
      </HoverCard>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- the hover card layer has no role or testid
    expect(screen.getByText('Details').parentElement).toHaveStyle({
      positionArea: 'bottom',
    });
  });

  it('applies alignment to the hover card layer', () => {
    render(
      <HoverCard alignment="start" content="Details" placement="above">
        Hover target
      </HoverCard>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- the hover card layer has no role or testid
    expect(screen.getByText('Details').parentElement).toHaveStyle({
      positionArea: 'top span-right',
    });
  });
});
