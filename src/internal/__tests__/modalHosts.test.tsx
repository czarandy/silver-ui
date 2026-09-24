import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {StrictMode, useState} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog/Dialog';
import {Drawer} from 'components/Drawer/Drawer';
import {Lightbox} from 'components/Lightbox/Lightbox';
import {MobileNav} from 'internal/MobileNav/MobileNav';
import {getActiveModalHost} from 'internal/modalHostStack';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';

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
      this.dispatchEvent(new Event('close'));
    },
  });
});

type Surface = 'dialog' | 'drawer' | 'lightbox' | 'mobileNav';

function ModalSurface({
  isOpen,
  onOpenChange,
  surface,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  surface: Surface;
}): React.JSX.Element {
  switch (surface) {
    case 'dialog':
      return (
        <Dialog
          data-testid="surface"
          isOpen={isOpen}
          label="Surface"
          onOpenChange={onOpenChange}>
          Content
        </Dialog>
      );
    case 'drawer':
      return (
        <Drawer
          data-testid="surface"
          isOpen={isOpen}
          label="Surface"
          onOpenChange={onOpenChange}>
          Content
        </Drawer>
      );
    case 'lightbox':
      return (
        <Lightbox
          data-testid="surface"
          isOpen={isOpen}
          media={{alt: 'Photo', src: '/photo.jpg', type: 'image'}}
          onOpenChange={onOpenChange}
        />
      );
    case 'mobileNav':
      return (
        <MobileNav
          data-testid="surface"
          header="Menu"
          isOpen={isOpen}
          onOpenChange={onOpenChange}>
          Content
        </MobileNav>
      );
  }
}

function Fixture({
  isInitiallyOpen = false,
  surface,
}: {
  isInitiallyOpen?: boolean;
  surface: Surface;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  return (
    <>
      <Button label="Open" onClick={() => setIsOpen(true)} />
      <Button label="Close surface" onClick={() => setIsOpen(false)} />
      <ModalSurface
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        surface={surface}
      />
    </>
  );
}

// Toasts render inside the active modal host so they stay operable above it;
// every surface that calls showModal() has to take part.
describe.each<Surface>(['dialog', 'drawer', 'lightbox', 'mobileNav'])(
  '%s as a modal host',
  surface => {
    it('registers while open and unregisters once closed', async () => {
      render(<Fixture surface={surface} />);
      expect(getActiveModalHost()).toBeNull();

      fireEvent.click(screen.getByRole('button', {name: 'Open'}));
      await waitFor(() =>
        expect(getActiveModalHost()).toBe(screen.getByTestId('surface')),
      );

      fireEvent.click(screen.getByRole('button', {name: 'Close surface'}));
      await waitFor(() => expect(getActiveModalHost()).toBeNull());
    });

    it('unregisters when unmounted while open', async () => {
      const {unmount} = render(<Fixture surface={surface} />);
      fireEvent.click(screen.getByRole('button', {name: 'Open'}));
      await waitFor(() => expect(getActiveModalHost()).not.toBeNull());

      unmount();
      expect(getActiveModalHost()).toBeNull();
    });

    // StrictMode re-runs effects on mount; a surface that is already open must
    // end up registered after the cleanup and second run.
    it('registers when mounted open under StrictMode', async () => {
      const {unmount} = render(
        <StrictMode>
          <Fixture isInitiallyOpen surface={surface} />
        </StrictMode>,
      );

      await waitFor(() =>
        expect(getActiveModalHost()).toBe(screen.getByTestId('surface')),
      );
      unmount();
    });
  },
);

// Content hosted in a dialog is detached with it, so it must be handed back
// within the same commit, before the browser paints.
it('unregisters an open dialog during the commit that unmounts it', async () => {
  const seenByNextLayoutEffect: (HTMLElement | null)[] = [];
  function Probe(): React.JSX.Element {
    useIsomorphicLayoutEffect(() => {
      seenByNextLayoutEffect.push(getActiveModalHost());
    }, []);
    return <span>probe</span>;
  }
  function Swap(): React.JSX.Element {
    const [isDialogShown, setIsDialogShown] = useState(true);
    return isDialogShown ? (
      <Dialog
        data-testid="surface"
        isOpen
        label="Surface"
        onOpenChange={() => {}}>
        <Button label="Replace" onClick={() => setIsDialogShown(false)} />
      </Dialog>
    ) : (
      <Probe />
    );
  }

  render(<Swap />);
  await waitFor(() =>
    expect(getActiveModalHost()).toBe(screen.getByTestId('surface')),
  );

  fireEvent.click(screen.getByRole('button', {name: 'Replace'}));
  expect(seenByNextLayoutEffect).toEqual([null]);
});

describe('nested modal hosts', () => {
  it('hands the active host back to the outer dialog when the inner closes', async () => {
    function Nested(): React.JSX.Element {
      const [isInnerOpen, setIsInnerOpen] = useState(false);
      return (
        <Dialog
          data-testid="outer"
          isOpen
          label="Outer"
          onOpenChange={() => {}}>
          <Button label="Open inner" onClick={() => setIsInnerOpen(true)} />
          <Button label="Close inner" onClick={() => setIsInnerOpen(false)} />
          <Dialog
            data-testid="inner"
            isOpen={isInnerOpen}
            label="Inner"
            onOpenChange={setIsInnerOpen}>
            Inner content
          </Dialog>
        </Dialog>
      );
    }

    render(<Nested />);
    await waitFor(() =>
      expect(getActiveModalHost()).toBe(screen.getByTestId('outer')),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Open inner'}));
    await waitFor(() =>
      expect(getActiveModalHost()).toBe(screen.getByTestId('inner')),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Close inner'}));
    await waitFor(() =>
      expect(getActiveModalHost()).toBe(screen.getByTestId('outer')),
    );
  });
});
