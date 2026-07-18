/* eslint-disable testing-library/no-container, testing-library/no-node-access -- the decorative timeline rail is hidden from accessibility queries */

import {Temporal} from '@js-temporal/polyfill';
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Timeline, type TimelineItemConfig} from 'components/Timeline/Timeline';

const CREATED = Temporal.Instant.from(
  '2026-07-15T16:30:00Z',
).toZonedDateTimeISO('UTC');
const SHIPPED = Temporal.Instant.from(
  '2026-07-16T09:45:00Z',
).toZonedDateTimeISO('UTC');
const DELIVERED = Temporal.Instant.from(
  '2026-07-17T18:05:00Z',
).toZonedDateTimeISO('UTC');

const items: TimelineItemConfig[] = [
  {id: 'created', timestamp: CREATED, title: 'Order created'},
  {id: 'shipped', timestamp: SHIPPED, title: 'Order shipped'},
  {id: 'delivered', timestamp: DELIVERED, title: 'Order delivered'},
];

describe('Timeline', () => {
  it('renders a semantic ordered list without a navigation landmark', () => {
    render(<Timeline items={items} timestampFormat="systemDateTime" />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('preserves the supplied item order', () => {
    render(
      <Timeline
        items={[items[2], items[0], items[1]]}
        timestampFormat="systemDateTime"
      />,
    );

    expect(
      screen.getAllByRole('listitem').map(item => item.textContent),
    ).toEqual([
      expect.stringContaining('Order delivered'),
      expect.stringContaining('Order created'),
      expect.stringContaining('Order shipped'),
    ]);
  });

  it('renders titles, free-form content, and semantic timestamps', () => {
    render(
      <Timeline
        items={[
          {
            id: 'created',
            timestamp: CREATED,
            title: 'Order created',
            content: <span>Confirmation sent</span>,
          },
          {
            id: 'count',
            timestamp: SHIPPED,
            title: 'Packages remaining',
            content: 0,
          },
        ]}
        timestampFormat="systemDateTime"
      />,
    );

    expect(screen.getByText('Order created')).toBeInTheDocument();
    expect(screen.getByText('Confirmation sent')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    const timestamps = screen.getAllByRole('time');
    expect(timestamps[0]).toHaveAttribute(
      'datetime',
      CREATED.toInstant().toString(),
    );
    expect(timestamps[1]).toHaveAttribute(
      'datetime',
      SHIPPED.toInstant().toString(),
    );
  });

  it('forwards timestampFormat to every Timestamp', () => {
    render(<Timeline items={items} timestampFormat="systemDateTime" />);

    expect(screen.getByText('2026-07-15 16:30:00')).toBeInTheDocument();
    expect(screen.getByText('2026-07-16 09:45:00')).toBeInTheDocument();
    expect(screen.getByText('2026-07-17 18:05:00')).toBeInTheDocument();
  });

  it('renders default dots for entries without custom icons', () => {
    const {container} = render(
      <Timeline items={items} timestampFormat="systemDateTime" />,
    );

    expect(container.querySelectorAll('[data-timeline-dot]')).toHaveLength(3);
  });

  it('replaces the default dot with a decorative custom icon', () => {
    const {container} = render(
      <Timeline
        items={[
          {
            id: 'custom',
            timestamp: CREATED,
            title: 'Custom event',
            icon: <span data-testid="custom-icon">I</span>,
          },
        ]}
        timestampFormat="systemDateTime"
      />,
    );

    const customIcon = screen.getByTestId('custom-icon');
    expect(customIcon.closest('[aria-hidden="true"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-timeline-dot]'),
    ).not.toBeInTheDocument();
  });

  it('connects every entry except the last', () => {
    const {container} = render(
      <Timeline items={items} timestampFormat="systemDateTime" />,
    );

    expect(
      container.querySelectorAll('[data-timeline-connector]'),
    ).toHaveLength(2);
    const listItems = screen.getAllByRole('listitem');
    expect(
      listItems[2].querySelector('[data-timeline-connector]'),
    ).not.toBeInTheDocument();
  });

  it('renders an empty ordered list', () => {
    render(<Timeline data-testid="timeline" items={[]} />);

    expect(screen.getByTestId('timeline').tagName).toBe('OL');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('forwards className, style, data-testid, and ref to the ordered list', () => {
    const ref = vi.fn<(element: HTMLOListElement | null) => void>();

    render(
      <Timeline
        className="custom-timeline"
        data-testid="timeline"
        items={items}
        ref={ref}
        style={{maxWidth: 480}}
        timestampFormat="systemDateTime"
      />,
    );

    const list = screen.getByTestId('timeline');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('custom-timeline');
    expect(list).toHaveStyle({maxWidth: '480px'});
    expect(ref).toHaveBeenCalledWith(list);
  });

  it('forwards each item data-testid to its list item', () => {
    render(
      <Timeline
        items={[
          {
            ...items[0],
            'data-testid': 'timeline-item',
          },
        ]}
        timestampFormat="systemDateTime"
      />,
    );

    expect(screen.getByTestId('timeline-item').tagName).toBe('LI');
  });

  it('does not add wizard or interactive semantics to entries', () => {
    render(<Timeline items={items} timestampFormat="systemDateTime" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    for (const item of screen.getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('aria-current');
    }
  });
});
