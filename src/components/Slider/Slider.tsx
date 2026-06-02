import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Field, type FieldNecessity, type InputStatus} from '../Field';
import {Tooltip} from '../Tooltip';

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderValueDisplay = 'tooltip' | 'text' | 'none';

export interface SliderMark {
  /**
   * Text label rendered beside the mark.
   */
  label?: string;
  /**
   * Numeric position of the mark along the track.
   */
  value: number;
}

export type SliderBaseProps = {
  /**
   * Additional CSS class names applied to the field root.
   */
  className?: string;
  /**
   * Test ID applied to the field root.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: string;
  /**
   * Custom value formatter used for visible value text, tooltip content, and
   * `aria-valuetext`.
   */
  formatValue?: (value: number) => string;
  /**
   * Whether the slider is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Field label.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: string;
  /**
   * Tick marks rendered along the track.
   */
  marks?: SliderMark[];
  /**
   * Maximum value.
   * @default 100
   */
  max?: number;
  /**
   * Minimum value.
   * @default 0
   */
  min?: number;
  /**
   * Slider orientation.
   * @default 'horizontal'
   */
  orientation?: SliderOrientation;
  /**
   * Ref forwarded to the field root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Validation status displayed below the slider.
   */
  status?: InputStatus;
  /**
   * Step increment.
   * @default 1
   */
  step?: number;
  /**
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
  /**
   * How to display the current value.
   * @default 'tooltip'
   */
  valueDisplay?: SliderValueDisplay;
} & FieldNecessity;

export type SliderSingleProps = SliderBaseProps & {
  /**
   * Called when the value changes during pointer or keyboard interaction.
   */
  onChange: (value: number) => void;
  /**
   * Called when pointer or keyboard interaction commits a value.
   */
  onChangeEnd?: (value: number) => void;
  /**
   * Current value.
   */
  value: number;
};

export type SliderRangeProps = SliderBaseProps & {
  /**
   * Minimum number of steps between range thumbs.
   * @default 0
   */
  minStepsBetweenThumbs?: number;
  /**
   * Called when the range changes during pointer or keyboard interaction.
   */
  onChange: (value: [number, number]) => void;
  /**
   * Called when pointer or keyboard interaction commits a range.
   */
  onChangeEnd?: (value: [number, number]) => void;
  /**
   * Current range.
   */
  value: [number, number];
};

export type SliderProps = SliderRangeProps | SliderSingleProps;

const THUMB_SIZE = 20;
const TRACK_SIZE = 4;

const styles = {
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
  }),
  textValue: css({
    flexShrink: 0,
    color: 'fg',
    fontFamily: 'body',
    fontSize: 'sm',
    whiteSpace: 'nowrap',
  }),
  trackContainer: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    isolation: 'isolate',
    touchAction: 'none',
    userSelect: 'none',
  }),
  trackContainerDisabled: css({
    cursor: 'not-allowed',
    opacity: 0.5,
  }),
  trackContainerHorizontal: css({
    w: 'full',
    h: `${THUMB_SIZE}px`,
    cursor: 'pointer',
  }),
  trackContainerVertical: css({
    w: `${THUMB_SIZE}px`,
    h: '40',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: 'pointer',
  }),
  track: css({
    position: 'absolute',
    bg: 'track',
    borderRadius: 'full',
  }),
  trackHorizontal: css({
    insetInline: 0,
    top: '50%',
    h: `${TRACK_SIZE}px`,
    transform: 'translateY(-50%)',
  }),
  trackVertical: css({
    insetBlock: 0,
    left: '50%',
    w: `${TRACK_SIZE}px`,
    transform: 'translateX(-50%)',
  }),
  filledTrack: css({
    position: 'absolute',
    bg: 'primary',
    borderRadius: 'full',
  }),
  filledTrackHorizontal: css({
    top: '50%',
    h: `${TRACK_SIZE}px`,
    transform: 'translateY(-50%)',
  }),
  filledTrackVertical: css({
    left: '50%',
    w: `${TRACK_SIZE}px`,
    transform: 'translateX(-50%)',
  }),
  thumb: css({
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
  }),
  thumbDisabled: css({
    bg: 'track.disabled',
    cursor: 'not-allowed',
  }),
  thumbHorizontal: css({
    top: '50%',
  }),
  thumbVertical: css({
    left: '50%',
    transform: 'translate(-50%, 50%)',
  }),
  marksContainer: css({
    position: 'absolute',
  }),
  marksContainerHorizontal: css({
    insetInline: 0,
    top: '50%',
  }),
  marksContainerVertical: css({
    insetBlock: 0,
    left: '50%',
  }),
  mark: css({
    position: 'absolute',
    bg: 'border.emphasized',
    borderRadius: 'full',
  }),
  markHorizontal: css({
    w: '0.5',
    h: '2',
    transform: 'translate(-50%, -50%)',
  }),
  markVertical: css({
    w: '2',
    h: '0.5',
    transform: 'translate(-50%, 50%)',
  }),
  markLabel: css({
    position: 'absolute',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'xs',
    whiteSpace: 'nowrap',
  }),
  markLabelHorizontal: css({
    top: `${THUMB_SIZE / 2 + 4}px`,
    transform: 'translateX(-50%)',
  }),
  markLabelVertical: css({
    left: `${THUMB_SIZE / 2 + 4}px`,
    transform: 'translateY(50%)',
  }),
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number): number {
  if (step <= 0) {
    return value;
  }
  return min + Math.round((value - min) / step) * step;
}

