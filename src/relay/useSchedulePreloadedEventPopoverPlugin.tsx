'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  loadEntryPoint,
  useRelayEnvironment,
  type EnvironmentProviderOptions,
  type IEnvironmentProvider,
} from 'react-relay';
import type {CalendarEvent} from 'components/Schedule/CalendarEvent';
import type {SchedulePlugin} from 'components/Schedule/types';
import {PreloadedSurfaceLoadingFallback} from 'relay/PreloadedSurfaceLoadingFallback';
import {
  defaultErrorFallback,
  LoadedEntryPoint,
  MAX_UNUSED_PRELOAD_AGE_MS,
  paramsKey,
  PreloadedEntryPointErrorBoundary,
  type EntryPointParams,
  type PreloadedContentOptions,
  type SurfaceRuntimeProps,
} from 'relay/usePreloadedEntryPoint';

const DEFAULT_HOVER_INTENT_MS = 100;

// The plugin mixes EntryPoints, so it cannot name one component type.
const loadAnyEntryPoint = loadEntryPoint as unknown as (
  environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
  entryPoint: object,
  params: object,
) => {dispose: () => void};

/**
 * The EntryPoint an event's popover loads, created with
 * {@link scheduleEventEntryPoint}.
 */
export interface ScheduleEventEntryPoint {
  readonly entryPoint: object;
  readonly params: object;
  readonly runtimeProps: object;
}

/**
 * Pairs an EntryPoint with its params and runtime props, type-checking them
 * against each other, for {@link useSchedulePreloadedEventPopoverPlugin}.
 */
export function scheduleEventEntryPoint<TEntryPoint extends object>(
  entryPoint: TEntryPoint,
  params: EntryPointParams<TEntryPoint>,
  runtimeProps: SurfaceRuntimeProps<TEntryPoint>,
): ScheduleEventEntryPoint {
  return {entryPoint, params, runtimeProps};
}

export interface UseSchedulePreloadedEventPopoverPluginOptions<
  TAuxiliaryData = unknown,
> extends PreloadedContentOptions {
  /**
   * When `true`, popover content receives the standard visually hidden close
   * affordance and Dialog context, so a nested `LayoutHeader` appends its
   * automatic close button.
   *
   * @default false
   */
  hasCloseButton?: boolean;
  /**
   * How long the pointer must rest on an event before its EntryPoint preloads.
   * Focus preloads immediately.
   *
   * @default 100
   */
  hoverIntentMs?: number;
  /**
   * Chooses the EntryPoint for an event, or `null` for no popover. Called while
   * rendering and on pointer intent, so it must be cheap and pure; the runtime
   * props it returns while the popover is open are the ones rendered.
   */
  resolve: (
    event: CalendarEvent<TAuxiliaryData>,
  ) => ScheduleEventEntryPoint | null;
}

interface LoadedEntry {
  readonly entryPoint: object;
  readonly error: Error | null;
  readonly generation: number;
  readonly key: string;
  readonly loadedAt: number;
  readonly params: object;
  // Rendered through `LoadedEntryPoint`, which knows the component type.
  readonly reference: {dispose: () => void};
}

interface StoreSnapshot {
  readonly open: {readonly entry: LoadedEntry; readonly eventId: string} | null;
  readonly preloaded: LoadedEntry | null;
}

const entryPointIds = new WeakMap<object, number>();
let nextEntryPointId = 0;

function entryPointKey({entryPoint, params}: ScheduleEventEntryPoint): string {
  let id = entryPointIds.get(entryPoint);
  if (id === undefined) {
    id = nextEntryPointId++;
    entryPointIds.set(entryPoint, id);
  }
  return `${id}:${paramsKey(params)}`;
}

/**
 * Holds at most two EntryPoint loads: the one rendered by the open popover and
 * the one preloaded for the event the pointer is resting on.
 */
class ScheduleEventEntryPointStore {
  private generation = 0;
  private intentTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly listeners = new Set<() => void>();
  private snapshot: StoreSnapshot = {open: null, preloaded: null};

  public constructor(
    private readonly environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
  ) {}

  public readonly getSnapshot = (): StoreSnapshot => this.snapshot;

  public readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public intend(descriptor: ScheduleEventEntryPoint, delayMs: number): void {
    this.cancelIntent();
    if (delayMs <= 0) {
      this.preload(descriptor);
      return;
    }
    this.intentTimer = setTimeout(() => {
      this.intentTimer = null;
      this.preload(descriptor);
    }, delayMs);
  }

  public cancelIntent(): void {
    if (this.intentTimer !== null) {
      clearTimeout(this.intentTimer);
      this.intentTimer = null;
    }
  }

  public show(eventId: string, descriptor: ScheduleEventEntryPoint): void {
    this.cancelIntent();
    const {open, preloaded} = this.snapshot;
    const key = entryPointKey(descriptor);
    const reusable = preloaded !== null && isReusable(preloaded, key);
    const entry = reusable
      ? preloaded
      : this.load(descriptor.entryPoint, descriptor.params, key);
    if (!reusable && preloaded !== null) {
      preloaded.reference.dispose();
    }
    open?.entry.reference.dispose();
    this.update({open: {entry, eventId}, preloaded: null});
  }

  public hide(eventId: string): void {
    const {open, preloaded} = this.snapshot;
    if (open?.eventId !== eventId) {
      return;
    }
    // Release the data so the next open reflects anything that changed.
    open.entry.reference.dispose();
    this.update({open: null, preloaded});
  }

  public readonly retry = (): void => {
    const {open, preloaded} = this.snapshot;
    if (open === null) {
      return;
    }
    open.entry.reference.dispose();
    const {entryPoint, key, params} = open.entry;
    const entry = this.load(entryPoint, params, key);
    this.update({open: {entry, eventId: open.eventId}, preloaded});
  };

