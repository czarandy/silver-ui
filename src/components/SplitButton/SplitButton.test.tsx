import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Copy} from 'lucide-react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {DropdownMenuItem} from 'components/DropdownMenu';
import {SplitButton} from 'components/SplitButton/SplitButton';

beforeAll(() => {
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

describe('SplitButton', () => {
  it('renders the two halves inside a labelled group', () => {
    render(<SplitButton items={[{label: 'Save a copy'}]} label="Save" />);

    expect(screen.getByRole('group', {name: 'Save'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'More actions'}),
    ).toBeInTheDocument();
  });

  it('fires the primary action without opening the menu', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SplitButton
        items={[{icon: Copy, label: 'Save a copy'}]}
        label="Save"
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Save'}));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', {name: 'More actions'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens the menu from the toggle and fires item handlers', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SplitButton
        items={[{icon: Copy, label: 'Save a copy', onClick: onSelect}]}
        label="Save"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'More actions'}));
    await user.click(screen.getByText('Save a copy'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('supports compound children', async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();

    render(
      <SplitButton label="Save">
        <DropdownMenuItem label="Save and archive" onClick={onArchive} />
      </SplitButton>,
    );

    await user.click(screen.getByRole('button', {name: 'More actions'}));
    await user.click(screen.getByText('Save and archive'));
    expect(onArchive).toHaveBeenCalled();
  });

  it('disables both the primary action and the menu toggle', () => {
    render(
      <SplitButton isDisabled items={[{label: 'Save a copy'}]} label="Save" />,
    );

    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'More actions'})).toBeDisabled();
  });

  it('propagates size to both buttons', () => {
    render(
      <SplitButton items={[{label: 'Save a copy'}]} label="Save" size="lg" />,
    );

    expect(screen.getByRole('button', {name: 'Save'})).toHaveClass(
      'silver-h_component.lg',
    );
    expect(screen.getByRole('button', {name: 'More actions'})).toHaveClass(
      'silver-h_component.lg',
    );
  });
});
