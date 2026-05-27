# Combined Component Library Audit — TripTracker & BookTracker

Inventory of all XDS and third-party UI components used across both projects.
Useful for evaluating what a component library migration would need to cover.

Legend: **TT** = TripTracker, **BT** = BookTracker

---

## XDS Components (`@xds/core`)

### Layout & Structure

| Component            | Import Path             | Projects | Notable Features                                                                        |
| -------------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------- |
| **XDSAppShell**      | `@xds/core/AppShell`    | TT, BT   | Top-level shell; BT uses `topNav`, `mobileNav` with responsive breakpoint               |
| **XDSAspectRatio**   | `@xds/core/AspectRatio` | BT       | Fixed ratio container (used for book covers)                                            |
| **XDSCard**          | `@xds/core/Card`        | TT, BT   | `padding`, `width`, mouse event handlers; BT uses custom styles in 8+ files             |
| **XDSCenter**        | `@xds/core/Center`      | TT, BT   | Width/height constraints ("100%", "100vh"), h/v alignment                               |
| **XDSHStack**        | `@xds/core/Stack`       | TT, BT   | Horizontal stack; `gap`, `hAlign="between"`, `vAlign`; used in 10–13+ files per project |
| **XDSVStack**        | `@xds/core/Stack`       | TT, BT   | Vertical stack; same API surface as HStack                                              |
| **XDSLayout**        | `@xds/core/Layout`      | TT, BT   | Compound layout with header/content/footer slots                                        |
| **XDSLayoutHeader**  | `@xds/core/Layout`      | TT, BT   | `hasDivider` prop for visual separation                                                 |
| **XDSLayoutContent** | `@xds/core/Layout`      | TT, BT   | Scrollable content region                                                               |
| **XDSLayoutFooter**  | `@xds/core/Layout`      | TT, BT   | `hasDivider` prop                                                                       |

### Navigation

| Component                 | Import Path              | Projects | Notable Features                                                             |
| ------------------------- | ------------------------ | -------- | ---------------------------------------------------------------------------- |
| **XDSTopNav**             | `@xds/core/TopNav`       | TT, BT   | `label`, `heading`, `startContent`, `endContent` slots; BT adds icon support |
| **XDSTopNavHeading**      | `@xds/core/TopNav`       | TT, BT   | `heading`, `href`                                                            |
| **XDSTopNavItem**         | `@xds/core/TopNav`       | TT, BT   | `href`, `label`, `isSelected` for active state                               |
| **XDSLink**               | `@xds/core/Link`         | BT       | Inline links; `color: primary`, `type: large`, `weight: bold`                |
| **XDSLinkProvider**       | `@xds/core/Link`         | TT, BT   | Wraps React Router link component for XDS integration                        |
| **XDSDropdownMenu**       | `@xds/core/DropdownMenu` | BT       | Custom button trigger, divider items, disabled state                         |
| **XDSDropdownMenuOption** | `@xds/core/DropdownMenu` | BT       | Individual menu options                                                      |

### Forms & Inputs

| Component            | Import Path             | Projects | Notable Features                                                                                       |
| -------------------- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| **XDSButton**        | `@xds/core/Button`      | TT, BT   | TT: "primary", "secondary"; BT adds: "destructive", "ghost", sizes sm/lg, icon support                 |
| **XDSTextInput**     | `@xds/core/TextInput`   | TT, BT   | `type` (email, password), `placeholder`, `label`, `hasAutoFocus`, `isRequired`                         |
| **XDSNumberInput**   | `@xds/core/NumberInput` | BT       | Numeric fields (pages, publication year)                                                               |
| **XDSDateInput**     | `@xds/core/DateInput`   | BT       | Date selection with max constraint                                                                     |
| **XDSSelector**      | `@xds/core/Selector`    | TT       | Dropdown select component                                                                              |
| **XDSTokenizer**     | `@xds/core/Tokenizer`   | TT, BT   | Multi-select token input; `searchSource`, `debounceMs`; BT adds custom `renderItem`, "Create new" flow |
| **XDSRadioList**     | `@xds/core/RadioList`   | BT       | Radio group selection                                                                                  |
| **XDSRadioListItem** | `@xds/core/RadioList`   | BT       | Individual radio option (e.g., CSV/Text format)                                                        |
| **XDSField**         | `@xds/core/Field`       | BT       | Label wrapper for custom inputs                                                                        |
| **XDSPowerSearch**   | `@xds/core/PowerSearch` | BT       | Advanced filtering with `usePowerSearchConfig`, `FieldDefinition`, custom filter types, result count   |

