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
});
