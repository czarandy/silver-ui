# Component Porting Plan

## Current silver-ui components (43)

AlertDialog, AppShell, AspectRatio, Avatar, AvatarGroup, Badge, Banner (rename to Alert), Button,
ButtonGroup, Calendar, Card, Center, CheckboxInput, DateInput, DateRangeInput,
DateTimeInput, Dialog, Divider, EmptyState, Field, FileInput, HoverCard,
InputGroup, Layout, Link, MetadataList, MobileNav, NumberInput, Popover,
RadioList (rename to RadioGroup), SideNav, Skeleton, Spinner, Stack, Switch, Text, TextArea, TextInput,
TimeInput, Toast, Tooltip, TopNav

---

## XDS components available to port

### Ported

Blockquote, Breadcrumbs, Collapsible, Combobox (Typeahead), ContextMenu,
DropdownMenu, Icon, Item, Kbd, List, MultiSelect (MultiSelector),
Pagination, Progress (ProgressBar), SearchFilterInput (PowerSearch),
SegmentedControl, Select (Selector), Slider, Stepper, Table, Tabs (TabList),
Tag (Token), TagsInput (Tokenizer), Thumbnail, ToggleButton

### Not yet ported

| Component           | Lines | Depends on             | Notes                                                         |
| ------------------- | ----- | ---------------------- | ------------------------------------------------------------- |
| Carousel            | 348   | Layer                  | Horizontal scroll with nav buttons                            |
| CheckboxList        | 213   | Field, List            | Multi-select checkbox group                                   |
| CircularProgress    | 372   | —                      | SVG ring progress indicator                                   |
| Citation            | 222   | Icon                   | Inline citation for AI/content attribution                    |
| ClickableCard       | 300   | Card                   | Interactive card with click/link support                      |
| CodeBlock           | 797   | —                      | Syntax-highlighted code display                               |
| CommandPalette      | 236   | Dialog, Combobox       | Keyboard-driven command search                                |
| FormLayout          | 167   | —                      | Form field layout container                                   |
| Grid                | 125   | —                      | CSS Grid layout helper                                        |
| IconButton          | 55    | Button                 | Icon-only button wrapper (Button with isIconOnly covers this) |
| Layer               | 63    | —                      | Provider for floating UI layer system                         |
| Markdown            | 1608  | List, Table, CodeBlock | Full markdown renderer                                        |
| MoreMenu            | 144   | DropdownMenu           | Overflow "..." menu (thin wrapper)                            |
| NavIcon             | 92    | —                      | Circular icon badge for nav                                   |
| OverflowList        | 271   | —                      | Collapses overflow items into menu                            |
| Overlay             | 142   | Layer                  | Image/content overlay with scrim                              |
| Resizable           | 557   | —                      | Drag-to-resize panels                                         |
| Section             | 315   | Layout                 | Container with background/padding                             |
| SelectableCard      | 364   | Card                   | Toggleable selection card                                     |
| StatusDot           | 184   | —                      | Small status indicator dot                                    |
| Timestamp           | 422   | Tooltip                | Formatted date/time display                                   |
| Toolbar             | 328   | —                      | Button/control container                                      |
| TreeView (TreeList) | 110   | —                      | Hierarchical expand/collapse list                             |

---

## Cross-library audit

Components present in 2+ of Mantine, Chakra, Shadcn, and MUI that silver-ui
does not yet have.

### Tier 1 — Universal (4/4 libraries)

| Component   | In XDS?                      | Effort | Why                                                                                                                                                                                                           |
| ----------- | ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select      | Yes (Selector, 956 lines)    | High   | Core form control. Every app needs a dropdown.                                                                                                                                                                |
| Tabs        | Yes (TabList, 407 lines)     | Medium | Core navigation pattern.                                                                                                                                                                                      |
| Menu        | Yes (DropdownMenu, 34 lines) | Low    | Dropdown action menus are fundamental.                                                                                                                                                                        |
| Accordion   | No                           | Medium | Most common disclosure pattern. Can build on Collapsible.                                                                                                                                                     |
| Breadcrumbs | Yes (179 lines)              | Low    | Standard navigation trail.                                                                                                                                                                                    |
| Progress    | Yes (ProgressBar, 356 lines) | Medium | Linear loading indicator.                                                                                                                                                                                     |
| Drawer      | No                           | Medium | Slide-in panel. Can build as a Dialog variant.                                                                                                                                                                |
| Combobox    | Yes (Typeahead, 429 lines)   | Medium | Search-enabled select.                                                                                                                                                                                        |
| Slider      | Yes (851 lines)              | High   | Standard range input. Complex interaction.                                                                                                                                                                    |
| Pagination  | Yes (583 lines)              | Medium | Page navigation for any list view.                                                                                                                                                                            |
| Table       | Yes (265 lines)              | Medium | Styled table primitives.                                                                                                                                                                                      |
| Alert       | No                           | Low    | Rename existing Banner to Alert. All 4 major libraries use "Alert" for this pattern, and the component already uses `role="alert"`. "Banner" implies a page-level strip, but this component works inline too. |

