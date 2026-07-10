import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useEffect, useState, type ReactNode} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Dialog} from 'components/Dialog/Dialog';
import {useIsTopLayer} from 'internal/LayerContext';
import {useLayer} from 'internal/useLayer';

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
      this.setAttribute('data-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('data-open');
    },
  });
});

/**
 * `useIsTopLayer()` hands back a getter that components call from their event
 * handlers, so the probe samples it on click rather than during render.
 */
function TopLayerProbe({testId = 'probe'}: {testId?: string}) {
  const isTopLayer = useIsTopLayer();
  const [value, setValue] = useState('unsampled');

  return (
    <>
      <button
        data-testid={`${testId}-sample`}
        onClick={() => setValue(String(isTopLayer()))}
        type="button">
        sample
      </button>
      <span data-testid={testId}>{value}</span>
    </>
  );
}

async function sample(testId: string): Promise<string | null> {
  await userEvent.click(screen.getByTestId(`${testId}-sample`));
  return screen.getByTestId(testId).textContent;
}

/**
 * A layer built directly on `useLayer()` — the "custom useLayer() call" a
 * consumer of the internal hook would write.
 */
function CustomLayer({
  children,
  isEscapeDismissEnabled = false,
  isOpen = true,
  onEscape,
}: {
  children: ReactNode;
  isEscapeDismissEnabled?: boolean;
  isOpen?: boolean;
  onEscape?: () => void;
}) {
  const layer = useLayer({isEscapeDismissEnabled, onEscape});
  const {hide, show} = layer;

  useEffect(() => {
    if (isOpen) {
      show();
    } else {
      hide();
    }
  }, [hide, isOpen, show]);

  return <>{layer.render(children)}</>;
}

describe('custom useLayer() and LayerContext', () => {
  it('lets descendants act on Escape when no layer handles Escape', async () => {
    render(
      <CustomLayer>
        <TopLayerProbe />
      </CustomLayer>,
    );

    expect(await sample('probe')).toBe('true');
  });

  it('does not shadow an enclosing layer when it opts out of Escape dismissal', async () => {
    render(
      <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
        <CustomLayer>
          <TopLayerProbe />
        </CustomLayer>
      </Dialog>,
    );

    // The dialog is the topmost Escape-handling layer and the custom layer sits
    // inside it, so the probe is free to act on Escape.
    expect(await sample('probe')).toBe('true');
  });

  it('reports a layer that opted out as covered when another layer is above it', async () => {
    render(
      <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
        <CustomLayer>
          <TopLayerProbe />
        </CustomLayer>
        <CustomLayer isEscapeDismissEnabled>
          <span>above</span>
        </CustomLayer>
      </Dialog>,
    );

    // Opting out of Escape dismissal is not a blanket "true": the probe still
    // sees the Escape-handling layer stacked above it.
    expect(await sample('probe')).toBe('false');
  });

  it('reports a layer outside the topmost layer as covered', async () => {
    render(
      <>
        <CustomLayer>
          <TopLayerProbe />
        </CustomLayer>
        <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
          <span>dialog content</span>
        </Dialog>
      </>,
    );

    // The custom layer is not inside the dialog, so Escape belongs to the
    // dialog and the probe must not act on it.
    expect(await sample('probe')).toBe('false');
  });

  it('reports descendants of the topmost layer as topmost', async () => {
    render(
      <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
        <CustomLayer isEscapeDismissEnabled>
          <TopLayerProbe testId="inside" />
        </CustomLayer>
      </Dialog>,
    );

    expect(await sample('inside')).toBe('true');
  });

  it('reports the enclosing dialog as covered while a custom layer is above it', async () => {
    render(
      <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
        <TopLayerProbe testId="dialog-probe" />
        <CustomLayer isEscapeDismissEnabled>
          <span>above</span>
        </CustomLayer>
      </Dialog>,
    );

    expect(await sample('dialog-probe')).toBe('false');
  });

  it('sends Escape to a custom layer before the dialog beneath it', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
        <CustomLayer isEscapeDismissEnabled onEscape={onEscape}>
          <button type="button">Inside</button>
        </CustomLayer>
      </Dialog>,
    );

    await user.keyboard('{Escape}');

    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('returns Escape to the dialog once the custom layer closes', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    const onOpenChange = vi.fn();

    function Harness({isLayerOpen}: {isLayerOpen: boolean}) {
      return (
        <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
          <CustomLayer
            isEscapeDismissEnabled
            isOpen={isLayerOpen}
            onEscape={onEscape}>
            <button type="button">Inside</button>
          </CustomLayer>
        </Dialog>
      );
    }

    const {rerender} = render(<Harness isLayerOpen />);
    rerender(<Harness isLayerOpen={false} />);

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('ignores Escape from a custom layer while an IME composition is active', () => {
    const onEscape = vi.fn();

    render(
      <CustomLayer isEscapeDismissEnabled onEscape={onEscape}>
        <button type="button">Inside</button>
      </CustomLayer>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        isComposing: true,
        key: 'Escape',
      }),
    );

    expect(onEscape).not.toHaveBeenCalled();
  });
});
