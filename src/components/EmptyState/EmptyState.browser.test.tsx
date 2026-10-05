import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Button} from 'components/Button';
import {EmptyState} from 'components/EmptyState/EmptyState';

// Real-layout tests for the actions slot. jsdom has no layout, so it cannot
// show how wide an action renders.

function renderInWidth(width: number, actions: React.ReactNode): void {
  render(
    <div style={{width}}>
      <EmptyState
        actions={actions}
        description="Create a project to start tracking work across your whole team."
        title="No projects"
      />
    </div>,
  );
}

function widthOf(element: HTMLElement): number {
  return element.getBoundingClientRect().width;
}

describe('EmptyState actions', () => {
  it.each([
    [300, 252],
    [800, 420],
  ])(
    'lets a full-width action fill the content width, up to 420px, in a %ipx container',
    (width, expected) => {
      renderInWidth(
        width,
        <Button label="Create project" variant="primary" width="full" />,
      );

      expect(
        widthOf(screen.getByRole('button', {name: 'Create project'})),
      ).toBeCloseTo(expected, 0);
    },
  );

  it('keeps a natural-width action centered at its own size', () => {
    renderInWidth(800, <Button label="Create project" variant="primary" />);

    const button = screen.getByRole('button', {name: 'Create project'});
    const region = screen.getByRole('region');
    const buttonBox = button.getBoundingClientRect();
    const regionBox = region.getBoundingClientRect();
    expect(buttonBox.width).toBeLessThan(200);
    expect(
      buttonBox.left +
        buttonBox.width / 2 -
        regionBox.left -
        regionBox.width / 2,
    ).toBeCloseTo(0, 0);
  });
});
