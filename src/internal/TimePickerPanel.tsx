'use client';

import {Temporal} from '@js-temporal/polyfill';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Button} from 'components/Button';
import {timeInputRecipe} from 'components/TimeInput/TimeInput.recipe';

const styles = timeInputRecipe();
const range = (length: number): number[] => Array.from({length}, (_, i) => i);
const seconds = (time: Temporal.PlainTime): number =>
  time.hour * 3600 + time.minute * 60 + time.second;

function closest(values: number[], target: number): number | undefined {
  return values.reduce<number | undefined>(
    (best, value) =>
      best === undefined || Math.abs(value - target) < Math.abs(best - target)
        ? value
        : best,
    undefined,
  );
}

function TimeColumn({
  label,
  values,
  selected,
  available,
  format,
  onSelect,
}: {
  label: string;
  values: number[];
  selected: number;
  available: Set<number>;
  format: (value: number) => string;
  onSelect: (value: number) => void;
}): React.JSX.Element {
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({block: 'nearest'});
  }, [selected]);

  return (
    <div className={styles.column}>
      <div className={styles.heading}>{label}</div>
      <div
        aria-label={label}
        className={styles.list}
        onKeyDown={event => {
          const enabled = values.filter(value => available.has(value));
          const index = enabled.indexOf(selected);
          let next: number | undefined;
          if (event.key === 'ArrowDown') {
            next = enabled[Math.min(index + 1, enabled.length - 1)];
          } else if (event.key === 'ArrowUp') {
            next = enabled[Math.max(index - 1, 0)];
          } else if (event.key === 'Home') {
            next = enabled[0];
          } else if (event.key === 'End') {
            next = enabled.at(-1);
          } else {
            return;
          }
          event.preventDefault();
          if (next !== undefined) {
            onSelect(next);
            event.currentTarget
              .querySelector<HTMLButtonElement>(`[data-value="${next}"]`)
              ?.focus();
          }
        }}
        role="listbox"
        tabIndex={-1}>
        {values.map(value => (
          <button
            aria-selected={value === selected}
            className={styles.option}
            data-value={value}
            disabled={!available.has(value)}
            key={value}
            onClick={() => onSelect(value)}
            ref={value === selected ? selectedRef : undefined}
            role="option"
            tabIndex={value === selected ? 0 : -1}
            type="button">
            {format(value)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Column picker with a draft value that is committed only by Done.
 */
export function TimePickerPanel({
  value,
  min,
  max,
  step,
  hasSeconds,
  onConfirm,
}: {
  value: Temporal.PlainTime | null;
  min?: Temporal.PlainTime;
  max?: Temporal.PlainTime;
  step?: number;
  hasSeconds: boolean;
  onConfirm: (value: Temporal.PlainTime) => void;
}): React.JSX.Element {
  const lower = min == null ? 0 : seconds(min);
  const upper = max == null ? 86399 : seconds(max);
  const increment =
    step != null && Number.isFinite(step) && step > 0
      ? step
      : hasSeconds
        ? 1
        : 60;
  const {validTimes, minuteOptions, secondOptions} = useMemo(() => {
    const result: number[] = [];
    const minutes = new Set<number>();
    const seconds = new Set<number>();
    for (let time = 0; time < 86400; time += hasSeconds ? 1 : 60) {
      const inRange =
        lower <= upper
          ? time >= lower && time <= upper
          : time >= lower || time <= upper;
      const steps = (time - lower) / increment;
      if (Math.abs(steps - Math.round(steps)) < 1e-8) {
        minutes.add(Math.floor(time / 60) % 60);
        seconds.add(time % 60);
        if (inRange) {
          result.push(time);
        }
      }
    }
    return {
      validTimes: result,
      minuteOptions: [...minutes].sort((a, b) => a - b),
      secondOptions: [...seconds].sort((a, b) => a - b),
    };
  }, [lower, upper, increment, hasSeconds]);
  const [draft, setDraft] = useState(() =>
    seconds(value ?? Temporal.Now.plainTimeISO()),
  );
  const selected = closest(validTimes, draft) ?? draft;
  const hour = Math.floor(selected / 3600);
  const minute = Math.floor(selected / 60) % 60;
  const second = selected % 60;
  const is12Hour =
    new Intl.DateTimeFormat(undefined, {hour: 'numeric'}).resolvedOptions()
      .hour12 === true;
  const period = Math.floor(hour / 12);
  const periodTimes = validTimes.filter(
    time => !is12Hour || Math.floor(time / 43200) === period,
  );
  const hourTimes = validTimes.filter(time => Math.floor(time / 3600) === hour);
  const minuteTimes = hourTimes.filter(
    time => Math.floor(time / 60) % 60 === minute,
  );
  const choose = (times: number[], target: number): void => {
    const next = closest(times, target);
    if (next !== undefined) {
      setDraft(next);
    }
  };
  const padded = (n: number): string => String(n).padStart(2, '0');

  return (
    <div className={styles.panel}>
      <div className={styles.columns}>
        <TimeColumn
          available={
            new Set(
              periodTimes.map(time =>
                is12Hour
                  ? Math.floor(time / 3600) % 12 || 12
                  : Math.floor(time / 3600),
              ),
            )
          }
          format={padded}
          label="Hours"
          onSelect={n => {
            const nextHour = is12Hour ? (n % 12) + period * 12 : n;
            choose(
              validTimes.filter(time => Math.floor(time / 3600) === nextHour),
              nextHour * 3600 + minute * 60 + second,
            );
          }}
          selected={is12Hour ? hour % 12 || 12 : hour}
          values={is12Hour ? [12, ...range(11).map(n => n + 1)] : range(24)}
        />
        <TimeColumn
          available={new Set(hourTimes.map(time => Math.floor(time / 60) % 60))}
          format={padded}
          label="Minutes"
          onSelect={n =>
            choose(
              hourTimes.filter(time => Math.floor(time / 60) % 60 === n),
              hour * 3600 + n * 60 + second,
            )
          }
          selected={minute}
          values={minuteOptions}
        />
        {hasSeconds ? (
          <TimeColumn
            available={new Set(minuteTimes.map(time => time % 60))}
            format={padded}
            label="Seconds"
            onSelect={n =>
              choose(
                minuteTimes.filter(time => time % 60 === n),
                hour * 3600 + minute * 60 + n,
              )
            }
            selected={second}
            values={secondOptions}
          />
        ) : null}
        {is12Hour ? (
          <TimeColumn
            available={
              new Set(validTimes.map(time => Math.floor(time / 43200)))
            }
            format={n => (n === 0 ? 'AM' : 'PM')}
            label="Period"
            onSelect={n =>
              choose(
                validTimes.filter(time => Math.floor(time / 43200) === n),
                selected + (n - period) * 43200,
              )
            }
            selected={period}
            values={[0, 1]}
          />
        ) : null}
      </div>
      <div className={styles.footer}>
        <Button
          isDisabled={validTimes.length === 0}
          label="Done"
          onClick={() =>
            onConfirm(Temporal.PlainTime.from({hour, minute, second}))
          }
          size="sm"
        />
      </div>
    </div>
  );
}
