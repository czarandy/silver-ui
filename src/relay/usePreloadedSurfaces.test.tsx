import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import type {ReactElement, ReactNode} from 'react';
import {RelayEnvironmentProvider, type EntryPointProps} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Layout, LayoutContent, LayoutHeader} from 'components/Layout';
import {preloadedSurfaceLoadingFallbackRecipe} from 'relay/PreloadedSurfaceLoadingFallback.recipe';
import {createJSResourceReference} from 'relay/createJSResourceReference';
import {usePreloadedDialog} from 'relay/usePreloadedDialog';
import {usePreloadedDrawer} from 'relay/usePreloadedDrawer';
import {usePreloadedHoverCard} from 'relay/usePreloadedHoverCard';
import {usePreloadedPopover} from 'relay/usePreloadedPopover';

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

interface TestParams {
  filters?: {active: boolean; role: string};
  id: string;
}

interface TestRuntimeProps {
  close: () => void;
  label: string;
}

type TestEntryPointProps = EntryPointProps<
  Record<string, never>,
  Record<string, never>,
  TestRuntimeProps,
  {id: string; loadCount: number}
>;

function TestEntryPointRoot({
  extraProps,
  props,
}: TestEntryPointProps): React.JSX.Element {
  return (
    <div>
      <span>{`${extraProps.id}:${props.label}`}</span>
      <span>EntryPoint load: {extraProps.loadCount}</span>
      <button onClick={props.close} type="button">
        Close loaded content
      </button>
    </div>
  );
}

function GuardedTestEntryPointRoot({
  extraProps,
  props,
}: TestEntryPointProps): React.JSX.Element {
  return (
    <Layout
      content={
        <LayoutContent>
          <span>{`${extraProps.id}:${props.label}`}</span>
          <button onClick={props.close} type="button">
            Close loaded content
          </button>
        </LayoutContent>
      }
      header={<LayoutHeader title="Guarded content" />}
    />
  );
}

function createTestEntryPoint(
  importModule = vi.fn(async () => {
    await Promise.resolve();
    return {default: TestEntryPointRoot};
  }),
) {
  let loadCount = 0;
  const getPreloadProps = vi.fn((params: TestParams) => ({
    extraProps: {id: params.id, loadCount: ++loadCount},
  }));

  return {
    entryPoint: {
      getPreloadProps,
      root: createJSResourceReference('TestEntryPointRoot', importModule),
    },
    getPreloadProps,
    importModule,
  };
}

type TestEntryPoint = ReturnType<typeof createTestEntryPoint>['entryPoint'];

const alphaParams: TestParams = {
  filters: {active: true, role: 'provider'},
  id: 'alpha',
};

function createEnvironment(): Environment {
  return new Environment({
    network: Network.create(async () => {
      await Promise.resolve();
      return {data: {}};
    }),
    store: new Store(new RecordSource()),
  });
}

function renderWithRelay(children: ReactNode): ReturnType<typeof render> {
  return render(
    <RelayEnvironmentProvider environment={createEnvironment()}>
      {children}
    </RelayEnvironmentProvider>,
  );
}

function DrawerFixture({
  entryPoint,
  onBeforeHide,
}: {
  entryPoint: TestEntryPoint;
  onBeforeHide?: () => boolean;
}): ReactElement {
  const drawer = usePreloadedDrawer(entryPoint, {
    'data-testid': 'test-drawer',
    label: 'Test drawer',
    placement: 'end',
    onBeforeHide,
    size: 420,
  });

  return (
    <>
      <button
        onClick={() =>
          drawer.show(
            {
              filters: {role: 'provider', active: true},
              id: 'alpha',
            },
            {label: 'drawer'},
          )
        }
        type="button">
        Show drawer
      </button>
      <button onClick={() => drawer.preload(alphaParams)} type="button">
        Preload drawer
      </button>
      {drawer.element}
    </>
  );
}

function DialogFixture({
  entryPoint,
  onBeforeHide,
}: {
  entryPoint: TestEntryPoint;
  onBeforeHide?: () => boolean;
}): ReactElement {
  const dialog = usePreloadedDialog(entryPoint, {
    label: 'Test dialog',
    onBeforeHide,
  });

  return (
    <>
      <button
        onClick={() => dialog.show(alphaParams, {label: 'dialog'})}
        type="button">
        Show dialog
      </button>
      {dialog.element}
    </>
  );
}

function PopoverFixture({
  entryPoint,
}: {
  entryPoint: TestEntryPoint;
}): ReactElement {
  const popover = usePreloadedPopover(entryPoint, {label: 'Test popover'});

  return (
    <>
      <button
        {...popover.triggerProps}
        onClick={() => popover.show(alphaParams, {label: 'popover'})}
        onPointerEnter={() => popover.preload(alphaParams)}
        ref={popover.triggerRef}
        type="button">
        Show popover
      </button>
      {popover.element}
    </>
  );
}

