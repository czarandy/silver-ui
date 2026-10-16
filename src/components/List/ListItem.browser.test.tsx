import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Button} from 'components/Button';
import {List} from 'components/List/List';
import {ListItem} from 'components/List/ListItem';

// Real-layout tests for the end content. jsdom has no layout, so it cannot
// show whether the end content fits beside the label or moves under it.

const LABEL = 'Progress Questionnaire for returning clients';

function renderInWidth(width: number): void {
  render(
    <div style={{width}}>
      <List>
        <ListItem
          description="Optional"
          endContent={<Button label="Continue form" variant="primary" />}
          label={LABEL}
        />
      </List>
    </div>,
  );
}

function boxOf(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

describe('ListItem end content', () => {
  it('sits beside the label when the item is wide enough', () => {
    renderInWidth(900);

    const label = boxOf(screen.getByText(LABEL));
    const action = boxOf(screen.getByRole('button', {name: 'Continue form'}));
    expect(action.left).toBeGreaterThan(label.right);
    expect(action.top).toBeLessThan(label.bottom);
  });

  it('moves to its own line at the trailing edge when the item is narrow', () => {
    renderInWidth(300);

    const label = boxOf(screen.getByText(LABEL));
    const description = boxOf(screen.getByText('Optional'));
    const action = boxOf(screen.getByRole('button', {name: 'Continue form'}));
    // The label keeps the row's width instead of being squeezed beside the
    // action.
    expect(label.width).toBeGreaterThan(200);
    expect(action.top).toBeGreaterThanOrEqual(description.bottom);
    expect(action.right).toBeLessThanOrEqual(300);
  });

  it('shows as many label lines as labelLines allows', () => {
    render(
      <div style={{width: 200}}>
        <List>
          <ListItem label={LABEL} />
          <ListItem label={`${LABEL} again`} labelLines={2} />
        </List>
      </div>,
    );

    const oneLine = boxOf(screen.getByText(LABEL)).height;
    expect(boxOf(screen.getByText(`${LABEL} again`)).height).toBeGreaterThan(
      oneLine * 1.5,
    );
  });
});
