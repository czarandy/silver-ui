'use client';

import {
  Component,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  EntryPointContainer,
  useEntryPointLoader,
  useRelayEnvironment,
  type EnvironmentProviderOptions,
  type IEnvironmentProvider,
  type JSResourceReference,
  type PreloadedEntryPoint,
} from 'react-relay';
import {stableCopy} from 'relay-runtime';
import {Alert} from 'components/Alert';
import {Button} from 'components/Button';
import {Spinner} from 'components/Spinner';
import {VStack} from 'components/Stack';

export type EntryPointParams<TEntryPoint> = TEntryPoint extends {
  getPreloadProps: (params: infer TParams) => unknown;
}
  ? TParams extends object
    ? TParams
    : never
  : never;

type EntryPointComponentType<TEntryPoint> = TEntryPoint extends {
  root: JSResourceReference<infer TComponent>;
}
  ? TComponent
  : never;

type ComponentRuntimeProps<TComponent> =
  TComponent extends ComponentType<infer TProps>
    ? TProps extends {props: infer TRuntimeProps}
      ? TRuntimeProps
      : never
    : never;

type EntryPointRuntimeProps<TEntryPoint> = ComponentRuntimeProps<
  EntryPointComponentType<TEntryPoint>
>;

const TypedEntryPointContainer = EntryPointContainer as unknown as <TComponent>(
  props: Readonly<{
    entryPointReference: PreloadedEntryPoint<TComponent>;
    props: ComponentRuntimeProps<TComponent>;
  }>,
) => ReactElement;

const useTypedEntryPointLoader = useEntryPointLoader as unknown as <
  TEntryPoint,
>(
  environmentProvider: IEnvironmentProvider<EnvironmentProviderOptions>,
  entryPoint: TEntryPoint,
) => readonly [
  PreloadedEntryPoint<EntryPointComponentType<TEntryPoint>> | null | undefined,
  (params: EntryPointParams<TEntryPoint>) => void,
  () => void,
];

export type SurfaceRuntimeProps<TEntryPoint> = Omit<
  EntryPointRuntimeProps<TEntryPoint>,
  'close'
>;

export interface PreloadedContentOptions {
  /**
   * Content rendered when loading the EntryPoint fails.
   */
  errorFallback?: (error: Error, retry: () => void) => ReactNode;
  /**
   * Content rendered while the EntryPoint module or data is loading.
   */
  loadingFallback?: ReactNode;
}

interface PreloadedEntryPointErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, retry: () => void) => ReactNode;
  onRetry: () => void;
}

interface PreloadedEntryPointErrorBoundaryState {
  error: Error | null;
}

class PreloadedEntryPointErrorBoundary extends Component<
  PreloadedEntryPointErrorBoundaryProps,
  PreloadedEntryPointErrorBoundaryState
> {
  public state: PreloadedEntryPointErrorBoundaryState = {error: null};

  public static getDerivedStateFromError(
    error: Error,
  ): PreloadedEntryPointErrorBoundaryState {
    return {error};
  }

  private readonly retry = (): void => {
    this.props.onRetry();
    this.setState({error: null});
  };

  public render(): ReactNode {
    return this.state.error === null
      ? this.props.children
      : this.props.fallback(this.state.error, this.retry);
  }
}

function DefaultLoadingFallback(): React.JSX.Element {
  return (
    <VStack align="center" gap={3}>
      <Spinner label="Loading content" />
    </VStack>
  );
}

function defaultErrorFallback(
  _error: Error,
  retry: () => void,
): React.JSX.Element {
  return (
    <Alert
      description="Please try again."
      endContent={
        <Button label="Try again" onClick={retry} variant="secondary" />
      }
      status="error"
      title="We couldn’t load this content"
    />
  );
}

function paramsKey(params: object): string {
  return JSON.stringify(stableCopy(params));
}

function LoadedEntryPoint<TEntryPoint>({
  close,
  entryPointReference,
  runtimeProps,
}: {
  close: () => void;
  entryPointReference: PreloadedEntryPoint<
    EntryPointComponentType<TEntryPoint>
  >;
  runtimeProps: SurfaceRuntimeProps<TEntryPoint>;
}): React.JSX.Element {
  const props = {
    ...runtimeProps,
    close,
  } as unknown as ComponentRuntimeProps<EntryPointComponentType<TEntryPoint>>;

  return (
    <TypedEntryPointContainer
      entryPointReference={entryPointReference}
      props={props}
    />
  );
}