### Data Display

| Component               | Import Path              | Projects | Notable Features                                                                                                                                                 |
| ----------------------- | ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **XDSTable**            | `@xds/core/Table`        | BT       | Sortable (`useXDSTableSortable`), paginated (`useXDSTablePagination`, `paginateData`), column sizing (`pixel`, `proportional`), density: compact, striped, hover |
| **XDSMetadataList**     | `@xds/core/MetadataList` | BT       | Label positioning and width                                                                                                                                      |
| **XDSMetadataListItem** | `@xds/core/MetadataList` | BT       | Individual metadata row                                                                                                                                          |
| **XDSToken**            | `@xds/core/Token`        | BT       | Clickable tags for genre/tag filtering; size: sm                                                                                                                 |
| **XDSAvatar**           | `@xds/core/Avatar`       | BT       | Sizes: xsmall, medium; `src`, `name` props                                                                                                                       |
| **XDSThumbnail**        | `@xds/core/Thumbnail`    | TT       | Image display; `src`, `alt`, `label`, `onClick`, custom sizing/borderRadius/outline                                                                              |

### Feedback & Overlays

| Component           | Import Path           | Projects | Notable Features                                                                      |
| ------------------- | --------------------- | -------- | ------------------------------------------------------------------------------------- |
| **XDSBanner**       | `@xds/core/Banner`    | TT, BT   | `status="error"`, `title`, `isDismissable`, `onDismiss`                               |
| **XDSSpinner**      | `@xds/core/Spinner`   | TT, BT   | `size` ("sm", "xl"); BT adds `shade: onMedia`                                         |
| **XDSDialog**       | `@xds/core/Dialog`    | TT, BT   | Modal dialog container; BT adds `purpose` (form), controlled open state, custom width |
| **XDSDialogHeader** | `@xds/core/Dialog`    | TT, BT   | Dialog title/header                                                                   |
| **XDSPopover**      | `@xds/core/Popover`   | BT       | Placement, alignment, width, close button                                             |
| **XDSHoverCard**    | `@xds/core/HoverCard` | BT       | Conditionally enabled, custom content                                                 |

### Typography & Media

| Component      | Import Path      | Projects | Notable Features                                                                 |
| -------------- | ---------------- | -------- | -------------------------------------------------------------------------------- |
| **XDSHeading** | `@xds/core/Text` | TT, BT   | Heading levels 1, 3; inline styling                                              |
| **XDSText**    | `@xds/core/Text` | TT, BT   | `type` (body, supporting), `weight` (bold), `color` (secondary), custom fontSize |
| **XDSIcon**    | `@xds/core/Icon` | BT       | Wraps Heroicons; sizes: sm, md; color: warning                                   |

### Theming & Types

| Export                | Import Path           | Projects | Notable Features                                                              |
| --------------------- | --------------------- | -------- | ----------------------------------------------------------------------------- |
| **XDSTheme**          | `@xds/core/theme`     | TT, BT   | Theme provider wrapper                                                        |
| **defineTheme**       | `@xds/core/theme`     | TT, BT   | Theme with `name` and `tokens` (CSS custom properties, e.g. `--color-accent`) |
| **XDSSearchableItem** | `@xds/core/Typeahead` | TT       | TypeScript type for searchable items (`id`, `label`, `auxiliaryData`)         |
| **XDSSearchSource**   | `@xds/core/Typeahead` | TT       | TypeScript type for search data sources                                       |
| **XDSTypeaheadItem**  | `@xds/core/Typeahead` | BT       | Custom rendered item with `auxiliaryData` in tokenizer dropdown               |

---

## Third-Party Libraries

### Lucide React (`lucide-react`) — TT only

| Icon           | Used In                | Context          |
| -------------- | ---------------------- | ---------------- |
| `Plus`         | `AddTripButton.tsx`    | Add action       |
| `Pencil`       | `EditTripButton.tsx`   | Edit action      |
| `Trash2`       | `DeleteTripButton.tsx` | Delete action    |
| `Calendar`     | `TripCard.tsx`         | Date display     |
| `MapPin`       | `TripCard.tsx`         | Location display |
| `CloudUpload`  | `ImageUpload.tsx`      | Upload prompt    |
| `GripVertical` | `ImageUpload.tsx`      | Drag handle      |

