import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import type {ReactElement, ReactNode} from 'react';
import {RelayEnvironmentProvider, type EntryPointProps} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {beforeAll, describe, expect, it, vi} from 'vitest';
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
  {id: string}
>;

function TestEntryPointRoot({
  extraProps,
  props,
}: TestEntryPointProps): React.JSX.Element {
  return (
    <div>
      <span>{`${extraProps.id}:${props.label}`}</span>
      <button onClick={props.close} type="button">
        Close loaded content
      </button>
    </div>
  );
}

function createTestEntryPoint(
  importModule = vi.fn(async () => {
    await Promise.resolve();
    return {default: TestEntryPointRoot};
  }),
) {
  const getPreloadProps = vi.fn((params: TestParams) => ({
    extraProps: {id: params.id},
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
}: {
  entryPoint: TestEntryPoint;
}): ReactElement {
  const drawer = usePreloadedDrawer(entryPoint, {
    'data-testid': 'test-drawer',
    label: 'Test drawer',
    placement: 'end',
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
}: {
  entryPoint: TestEntryPoint;
}): ReactElement {
  const dialog = usePreloadedDialog(entryPoint, {label: 'Test dialog'});

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