function HoverCardFixture({
  entryPoint,
}: {
  entryPoint: TestEntryPoint;
}): ReactElement {
  const hoverCard = usePreloadedHoverCard(entryPoint, {
    delay: 0,
    entryPointParams: alphaParams,
    label: 'Test hover card',
    runtimeProps: {label: 'hover card'},
  });

  return (
    <>
      <button {...hoverCard.triggerProps} type="button">
        Show hover card
      </button>
      {hoverCard.element}
    </>
  );
}

describe('preloaded Relay surfaces', () => {
  it('shows a loading fallback, renders a drawer, and closes loaded content', async () => {
    let resolveModule:
      ((module: {default: typeof TestEntryPointRoot}) => void) | undefined;
    const importModule = vi.fn(async () => {
      await Promise.resolve();
      return new Promise<{default: typeof TestEntryPointRoot}>(resolve => {
        resolveModule = resolve;
      });
    });
    const {entryPoint, getPreloadProps} = createTestEntryPoint(importModule);
    renderWithRelay(<DrawerFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));

    expect(screen.getByTestId('test-drawer')).toBeVisible();
    const loadingFallback = screen.getByLabelText('Loading...');
    expect(loadingFallback).toBeVisible();
    expect(screen.getByTestId('preloaded-drawer-loading')).toHaveClass(
      preloadedSurfaceLoadingFallbackRecipe({surface: 'drawer'}),
    );
    expect(getPreloadProps).toHaveBeenCalledOnce();

    await act(async () => {
      await Promise.resolve();
      resolveModule?.({default: TestEntryPointRoot});
      await Promise.resolve();
    });

    expect(await screen.findByText('alpha:drawer')).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name: 'Close loaded content'}));
    await waitFor(() =>
      expect(screen.getByTestId('test-drawer')).not.toHaveAttribute('open'),
    );
  });

  it('deduplicates equivalent preload parameters', () => {
    const importModule = vi.fn(
      async (): Promise<{default: typeof TestEntryPointRoot}> => {
        await new Promise(() => {});
        return {default: TestEntryPointRoot};
      },
    );
    const {entryPoint, getPreloadProps} = createTestEntryPoint(importModule);
    renderWithRelay(<DrawerFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Preload drawer'}));
    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));

    expect(getPreloadProps).toHaveBeenCalledOnce();
  });

  it('loads again when a drawer reopens with the same parameters', async () => {
    const {entryPoint, getPreloadProps} = createTestEntryPoint();
    await entryPoint.root.load();
    renderWithRelay(<DrawerFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));
    expect(await screen.findByText('alpha:drawer')).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name: 'Close loaded content'}));
    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));

    expect(getPreloadProps).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('EntryPoint load: 2')).toBeVisible();
  });

  it('refreshes on intent after hide, then reuses that load on show', async () => {
    const {entryPoint, getPreloadProps} = createTestEntryPoint();
    await entryPoint.root.load();
    renderWithRelay(<DrawerFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Preload drawer'}));
    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));
    expect(await screen.findByText('alpha:drawer')).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name: 'Close loaded content'}));
    fireEvent.click(screen.getByRole('button', {name: 'Preload drawer'}));
    fireEvent.click(screen.getByRole('button', {name: 'Preload drawer'}));
    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));

    expect(getPreloadProps).toHaveBeenCalledTimes(2);
  });

  it('refreshes a long-unused preload before the first show', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(0);
    try {
      const {entryPoint, getPreloadProps} = createTestEntryPoint();
      renderWithRelay(<DrawerFixture entryPoint={entryPoint} />);

      fireEvent.click(screen.getByRole('button', {name: 'Preload drawer'}));
      now.mockReturnValue(30_000);
      fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));

      expect(getPreloadProps).toHaveBeenCalledTimes(2);
    } finally {
      now.mockRestore();
    }
  });

  it('renders the error fallback and retries a failed module import', async () => {
    const importModule = vi
      .fn<() => Promise<{default: typeof TestEntryPointRoot}>>()
      .mockRejectedValueOnce(new Error('chunk failed'))
      .mockResolvedValueOnce({default: TestEntryPointRoot});
    const {entryPoint} = createTestEntryPoint(importModule);
    renderWithRelay(<DrawerFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Try again',
      }),
    );

    expect(await screen.findByText('alpha:drawer')).toBeVisible();
    expect(importModule).toHaveBeenCalledTimes(2);
  });

  it('calls onBeforeHide once per user dismiss of a drawer', async () => {
    const {entryPoint} = createTestEntryPoint(
      vi.fn(async () => {
        await Promise.resolve();
        return {default: GuardedTestEntryPointRoot};
      }),
    );
    const onBeforeHide = vi.fn(() => false);
    renderWithRelay(
      <DrawerFixture entryPoint={entryPoint} onBeforeHide={onBeforeHide} />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));
    expect(await screen.findByText('alpha:drawer')).toBeVisible();
    const drawer = screen.getByTestId('test-drawer');

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onBeforeHide).toHaveBeenCalledTimes(1);
    expect(drawer).toHaveAttribute('open');

    // jsdom has no layout, so a zero-size rect puts any positive point on the
    // backdrop.
    fireEvent.pointerDown(drawer, {clientX: 5, clientY: 5});
    fireEvent.click(drawer, {clientX: 5, clientY: 5, detail: 1});
    expect(onBeforeHide).toHaveBeenCalledTimes(2);
    expect(drawer).toHaveAttribute('open');

    fireEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(onBeforeHide).toHaveBeenCalledTimes(3);
    expect(drawer).toHaveAttribute('open');

    onBeforeHide.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(onBeforeHide).toHaveBeenCalledTimes(4);
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
  });

  it('closes a drawer programmatically without calling onBeforeHide', async () => {
    const {entryPoint} = createTestEntryPoint();
    await entryPoint.root.load();
    const onBeforeHide = vi.fn(() => false);
    renderWithRelay(
      <DrawerFixture entryPoint={entryPoint} onBeforeHide={onBeforeHide} />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show drawer'}));
    expect(await screen.findByText('alpha:drawer')).toBeVisible();
    fireEvent.click(screen.getByRole('button', {name: 'Close loaded content'}));

    expect(onBeforeHide).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByTestId('test-drawer')).not.toHaveAttribute('open'),
    );
  });

  it('lets onBeforeHide veto hiding a preloaded dialog', async () => {
    const {entryPoint} = createTestEntryPoint();
    await entryPoint.root.load();
    const onBeforeHide = vi.fn(() => false);
    renderWithRelay(
      <DialogFixture entryPoint={entryPoint} onBeforeHide={onBeforeHide} />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show dialog'}));
    expect(await screen.findByText('alpha:dialog')).toBeVisible();
    const dialog = screen.getByRole('dialog', {name: 'Test dialog'});

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onBeforeHide).toHaveBeenCalledTimes(1);
    expect(dialog).toHaveAttribute('open');

    onBeforeHide.mockReturnValue(true);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onBeforeHide).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  });

  it('renders a preloaded dialog', async () => {
    const {entryPoint} = createTestEntryPoint();
    await entryPoint.root.load();
    renderWithRelay(<DialogFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show dialog'}));

    expect(await screen.findByText('alpha:dialog')).toBeVisible();
    expect(screen.getByRole('dialog', {name: 'Test dialog'})).toBeVisible();
  });

  it('gives the dialog loading fallback a stable height', () => {
    const {entryPoint} = createTestEntryPoint(
      vi.fn(async () => {
        await Promise.resolve();
        return new Promise<{default: typeof TestEntryPointRoot}>(() => {});
      }),
    );
    renderWithRelay(<DialogFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show dialog'}));

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('preloaded-dialog-loading')).toHaveClass(
      preloadedSurfaceLoadingFallbackRecipe({surface: 'dialog'}),
    );
  });

  it('renders a preloaded popover', async () => {
    const {entryPoint} = createTestEntryPoint();
    await entryPoint.root.load();
    renderWithRelay(<PopoverFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show popover'}));

    expect(await screen.findByText('alpha:popover')).toBeInTheDocument();
    expect(screen.getByRole('dialog', {hidden: true})).toHaveAttribute(
      'aria-label',
      'Test popover',
    );
  });

  it('refreshes a popover on the next intent after close', async () => {
    const {entryPoint, getPreloadProps} = createTestEntryPoint();
    await entryPoint.root.load();
    renderWithRelay(<PopoverFixture entryPoint={entryPoint} />);
    const trigger = screen.getByRole('button', {name: 'Show popover'});

    fireEvent.pointerEnter(trigger);
    fireEvent.click(trigger);
    expect(await screen.findByText('EntryPoint load: 1')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {hidden: true, name: 'Close loaded content'}),
    );
    fireEvent.pointerEnter(trigger);
    fireEvent.click(trigger);

    expect(getPreloadProps).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('EntryPoint load: 2')).toBeInTheDocument();
  });

  it('gives the popover loading fallback stable dimensions', () => {
    const {entryPoint} = createTestEntryPoint(
      vi.fn(async () => {
        await Promise.resolve();
        return new Promise<{default: typeof TestEntryPointRoot}>(() => {});
      }),
    );
    renderWithRelay(<PopoverFixture entryPoint={entryPoint} />);

    fireEvent.click(screen.getByRole('button', {name: 'Show popover'}));

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('preloaded-popover-loading')).toHaveClass(
      preloadedSurfaceLoadingFallbackRecipe({surface: 'popover'}),
    );
  });

  it('preloads on hover intent and renders a hover card', async () => {
    const {entryPoint, getPreloadProps} = createTestEntryPoint();
    await entryPoint.root.load();
    renderWithRelay(<HoverCardFixture entryPoint={entryPoint} />);
    const trigger = screen.getByRole('button', {name: 'Show hover card'});

    fireEvent.pointerEnter(trigger);
    expect(getPreloadProps).toHaveBeenCalledOnce();

    fireEvent.mouseEnter(trigger);

    expect(await screen.findByText('alpha:hover card')).toBeInTheDocument();
    expect(screen.getByRole('dialog', {hidden: true})).toHaveAttribute(
      'aria-label',
      'Test hover card',
    );
  });
});
