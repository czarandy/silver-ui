import {sva, type RecipeVariantProps} from 'styled-system/css';

const THUMB_SIZE = 20;
const TRACK_SIZE = 4;

export const sliderRecipe = sva({
  slots: [
    'field',
    'filledTrack',
    'mark',
    'markLabel',
    'marksContainer',
    'row',
    'textValue',
    'thumb',
    'track',
    'trackContainer',
  ],
  base: {
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
    },
    trackContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      isolation: 'isolate',
      touchAction: 'none',
      userSelect: 'none',
    },
    track: {
      position: 'absolute',
      bg: 'track',
      borderRadius: 'full',
    },
    filledTrack: {
      position: 'absolute',
      bg: 'primary',
      borderRadius: 'full',
    },
    thumb: {
      position: 'absolute',
      zIndex: 1,
      w: `${THUMB_SIZE}px`,
      h: `${THUMB_SIZE}px`,
      borderRadius: 'full',
      bg: 'primary',
      cursor: 'grab',
      outline: 'none',
      transform: 'translate(-50%, -50%)',
      transitionDuration: 'fast',
      transitionProperty: 'background-color, box-shadow',
      transitionTimingFunction: 'default',
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
      _hover: {
        '@media (hover: hover)': {
          bg: 'primary.emphasized',
        },
      },
    },
    marksContainer: {
      position: 'absolute',
    },
    mark: {
      position: 'absolute',
      bg: 'border.emphasized',
      borderRadius: 'full',
    },
    markLabel: {
      position: 'absolute',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'xs',
      whiteSpace: 'nowrap',
    },
    textValue: {
      flexShrink: 0,
      color: 'fg',
      fontFamily: 'body',
      fontSize: 'sm',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    orientation: {
      horizontal: {
        trackContainer: {
          w: 'full',
          h: `${THUMB_SIZE}px`,
          flexGrow: 1,
          cursor: 'pointer',
        },
        track: {
          insetInline: 0,
          top: '50%',
          h: `${TRACK_SIZE}px`,
          transform: 'translateY(-50%)',
        },
        filledTrack: {
          top: '50%',
          h: `${TRACK_SIZE}px`,
          transform: 'translateY(-50%)',
        },
        thumb: {
          top: '50%',
        },
        marksContainer: {
          insetInline: 0,
          top: '50%',
        },
        mark: {
          w: '0.5',
          h: '2',
          transform: 'translate(-50%, -50%)',
        },
        markLabel: {
          top: `${THUMB_SIZE / 2 + 4}px`,
          transform: 'translateX(-50%)',
        },
      },
      vertical: {
        field: {
          alignItems: 'center',
          w: 'fit-content',
        },
        row: {
          flexDirection: 'column',
          alignItems: 'center',
        },
        trackContainer: {
          w: `${THUMB_SIZE}px`,
          h: '40',
          flexDirection: 'column',
          justifyContent: 'center',
          cursor: 'pointer',
        },
        track: {
          insetBlock: 0,
          left: '50%',
          w: `${TRACK_SIZE}px`,
          transform: 'translateX(-50%)',
        },
        filledTrack: {
          left: '50%',
          w: `${TRACK_SIZE}px`,
          transform: 'translateX(-50%)',
        },
        thumb: {
          left: '50%',
          transform: 'translate(-50%, 50%)',
        },
        marksContainer: {
          insetBlock: 0,
          left: '50%',
        },
        mark: {
          w: '2',
          h: '0.5',
          transform: 'translate(-50%, 50%)',
        },
        markLabel: {
          left: `${THUMB_SIZE / 2 + 4}px`,
          transform: 'translateY(50%)',
        },
      },
    },
    isDisabled: {
      true: {
        trackContainer: {
          cursor: 'not-allowed',
          opacity: 0.5,
        },
        thumb: {
          bg: 'track.disabled',
          cursor: 'not-allowed',
        },
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type SliderVariants = RecipeVariantProps<typeof sliderRecipe>;
