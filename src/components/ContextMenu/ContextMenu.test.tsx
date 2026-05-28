import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Divider} from '../Divider';
import {ContextMenu, ContextMenuItem} from './ContextMenu';

const showPopover = vi.fn(function (this: HTMLElement) {
  this.setAttribute('popover-open', '');
});
const hidePopover = vi.fn(function (this: HTMLElement) {
  this.removeAttribute('popover-open');
});

beforeEach(() => {
  showPopover.mockClear();
  hidePopover.mockClear();
  HTMLElement.prototype.showPopover = showPopover;
  HTMLElement.prototype.hidePopover = hidePopover;
});

describe('ContextMenu', () => {
  it('renders trigger children', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('opens at the cursor position on right-click', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'), {
      clientX: 24,
      clientY: 48,
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu', {hidden: true})).toHaveStyle({
      left: '24px',
      top: '48px',
    });
  });

  it('does not prevent the native context menu when disabled', () => {
    render(
      <ContextMenu isDisabled items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    screen.getByText('Right-click me').dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(showPopover).not.toHaveBeenCalled();
  });

  it('renders data-driven items, sections, and dividers', () => {
    render(
      <ContextMenu
        items={[
          {
            items: [{label: 'Cut'}, {label: 'Copy'}],
            title: 'Edit',
            type: 'section',
          },
          {type: 'divider'},
          {label: 'Paste'},
        ]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(
      screen.getByRole('group', {hidden: true, name: 'Edit'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Cut'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Paste'}),
    ).toBeInTheDocument();
  });

  it('calls item onClick and closes the menu', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu items={[{label: 'Copy', onClick: handleClick}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    await user.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('renders compound menu content', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu
        menuContent={
          <>
            <ContextMenuItem label="Copy" onClick={handleClick} />
            <Divider />
            <ContextMenuItem label="Paste" />
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    await user.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Paste'}),
    ).toBeInTheDocument();
  });

  it('opens from the keyboard context menu shortcut', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.keyDown(screen.getByTestId('context-trigger'), {
      key: 'ContextMenu',
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
  });
});
