import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Dialog} from 'components/Dialog/Dialog';
import {Select} from 'components/Select';

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
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('popover-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('popover-open');
    },
  });
});

describe('nested overlays', () => {
  it('keeps a dialog open while a Select option starts an async update', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    let resolveRequest: (() => void) | undefined;
    const request = new Promise<void>(resolve => {
      resolveRequest = resolve;
    });

    function TestDialog() {
      const [value, setValue] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(false);

      return (
        <Dialog isOpen label="Assignment" onOpenChange={onOpenChange}>
          <Select
            hasSearch
            label="Client"
            onChange={nextValue => {
              void (async () => {
                setValue(nextValue);
                setIsLoading(true);
                await request;
                setIsLoading(false);
              })();
            }}
            options={[{label: 'Alicia Rivera', value: 'client-1'}]}
            value={value}
          />
          {isLoading ? <span>Loading assignment</span> : null}
        </Dialog>
      );
    }

    render(<TestDialog />);

    const dialog = screen.getByRole('dialog', {name: 'Assignment'});

    await user.click(screen.getByRole('combobox', {name: 'Client'}));

    // Native popovers can render outside the dialog's border box while staying
    // in its DOM subtree. Model an option at such a coordinate: its events
    // bubble through the dialog but must not be treated as backdrop events.
    dialog.getBoundingClientRect = () => ({
      bottom: 300,
      height: 200,
      left: 100,
      right: 300,
      toJSON: () => ({}),
      top: 100,
      width: 200,
      x: 100,
      y: 100,
    });

    await user.click(screen.getByText('Alicia Rivera'));

    expect(screen.getByText('Loading assignment')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    resolveRequest?.();
    await waitFor(() => {
      expect(screen.queryByText('Loading assignment')).not.toBeInTheDocument();
    });
    expect(dialog).toHaveAttribute('open');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('dismisses only the topmost layer on Escape', async () => {
    const user = userEvent.setup();

    function TestDialog() {
      const [isOpen, setIsOpen] = useState(true);
      const [value, setValue] = useState<string | null>('Apple');
      return (
        <Dialog isOpen={isOpen} label="Preferences" onOpenChange={setIsOpen}>
          <Select
            label="Fruit"
            onChange={setValue}
            options={['Apple', 'Banana']}
            value={value}
          />
        </Dialog>
      );
    }

    render(<TestDialog />);

    const dialog = screen.getByRole('dialog', {name: 'Preferences'});
    const trigger = screen.getByRole('combobox', {name: 'Fruit'});
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).toHaveAttribute('open');

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(dialog).not.toHaveAttribute('open');
    });
  });
});