  public dispose(): void {
    this.cancelIntent();
    const {open, preloaded} = this.snapshot;
    open?.entry.reference.dispose();
    preloaded?.reference.dispose();
    this.update({open: null, preloaded: null});
  }

  private preload(descriptor: ScheduleEventEntryPoint): void {
    const {open, preloaded} = this.snapshot;
    const key = entryPointKey(descriptor);
    if (
      open?.entry.key === key ||
      (preloaded !== null && isReusable(preloaded, key))
    ) {
      return;
    }
    preloaded?.reference.dispose();
    this.update({
      open,
      preloaded: this.load(descriptor.entryPoint, descriptor.params, key),
    });
  }

  private load(entryPoint: object, params: object, key: string): LoadedEntry {
    const generation = ++this.generation;
    const reference = loadAnyEntryPoint(
      this.environmentProvider,
      entryPoint,
      params,
    );
    void (entryPoint as {root: {load: () => Promise<unknown>}}).root
      .load()
      .catch((error: unknown) => {
        this.fail(
          generation,
          error instanceof Error ? error : new Error('EntryPoint load failed'),
        );
      });
    return {
      entryPoint,
      error: null,
      generation,
      key,
      loadedAt: performance.now(),
      params,
      reference,
    };
  }

  private fail(generation: number, error: Error): void {
    const {open, preloaded} = this.snapshot;
    if (open?.entry.generation === generation) {
      this.update({open: {...open, entry: {...open.entry, error}}, preloaded});
    } else if (preloaded?.generation === generation) {
      this.update({open, preloaded: {...preloaded, error}});
    }
  }

  private update(snapshot: StoreSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach(listener => listener());
  }
}

function isReusable(entry: LoadedEntry, key: string): boolean {
  return (
    entry.key === key &&
    entry.error === null &&
    performance.now() - entry.loadedAt < MAX_UNUSED_PRELOAD_AGE_MS
  );
}

interface PreloadedEventPopoverContentProps {
  close: () => void;
  errorFallback: NonNullable<PreloadedContentOptions['errorFallback']>;
  event: CalendarEvent;
  loadingFallback: ReactNode;
  resolve: (event: CalendarEvent) => ScheduleEventEntryPoint | null;
  store: ScheduleEventEntryPointStore;
}

function PreloadedEventPopoverContent({
  close,
  errorFallback,
  event,
  loadingFallback,
  resolve,
  store,
}: PreloadedEventPopoverContentProps): ReactNode {
  const {open} = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  // Popover content stays mounted after it closes; only the open one renders.
  const descriptor = open?.eventId === event.id ? resolve(event) : null;
  if (open === null || descriptor === null) {
    return null;
  }
  const {entry} = open;
  if (entry.error !== null) {
    return errorFallback(entry.error, store.retry);
  }
  return (
    <PreloadedEntryPointErrorBoundary
      fallback={errorFallback}
      key={entry.generation}
      onRetry={store.retry}>
      <Suspense fallback={loadingFallback}>
        <LoadedEntryPoint<unknown>
          close={close}
          entryPointReference={entry.reference as never}
          runtimeProps={descriptor.runtimeProps as never}
        />
      </Suspense>
    </PreloadedEntryPointErrorBoundary>
  );
}

/**
 * Schedule plugin that opens a popover backed by a Relay EntryPoint when an
 * event is clicked. The EntryPoint preloads when the pointer rests on an event
 * or it receives focus, and reloads each time the popover reopens.
 */
export function useSchedulePreloadedEventPopoverPlugin<
  TAuxiliaryData = unknown,
>({
  errorFallback = defaultErrorFallback,
  hasCloseButton = false,
  hoverIntentMs = DEFAULT_HOVER_INTENT_MS,
  loadingFallback,
  resolve,
}: UseSchedulePreloadedEventPopoverPluginOptions<TAuxiliaryData>): SchedulePlugin {
  const environment = useRelayEnvironment();
  const store = useMemo(
    () => new ScheduleEventEntryPointStore({getEnvironment: () => environment}),
    [environment],
  );
  useEffect(() => () => store.dispose(), [store]);
  const resolvedLoadingFallback = useMemo(
    (): ReactNode =>
      loadingFallback ?? <PreloadedSurfaceLoadingFallback surface="popover" />,
    [loadingFallback],
  );

  return useMemo((): SchedulePlugin => {
    const resolveEvent = resolve as (
      event: CalendarEvent,
    ) => ScheduleEventEntryPoint | null;
    const intend = (event: CalendarEvent, delayMs: number): void => {
      const descriptor = resolveEvent(event);
      if (descriptor !== null) {
        store.intend(descriptor, delayMs);
      }
    };
    return {
      eventPopoverHasCloseButton: hasCloseButton,
      getEventProps: ({event}) => ({
        onFocus: () => intend(event, 0),
        onPointerEnter: () => intend(event, hoverIntentMs),
        onPointerLeave: () => store.cancelIntent(),
      }),
      onEventPopoverHide: event => store.hide(event.id),
      onEventPopoverShow: event => {
        const descriptor = resolveEvent(event);
        if (descriptor !== null) {
          store.show(event.id, descriptor);
        }
      },
      renderEventPopover: (event, {close}) =>
        resolveEvent(event) === null ? null : (
          <PreloadedEventPopoverContent
            close={close}
            errorFallback={errorFallback}
            event={event}
            loadingFallback={resolvedLoadingFallback}
            resolve={resolveEvent}
            store={store}
          />
        ),
    };
  }, [
    errorFallback,
    hasCloseButton,
    hoverIntentMs,
    resolve,
    resolvedLoadingFallback,
    store,
  ]);
}
