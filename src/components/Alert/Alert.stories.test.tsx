import {composeStories} from '@storybook/react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import * as stories from 'components/Alert/Alert.stories';

const {BlockDescription, CenteredEndContent, WithSecondaryAction} =
  composeStories(stories);

describe('Alert stories', () => {
  it('composes the block description from the List component', () => {
    render(<BlockDescription />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);

    for (const item of items) {
      // ListItem renders its marker before the content wrapper. A native list
      // item would contain only the text and would regress the missing markers.
      // eslint-disable-next-line testing-library/no-node-access
      expect(item.children).toHaveLength(2);
    }
  });

  it('shows the centered end-content option with an action', () => {
    render(<CenteredEndContent />);

    const action = screen.getByRole('button', {name: 'Upgrade plan'});
    // eslint-disable-next-line testing-library/no-node-access -- the end-area slot has no semantic role of its own
    expect(action.parentElement).toHaveClass('silver-as_center');
  });

  it('shows paired secondary and primary actions for every status', () => {
    render(<WithSecondaryAction />);

    for (const name of [
      'Later',
      'Update now',
      'View details',
      'Download',
      'Not now',
      'Upgrade plan',
      'Cancel',
      'Update payment',
    ]) {
      expect(screen.getByRole('button', {name})).toBeInTheDocument();
    }
  });
});
