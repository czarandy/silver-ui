import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
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
import {Tab, Tabs} from 'components/Tabs';
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

  it('applies the gap class for the given gap value', () => {
    render(
      <Toolbar
        data-testid="toolbar"
        gap={10}
        label="Actions"
        startContent={<Button label="Save" />}
      />,
    );

    expect(screen.getByTestId('toolbar')).toHaveClass('silver-gap_10');
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

    it('follows visual arrow direction in an RTL layout', async () => {
      const user = userEvent.setup();
      render(
        <div dir="rtl">
          <Toolbar
            label="Actions"
            startContent={
              <>
                <Button label="One" />
                <Button label="Two" />
                <Button label="Three" />
              </>
            }
          />
        </div>,
      );

      screen.getByRole('button', {name: 'Two'}).focus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', {name: 'Three'})).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();
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

    it('moves one step when a nested Tabs handles the arrow key', async () => {
      function TabsToolbar(): React.JSX.Element {
        const [tab, setTab] = useState('overview');
        return (
          <Toolbar
            endContent={<Button label="Save" />}
            label="Actions"
            startContent={
              <Tabs label="Sections" onChange={setTab} value={tab}>
                <Tab label="Overview" value="overview" />
                <Tab label="Analytics" value="analytics" />
                <Tab label="Settings" value="settings" />
              </Tabs>
            }
          />
        );
      }
      const user = userEvent.setup();
      render(<TabsToolbar />);

      screen.getByRole('tab', {name: 'Overview'}).focus();
      await user.keyboard('{ArrowRight}');

      // Tabs consumed the key and moved to the next tab; the toolbar must not
      // move focus a second step (to Settings or the Save button).
      expect(screen.getByRole('tab', {name: 'Analytics'})).toHaveFocus();
      expect(screen.getByRole('tab', {name: 'Analytics'})).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('does not make a composite child wrapper the tab stop', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          endContent={<Button label="Save" />}
          label="Actions"
          startContent={
            <Tabs label="Sections" onChange={() => {}} value="overview">
              <Tab label="Overview" value="overview" />
              <Tab label="Analytics" value="analytics" />
            </Tabs>
          }
        />,
      );

      // The tablist container is focusable (tabIndex={-1}) but is not a
      // toolbar item; its tabs are.
      expect(screen.getByRole('tablist', {name: 'Sections'})).toHaveAttribute(
        'tabindex',
        '-1',
      );

      await user.tab();
      expect(screen.getByRole('tab', {name: 'Overview'})).toHaveFocus();
    });

    it('manages items when the toolbar itself is inside a popover', async () => {
      const user = userEvent.setup();
      render(
        // jsdom's UA stylesheet hides closed popovers; the inline display
        // keeps the content queryable while the `[popover]` ancestor stays.
        <div popover="manual" style={{display: 'block'}}>
          <Toolbar
            label="Actions"
            startContent={
              <>
                <Button label="One" />
                <Button label="Two" />
              </>
            }
          />
        </div>,
      );

      expect(screen.getByRole('button', {name: 'One'})).toHaveAttribute(
        'tabindex',
        '0',
      );
      expect(screen.getByRole('button', {name: 'Two'})).toHaveAttribute(
        'tabindex',
        '-1',
      );

      screen.getByRole('button', {name: 'One'}).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();
    });

    it('still excludes items inside a child popover', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <div popover="auto">
                <button type="button">Inside popover</button>
              </div>
              <Button label="Two" />
            </>
          }
        />,
      );

      screen.getByRole('button', {name: 'One'}).focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();
    });

    it('keeps a single tab stop when a nested Tabs selection changes programmatically', async () => {
      function TabsToolbar({value}: {value: string}): React.JSX.Element {
        return (
          <Toolbar
            endContent={<Button label="Save" />}
            label="Actions"
            startContent={
              <Tabs label="Sections" onChange={() => {}} value={value}>
                <Tab label="Overview" value="overview" />
                <Tab label="Analytics" value="analytics" />
              </Tabs>
            }
          />
        );
      }
      const view = render(<TabsToolbar value="overview" />);

      screen.getByRole('button', {name: 'Save'}).focus();
      expect(screen.getByRole('button', {name: 'Save'})).toHaveAttribute(
        'tabindex',
        '0',
      );

      // A selection change makes React write tabIndex={0} on the newly
      // selected tab; the toolbar must reconcile it back to a single stop.
      view.rerender(<TabsToolbar value="analytics" />);

      await waitFor(() => {
        expect(screen.getByRole('tab', {name: 'Analytics'})).toHaveAttribute(
          'tabindex',
          '-1',
        );
      });
      expect(screen.getByRole('button', {name: 'Save'})).toHaveAttribute(
        'tabindex',
        '0',
      );
    });

    it('skips aria-disabled items', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          label="Actions"
          startContent={
            <>
              <Button label="One" />
              <button aria-disabled="true" type="button">
                Blocked
              </button>
              <Button label="Two" />
            </>
          }
        />,
      );

      screen.getByRole('button', {name: 'One'}).focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();
    });

    it('does not move focus when a child prevented the arrow key default', async () => {
      const user = userEvent.setup();
      render(
        <Toolbar
          endContent={<Button label="Save" />}
          label="Actions"
          startContent={
            <button onKeyDown={event => event.preventDefault()} type="button">
              Widget
            </button>
          }
        />,
      );

      screen.getByRole('button', {name: 'Widget'}).focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('button', {name: 'Widget'})).toHaveFocus();
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

    it('cascades size to Tabs', () => {
      render(
        <>
          <Toolbar
            label="Actions"
            size="sm"
            startContent={
              <Tabs label="Sections" onChange={() => {}} value="overview">
                <Tab
                  data-testid="ambient-tab"
                  label="Overview"
                  value="overview"
                />
              </Tabs>
            }
          />
          <Tabs label="Explicit" onChange={() => {}} size="sm" value="overview">
            <Tab data-testid="explicit-tab" label="Overview" value="overview" />
          </Tabs>
        </>,
      );

      expect(screen.getByTestId('ambient-tab')).toHaveAttribute(
        'class',
        screen.getByTestId('explicit-tab').getAttribute('class') ?? '',
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

    it('shows a single hint when a nested composite mounts its own', () => {
      shim.setFocusVisible(true);
      const view = render(
        <Toolbar
          endContent={<Button label="Save" />}
          label="Actions"
          startContent={
            <Tabs label="Sections" onChange={() => {}} value="overview">
              <Tab label="Overview" value="overview" />
              <Tab label="Analytics" value="analytics" />
            </Tabs>
          }
        />,
      );

      // One focus event reaches both the Tabs hint and the Toolbar hint.
      fireEvent.focus(screen.getByRole('tab', {name: 'Overview'}));

      const hintLayers = Array.from(
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the hint is aria-hidden, so it cannot be reached by role or text
        view.container.querySelectorAll<HTMLElement>('[popover="manual"]'),
      );
      expect(hintLayers.filter(shim.isPopoverOpen)).toHaveLength(1);
    });
  });
});
