/**
 * The sidebar taxonomy for the component docs. This is the one manual step
 * when adding a component: put its directory name (src/components/<Name>) in
 * exactly one category. The docs generator fails the build if a component is
 * missing from this map or if a name here has no matching directory.
 *
 * Categories describe what a component is for, not how it is built, and
 * mirror the README's `## Components` section — update both together.
 */
export const componentCategories: Record<string, readonly string[]> = {
  'Layout & Structure': [
    'Accordion',
    'AppShell',
    'AspectRatio',
    'Card',
    'Center',
    'Divider',
    'Layout',
    'Stack',
  ],
  Typography: ['Blockquote', 'CodeBlock', 'Kbd', 'Text'],
  Navigation: [
    'Breadcrumbs',
    'Link',
    'NavIcon',
    'Pagination',
    'SideNav',
    'Stepper',
    'Tabs',
    'TopNav',
  ],
  'Buttons & Actions': [
    'Button',
    'ButtonGroup',
    'ContextMenu',
    'DropdownMenu',
    'SegmentedControl',
    'SplitButton',
    'ToggleButton',
  ],
  Forms: [
    'AutocompleteInput',
    'CheckboxGroup',
    'CheckboxInput',
    'ColorSwatchPicker',
    'Field',
    'FileInput',
    'InputGroup',
    'MultiSelect',
    'NumberInput',
    'PasswordInput',
    'RadioGroup',
    'Rating',
    'SearchFilterInput',
    'Select',
    'Slider',
    'Switch',
    'TagsInput',
    'TextArea',
    'TextInput',
  ],
  'Dates & Time': [
    'Calendar',
    'DateInput',
    'DateRangeInput',
    'DateTimeInput',
    'Schedule',
    'TimeInput',
    'Timestamp',
  ],
  'Data Display': [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Icon',
    'Item',
    'List',
    'MetadataList',
    'Table',
    'Tag',
    'Thumbnail',
    'TreeView',
  ],
  'Chat & Messaging': ['Chat'],
  'Feedback & Status': [
    'Alert',
    'EmptyState',
    'Progress',
    'Skeleton',
    'Spinner',
    'Toast',
  ],
  Overlays: [
    'AlertDialog',
    'Dialog',
    'Drawer',
    'HoverCard',
    'Lightbox',
    'Popover',
    'Tooltip',
  ],
  Utilities: ['Theme', 'VisuallyHidden'],
};

/**
 * Display labels for pages that document more than one headline component,
 * keyed by directory name. Used as the page title, which Starlight also uses
 * as the sidebar label.
 */
export const componentPageLabels: Record<string, string> = {
  Stack: 'HStack & VStack',
  Text: 'Text & Heading',
};

/**
 * The title shown for a component page in the sidebar and page heading.
 */
export function componentPageLabel(name: string): string {
  return componentPageLabels[name] ?? name;
}

/**
 * Converts a PascalCase component name to its docs URL slug.
 */
export function componentSlug(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Finds the category for a component name, or undefined if uncategorized.
 */
export function categoryOf(name: string): string | undefined {
  for (const [category, names] of Object.entries(componentCategories)) {
    if (names.includes(name)) {
      return category;
    }
  }
  return undefined;
}

/**
 * Builds the Starlight sidebar groups for the component pages, in the order
 * the categories are declared above.
 */
export function componentSidebarGroups(): Array<{
  label: string;
  items: string[];
}> {
  return Object.entries(componentCategories).map(([category, names]) => ({
    label: category,
    items: [...names].sort().map(name => `components/${componentSlug(name)}`),
  }));
}
