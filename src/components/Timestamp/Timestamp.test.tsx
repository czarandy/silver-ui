import {Temporal} from '@js-temporal/polyfill';
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Timestamp} from 'components/Timestamp/Timestamp';
import {
  formatAbsolute,
  formatRelative,
  formatTimestamp,
  resolveInstant,
} from 'components/Timestamp/Timestamp.utils';

// A fixed reference moment used across the deterministic unit tests.
const REFERENCE_ISO = '2025-03-21T14:51:53Z';
const REFERENCE = Temporal.Instant.from(REFERENCE_ISO);
const REFERENCE_MS = REFERENCE.epochMilliseconds;

describe('Timestamp.utils', () => {
  describe('resolveInstant', () => {
    it('treats a number as Unix epoch seconds', () => {
      const {instant} = resolveInstant(REFERENCE_MS / 1000);
      expect(instant.epochMilliseconds).toBe(REFERENCE_MS);
    });

    it('parses an ISO 8601 string', () => {
      const {instant} = resolveInstant(REFERENCE_ISO);
      expect(instant.epochMilliseconds).toBe(REFERENCE_MS);
    });

    it('takes the display timezone from a ZonedDateTime', () => {
      const zdt = REFERENCE.toZonedDateTimeISO('America/New_York');
      const {instant, timeZone} = resolveInstant(zdt);
      expect(instant.epochMilliseconds).toBe(REFERENCE_MS);
      expect(timeZone).toBe('America/New_York');
    });
  });

  describe('formatRelative', () => {
    it('renders recent moments as "now"', () => {
      expect(formatRelative(REFERENCE, REFERENCE_MS + 10_000)).toBe('now');
    });

    it('renders past moments with "ago"', () => {
      const twoHoursLater = REFERENCE_MS + 2 * 3600 * 1000;
      expect(formatRelative(REFERENCE, twoHoursLater)).toBe('2 hours ago');
    });

    it('renders future moments', () => {
      const threeDaysEarlier = REFERENCE_MS - 3 * 86400 * 1000;
      expect(formatRelative(REFERENCE, threeDaysEarlier)).toBe('in 3 days');
    });

    it.each([
      [-3599, '59 minutes ago'],
      [-3571, '59 minutes ago'],
      [-3570, '59 minutes ago'],
      [-86399, '23 hours ago'],
      [-84601, '23 hours ago'],
      [3599, 'in 59 minutes'],
      [86399, 'in 23 hours'],
    ])(
      'does not round a %i-second difference up to the next relative unit',
      (diffSeconds, expected) => {
        const nowMs = REFERENCE_MS - diffSeconds * 1000;
        expect(formatRelative(REFERENCE, nowMs)).toBe(expected);
      },
    );
  });

  describe('formatAbsolute', () => {
    it('renders system formats as fixed ISO-like strings', () => {
      expect(formatAbsolute(REFERENCE, 'systemDate', 'UTC', false)).toBe(
        '2025-03-21',
      );
      expect(formatAbsolute(REFERENCE, 'systemTime', 'UTC', false)).toBe(
        '14:51:53',
      );
      expect(formatAbsolute(REFERENCE, 'systemDateTime', 'UTC', false)).toBe(
        '2025-03-21 14:51:53',
      );
    });

    it('honors the display timezone for system formats', () => {
      // 14:51 UTC is 10:51 in New York (EDT, UTC-4) on this date.
      expect(
        formatAbsolute(REFERENCE, 'systemTime', 'America/New_York', false),
      ).toBe('10:51:53');
    });

    it('appends a timezone abbreviation when requested', () => {
      const withZone = formatAbsolute(REFERENCE, 'time', 'UTC', true);
      expect(withZone).toMatch(/UTC|GMT/);
    });
  });

  describe('formatTimestamp auto mode', () => {
    it('shows a relative string within the threshold', () => {
      const result = formatTimestamp(
        REFERENCE,
        'auto',
        604800,
        false,
        REFERENCE_MS + 3600 * 1000,
      );
      expect(result.isRelative).toBe(true);
      expect(result.text).toBe('1 hour ago');
    });

    it('falls back to an absolute date/time beyond the threshold', () => {
      const oneYearLater = REFERENCE_MS + 365 * 86400 * 1000;
      const result = formatTimestamp(
        REFERENCE,
        'auto',
        604800,
        false,
        oneYearLater,
      );
      expect(result.isRelative).toBe(false);
      expect(result.text).toMatch(/2025/);
    });
  });
});

describe('Timestamp', () => {
  it.each([
    ['an empty string', ''],
    ['an invalid ISO string', 'not-a-date'],
    ['a NaN epoch', Number.NaN],
  ])('renders nothing and warns for %s', (_description, value) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const {container} = render(<Timestamp value={value} />);

    expect(container).toBeEmptyDOMElement();
    expect(warn).toHaveBeenCalledWith(
      'Timestamp: `value` could not be parsed; nothing will be rendered.',
      expect.any(RangeError),
    );

    warn.mockRestore();
  });

  it('renders a <time> element with an ISO dateTime attribute', () => {
    render(<Timestamp data-testid="ts" format="date" value={REFERENCE_ISO} />);

    const element = screen.getByTestId('ts');
    expect(element.tagName).toBe('TIME');
    expect(element).toHaveAttribute('datetime', REFERENCE_ISO);
  });

  it('renders the requested absolute format', () => {
    render(
      <Timestamp
        data-testid="ts"
        format="systemDateTime"
        value={REFERENCE.toZonedDateTimeISO('UTC')}
      />,
    );

    expect(screen.getByTestId('ts')).toHaveTextContent('2025-03-21 14:51:53');
  });

  it('wires a tooltip and accessible absolute label for relative text', () => {
    const longAgo = Temporal.Now.instant().subtract({hours: 5});
    render(<Timestamp data-testid="ts" format="relative" value={longAgo} />);

    const element = screen.getByTestId('ts');
    expect(element).toHaveTextContent(/ago/);
    expect(element).toHaveAttribute('aria-describedby');
    expect(element).toHaveAttribute('aria-label');
  });

  it('omits the tooltip when hasTooltip is false', () => {
    const longAgo = Temporal.Now.instant().subtract({hours: 5});
    render(
      <Timestamp
        data-testid="ts"
        format="relative"
        hasTooltip={false}
        value={longAgo}
      />,
    );

    expect(screen.getByTestId('ts')).not.toHaveAttribute('aria-describedby');
  });

  it('does not treat an absolute format as relative', () => {
    render(<Timestamp data-testid="ts" format="date" value={REFERENCE_ISO} />);

    const element = screen.getByTestId('ts');
    expect(element).not.toHaveAttribute('aria-describedby');
    expect(element).not.toHaveAttribute('aria-label');
  });

  it('applies className, style, data-testid, and ref to the element', () => {
    const ref = vi.fn<(element: HTMLTimeElement | null) => void>();

    render(
      <Timestamp
        className="custom-ts"
        data-testid="ts"
        format="date"
        ref={ref}
        style={{color: 'red'}}
        value={REFERENCE_ISO}
      />,
    );

    const element = screen.getByTestId('ts');
    expect(element).toHaveClass('custom-ts');
    expect(element).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
