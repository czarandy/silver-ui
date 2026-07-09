/**
 * The sidebar taxonomy for the component docs. This is the one manual step
 * when adding a component: put its directory name (src/components/<Name>) in
 * exactly one category. The docs generator fails the build if a component is
 * missing from this map or if a name here has no matching directory.
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
  Navigation: [
    'Breadcrumbs',
    'Link',
    'NavIcon',
    'Pagination',
    'SideNav',
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
  'Data Display': [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Blockquote',
    'CodeBlock',
    'Icon',
    'Item',
    'Kbd',
    'Lightbox',
    'List',
    'MetadataList',
    'Table',
    'Tag',
    'Text',
    'Thumbnail',
    'Timestamp',
    'TreeView',
  ],
  Forms: [
    'AutocompleteInput',
    'CheckboxGroup',
    'CheckboxInput',
    'DateInput',
    'DateRangeInput',
    'DateTimeInput',
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
    'TimeInput',
  ],
  'Feedback & Status': [
    'Alert',
    'EmptyState',
    'Progress',
    'Skeleton',
    'Spinner',
    'Stepper',
    'Toast',
  ],
  Overlays: [
    'AlertDialog',
    'Dialog',
    'Drawer',
    'HoverCard',
    'Popover',
    'Tooltip',
  ],
  Composite: ['Calendar', 'Schedule'],
  Theming: ['Theme'],
  Accessibility: ['VisuallyHidden'],
};

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
