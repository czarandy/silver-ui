import {render, screen} from '@testing-library/react';
import {useEffect} from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {
  useLayer,
  type LayerAlignment,
  type LayerPlacement,
} from 'internal/useLayer';

// Real-layout placement tests for `useLayer`'s CSS anchor positioning. jsdom
// cannot resolve `position-area` or `position-try-fallbacks`, so these run in
// Chromium (see the `browser` project in vitest.config.ts).

const GAP = 8;
const ANCHOR_WIDTH = 150;
const ANCHOR_HEIGHT = 80;

interface Size {
  height: number;
  width: number;
}

interface Point {
  x: number;
  y: number;
}

function LayerHarness({
  alignment,
  anchor,
  placement,
  size,
}: {
  alignment: LayerAlignment;
  anchor: Point;
  placement: LayerPlacement;
  size: Size;
}) {
  const layer = useLayer();
  const {show} = layer;
  useEffect(() => {
    show();
  }, [show]);
  const isInline = placement === 'start' || placement === 'end';
  return (
    <>
      <div
        data-testid="anchor"
        ref={layer.ref}
        style={{
          height: ANCHOR_HEIGHT,
          left: anchor.x,
          position: 'fixed',
          top: anchor.y,
          width: ANCHOR_WIDTH,
        }}
      />
      {layer.render(<div data-testid="layer-content" style={size} />, {
        alignment,
        offsetX: isInline ? GAP : undefined,
        offsetY: isInline ? undefined : GAP,
        placement,
      })}
    </>
  );
}

function renderLayer(props: {
  alignment: LayerAlignment;
  anchor: Point;
  placement: LayerPlacement;
  size: Size;
}): {anchor: DOMRect; layer: DOMRect} {
  render(<LayerHarness {...props} />);
  const content = screen.getByTestId('layer-content');
  expect(content.parentElement?.matches(':popover-open')).toBe(true);
  return {
    anchor: screen.getByTestId('anchor').getBoundingClientRect(),
    layer: content.getBoundingClientRect(),
  };
}

function overlaps(a: DOMRect, b: DOMRect): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

type Side = 'above' | 'below' | 'left' | 'right';

/**
 * Which side of the anchor the layer sits on, or `null` when it overlaps the
 * anchor on both axes.
 */
function getSide(anchor: DOMRect, layer: DOMRect): Side | null {
  if (layer.left >= anchor.right) {
    return 'right';
  }
  if (layer.right <= anchor.left) {
    return 'left';
  }
  if (layer.top >= anchor.bottom) {
    return 'below';
  }
  if (layer.bottom <= anchor.top) {
    return 'above';
  }
  return null;
}

function getGap(side: Side, anchor: DOMRect, layer: DOMRect): number {
  switch (side) {
    case 'right':
      return layer.left - anchor.right;
    case 'left':
      return anchor.left - layer.right;
    case 'below':
      return layer.top - anchor.bottom;
    case 'above':
      return anchor.top - layer.bottom;
  }
}

const PLACEMENT_SIDES: Record<LayerPlacement, [Side, Side]> = {
  above: ['above', 'below'],
  below: ['below', 'above'],
  // The document is left-to-right, so `end` is the right-hand side.
  end: ['right', 'left'],
  start: ['left', 'right'],
};

/**
 * The side the layer should use: its placement's side when there is room for
 * it and the gap there, otherwise the opposite side.
 */
function getExpectedSide(
  placement: LayerPlacement,
  anchor: Point,
  size: Size,
): Side {
  const {innerHeight, innerWidth} = window;
  const room: Record<Side, number> = {
    above: anchor.y,
    below: innerHeight - anchor.y - ANCHOR_HEIGHT,
    left: anchor.x,
    right: innerWidth - anchor.x - ANCHOR_WIDTH,
  };
  const isInline = placement === 'start' || placement === 'end';
  const needed = (isInline ? size.width : size.height) + GAP;
  const [preferred, opposite] = PLACEMENT_SIDES[placement];
  return room[preferred] >= needed ? preferred : opposite;
}

/**
 * Where the layer's edges land along the anchor edge for each alignment, when
 * that alignment fits inside the viewport; `null` when it does not.
 */
function getAlignedStart(
  alignment: LayerAlignment,
  anchorStart: number,
  anchorLength: number,
  layerLength: number,
  viewportLength: number,
): number | null {
  const start =
    alignment === 'start'
      ? anchorStart
      : alignment === 'end'
        ? anchorStart + anchorLength - layerLength
        : anchorStart + (anchorLength - layerLength) / 2;
  return start >= 0 && start + layerLength <= viewportLength ? start : null;
}

const OPPOSITE_ALIGNMENT: Record<LayerAlignment, LayerAlignment> = {
  center: 'center',
  end: 'start',
  start: 'end',
};

/**
 * The layer's expected start coordinate along the anchor edge: the requested
 * alignment when it fits, else the flipped alignment when that fits, else
 * `null` (the layer is then only required to stay in the viewport).
 */
function getExpectedAlignedStart(
  placement: LayerPlacement,
  alignment: LayerAlignment,
  anchor: Point,
  size: Size,
): number | null {
  const isInline = placement === 'start' || placement === 'end';
  const getStart = (align: LayerAlignment): number | null =>
    isInline
      ? getAlignedStart(
          align,
          anchor.y,
          ANCHOR_HEIGHT,
          size.height,
          window.innerHeight,
        )
      : getAlignedStart(
          align,
          anchor.x,
          ANCHOR_WIDTH,
          size.width,
          window.innerWidth,
        );
  return getStart(alignment) ?? getStart(OPPOSITE_ALIGNMENT[alignment]);
}

