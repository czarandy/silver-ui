import {render, screen, within} from '@testing-library/react';
import {CircleCheck} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
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

  it('labels the dl with the title via aria-labelledby', () => {
    render(
      <MetadataList title="Details">
        <MetadataListItem label="Status">Active</MetadataListItem>
      </MetadataList>,
    );

    const heading = screen.getByRole('heading', {name: 'Details'});
    const dl = screen.getByRole('definition').closest('dl')!; // eslint-disable-line testing-library/no-node-access
    expect(dl).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('renders without a title', () => {
    render(
      <MetadataList data-testid="list">
        <MetadataListItem label="Status">Active</MetadataListItem>
      </MetadataList>,
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('wraps items in a stacked layout when labelPosition is top', () => {
    render(
      <MetadataList labelPosition="top">
        <MetadataListItem data-testid="item" label="Status">
          Active
        </MetadataListItem>
      </MetadataList>,
    );

    const item = screen.getByTestId('item');
    const dt = within(item).getByText('Status');
    const dd = within(item).getByText('Active');
    expect(dt.tagName).toBe('DT');
    expect(dd.tagName).toBe('DD');
  });

  it('renders items inline by default', () => {
    render(
      <MetadataList>
        <MetadataListItem data-testid="item" label="Status">
          Active
        </MetadataListItem>
      </MetadataList>,
    );

    const item = screen.getByTestId('item');
    const dt = within(item).getByText('Status');
    const dd = within(item).getByText('Active');
    expect(dt.tagName).toBe('DT');
    expect(dd.tagName).toBe('DD');
  });

  it('renders an icon as a decorative element', () => {
    render(
      <MetadataList>
        <MetadataListItem icon={CircleCheck} label="Status">
          Active
        </MetadataListItem>
      </MetadataList>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying decorative svg presence
    expect(screen.getByText('Status').querySelector('svg')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to MetadataList', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <MetadataList
        className="custom-list"
        data-testid="list"
        ref={ref}
        style={{color: 'red'}}>
        <MetadataListItem label="Status">Active</MetadataListItem>
      </MetadataList>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('custom-list');
    expect(list).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('applies className, style, data-testid, and ref to MetadataListItem', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <MetadataList labelPosition="top">
        <MetadataListItem
          className="custom-item"
          data-testid="item"
          label="Status"
          ref={ref}
          style={{color: 'blue'}}>
          Active
        </MetadataListItem>
      </MetadataList>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveClass('custom-item');
    expect(item).toHaveStyle({color: 'rgb(0, 0, 255)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('throws in dev when MetadataListItem is rendered outside MetadataList', () => {
    expect(() =>
      render(
        <MetadataListItem data-testid="item" label="Status">
          Active
        </MetadataListItem>,
      ),
    ).toThrow('MetadataListItem must be rendered inside a MetadataList.');
  });
});
