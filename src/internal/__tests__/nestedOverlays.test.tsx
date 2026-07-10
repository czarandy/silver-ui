import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';
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