### Tier 2 — Very common (3/4 libraries)

| Component         | In XDS?                   | Effort | Why                                                                            |
| ----------------- | ------------------------- | ------ | ------------------------------------------------------------------------------ |
| Kbd               | Yes (175 lines)           | Low    | Keyboard shortcut visuals.                                                     |
| ScrollArea        | No                        | Medium | Custom-styled scrollbar container.                                             |
| Collapsible       | Yes (35 lines)            | Low    | Expand/collapse. Building block for Accordion.                                 |
| Carousel          | Yes (348 lines)           | Medium | Horizontal scroll with navigation.                                             |
| Chip/Tag          | Yes (Token)               | Low    | Interactive/dismissible labels. Export existing XDS Token as public component. |
| Stepper           | No                        | Medium | Multi-step wizard progress.                                                    |
| Circular Progress | Yes (372 lines)           | Medium | SVG ring progress variant.                                                     |
| Timeline          | No                        | Medium | Vertical event timeline.                                                       |
| List              | Yes (204 lines)           | Low    | Semantic list with density options.                                            |
| Pin Input         | No                        | Medium | Multi-digit verification code input.                                           |
| Rating            | No                        | Medium | Star rating input.                                                             |
| TreeView          | Yes (TreeList, 110 lines) | Low    | Hierarchical expand/collapse list.                                             |
| Grid              | Yes (125 lines)           | Low    | CSS Grid helper. May overlap with Layout.                                      |
| Container         | No                        | Low    | Max-width centered wrapper. Trivial.                                           |

### Tier 3 — Common (2/4 libraries)

| Component        | In XDS?                    | Effort | Why                                    |
| ---------------- | -------------------------- | ------ | -------------------------------------- |
| SegmentedControl | Yes (220 lines)            | Low    | Exclusive selection toggle group.      |
| ToggleButton     | Yes (246 lines)            | Low    | Pressable toggle, thin Button wrapper. |
| CodeBlock        | Yes (797 lines)            | High   | Syntax-highlighted code display.       |
| Blockquote       | Yes (118 lines)            | Low    | Styled quote element.                  |
| Resizable        | Yes (557 lines)            | High   | Draggable panel resize.                |
| Menubar          | No                         | Medium | Desktop-style menu bar.                |
| PasswordInput    | No                         | Low    | Show/hide toggle on TextInput.         |
| ColorPicker      | No                         | High   | Color selection widget.                |
| Fieldset         | No                         | Low    | Form section grouping.                 |
| TagsInput        | Yes (Tokenizer, 817 lines) | High   | Multi-value chip input.                |

---

## Recommended porting order

### Batch 1 — Core gaps (port from XDS)

1. Select (XDS: Selector)
2. Tabs (XDS: TabList)
3. Menu (XDS: DropdownMenu + ContextMenu + MoreMenu)
4. Breadcrumbs
5. Progress (ProgressBar)
6. Collapsible

### Batch 2 — Essential form & navigation

7. Combobox (XDS: Typeahead)
8. Slider
9. Pagination
10. Table

### Batch 3 — Build from scratch

11. Accordion (build on Collapsible)
12. Drawer (build on Dialog)
13. Alert (rename existing Banner)
14. Token (export existing XDS Token)

### Batch 4 — Round out the library

15. Kbd
16. SegmentedControl
17. ToggleButton
18. Circular Progress
19. List
20. Grid
21. Carousel
22. CodeBlock

### Batch 5 — Defer

23. Stepper, Timeline, Pin Input, Rating, TreeView (XDS: TreeList), ScrollArea,
    Resizable, Menubar, PasswordInput, ColorPicker, Fieldset,
    TagsInput (XDS: Tokenizer)

### Batch 6 — Large compositions (port last, depend on earlier batches)

24. MultiSelect (XDS: MultiSelector — needs Select)
25. CommandPalette (needs Dialog + Combobox)
26. FilterInput (XDS: PowerSearch — needs TagsInput + Combobox)
27. Markdown (needs List, Table, CodeBlock)