export interface PreloadedEntryPointController<TEntryPoint> {
  content: (close: () => void) => ReactNode;
  hide: () => void;
  isOpen: boolean;
  preload: (params: EntryPointParams<TEntryPoint>) => void;
  show: (
    params: EntryPointParams<TEntryPoint>,
    runtimeProps: SurfaceRuntimeProps<TEntryPoint>,
  ) => void;
}

/**
 * Owns the loading, retry, visibility, and lifetime of a Relay EntryPoint.
 */
export function usePreloadedEntryPoint<TEntryPoint>(
  entryPoint: TEntryPoint,
  {
    errorFallback = defaultErrorFallback,
    loadingFallback = <DefaultLoadingFallback />,
  }: PreloadedContentOptions = {},
): PreloadedEntryPointController<TEntryPoint> {
  const environment = useRelayEnvironment();
  const environmentProvider = useMemo(
    () => ({getEnvironment: () => environment}),
    [environment],
  );
  const [entryPointReference, loadEntryPoint] = useTypedEntryPointLoader(
    environmentProvider,
    entryPoint,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [runtimeProps, setRuntimeProps] =
    useState<SurfaceRuntimeProps<TEntryPoint> | null>(null);
  const [moduleError, setModuleError] = useState<Error | null>(null);
  const currentParamsRef = useRef<{
    value: EntryPointParams<TEntryPoint>;
  } | null>(null);
  const currentParamsKeyRef = useRef<string | null>(null);

  const monitorRootLoad = useCallback(
    (key: string): void => {
      const root = (
        entryPoint as {
          root: {load: () => Promise<unknown>};
        }
      ).root;
      void root.load().catch((error: unknown) => {
        if (currentParamsKeyRef.current === key) {
          setModuleError(
            error instanceof Error
              ? error
              : new Error('EntryPoint load failed'),
          );
        }
      });
    },
    [entryPoint],
  );

  const preload = useCallback(
    (params: EntryPointParams<TEntryPoint>): void => {
      const nextKey = paramsKey(params);
      if (currentParamsKeyRef.current === nextKey) {
        return;
      }

      currentParamsKeyRef.current = nextKey;
      currentParamsRef.current = {value: params};
      setModuleError(null);
      loadEntryPoint(params);
      monitorRootLoad(nextKey);
    },
    [loadEntryPoint, monitorRootLoad],
  );
  const show = useCallback(
    (
      params: EntryPointParams<TEntryPoint>,
      nextRuntimeProps: SurfaceRuntimeProps<TEntryPoint>,
    ): void => {
      preload(params);
      setRuntimeProps(nextRuntimeProps);
      setIsOpen(true);
    },
    [preload],
  );
  const hide = useCallback((): void => setIsOpen(false), []);
  const retry = useCallback((): void => {
    const currentParams = currentParamsRef.current;
    const currentKey = currentParamsKeyRef.current;
    if (currentParams !== null && currentKey !== null) {
      setModuleError(null);
      loadEntryPoint(currentParams.value);
      monitorRootLoad(currentKey);
    }
  }, [loadEntryPoint, monitorRootLoad]);
  const content = useCallback(
    (close: () => void): ReactNode => {
      if (entryPointReference == null || runtimeProps === null) {
        return isOpen
          ? moduleError === null
            ? loadingFallback
            : errorFallback(moduleError, retry)
          : null;
      }
      if (moduleError !== null) {
        return errorFallback(moduleError, retry);
      }

      return (
        <PreloadedEntryPointErrorBoundary
          fallback={errorFallback}
          key={currentParamsKeyRef.current}
          onRetry={retry}>
          <Suspense fallback={loadingFallback}>
            <LoadedEntryPoint<TEntryPoint>
              close={close}
              entryPointReference={entryPointReference}
              runtimeProps={runtimeProps}
            />
          </Suspense>
        </PreloadedEntryPointErrorBoundary>
      );
    },
    [
      entryPointReference,
      errorFallback,
      isOpen,
      loadingFallback,
      moduleError,
      retry,
      runtimeProps,
    ],
  );

  return {content, hide, isOpen, preload, show};
}
