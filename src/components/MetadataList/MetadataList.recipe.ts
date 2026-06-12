import {sva, type RecipeVariantProps} from 'styled-system/css';

export const metadataListRecipe = sva({
  slots: ['root', 'title', 'dl', 'item', 'label', 'value'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      mb: '3',
    },
    dl: {
      m: 0,
      p: 0,
      display: 'grid',
    },
    label: {
      color: 'fg.muted',
      fontSize: 'md',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      m: 0,
      minH: '6',
    },
    value: {
      color: 'fg',
      fontSize: 'md',
      m: 0,
      minH: '6',
      overflowWrap: 'break-word',
    },
  },
  variants: {
    // Orientation of each label relative to its value. The parent sets the `dl`
    // grid layout while each item sets its own wrapper display; both read the
    // same value via MetadataListContext so the two stay in sync.
    labelPosition: {
      start: {
        dl: {
          gridTemplateColumns: 'auto 1fr',
          rowGap: '3',
          columnGap: '4',
          alignItems: 'start',
        },
        item: {
          display: 'contents',
        },
      },
      top: {
        dl: {
          gridTemplateColumns: '1fr',
          gap: '3',
        },
        item: {
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5',
        },
      },
    },
    // Renders only the icon in the label slot (the label text is kept available
    // to assistive technology via VisuallyHidden in MetadataListItem).
    isIconOnly: {
      true: {
        label: {
          paddingBlockStart: '2px',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    labelPosition: 'start',
    isIconOnly: false,
  },
});

export type MetadataListVariants = RecipeVariantProps<
  typeof metadataListRecipe
>;
