/**
 * One documented prop of a component export.
 */
export interface PropDoc {
  /**
   * Value of the `@default` JSDoc tag, if present.
   */
  defaultValue?: string;
  description: string;
  name: string;
  required: boolean;
  /**
   * Type text as printed by the TypeScript checker (without `undefined`).
   */
  type: string;
}

/**
 * A group of props. Most components have a single group; components whose
 * props type is a discriminated union get one group per union branch, labeled
 * by the discriminant (e.g. `isIconOnly: true`).
 */
export interface PropsGroup {
  label?: string;
  props: PropDoc[];
}

/**
 * One exported component (e.g. `TopNavItem`) documented on a page.
 */
export interface ExportDoc {
  description: string;
  groups: PropsGroup[];
  name: string;
}

/**
 * The generated docs data for one component page.
 */
export interface ComponentDocData {
  category: string;
  /**
   * Lead description shown at the top of the page.
   */
  description: string;
  /**
   * All documented exports; the primary page export first.
   */
  exports: ExportDoc[];
  /**
   * Page title shown in the sidebar and heading; can differ from `name` for
   * focused or multi-component pages (e.g. `Chat Composer`, `Text & Heading`).
   */
  label: string;
  /**
   * Unique docs-page name, e.g. `DateInput` or `ChatComposer`.
   */
  name: string;
  /**
   * URL slug, e.g. `date-input`.
   */
  slug: string;
  /**
   * Source component directory, which can back multiple focused docs pages.
   */
  sourceName: string;
}
