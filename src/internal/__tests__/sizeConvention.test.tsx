import {render, screen} from '@testing-library/react';
import type {ReactElement} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {AlertDialog} from 'components/AlertDialog';
import {Button} from 'components/Button';
import {Center} from 'components/Center';
import {CheckboxInput} from 'components/CheckboxInput';
import {CircularProgress} from 'components/CircularProgress';
import {CodeBlock} from 'components/CodeBlock';
import {Dialog} from 'components/Dialog';
import {Divider} from 'components/Divider';
import {Item} from 'components/Item';
import {LayoutFooter, LayoutHeader, LayoutPanel} from 'components/Layout';
import {Skeleton} from 'components/Skeleton';
import {Slider} from 'components/Slider';
import {HStack, VStack} from 'components/Stack';
import type {WidthValue} from 'internal/toPixelSize';

/**
 * Every public size prop resolves through the shared `toPixelSize` helper, so
 * they all behave identically: numbers become pixels, strings pass through
 * as-is, unit-less numeric strings are corrected with a dev warning, and
 * `'full'` (only where the prop advertises it) fills the container.
 *
 * This suite is the guard against that convention drifting again — a component
 * that reintroduces a local size formatter, or that invents its own meaning
 * for a value, fails here. Add an entry whenever a size prop is added.
 */
interface SizeCase {
  /**
   * CSS property the prop feeds.
   */
  property: '--circular-progress-size' | 'width' | 'height';
  /**
   * Renders the component with the size prop under test.
   */
  render: (size: WidthValue) => ReactElement;
  /**
   * Whether the prop additionally accepts `'full'`.
   */
  supportsFull?: boolean;
  /**
   * Locates the element the size lands on. Defaults to `[data-testid="size"]`.
   */
  target?: () => HTMLElement;
}

beforeAll(() => {
  // jsdom does not implement the modal dialog methods the overlays call.
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

afterEach(() => {
  vi.restoreAllMocks();
});

function byTestId(): HTMLElement {
  return screen.getByTestId('size');
}

/**
 * The width lands on the inner `Item`, not on the input that owns the roles
 * and test IDs, so walk up to the row element.
 */
function checkboxItem(): HTMLElement {
  // eslint-disable-next-line testing-library/no-node-access
  const item = screen.getByRole('checkbox').closest('div');
  if (item == null) {
    throw new Error('CheckboxInput did not render an item');
  }
  return item;
}

const cases: Record<string, SizeCase> = {
  'Button width': {
    property: 'width',
    render: size => <Button data-testid="size" label="Save" width={size} />,
    supportsFull: true,
  },
  'Center height': {
    property: 'height',
    render: size => (
      <Center data-testid="size" height={size}>
        content
      </Center>
    ),
  },
  'Center width': {
    property: 'width',
    render: size => (
      <Center data-testid="size" width={size}>
        content
      </Center>
    ),
  },
  'CheckboxInput width': {
    property: 'width',
    render: size => (
      <CheckboxInput label="Notify me" onChange={() => {}} value width={size} />
    ),
    supportsFull: true,
    target: checkboxItem,
  },
  'CircularProgress size': {
    property: '--circular-progress-size',
    render: size => (
      <CircularProgress data-testid="size" label="Progress" size={size} />
    ),
  },
  'CodeBlock width': {
    property: 'width',
    render: size => (
      <CodeBlock code="const a = 1;" data-testid="size" width={size} />
    ),
  },
  'Dialog width': {
    property: 'width',
    render: size => (
      <Dialog
        data-testid="size"
        isOpen
        label="Settings"
        onOpenChange={() => {}}
        width={size}>
        body
      </Dialog>
    ),
  },
  'Divider width': {
    property: 'width',
    render: size => <Divider data-testid="size" width={size} />,
  },
  'HStack width': {
    property: 'width',
    render: size => (
      <HStack data-testid="size" width={size}>
        content
      </HStack>
    ),
  },
  'Item width': {
    property: 'width',
    render: size => <Item data-testid="size" label="Row" width={size} />,
    supportsFull: true,
  },
  'LayoutFooter height': {
    property: 'height',
    render: size => <LayoutFooter data-testid="size" height={size} />,
  },
  'LayoutHeader height': {
    property: 'height',
    render: size => (
      <LayoutHeader data-testid="size" height={size} title="Title" />
    ),
  },
  'LayoutPanel width': {
    property: 'width',
    render: size => (
      <LayoutPanel data-testid="size" width={size}>
        content
      </LayoutPanel>
    ),
  },
  'Skeleton height': {
    property: 'height',
    render: size => <Skeleton data-testid="size" height={size} />,
  },
  'Skeleton width': {
    property: 'width',
    render: size => <Skeleton data-testid="size" width={size} />,
  },
  'Slider width': {
    property: 'width',
    render: size => (
      <Slider
        data-testid="size"
        label="Volume"
        onChange={() => {}}
        value={50}
        width={size}
      />
    ),
  },
  'VStack height': {
    property: 'height',
    render: size => (
      <VStack data-testid="size" height={size}>
        content
      </VStack>
    ),
  },
};

const entries = Object.entries(cases);

describe.each(entries)('%s', (name, sizeCase) => {
  const {property, render: renderCase} = sizeCase;
  const target = sizeCase.target ?? byTestId;

  it('treats numbers as pixels', () => {
    render(renderCase(220));

    expect(target()).toHaveStyle({[property]: '220px'});
  });

  it('passes strings with units through unchanged', () => {
    render(renderCase('18rem'));

    expect(target()).toHaveStyle({[property]: '18rem'});
  });

  it('corrects unit-less numeric strings and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(renderCase('220'));

    expect(target()).toHaveStyle({[property]: '220px'});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('has no unit'));
  });
});

describe.each(entries.filter(([, {supportsFull}]) => supportsFull === true))(
  "%s with 'full'",
  (name, {property, render: renderCase, target = byTestId}) => {
    it('fills the container', () => {
      render(renderCase('full'));

      expect(target()).toHaveStyle({[property]: '100%'});
    });
  },
);

describe.each(entries.filter(([, {supportsFull}]) => supportsFull !== true))(
  "%s with 'full'",
  (name, {property, render: renderCase, target = byTestId}) => {
    it('does not invent a meaning for a keyword it never advertised', () => {
      render(renderCase('full'));

      expect(target()).not.toHaveStyle({[property]: '100%'});
    });
  },
);

describe('AlertDialog width', () => {
  it('forwards the shared convention to its Dialog', () => {
    render(
      <AlertDialog
        actionLabel="Delete"
        description="This cannot be undone."
        isOpen
        onAction={() => {}}
        onOpenChange={() => {}}
        title="Delete file"
        width={220}
      />,
    );

    expect(screen.getByRole('alertdialog')).toHaveStyle({width: '220px'});
  });
});
