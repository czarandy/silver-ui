import {act, render, screen, within} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {OverflowList, type OverflowItem} from 'components/OverflowList';
import {createResizeObserverStub} from 'internal/testHelpers';

let containerWidth = 200;
const resizeObserver = createResizeObserverStub();

function widthFor(element: HTMLElement): number {
  // The visible row every test renders with data-testid="list" takes the
  // test-controlled container width.
  if (element.dataset.testid === 'list') {
    return containerWidth;
  }

  const ownWidth = Number(element.dataset.width);
  if (Number.isFinite(ownWidth) && ownWidth > 0) {
    return ownWidth;
  }

  // Wrapper elements (like the measure row's indicator wrapper) take the
  // width their content declares.
  // eslint-disable-next-line testing-library/no-node-access -- width mock inspects raw DOM structure
  const inner = element.querySelector('[data-width]');
  if (inner != null) {
    return Number(inner.getAttribute('data-width')) || 0;
  }

  return 0;
}

function Item({children}: {children: string}): React.JSX.Element {
  return <span data-width="30">{children}</span>;
}

function renderOverflow(overflowItems: OverflowItem[]): React.JSX.Element {
  return <span data-width="20">+{overflowItems.length}</span>;
}

function NullItem(): React.JSX.Element | null {
  return null;
}

beforeEach(() => {
  containerWidth = 200;
  vi.stubGlobal('ResizeObserver', resizeObserver.ResizeObserverStub);
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
  resizeObserver.reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('OverflowList', () => {
  it('measures all items in an inert mirror and reserves room for the overflow indicator', () => {
    containerWidth = 90;
    render(
      <OverflowList
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
          element.dataset.testid === 'list'
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

  it('keeps measurement aligned when a child renders no DOM element', () => {
    containerWidth = 70;
    render(
      <OverflowList data-testid="list" overflowRenderer={renderOverflow}>
        <Item>Alpha</Item>
        <NullItem />
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );

    // The null-rendering child occupies a zero-width slot; the indicator is
    // still recognized as the indicator and reserves its width.
    const root = screen.getByTestId('list');
    expect(root).toHaveTextContent('Alpha+2');
    expect(within(root).queryByText('Beta')).not.toBeInTheDocument();
    expect(within(root).queryByText('Gamma')).not.toBeInTheDocument();
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
    expect(resizeObserver.isObserved(parent)).toBe(true);
    expect(root).toHaveTextContent('AlphaBeta+1');
  });

  it('recalculates visible items when the observed element resizes', () => {
    render(
      <OverflowList data-testid="list" overflowRenderer={renderOverflow}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );
    const root = screen.getByTestId('list');
    expect(root).toHaveTextContent('AlphaBetaGamma');

    containerWidth = 50;
    act(() => {
      resizeObserver.resize(root);
    });

    expect(root).toHaveTextContent('Alpha+2');
  });

  it('recalculates when the measured content changes size', () => {
    const {rerender} = render(
      <OverflowList data-testid="list" overflowRenderer={renderOverflow}>
        {['Alpha', 'Beta', 'Gamma'].map(label => (
          <span data-width="30" key={label}>
            {label}
          </span>
        ))}
      </OverflowList>,
    );
    const root = screen.getByTestId('list');
    const measure = screen.getByTestId('list-measure');
    expect(resizeObserver.isObserved(measure)).toBe(true);
    expect(root).toHaveTextContent('AlphaBetaGamma');

    rerender(
      <OverflowList data-testid="list" overflowRenderer={renderOverflow}>
        {['Alpha', 'Beta', 'Gamma'].map(label => (
          <span data-width="90" key={label}>
            {label}
          </span>
        ))}
      </OverflowList>,
    );
    // The item count is unchanged, so only the measure row growing (as in a
    // browser when labels lengthen or a font loads) reports the change.
    act(() => {
      resizeObserver.resize(measure);
    });

    expect(root).toHaveTextContent('AlphaBeta+1');
  });

  it('recovers when the container grows after collapsing in observeParent mode', () => {
    containerWidth = 60;
    render(
      <div data-client-width="100" data-testid="parent">
        <OverflowList
          behavior="observeParent"
          data-testid="list"
          overflowRenderer={renderOverflow}>
          <Item>Alpha</Item>
          <Item>Beta</Item>
          <Item>Gamma</Item>
        </OverflowList>
      </div>,
    );

    // The flex-shrunk container clamps the available width below the
    // parent's 100px content box.
    const root = screen.getByTestId('list');
    expect(root).toHaveTextContent('Alpha+2');
    expect(resizeObserver.isObserved(root)).toBe(true);

    // Collapsing applies fillsParent (flex: 1 1 0), growing the container
    // while the parent stays the same size — only the container's own
    // resize reports the freed space.
    containerWidth = 100;
    act(() => {
      resizeObserver.resize(root);
    });

    expect(root).toHaveTextContent('AlphaBetaGamma');
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
          element.dataset.testid === 'list'
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
      <OverflowList data-testid="list" gap={4}>
        <Item>Alpha</Item>
        <Item>Beta</Item>
        <Item>Gamma</Item>
      </OverflowList>,
    );
    expect(screen.getByTestId('list')).toHaveTextContent(/^AlphaBeta$/);

    rerender(
      <OverflowList data-testid="list" gap={1}>
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
        className="custom-list"
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

  it('forwards unrecognized HTML attributes to the visible row', () => {
    const onClick = vi.fn();
    render(
      <OverflowList
        aria-label="Selected teams"
        data-testid="list"
        id="team-list"
        onClick={onClick}>
        <Item>Alpha</Item>
      </OverflowList>,
    );

    const root = screen.getByTestId('list');
    expect(root).toHaveAttribute('aria-label', 'Selected teams');
    expect(root).toHaveAttribute('id', 'team-list');
    root.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    const measure = screen.getByTestId('list-measure');
    expect(measure).not.toHaveAttribute('aria-label');
    expect(measure).not.toHaveAttribute('id');
  });
});
