import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {Button} from 'components/Button';
import {ButtonGroup} from 'components/ButtonGroup';
import {
  SegmentedControl,
  SegmentedControlItem,
} from 'components/SegmentedControl';
import {Select} from 'components/Select';
import {TextInput} from 'components/TextInput';
import {Toolbar} from 'components/Toolbar/Toolbar';
import {assertNonNull, createPopoverFocusShim} from 'internal/testHelpers';

const shim = createPopoverFocusShim();

beforeAll(shim.install);
afterAll(shim.uninstall);
beforeEach(() => {
  shim.reset();
  // Most tests focus items directly, which in a real browser is not
  // focus-visible. Default to pointer modality and opt in where the hint is
  // under test.
  shim.setFocusVisible(false);
});

describe('Toolbar', () => {
  it('renders a labelled toolbar with orientation', () => {
    render(<Toolbar label="Actions" startContent={<Button label="Save" />} />);

    const toolbar = screen.getByRole('toolbar', {name: 'Actions'});
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders start, center, and end content', () => {
    render(
      <Toolbar
        centerContent={<span>Center</span>}
        endContent={<Button label="End" />}
        label="Actions"
        startContent={<Button label="Start" />}
      />,
    );

    expect(screen.getByRole('button', {name: 'Start'})).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'End'})).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Toolbar
        className="custom-toolbar"
        data-testid="toolbar"
        label="Actions"
        ref={ref}
        startContent={<Button label="Save" />}
        style={{marginTop: 4}}
      />,
    );

    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toHaveClass('custom-toolbar');
    expect(toolbar).toHaveStyle({marginTop: '4px'});
    expect(ref).toHaveBeenCalledWith(toolbar);
  });

  describe('roving tabindex', () => {
    it('makes the first item the only tab stop', () => {
      render(
        <Toolbar
          endContent={<Button label="Three" />}
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <Button label="Two" />
            </>
          }
        />,
      );

      expect(screen.getByRole('button', {name: 'One'})).toHaveAttribute(
        'tabindex',
        '0',
      );
      expect(screen.getByRole('button', {name: 'Two'})).toHaveAttribute(
        'tabindex',
        '-1',
      );
      expect(screen.getByRole('button', {name: 'Three'})).toHaveAttribute(
        'tabindex',
        '-1',
      );
    });

    it('moves focus with arrow keys, wrapping at the ends', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          endContent={<Button label="Three" />}
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <Button label="Two" />
            </>
          }
        />,
      );

      await user.tab();
      expect(screen.getByRole('button', {name: 'One'})).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'Three'})).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'One'})).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', {name: 'Three'})).toHaveFocus();
    });

    it('jumps to either end with Home and End', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <Button label="Two" />
              <Button label="Three" />
            </>
          }
        />,
      );

      await user.tab();
      await user.keyboard('{End}');
      expect(screen.getByRole('button', {name: 'Three'})).toHaveFocus();

      await user.keyboard('{Home}');
      expect(screen.getByRole('button', {name: 'One'})).toHaveFocus();
    });

    it('navigates with up and down arrows when vertical', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          label="Actions"
          orientation="vertical"
          startContent={
            <>
              <Button label="One" />
              <Button label="Two" />
            </>
          }
        />,
      );

      expect(screen.getByRole('toolbar', {name: 'Actions'})).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('button', {name: 'One'})).toHaveFocus();
    });

    it('skips disabled items', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <Button isDisabled label="Two" />
              <Button label="Three" />
            </>
          }
        />,
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'Three'})).toHaveFocus();
    });

    it('keeps the last focused item as the tab stop', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Toolbar
            label="Actions"
            startContent={
              <>
                <Button label="One" />
                <Button label="Two" />
              </>
            }
          />
          <button type="button">After</button>
        </>,
      );

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', {name: 'After'})).toHaveFocus();

      await user.tab({shift: true});
      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();
    });

    it('applies the roving tab stop to items added after mount', async () => {
      const {rerender} = render(
        <Toolbar label="Actions" startContent={<Button label="One" />} />,
      );

      rerender(
        <Toolbar
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <Button label="Two" />
            </>
          }
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', {name: 'Two'})).toHaveAttribute(
          'tabindex',
          '-1',
        );
      });
      expect(screen.getByRole('button', {name: 'One'})).toHaveAttribute(
        'tabindex',
        '0',
      );
    });

    it('leaves arrow keys to text inputs inside the toolbar', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          endContent={<Button label="Save" />}
          label="Actions"
          startContent={
            <TextInput label="Search" onChange={() => {}} value="query" />
          }
        />,
      );

      await user.click(screen.getByRole('textbox', {name: 'Search'}));
      await user.keyboard('{ArrowRight}{ArrowLeft}{Home}{End}');

      expect(screen.getByRole('textbox', {name: 'Search'})).toHaveFocus();
    });
  });

  describe('size cascading', () => {
    it('cascades size to child Buttons', () => {
      render(
        <Toolbar
          label="Actions"
          size="lg"
          startContent={<Button label="Save" />}
        />,
      );

      expect(screen.getByRole('button', {name: 'Save'})).toHaveClass(
        'silver-h_component.lg',
      );
    });

    it('lets a child override the toolbar size', () => {
      render(
        <Toolbar
          label="Actions"
          size="lg"
          startContent={<Button label="Save" size="sm" />}
        />,
      );

      expect(screen.getByRole('button', {name: 'Save'})).toHaveClass(
        'silver-h_component.sm',
      );
    });

    it('cascades size through ButtonGroup', () => {
      render(
        <Toolbar
          label="Actions"
          size="sm"
          startContent={
            <ButtonGroup label="Clipboard">
              <Button label="Copy" />
            </ButtonGroup>
          }
        />,
      );

      expect(screen.getByRole('button', {name: 'Copy'})).toHaveClass(
        'silver-h_component.sm',
      );
    });

    it('cascades size to SegmentedControl', () => {
      render(
        <Toolbar
          label="Actions"
          size="sm"
          startContent={
            <SegmentedControl label="View" onChange={() => {}} value="list">
              <SegmentedControlItem label="List" value="list" />
              <SegmentedControlItem label="Grid" value="grid" />
            </SegmentedControl>
          }
        />,
      );

      expect(screen.getByRole('radiogroup', {name: 'View'})).toHaveClass(
        'silver-h_component.sm',
      );
    });

    it('cascades size to TextInput and Select', () => {
      const view = render(
        <Toolbar
          endContent={
            <Select
              label="Status"
              onChange={() => {}}
              options={[{label: 'Open', value: 'open'}]}
              value="open"
            />
          }
          label="Actions"
          size="lg"
          startContent={
            <TextInput label="Search" onChange={() => {}} value="" />
          }
        />,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the size lands on styled wrapper divs with no roles of their own
      const sizedWrappers = view.container.querySelectorAll(
        '.silver-min-h_component\\.lg',
      );
      expect(sizedWrappers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('keyboard navigation hint', () => {
    it('shows an arrow-key hint on keyboard focus', () => {
      shim.setFocusVisible(true);
      const view = render(
        <Toolbar label="Actions" startContent={<Button label="Save" />} />,
      );
      assertNonNull(
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the hint is aria-hidden, so it cannot be reached by role or text
        view.container.querySelector<HTMLElement>('[popover="manual"]'),
        'hint layer should be rendered',
      );

      fireEvent.focus(screen.getByRole('button', {name: 'Save'}));

      expect(shim.showPopover).toHaveBeenCalledTimes(1);
    });

    it('does not show the hint on pointer focus', () => {
      render(
        <Toolbar label="Actions" startContent={<Button label="Save" />} />,
      );

      fireEvent.focus(screen.getByRole('button', {name: 'Save'}));

      expect(shim.showPopover).not.toHaveBeenCalled();
    });
  });
});
