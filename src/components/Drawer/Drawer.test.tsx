import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {Drawer} from './Drawer';
import {useDrawer} from './useDrawer';

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

describe('Drawer', () => {
  it('opens and renders drawer content', () => {
    render(
      <Drawer isOpen label="Navigation" onOpenChange={() => {}}>
        Drawer content
      </Drawer>,
    );

    expect(screen.getByRole('dialog', {name: 'Navigation'})).toHaveAttribute(
      'open',
    );
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not open when isOpen is false', () => {
    render(
      <Drawer
        data-testid="drawer"
        isOpen={false}
        label="Navigation"
        onOpenChange={() => {}}>
        Hidden content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).not.toHaveAttribute('open');
  });

  it('calls onOpenChange(false) on backdrop click', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on escape', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const cancelEvent = new Event('cancel', {cancelable: true});
    screen.getByRole('dialog').dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('defaults placement to right', () => {
    render(
      <Drawer data-testid="drawer" isOpen label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveStyle({width: '320px'});
  });

  it('applies custom size based on placement', () => {
    const {rerender} = render(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="start"
        size={400}>
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({width: '400px'});

    rerender(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="bottom"
        size="50vh">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({height: '50vh'});
  });

  it('applies className, style, ref, and data-testid', () => {
    const ref = vi.fn();

    render(
      <Drawer
        className="custom-drawer"
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        ref={ref}
        style={{color: 'red'}}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveClass('custom-drawer');
    expect(drawer).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(drawer);
  });

  it('focuses a data-autofocus element after opening', async () => {
    render(
      <Drawer isOpen label="Nav" onOpenChange={() => {}}>
        <button data-autofocus type="button">
          First action
        </button>
      </Drawer>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'First action'})).toHaveFocus();
    });
  });
});

describe('useDrawer', () => {
  it('opens and hides an imperative drawer', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const drawer = useDrawer({label: 'Details'});

      return (
        <>
          <Button
            label="Open"
            onClick={() => drawer.show(<div>Drawer content</div>)}
          />
          <Button label="Close" onClick={drawer.hide} />
          <span data-testid="status">{drawer.isOpen ? 'open' : 'closed'}</span>
          {drawer.element}
        </>
      );
    }

    render(<Fixture />);

    expect(screen.getByTestId('status')).toHaveTextContent('closed');

    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByTestId('status')).toHaveTextContent('open');
    expect(screen.getByText('Drawer content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.getByTestId('status')).toHaveTextContent('closed');
  });
});
