import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {HoverCard} from 'components/HoverCard/HoverCard';
import {useHoverCard} from 'components/HoverCard/useHoverCard';
import {HoverLayerTrigger} from 'internal/HoverLayerTrigger';

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

  it('defaults an unlabelled hover card layer to role="group"', () => {
    render(<HoverCard content="Details">Hover target</HoverCard>);

    const hoverCard = screen.getByRole('group', {hidden: true});
    expect(hoverCard).toHaveTextContent('Details');
    expect(hoverCard).not.toHaveAttribute('aria-label');
    expect(
      screen.queryByRole('dialog', {hidden: true}),
    ).not.toBeInTheDocument();
  });

  it('exposes a labelled hover card layer as a named dialog', () => {
    render(
      <HoverCard content="Details" label="Account health">
        Hover target
      </HoverCard>,
    );

    const hoverCard = screen.getByRole('dialog', {hidden: true});
    expect(hoverCard).toHaveAttribute('aria-label', 'Account health');
    expect(hoverCard).toHaveTextContent('Details');
  });

  it('describes the trigger with the layer regardless of label', () => {
    render(
      <HoverCard content="Details" label="Account health">
        Hover target
      </HoverCard>,
    );

    const trigger = screen.getByText('Hover target');
    expect(trigger).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('dialog', {hidden: true}).id,
    );
  });

  it('keeps the surface background above the layer reset', () => {
    render(<HoverCard content="Details">Hover target</HoverCard>);

    const hoverCard = screen.getByRole('group', {hidden: true});
    expect(hoverCard).toHaveClass('silver-layer-reset', 'silver-bg_bg');
    expect(hoverCard).not.toHaveClass('silver-bg_transparent');
  });

  it('applies placement to the hover card layer', () => {
    render(
      <HoverCard content="Details" placement="below">
        Hover target
      </HoverCard>,
    );

    expect(screen.getByRole('group', {hidden: true})).toHaveStyle({
      positionArea: 'block-end',
    });
  });

  it('applies alignment to the hover card layer', () => {
    render(
      <HoverCard alignment="start" content="Details" placement="above">
        Hover target
      </HoverCard>,
    );

    const hoverCard = screen.getByRole('group', {hidden: true});
    const positionArea = hoverCard.style.positionArea;
    expect(positionArea).toBe('block-start span-inline-end');
  });

  it.each([
    ['start', 'silver-me_1'],
    ['end', 'silver-ms_1'],
  ] as const)(
    'uses a logical default gap for placement=%s',
    (placement, expectedClassName) => {
      render(
        <div dir="rtl">
          <HoverCard content="Details" placement={placement}>
            Hover target
          </HoverCard>
        </div>,
      );

      expect(screen.getByRole('group', {hidden: true})).toHaveClass(
        expectedClassName,
      );
    },
  );

  it('allows an explicit role to override the default', () => {
    function CustomRoleHoverCard(): React.JSX.Element {
      const hoverCard = useHoverCard();
      return (
        <HoverLayerTrigger
          describedBy={hoverCard.describedBy}
          isNonTextWrapperPropsForwarded={false}
          layer={hoverCard.renderHoverCard('Details', {role: 'tooltip'})}
          triggerRef={hoverCard.ref}>
          Hover target
        </HoverLayerTrigger>
      );
    }

    render(<CustomRoleHoverCard />);

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Details',
    );
    expect(screen.queryByRole('group', {hidden: true})).not.toBeInTheDocument();
  });

  it('lets a render-prop aria-label name the layer and win over the option', () => {
    function LabelledHoverCard(): React.JSX.Element {
      const hoverCard = useHoverCard({label: 'Option label'});
      return (
        <HoverLayerTrigger
          describedBy={hoverCard.describedBy}
          isNonTextWrapperPropsForwarded={false}
          layer={hoverCard.renderHoverCard('Details', {
            'aria-label': 'Render label',
          })}
          triggerRef={hoverCard.ref}>
          Hover target
        </HoverLayerTrigger>
      );
    }

    render(<LabelledHoverCard />);

    expect(screen.getByRole('dialog', {hidden: true})).toHaveAttribute(
      'aria-label',
      'Render label',
    );
  });
});
