/* eslint-disable testing-library/no-container, testing-library/no-node-access -- these tests verify definition-list and recipe structure */

import {render, screen} from '@testing-library/react';
import {CircleDollarSign} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Stat} from 'components/Stat/Stat';
import {statRecipe} from 'components/Stat/Stat.recipe';
import {textRecipe} from 'components/Text/Text.recipe';
import {assertNonNull} from 'internal/testHelpers';

const classesOf = (className: string | undefined): string[] =>
  assertNonNull(className).split(' ');

describe('Stat', () => {
  it('renders the required label and value', () => {
    render(<Stat label="Revenue" value="$1.2M" />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1.2M')).toBeInTheDocument();
  });

  it('uses a direct definition term and description pair', () => {
    render(<Stat label="Revenue" value="$1.2M" />);

    const label = screen.getByText('Revenue');
    const value = screen.getByText('$1.2M');
    const term = assertNonNull(label.closest('dt'));
    const details = assertNonNull(value.closest('dd'));
    const definition = assertNonNull(term.parentElement);

    expect(definition.tagName).toBe('DL');
    expect(details.parentElement).toBe(definition);
    expect(Array.from(definition.children)).toEqual([term, details]);
  });

  it('uses display-2 typography and tabular numbers for the value', () => {
    render(<Stat label="Revenue" value="$1.2M" />);

    const value = screen.getByText('$1.2M');
    const expectedClasses = textRecipe({
      color: 'primary',
      display: 'block',
      hasTabularNumbers: true,
      type: 'display-2',
    });

    expect(value).toHaveClass(...classesOf(expectedClasses));
    expect(value).toHaveClass('silver-fv-num_tabular-nums');
  });

  it('keeps the value on one line', () => {
    render(<Stat label="Revenue" value="$1.2 million" />);

    expect(screen.getByText('$1.2 million')).toHaveClass(
      'silver-white-space_nowrap',
    );
  });

  it.each([
    {
      change: 12.5,
      direction: 'increase',
      iconClass: 'lucide-trending-up',
      text: '12.5% increased',
      tone: 'positive',
    },
    {
      change: -8.2,
      direction: 'decrease',
      iconClass: 'lucide-trending-down',
      text: '8.2% decreased',
      tone: 'negative',
    },
    {
      change: 0,
      direction: 'unchanged',
      iconClass: 'lucide-minus',
      text: '0% unchanged',
      tone: 'neutral',
    },
  ] as const)(
    'renders a $direction percentage change',
    ({change, direction, iconClass, text, tone}) => {
      const {container} = render(
        <Stat change={change} label="Revenue" value="$1.2M" />,
      );

      const changeText = screen.getByText(text);
      const changeElement = assertNonNull(
        changeText.closest('[data-direction]'),
      );

      expect(changeElement).toHaveAttribute('data-direction', direction);
      expect(changeElement).toHaveClass(
        ...classesOf(statRecipe({changeTone: tone}).change),
      );
      expect(changeText).toHaveClass('silver-fv-num_tabular-nums');
      expect(container.querySelector(`.${iconClass}`)).toBeInTheDocument();
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'does not emit a change for the non-finite value %d',
    change => {
      const {container} = render(
        <Stat change={change} label="Revenue" value="$1.2M" />,
      );

      expect(
        container.querySelector('[data-direction]'),
      ).not.toBeInTheDocument();
    },
  );

  it('rounds the change instead of rendering raw float artifacts', () => {
    render(<Stat change={8.0392156} label="Revenue" value="$1.2M" />);

    expect(screen.getByText('8% increased')).toBeInTheDocument();
  });

  it('formats the change with locale grouping', () => {
    render(<Stat change={-1234.56} label="Revenue" value="$1.2M" />);

    expect(screen.getByText('1,234.6% decreased')).toBeInTheDocument();
  });

  it.each([
    {change: -3.4, changeSentiment: 'inverted', tone: 'positive'},
    {change: 3.4, changeSentiment: 'inverted', tone: 'negative'},
    {change: 3.4, changeSentiment: 'neutral', tone: 'neutral'},
  ] as const)(
    'colors a $changeSentiment sentiment change of $change with the $tone tone',
    ({change, changeSentiment, tone}) => {
      render(
        <Stat
          change={change}
          changeSentiment={changeSentiment}
          label="Churn rate"
          value="2.1%"
        />,
      );

      const changeElement = assertNonNull(
        screen.getByText(/3\.4%/).closest('[data-direction]'),
      );
      expect(changeElement).toHaveClass(
        ...classesOf(statRecipe({changeTone: tone}).change),
      );
    },
  );

  it('renders custom direction labels', () => {
    render(
      <Stat
        change={12.5}
        increaseLabel="up year over year"
        label="Revenue"
        value="$1.2M"
      />,
    );

    expect(screen.getByText('12.5% up year over year')).toBeInTheDocument();
  });

  it('formats the change with a custom formatter', () => {
    render(
      <Stat
        change={340}
        formatChange={change => `+${change}`}
        increaseLabel="this month"
        label="Customers"
        value="8,429"
      />,
    );

    expect(screen.getByText('+340 this month')).toBeInTheDocument();
  });

  it('does not emit a percentage change when omitted', () => {
    const {container} = render(<Stat label="Revenue" value="$1.2M" />);

    expect(container.querySelector('[data-direction]')).not.toBeInTheDocument();
  });

  it('renders the optional description in the value details', () => {
    render(
      <Stat
        description="For the reporting period ending June 30"
        label="Revenue"
        value="$1.2M"
      />,
    );

    const value = screen.getByText('$1.2M');
    const description = screen.getByText(
      'For the reporting period ending June 30',
    );
    const details = assertNonNull(value.closest('dd'));
    const expectedClasses = textRecipe({
      color: 'secondary',
      display: 'block',
      type: 'supporting',
    });

    expect(details).toContainElement(description);
    expect(description).toHaveClass(...classesOf(expectedClasses));
  });

  it('does not emit a description node when omitted', () => {
    render(<Stat label="Revenue" value="$1.2M" />);

    const details = assertNonNull(screen.getByText('$1.2M').closest('dd'));
    expect(details.children).toHaveLength(1);
  });

  it('does not emit a description node for an empty string', () => {
    render(<Stat description="" label="Revenue" value="$1.2M" />);

    const details = assertNonNull(screen.getByText('$1.2M').closest('dd'));
    expect(details.children).toHaveLength(1);
  });

  it('renders an optional decorative icon through Icon', () => {
    const {container} = render(
      <Stat icon={CircleDollarSign} label="Revenue" value="$1.2M" />,
    );

    const icon = assertNonNull(container.querySelector('svg'));
    const label = assertNonNull(screen.getByText('Revenue').closest('dt'));
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon).toHaveClass('silver-w_icon.sm', 'silver-h_icon.sm');
    expect(label.firstElementChild).toBe(icon);
  });

  it('does not emit an SVG when the icon is omitted', () => {
    const {container} = render(<Stat label="Revenue" value="$1.2M" />);

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('forwards root props, className, style, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Stat
        aria-label="Quarterly revenue"
        className="custom-stat"
        data-owner="finance"
        data-testid="stat"
        id="revenue-stat"
        label="Revenue"
        ref={ref}
        role="group"
        style={{color: 'red'}}
        value="$1.2M"
      />,
    );

    const root = screen.getByRole('group', {name: 'Quarterly revenue'});
    expect(root).toBe(screen.getByTestId('stat'));
    expect(root).toHaveAttribute('data-owner', 'finance');
    expect(root).toHaveAttribute('id', 'revenue-stat');
    expect(root).toHaveClass('custom-stat');
    expect(root).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies recipe classes to each structural element', () => {
    const {container} = render(
      <Stat
        description="Reporting period"
        icon={CircleDollarSign}
        label="Revenue"
        value="$1.2M"
      />,
    );
    const classes = statRecipe();
    const root = assertNonNull(container.firstElementChild);
    const definition = assertNonNull(root.querySelector('dl'));
    const label = assertNonNull(definition.querySelector('dt'));
    const details = assertNonNull(definition.querySelector('dd'));

    expect(root).toHaveClass(...classesOf(classes.root));
    expect(definition).toHaveClass(...classesOf(classes.definition));
    expect(label).toHaveClass(...classesOf(classes.label));
    expect(details).toHaveClass(...classesOf(classes.details));
    expect(screen.getByText('$1.2M')).toHaveClass(...classesOf(classes.value));
    expect(screen.getByText('Reporting period')).toHaveClass(
      ...classesOf(classes.description),
    );
  });
});
