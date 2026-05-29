import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {ButtonGroup} from './ButtonGroup';

describe('ButtonGroup', () => {
  it('renders a labelled group', () => {
    render(
      <ButtonGroup label="Text alignment">
        <Button label="Left" />
        <Button label="Center" />
      </ButtonGroup>,
    );

    expect(
      screen.getByRole('group', {name: 'Text alignment'}),
    ).toBeInTheDocument();
  });

  it('sets vertical orientation', () => {
    render(
      <ButtonGroup label="Actions" orientation="vertical">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'Actions'})).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
  });

  it('propagates size to child buttons', () => {
    render(
      <ButtonGroup label="Actions" size="lg">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toHaveClass(
      'silver-h_component.lg',
    );
  });

  it('allows child buttons to override group size', () => {
    render(
      <ButtonGroup label="Actions" size="lg">
        <Button label="Copy" size="sm" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toHaveClass(
      'silver-h_component.sm',
    );
  });

  it('propagates disabled state to child buttons', () => {
    render(
      <ButtonGroup isDisabled label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'Actions'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeDisabled();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ButtonGroup
        className="custom-group"
        data-testid="group"
        label="Actions"
        ref={ref}
        style={{color: 'red'}}>
        <Button label="Copy" />
      </ButtonGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveClass('custom-group');
    expect(group).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('defaults to horizontal orientation', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'Actions'})).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );
  });

  it('defaults to md size', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toHaveClass(
      'silver-h_component.md',
    );
  });

  it('does not allow child buttons to override group disabled state', () => {
    render(
      <ButtonGroup isDisabled label="Actions">
        <Button isDisabled={false} label="Test" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Test'})).toBeDisabled();
  });

  it('applies vertical CSS class for vertical orientation', () => {
    render(
      <ButtonGroup label="Actions" orientation="vertical">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'Actions'})).toHaveClass(
      'silver-flex-d_column',
    );
  });

  it('isolates context between multiple ButtonGroups', () => {
    render(
      <>
        <ButtonGroup label="Small actions" size="sm">
          <Button label="Alpha" />
        </ButtonGroup>
        <ButtonGroup label="Large actions" size="lg">
          <Button label="Beta" />
        </ButtonGroup>
      </>,
    );

    expect(screen.getByRole('button', {name: 'Alpha'})).toHaveClass(
      'silver-h_component.sm',
    );
    expect(screen.getByRole('button', {name: 'Beta'})).toHaveClass(
      'silver-h_component.lg',
    );
  });

  it('applies group styling to tooltip-wrapped buttons', () => {
    render(
      <ButtonGroup data-testid="group" label="Actions">
        <Button label="First" tooltip="First action" />
        <Button label="Second" tooltip="Second action" />
        <Button label="Third" tooltip="Third action" />
      </ButtonGroup>,
    );

    const group = screen.getByTestId('group');
    // eslint-disable-next-line testing-library/no-node-access -- verifying tooltip wrapper doesn't break group selectors
    const buttons = group.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
  });

  it('renders link buttons as anchor elements inside the group', () => {
    render(
      <ButtonGroup data-testid="group" label="Navigation">
        <Button href="/home" label="Home" />
        <Button href="/about" label="About" />
      </ButtonGroup>,
    );

    const group = screen.getByTestId('group');
    // eslint-disable-next-line testing-library/no-node-access -- verifying anchor elements are grouped
    const links = group.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'href',
      '/home',
    );
  });
});
