import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {MetadataList} from './MetadataList';
import {MetadataListItem} from './MetadataListItem';

describe('MetadataList', () => {
  it('renders semantic metadata items', () => {
    render(
      <MetadataList title="Details">
        <MetadataListItem label="Status">Active</MetadataListItem>
        <MetadataListItem label="Owner">Design systems</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Status').tagName).toBe('DT');
    expect(screen.getByText('Active').tagName).toBe('DD');
  });

  it('collapses and expands when maxNumOfItems is set', async () => {
    const user = userEvent.setup();

    render(
      <MetadataList maxNumOfItems={1}>
        <MetadataListItem label="Status">Active</MetadataListItem>
        <MetadataListItem label="Owner">Design systems</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Design systems')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Show more'}));

    expect(screen.getByText('Design systems')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Show less'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
