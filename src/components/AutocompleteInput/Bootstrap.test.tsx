import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {AutocompleteInput} from 'components/AutocompleteInput/AutocompleteInput';
import {
  createStaticSearchSource,
  type SearchableItem,
  type SearchSource,
} from 'components/AutocompleteInput/types';
import {TagsInput} from 'components/TagsInput/TagsInput';

const items: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
];

function deferredResults() {
  let resolve: (items: SearchableItem[]) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<SearchableItem[]>(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    },
  );
  return {promise, resolve, reject};
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('popover-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('popover-open');
    },
  });
});

describe.each(['AutocompleteInput', 'TagsInput'] as const)(
  '%s bootstrap',
  component => {
    function Example({source}: {source: SearchSource}) {
      return component === 'AutocompleteInput' ? (
        <AutocompleteInput
          debounceMs={0}
          hasEntriesOnFocus
          label="Person"
          onChange={() => {}}
          searchSource={source}
          value={null}
        />
      ) : (
        <TagsInput
          debounceMs={0}
          hasEntriesOnFocus
          label="Person"
          onChange={() => {}}
          searchSource={source}
          value={[items[0]]}
        />
      );
    }

    it('commits synchronous suggestions before yielding without loading', () => {
      render(<Example source={createStaticSearchSource(items)} />);

      fireEvent.focus(screen.getByRole('combobox'));

      expect(
        screen.queryByRole('status', {name: 'Loading'}),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(
        component === 'TagsInput' ? 1 : 2,
      );
      expect(
        screen.getByRole('option', {name: 'Grace Hopper', hidden: true}),
      ).toBeInTheDocument();
    });

    it('keeps empty synchronous suggestions closed without loading', () => {
      render(<Example source={createStaticSearchSource([])} />);

      fireEvent.focus(screen.getByRole('combobox'));

      expect(
        screen.queryByRole('status', {name: 'Loading'}),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('loads even an already resolved Promise before showing suggestions', async () => {
      render(
        <Example
          source={{
            bootstrap: async () => Promise.resolve(items),
            search: () => [],
          }}
        />,
      );

      fireEvent.focus(screen.getByRole('combobox'));

      expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
      expect(
        await screen.findByRole('option', {name: 'Grace Hopper', hidden: true}),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('status', {name: 'Loading'}),
      ).not.toBeInTheDocument();
    });

    it.each(['resolve', 'reject'] as const)(
      'handles a pending Promise that will %s',
      async outcome => {
        const pending = deferredResults();
        render(
          <Example
            source={{bootstrap: async () => pending.promise, search: () => []}}
          />,
        );
        fireEvent.focus(screen.getByRole('combobox'));
        expect(
          screen.getByRole('status', {name: 'Loading'}),
        ).toBeInTheDocument();

        await act(async () => {
          if (outcome === 'resolve') {
            pending.resolve(items);
          } else {
            pending.reject(new Error('Unavailable'));
          }
          await pending.promise.catch(() => {});
        });

        expect(
          screen.queryByRole('status', {name: 'Loading'}),
        ).not.toBeInTheDocument();
        expect(screen.queryAllByRole('option', {hidden: true})).toHaveLength(
          outcome === 'resolve' ? (component === 'TagsInput' ? 1 : 2) : 0,
        );
        expect(screen.queryByText('Something went wrong') != null).toBe(
          outcome === 'reject',
        );
      },
    );

    it('handles synchronous bootstrap errors without loading', () => {
      render(
        <Example
          source={{
            bootstrap: () => {
              throw new Error('Unavailable');
            },
            search: () => [],
          }}
        />,
      );
      fireEvent.focus(screen.getByRole('combobox'));

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.queryByRole('status', {name: 'Loading'}),
      ).not.toBeInTheDocument();
    });

    it.each(['resolve', 'reject'] as const)(
      'ignores a replaced source that will %s',
      async outcome => {
        const pending = deferredResults();
        const cancel = vi.fn();
        const {rerender} = render(
          <Example
            source={{
              bootstrap: async () => pending.promise,
              cancel,
              search: () => [],
            }}
          />,
        );
        fireEvent.focus(screen.getByRole('combobox'));
        cancel.mockClear();

        rerender(<Example source={createStaticSearchSource(items)} />);
        expect(cancel).toHaveBeenCalledOnce();
        expect(
          screen.queryByRole('status', {name: 'Loading'}),
        ).not.toBeInTheDocument();
        fireEvent.focus(screen.getByRole('combobox'));

        await act(async () => {
          if (outcome === 'resolve') {
            pending.resolve([{id: 'stale', label: 'Stale result'}]);
          } else {
            pending.reject(new Error('Stale error'));
          }
          await pending.promise.catch(() => {});
        });

        expect(
          screen.getByRole('option', {name: 'Grace Hopper', hidden: true}),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('option', {name: 'Stale result', hidden: true}),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Something went wrong'),
        ).not.toBeInTheDocument();
      },
    );

    it('cancels pending bootstrap on blur and ignores its result', async () => {
      const pending = deferredResults();
      const cancel = vi.fn();
      const user = userEvent.setup();
      render(
        <Example
          source={{
            bootstrap: async () => pending.promise,
            cancel,
            search: () => [],
          }}
        />,
      );
      await user.click(screen.getByRole('combobox'));
      cancel.mockClear();

      vi.useFakeTimers();
      fireEvent.blur(screen.getByRole('combobox'));
      // The native focus check runs on the next animation frame.
      act(() => {
        screen.getByRole('combobox').blur();
        vi.runOnlyPendingTimers();
      });
      vi.useRealTimers();
      expect(cancel).toHaveBeenCalled();
      await act(async () => {
        pending.resolve(items);
        await pending.promise;
      });

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(
        screen.queryByRole('status', {name: 'Loading'}),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('option', {hidden: true}),
      ).not.toBeInTheDocument();
    });
  },
);

it('filters newly selected tags when reopening synchronous bootstrap', async () => {
  const source = createStaticSearchSource(items);
  function Example() {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <TagsInput
        hasEntriesOnFocus
        label="People"
        onChange={setValue}
        searchSource={source}
        value={value}
      />
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole('combobox'));
  await user.click(
    screen.getByRole('option', {name: 'Ada Lovelace', hidden: true}),
  );

  expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(1);
  expect(
    screen.getByRole('option', {name: 'Grace Hopper', hidden: true}),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('status', {name: 'Loading'}),
  ).not.toBeInTheDocument();
});

it('filters the latest controlled tags when pending bootstrap resolves', async () => {
  const pending = deferredResults();
  const source: SearchSource = {
    bootstrap: async () => pending.promise,
    search: () => [],
  };
  const {rerender} = render(
    <TagsInput
      hasEntriesOnFocus
      label="People"
      onChange={() => {}}
      searchSource={source}
      value={[]}
    />,
  );
  fireEvent.focus(screen.getByRole('combobox'));
  rerender(
    <TagsInput
      hasEntriesOnFocus
      label="People"
      onChange={() => {}}
      searchSource={source}
      value={[items[0]]}
    />,
  );

  await act(async () => {
    pending.resolve(items);
    await pending.promise;
  });

  expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(1);
  expect(
    screen.getByRole('option', {name: 'Grace Hopper', hidden: true}),
  ).toBeInTheDocument();
});
