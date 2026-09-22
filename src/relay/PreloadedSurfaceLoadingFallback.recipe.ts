import {cva} from 'styled-system/css';

export const preloadedSurfaceLoadingFallbackRecipe = cva({
  base: {
    w: '100%',
  },
  variants: {
    surface: {
      dialog: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minH: '240px',
      },
      drawer: {
        alignItems: 'end',
        display: 'grid',
        flex: '1 1 auto',
        gridTemplateRows: '1fr 2fr',
        justifyItems: 'center',
        minH: 0,
      },
      popover: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minH: '160px',
        minW: '280px',
      },
    },
  },
});
