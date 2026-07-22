import {act, render, screen, within} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {OverflowList, type OverflowItem} from 'components/OverflowList';
import {overflowListRecipe} from 'components/OverflowList/OverflowList.recipe';

let containerWidth = 200;
const resizeCallbacks = new Map<Element, () => void>();
const indicatorClassNames =
  overflowListRecipe().measureIndicator?.split(' ') ?? [];

class ResizeObserverStub implements ResizeObserver {
  readonly callback: ResizeObserverCallback;
  readonly targets = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  disconnect(): void {
    for (const target of this.targets) {
      resizeCallbacks.delete(target);
    }
    this.targets.clear();
  }

  observe(target: Element): void {
    this.targets.add(target);
    resizeCallbacks.set(target, () => this.callback([], this));
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
    resizeCallbacks.delete(target);
  }
}

function widthFor(element: HTMLElement): number {
  if (element.classList.contains('overflow-list-root')) {
    return containerWidth;
  }

  const ownWidth = Number(element.dataset.width);
  if (Number.isFinite(ownWidth) && ownWidth > 0) {
    return ownWidth;
  }

  if (
    indicatorClassNames.some(className => element.classList.contains(className))
  ) {
    return 20;
  }

  return 0;
}

function Item({children}: {children: string}): React.JSX.Element {
  return <span data-width="30">{children}</span>;
}

function renderOverflow(overflowItems: OverflowItem[]): React.JSX.Element {
  return <span data-width="20">+{overflowItems.length}</span>;
}

beforeEach(() => {
  containerWidth = 200;
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return widthFor(this);
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
    function (this: HTMLElement) {
      return Number(this.dataset.clientWidth) || widthFor(this);
    },
  );
});

afterEach(() => {
  resizeCallbacks.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('OverflowList', () => {
  it('measures all items in an inert mirror and reserves room for the overflow indicator', () => {
    containerWidth = 90;
    render(
      <OverflowList
        className="overflow-list-root"
        data-testid="list"
        gap={2}
        overflowRenderer={renderOverflow}
        style={{columnGap: 8}}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );

    const measure = screen.getByTestId('list-measure');
    const root = screen.getByTestId('list');
    expect(measure).toHaveAttribute('inert');
    expect(measure).toHaveTextContent('AlphaBetaGamma+3');
    expect(within(root).getByText('Alpha')).toBeVisible();
    expect(within(root).getByText('+2')).toBeVisible();
    expect(within(root).queryByText('Beta')).not.toBeInTheDocument();
    expect(within(root).queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('ignores the row gap when the column gap is zero', () => {
    containerWidth = 90;
    // Mirror real browser computed values (jsdom does not compute them): with
    // `gap: 16px 0px`, columnGap resolves to '0px' and the `gap` shorthand
    // serializes as '<row-gap> <column-gap>'. Parsing the shorthand would
    // wrongly read the 16px ROW gap as the horizontal gap.
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element, pseudo) => {
        if (
          element instanceof HTMLElement &&
          element.classList.contains('overflow-list-root')
        ) {
          const stubStyle: Partial<CSSStyleDeclaration> = {
            columnGap: '0px',
            gap: '16px 0px',
          };
          return stubStyle as CSSStyleDeclaration;
        }
        return realGetComputedStyle(element, pseudo);
      },
    );

    render(
      <OverflowList
        className="overflow-list-root"
        data-testid="list"
        overflowRenderer={renderOverflow}
        style={{gap: '16px 0px'}}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );

    const root = screen.getByTestId('list');
    expect(root).toHaveTextContent('AlphaBetaGamma');
    expect(within(root).queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('collapses items from the start', () => {
    containerWidth = 50;
    render(
      <OverflowList
        className="overflow-list-root"
        collapseFrom="start"
        data-testid="list"
        overflowRenderer={renderOverflow}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );

    const root = screen.getByTestId('list');
    expect(root).toHaveTextContent('+2Gamma');
    expect(within(root).queryByText('Alpha')).not.toBeInTheDocument();
    expect(within(root).queryByText('Beta')).not.toBeInTheDocument();
  });

  it('honors minVisibleItems when the items exceed the available width', () => {
    containerWidth = 20;
    render(
      <OverflowList
        className="overflow-list-root"
        data-testid="list"
        minVisibleItems={2}
        overflowRenderer={renderOverflow}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );

    expect(screen.getByTestId('list')).toHaveTextContent('AlphaBeta+1');
  });

  it('observes and measures the parent content box with observeParent', () => {
    containerWidth = 200;
    render(
      <div
        data-client-width="100"
        data-testid="parent"
        style={{paddingLeft: 10, paddingRight: 10}}>
        <OverflowList
          behavior="observeParent"
          className="overflow-list-root"
          data-testid="list"
          overflowRenderer={renderOverflow}>
          <Item>Alpha</Item>
          <Item>Beta</Item>
          <Item>Gamma</Item>
        </OverflowList>
      </div>,
    );

    const parent = screen.getByTestId('parent');
    const root = screen.getByTestId('list');
    expect(resizeCallbacks.has(parent)).toBe(true);
    expect(root).toHaveTextContent('AlphaBeta+1');
  });

  it('recalculates visible items when the observed element resizes', () => {
    render(
      <OverflowList
        className="overflow-list-root"
        data-testid="list"
        overflowRenderer={renderOverflow}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );
    const root = screen.getByTestId('list');
    expect(root).toHaveTextContent('AlphaBetaGamma');

    containerWidth = 50;
    act(() => {
      resizeCallbacks.get(root)?.();
    });

    expect(root).toHaveTextContent('Alpha+2');
  });

  it('re-measures when the gap token changes', () => {
    containerWidth = 100;
    // jsdom does not resolve the recipe's gap class to a computed column-gap,
    // so map the emitted class to the pixel value a browser would compute.
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element, pseudo) => {
        if (
          element instanceof HTMLElement &&
          element.classList.contains('overflow-list-root')
        ) {
          const stubStyle: Partial<CSSStyleDeclaration> = {
            columnGap: element.classList.contains('silver-gap_4')
              ? '16px'
              : '4px',
          };
          return stubStyle as CSSStyleDeclaration;
        }
        return realGetComputedStyle(element, pseudo);
      },
    );

    const {rerender} = render(
      <OverflowList className="overflow-list-root" data-testid="list" gap={4}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );
    expect(screen.getByTestId('list')).toHaveTextContent(/^AlphaBeta$/);

    rerender(
      <OverflowList className="overflow-list-root" data-testid="list" gap={1}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );
    expect(screen.getByTestId('list')).toHaveTextContent('AlphaBetaGamma');
  });

  it('applies tokenized gap styling and forwards className, style, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();
    render(
      <OverflowList
        className="overflow-list-root custom-list"
        data-testid="list"
        gap={4}
        ref={ref}
        style={{color: 'red'}}>
        <Item>Alpha</Item>
      </OverflowList>,
    );

    const root = screen.getByTestId('list');
    const measure = screen.getByTestId('list-measure');
    expect(root).toHaveClass('custom-list', 'silver-gap_4');
    expect(measure).toHaveClass('silver-gap_4');
    expect(root).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(root);
  });
});
