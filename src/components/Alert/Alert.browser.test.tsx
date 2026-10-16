import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Alert} from 'components/Alert/Alert';
import {Button} from 'components/Button';

// Real-layout tests for the end area. jsdom has no layout, so it cannot show
// whether the end area fits beside the text or moves under it.

function renderInWidth(width: number): void {
  render(
    <div style={{width}}>
      <Alert
        description="Contact Harbor Therapy."
        endContent={
          <>
            <Button label="Call (415) 555-0100" variant="secondary" />
            <Button label="Email the practice" variant="secondary" />
          </>
        }
        isDismissable
        status="info"
        title="Need to reschedule?"
      />
    </div>,
  );
}

function boxOf(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect();
}

describe('Alert end area', () => {
  it('sits beside the text when the alert is wide enough', () => {
    renderInWidth(900);

    const title = boxOf(screen.getByText('Need to reschedule?'));
    const call = boxOf(screen.getByRole('button', {name: /Call/}));
    const dismiss = boxOf(screen.getByRole('button', {name: 'Dismiss'}));
    expect(call.left).toBeGreaterThan(title.right);
    expect(call.top).toBeLessThan(title.bottom);
    expect(dismiss.left).toBeGreaterThan(call.right);
  });

  it('moves under the text, aligned with the title, when the alert is narrow', () => {
    renderInWidth(320);

    const title = boxOf(screen.getByText('Need to reschedule?'));
    const description = boxOf(screen.getByText('Contact Harbor Therapy.'));
    const call = boxOf(screen.getByRole('button', {name: /Call/}));
    const email = boxOf(
      screen.getByRole('button', {name: 'Email the practice'}),
    );
    // The text keeps its width instead of collapsing to a sliver.
    expect(description.width).toBeGreaterThan(150);
    expect(call.top).toBeGreaterThanOrEqual(description.bottom);
    expect(call.left).toBeCloseTo(title.left, 0);
    // Actions that do not fit one line wrap within the alert.
    expect(email.right).toBeLessThanOrEqual(320);
  });
});
