import type {ReactNode} from 'react';

/**
 * A search result item with a fully custom pre-rendered element. When
 * `element` is set, `AutocompleteInputItem` renders it directly — props
 * like `icon`, `description`, and `className` do not apply.
 */
export interface CustomSearchableItem<TAuxiliaryData = unknown> {
  /**
   * Custom data associated with the item.
   */
  auxiliaryData?: TAuxiliaryData;
  /**
   * Pre-rendered item content. When set, `AutocompleteInputItem` renders
   * this element directly and ignores layout props like `icon` and
   * `description`.
   */
  element: ReactNode;
  /**
   * Stable unique identifier.
   */
  id: string;
  /**
   * Display text used for the selected-value tag chip.
   */
  label: string;
}

/**
 * A search result item rendered by the default `AutocompleteInputItem`
 * layout with an optional icon and description.
 */
export interface StandardSearchableItem<TAuxiliaryData = unknown> {
  /**
   * Custom data associated with the item.
   */
  auxiliaryData?: TAuxiliaryData;
  /**
   * Must be omitted to use the standard layout. Set `element` on a
   * {@link CustomSearchableItem} for fully custom rendering.
   */
  element?: undefined;
  /**
   * Stable unique identifier.
   */
  id: string;
  /**
   * Display text.
   */
  label: string;
}

/**
 * A search result item. Items without `element` use the default
 * `AutocompleteInputItem` layout; items with `element` render fully
 * custom content.
 */
export type SearchableItem<TAuxiliaryData = unknown> =
  | CustomSearchableItem<TAuxiliaryData>
  | StandardSearchableItem<TAuxiliaryData>;

export interface SearchSource<T extends SearchableItem = SearchableItem> {
  /**
   * Return initial items, usually recent or common selections.
   */
  bootstrap(): Promise<T[]> | T[];
  /**
   * Optional cancellation for in-flight async searches.
   */
  cancel?(): void;
  /**
   * Return items matching the query.
   */
  search(query: string): Promise<T[]> | T[];
}

export interface CreateStaticSourceOptions<
  T extends SearchableItem = SearchableItem,
> {
  /**
   * Extra searchable terms for each item.
   */
  keywords?: (item: T) => string[];
}

export function createStaticSource<T extends SearchableItem>(
  items: T[],
  options?: CreateStaticSourceOptions<T>,
): SearchSource<T> {
  return {
    bootstrap: () => items,
    search(query) {
      const normalizedQuery = query.trim().toLowerCase();
      if (normalizedQuery === '') {
        return items;
      }

      return items.filter(item => {
        if (item.label.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        return (
          options
            ?.keywords?.(item)
            .some(keyword => keyword.toLowerCase().includes(normalizedQuery)) ??
          false
        );
      });
    },
  };
}