function getPercent(value: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return ((value - min) / (max - min)) * 100;
}

/**
 * Slider control for selecting a single value or a range.
 */
export function Slider({
  className,
  'data-testid': dataTestId,
  description,
  formatValue,
  isDisabled = false,
  isLabelHidden = false,
  isOptional,
  isRequired,
  label,
  labelTooltip,
  marks,
  max = 100,
  min = 0,
  orientation = 'horizontal',
  ref,
  status,
  step = 1,
  style,
  value,
  valueDisplay = 'tooltip',
  ...props
}: SliderProps): React.JSX.Element {
  const inputId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const pendingValuesRef = useRef<number[] | null>(null);
  const draggingThumbRef = useRef<number | null>(null);
  const [draggingThumb, setDraggingThumb] = useState<number | null>(null);
  const isRange = Array.isArray(value);
  const isHorizontal = orientation === 'horizontal';
  const values = useMemo(() => (isRange ? value : [value]), [isRange, value]);
  const minStepsBetweenThumbs =
    isRange && 'minStepsBetweenThumbs' in props
      ? (props.minStepsBetweenThumbs ?? 0)
      : 0;
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID =
    status?.message != null ? `${inputId}-status` : undefined;
  const ariaDescribedBy =
    [descriptionID, statusMessageID].filter(Boolean).join(' ') || undefined;

  useEffect(() => {
    pendingValuesRef.current = values;
  }, [values]);

  const displayValue = useCallback(
    (displayedValue: number): string =>
      formatValue == null
        ? String(displayedValue)
        : formatValue(displayedValue),
    [formatValue],
  );

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (track == null) {
        return min;
      }
      const rect = track.getBoundingClientRect();
      const rawPercent = isHorizontal
        ? (clientX - rect.left) / rect.width
        : 1 - (clientY - rect.top) / rect.height;
      const percent = clamp(rawPercent, 0, 1);
      const rawValue = min + percent * (max - min);
      return clamp(snapToStep(rawValue, min, step), min, max);
    },
    [isHorizontal, max, min, step],
  );

  const getClosestThumb = useCallback(
    (newValue: number): number => {
      if (!isRange) {
        return 0;
      }
      const [lower, upper] = values;
      return Math.abs(newValue - lower) <= Math.abs(newValue - upper) ? 0 : 1;
    },
    [isRange, values],
  );

  const getNextValues = useCallback(
    (thumbIndex: number, newValue: number): number[] => {
      const snapped = clamp(snapToStep(newValue, min, step), min, max);
      if (!isRange) {
        return [snapped];
      }

      const nextValues = [...values] as [number, number];
      nextValues[thumbIndex] = snapped;
      const minGap = minStepsBetweenThumbs * step;
      if (thumbIndex === 0) {
        nextValues[0] = Math.min(nextValues[0], nextValues[1] - minGap);
      } else {
        nextValues[1] = Math.max(nextValues[1], nextValues[0] + minGap);
      }
      nextValues[0] = clamp(nextValues[0], min, max);
      nextValues[1] = clamp(nextValues[1], min, max);
      return nextValues;
    },
    [isRange, max, min, minStepsBetweenThumbs, step, values],
  );

  const emitChange = useCallback(
    (nextValues: number[]) => {
      pendingValuesRef.current = nextValues;
      if (isRange) {
        (props.onChange as SliderRangeProps['onChange'])(
          nextValues as [number, number],
        );
      } else {
        (props.onChange as SliderSingleProps['onChange'])(nextValues[0]);
      }
    },
    [isRange, props],
  );

  const emitChangeEnd = useCallback(
    (nextValues: number[]) => {
      if (isRange) {
        (props.onChangeEnd as SliderRangeProps['onChangeEnd'])?.(
          nextValues as [number, number],
        );
      } else {
        (props.onChangeEnd as SliderSingleProps['onChangeEnd'])?.(
          nextValues[0],
        );
      }
    },
    [isRange, props],
  );

  const updateValue = useCallback(
    (thumbIndex: number, newValue: number): number[] | null => {
      if (isDisabled) {
        return null;
      }
      const nextValues = getNextValues(thumbIndex, newValue);
      emitChange(nextValues);
      return nextValues;
    },
    [emitChange, getNextValues, isDisabled],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }
      event.preventDefault();
      const markElement = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-mark-value]',
      );
      const newValue =
        markElement == null
          ? getValueFromPosition(event.clientX, event.clientY)
          : Number(markElement.dataset.markValue);
      const thumbIndex = getClosestThumb(newValue);
      draggingThumbRef.current = thumbIndex;
      setDraggingThumb(thumbIndex);
      updateValue(thumbIndex, newValue);

      const thumbs =
        trackRef.current?.querySelectorAll<HTMLElement>('[role="slider"]');
      thumbs?.[thumbIndex]?.focus();

      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    },
    [getClosestThumb, getValueFromPosition, isDisabled, updateValue],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (draggingThumbRef.current == null || isDisabled) {
        return;
      }
      updateValue(
        draggingThumbRef.current,
        getValueFromPosition(event.clientX, event.clientY),
      );
    },
    [getValueFromPosition, isDisabled, updateValue],
  );

  const handlePointerUp = useCallback(() => {
    if (draggingThumbRef.current == null) {
      return;
    }
    draggingThumbRef.current = null;
    setDraggingThumb(null);
    emitChangeEnd(pendingValuesRef.current ?? values);
  }, [emitChangeEnd, values]);

  const handleKeyDown = useCallback(
    (thumbIndex: number, event: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }

      const currentValue = values[thumbIndex];
      let nextValue: number;
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowLeft':
          nextValue = currentValue - step;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          nextValue = currentValue + step;
          break;
        case 'End':
          nextValue = max;
          break;
        case 'Home':
          nextValue = min;
          break;
        case 'PageDown':
          nextValue = currentValue - step * 10;
          break;
        case 'PageUp':
          nextValue = currentValue + step * 10;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextValues = getNextValues(thumbIndex, nextValue);
      emitChange(nextValues);
      emitChangeEnd(nextValues);
    },
    [
      emitChange,
      emitChangeEnd,
      getNextValues,
      isDisabled,
      max,
      min,
      step,
      values,
    ],
  );

  const filledStyle: CSSProperties = (() => {
    if (isRange) {
      const [lower, upper] = values;
      const lowerPercent = getPercent(lower, min, max);
      const upperPercent = getPercent(upper, min, max);
      return isHorizontal
        ? {left: `${lowerPercent}%`, width: `${upperPercent - lowerPercent}%`}
        : {
            bottom: `${lowerPercent}%`,
            height: `${upperPercent - lowerPercent}%`,
          };
    }
    const percent = getPercent(values[0], min, max);
    return isHorizontal
      ? {left: '0%', width: `${percent}%`}
      : {bottom: '0%', height: `${percent}%`};
  })();

  const textDisplay =
    valueDisplay === 'text' ? (
      <span className={styles.textValue}>
        {isRange
          ? `${displayValue(values[0])} - ${displayValue(values[1])}`
          : displayValue(values[0])}
      </span>
    ) : null;

  const necessity: FieldNecessity = {isOptional, isRequired};

  return (
    <Field
      className={className}
      data-testid={dataTestId}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelTooltip={labelTooltip}
      ref={ref}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      statusVariant="detached"
      style={style}>
      <div className={styles.row}>
        <div
          aria-label={isRange ? label : undefined}
          className={cx(
            styles.trackContainer,
            isHorizontal
              ? styles.trackContainerHorizontal
              : styles.trackContainerVertical,
            isDisabled ? styles.trackContainerDisabled : undefined,
          )}
          data-testid="slider-track-container"
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={trackRef}
          role={isRange ? 'group' : undefined}>
          <div
            aria-hidden="true"
            className={cx(
              styles.track,
              isHorizontal ? styles.trackHorizontal : styles.trackVertical,
            )}
          />
          <div
            aria-hidden="true"
            className={cx(
              styles.filledTrack,
              isHorizontal
                ? styles.filledTrackHorizontal
                : styles.filledTrackVertical,
            )}
            style={filledStyle}
          />
          {marks == null ? null : (
            <div
              aria-hidden="true"
              className={cx(
                styles.marksContainer,
                isHorizontal
                  ? styles.marksContainerHorizontal
                  : styles.marksContainerVertical,
              )}>
              {marks.map(mark => {
                const percent = getPercent(mark.value, min, max);
                const markStyle = isHorizontal
                  ? {left: `${percent}%`}
                  : {bottom: `${percent}%`};
                return (
                  <div key={mark.value}>
                    <div
                      className={cx(
                        styles.mark,
                        isHorizontal
                          ? styles.markHorizontal
                          : styles.markVertical,
                      )}
                      data-mark-value={mark.value}
                      data-testid="slider-mark"
                      style={markStyle}
                    />
                    {mark.label == null ? null : (
                      <span
                        className={cx(
                          styles.markLabel,
                          isHorizontal
                            ? styles.markLabelHorizontal
                            : styles.markLabelVertical,
                        )}
                        data-mark-value={mark.value}
                        data-testid="slider-mark-label"
                        style={markStyle}>
                        {mark.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {values.map((currentValue, thumbIndex) => {
            const percent = getPercent(currentValue, min, max);
            const thumbStyle = isHorizontal
              ? {left: `${percent}%`}
              : {bottom: `${percent}%`, left: '50%'};
            const thumbLabel = isRange
              ? thumbIndex === 0
                ? `${label}, minimum value`
                : `${label}, maximum value`
              : label;
            const thumbKey = isRange
              ? thumbIndex === 0
                ? 'minimum'
                : 'maximum'
              : 'value';
            const thumb = (
              <div
                aria-describedby={ariaDescribedBy}
                aria-disabled={isDisabled || undefined}
                aria-invalid={status?.type === 'error' || undefined}
                aria-label={thumbLabel}
                aria-orientation={orientation}
                aria-valuemax={max}
                aria-valuemin={min}
                aria-valuenow={currentValue}
                aria-valuetext={
                  formatValue == null ? undefined : formatValue(currentValue)
                }
                className={cx(
                  styles.thumb,
                  isHorizontal ? styles.thumbHorizontal : styles.thumbVertical,
                  isDisabled ? styles.thumbDisabled : undefined,
                )}
                id={!isRange ? inputId : undefined}
                key={thumbKey}
                onKeyDown={event => handleKeyDown(thumbIndex, event)}
                role="slider"
                style={thumbStyle}
                tabIndex={isDisabled ? -1 : 0}
              />
            );

            if (valueDisplay !== 'tooltip') {
              return thumb;
            }

            return (
              <Tooltip
                content={displayValue(currentValue)}
                delay={0}
                focusTrigger="always"
                isOpen={draggingThumb === thumbIndex ? true : undefined}
                key={thumbKey}
                placement={isHorizontal ? 'above' : 'start'}>
                {thumb}
              </Tooltip>
            );
          })}
        </div>
        {textDisplay}
      </div>
    </Field>
  );
}

Slider.displayName = 'Slider';