// Viewport is 1280×720 (vitest.config.ts). Anchors sit against each edge and
// in the middle of both axes.
const ANCHOR_XS = [16, 565, 1114];
const ANCHOR_YS = [16, 320, 624];
const ANCHORS: Point[] = ANCHOR_XS.flatMap(x => ANCHOR_YS.map(y => ({x, y})));

const PLACEMENTS: LayerPlacement[] = ['above', 'below', 'start', 'end'];
const ALIGNMENTS: LayerAlignment[] = ['start', 'center', 'end'];

/**
 * A small layer, which fits beside the anchor with its requested alignment
 * wherever there is room, and a large one, which is longer along the anchor
 * edge than the space on either side of any anchor in the grid. The large
 * layer fits none of the `flip-*` fallbacks, so without the span-all
 * fallbacks the browser shifts it back inside the viewport on top of the
 * anchor (the Schedule create popover bug).
 */
const SIZES: Record<'large' | 'small', Record<LayerPlacement, Size>> = {
  large: {
    above: {height: 180, width: 1000},
    below: {height: 180, width: 1000},
    end: {height: 600, width: 360},
    start: {height: 600, width: 360},
  },
  small: {
    above: {height: 120, width: 200},
    below: {height: 120, width: 200},
    end: {height: 120, width: 200},
    start: {height: 120, width: 200},
  },
};

describe('useLayer placement (browser)', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it('runs in the viewport the placement grid assumes', () => {
    expect(window.innerWidth).toBe(1280);
    expect(window.innerHeight).toBe(720);
  });

  describe.each(['small', 'large'] as const)('%s layer', sizeName => {
    describe.each(PLACEMENTS)('placement %s', placement => {
      const size = SIZES[sizeName][placement];
      describe.each(ALIGNMENTS)('alignment %s', alignment => {
        it.each(ANCHORS)(
          'beside an anchor at ($x, $y) without covering it',
          anchorPoint => {
            const {anchor, layer} = renderLayer({
              alignment,
              anchor: anchorPoint,
              placement,
              size,
            });

            expect(layer.width).toBe(size.width);
            expect(layer.height).toBe(size.height);
            expect(overlaps(anchor, layer)).toBe(false);

            const side = getExpectedSide(placement, anchorPoint, size);
            expect(getSide(anchor, layer)).toBe(side);
            expect(getGap(side, anchor, layer)).toBe(GAP);

            expect(layer.left).toBeGreaterThanOrEqual(0);
            expect(layer.top).toBeGreaterThanOrEqual(0);
            expect(layer.right).toBeLessThanOrEqual(window.innerWidth);
            expect(layer.bottom).toBeLessThanOrEqual(window.innerHeight);
          },
        );

        // Where the requested alignment (or its flip) fits, the fallbacks
        // must not give it up for a span-all position.
        const alignedCases = ANCHORS.flatMap(anchorPoint => {
          const alignedStart = getExpectedAlignedStart(
            placement,
            alignment,
            anchorPoint,
            size,
          );
          return alignedStart == null ? [] : [{...anchorPoint, alignedStart}];
        });
        it.each(alignedCases)(
          'aligns to an anchor at ($x, $y) where the alignment fits',
          ({alignedStart, x, y}) => {
            const {layer} = renderLayer({
              alignment,
              anchor: {x, y},
              placement,
              size,
            });
            const isInline = placement === 'start' || placement === 'end';
            expect(isInline ? layer.top : layer.left).toBe(alignedStart);
          },
        );
      });
    });
  });

  it('keeps a tall layer off the anchor when neither alignment fits', () => {
    // The Schedule create popover case from the bug report: a tall popover
    // beside an event low in a right-hand column. Neither side fits it
    // start-aligned (extending down) or end-aligned (extending up), and the
    // right side has no room at all.
    const {anchor, layer} = renderLayer({
      alignment: 'start',
      anchor: {x: 1073, y: 400},
      placement: 'end',
      size: {height: 546, width: 392},
    });

    expect(overlaps(anchor, layer)).toBe(false);
    expect(getSide(anchor, layer)).toBe('left');
    expect(getGap('left', anchor, layer)).toBe(GAP);
    expect(layer.top).toBeGreaterThanOrEqual(0);
    expect(layer.bottom).toBeLessThanOrEqual(window.innerHeight);
  });

  it('follows a right-to-left document for start and end', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const {anchor, layer} = renderLayer({
      alignment: 'start',
      anchor: {x: 565, y: 320},
      placement: 'end',
      size: SIZES.large.end,
    });

    expect(overlaps(anchor, layer)).toBe(false);
    expect(getSide(anchor, layer)).toBe('left');
    expect(getGap('left', anchor, layer)).toBe(GAP);
  });

  it('flips a tall layer to the start side in a right-to-left document', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const {anchor, layer} = renderLayer({
      alignment: 'start',
      anchor: {x: 16, y: 400},
      placement: 'end',
      size: SIZES.large.end,
    });

    expect(overlaps(anchor, layer)).toBe(false);
    expect(getSide(anchor, layer)).toBe('right');
    expect(getGap('right', anchor, layer)).toBe(GAP);
  });
});
