import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe for the schedule shell: the root wrapper, the frame/header layout
 * rendered by `ScheduleFrame`, and the bordered `surface` shared by every view.
 */
export const scheduleRecipe = sva({
  slots: [
    'root',
    'frame',
    'header',
    'headerSlotStart',
    'headerSlotCenter',
    'headerSlotEnd',
    'headerTitleContent',
    'surface',
  ],
  base: {
    root: {
      color: 'fg',
      fontFamily: 'body',
      w: 'full',
    },
    frame: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3',
      w: 'full',
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: '3',
    },
    headerSlotStart: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '2',
    },
    headerSlotCenter: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2',
      textAlign: 'center',
    },
    headerSlotEnd: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '2',
    },
    headerTitleContent: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2',
    },
    surface: {
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border',
      borderRadius: 'md',
      overflow: 'hidden',
      bg: 'bg',
    },
  },
});

export type ScheduleVariants = RecipeVariantProps<typeof scheduleRecipe>;
