import type {ReactNode} from 'react';

export interface SearchableItem<TAuxiliaryData = unknown> {
  /**
   * Custom data associated with the item.
   */
  auxiliaryData?: TAuxiliaryData;
  /**
   * Optional pre-rendered item content.
   */
  element?: ReactNode;
  /**
   * Stable unique identifier.
   */
  id: string;
  /**
   * Display text.
   */
  label: string;
}

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