Icons typically sized at 16px for inline use.

### Heroicons (`@heroicons/react`) — BT only

| Icon                  | Variant         | Used In                              | Context                       |
| --------------------- | --------------- | ------------------------------------ | ----------------------------- |
| `PlusIcon`            | outline         | `AddModalButton.tsx`                 | Add book button               |
| `StarIcon`            | outline + solid | `AdjustableRating.tsx`, `Rating.tsx` | Star rating (filled vs empty) |
| `MagnifyingGlassIcon` | outline         | `Books.tsx`                          | Search icon in PowerSearch    |

### React Simple Maps (`react-simple-maps`) — TT only

| Component       | Used In       | Notable Features                                        |
| --------------- | ------------- | ------------------------------------------------------- |
| `ComposableMap` | `MapView.tsx` | `width`, `height`, `projection`, `projectionConfig`     |
| `Geographies`   | `MapView.tsx` | Renders country shapes from TopoJSON                    |
| `Geography`     | `MapView.tsx` | Fill/stroke styling, hover states, mouse event handlers |
| `Marker`        | `MapPin.tsx`  | Positioned markers with coordinates                     |

Custom type definitions in `src/react-simple-maps.d.ts`.

### Recharts (`recharts`) — BT only

| Component             | Used In      | Notable Features                                      |
| --------------------- | ------------ | ----------------------------------------------------- |
| `BarChart`            | `Charts.tsx` | Genre and ratings distribution                        |
| `ScatterChart`        | `Charts.tsx` | Publication year vs. date read plot                   |
| `Bar`                 | `Charts.tsx` | Click handlers for filter navigation, cursor: pointer |
| `Scatter`             | `Charts.tsx` | Custom tooltip with book details                      |
| `CartesianGrid`       | `Charts.tsx` | Grid lines                                            |
| `XAxis`, `YAxis`      | `Charts.tsx` | Custom `tickFormatter`, domain config                 |
| `Tooltip`             | `Charts.tsx` | Custom `ScatterTooltip` renderer                      |
| `Cell`                | `Charts.tsx` | Per-cell color styling                                |
| `ResponsiveContainer` | `Charts.tsx` | Responsive width/height wrapper                       |

### heic-to (`heic-to`) — TT only

Utility library (not a UI component) for converting HEIC images to JPEG/PNG. Used in image upload pipeline.

---

## Summary

| Category               | TripTracker           | BookTracker   | Combined Unique |
| ---------------------- | --------------------- | ------------- | --------------- |
| XDS components/exports | 22                    | 31            | 39              |
| Icon library icons     | 7 (Lucide)            | 3 (Heroicons) | 10              |
| Charting components    | —                     | 9 (Recharts)  | 9               |
| Map components         | 4 (React Simple Maps) | —             | 4               |
| Non-UI utilities       | 1 (heic-to)           | —             | 1               |

### Most-Used XDS Components (across both projects)

| Component             | Total File Count |
| --------------------- | ---------------- |
| XDSHStack / XDSVStack | 23+ files        |
| XDSCenter             | 13+ files        |
| XDSCard               | 12+ files        |
| XDSBanner             | 10+ files        |
| XDSButton             | 10+ files        |
| XDSLayout family      | 8+ files         |
| XDSDialog             | 5+ files         |

### Key Migration Considerations

- **Stack layout system** is the most pervasive pattern — any replacement must have strong flex stack primitives
- **Theming via CSS custom properties** — replacement must support token-based theming
- **Compound Layout + Dialog composition** — dialogs compose with Layout header/content/footer, not standalone
- **Table with sort + pagination hooks** (`useXDSTableSortable`, `useXDSTablePagination`) — need equivalent hooks or built-in table features
- **PowerSearch with field definitions** — specialized advanced filter component, hard to replace 1:1
- **Tokenizer with async search and custom rendering** — not all libraries offer this
- **LinkProvider** integration with React Router — replacement needs a router adapter pattern
- **Two different icon libraries** (Lucide in TT, Heroicons in BT) — migration is an opportunity to consolidate
- **Charting (Recharts) and Maps (React Simple Maps)** are independent of XDS and can remain as-is
