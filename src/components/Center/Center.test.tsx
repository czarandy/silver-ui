import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Center} from 'components/Center/Center';

describe('Center', () => {
  it('renders children centered on both axes by default', () => {
    render(<Center data-testid="center">Content</Center>);

    const center = screen.getByTestId('center');
    expect(center).toHaveTextContent('Content');
    expect(center).toHaveClass('silver-ai_center');
    expect(center).toHaveClass('silver-jc_center');
  });

  it('centers only horizontally when axis is horizontal', () => {
    render(
      <Center axis="horizontal" data-testid="center">
        Content
      </Center>,
    );

    const center = screen.getByTestId('center');
    expect(center).toHaveClass('silver-jc_center');
    expect(center).not.toHaveClass('silver-ai_center');
  });

  it('centers only vertically when axis is vertical', () => {
    render(
      <Center axis="vertical" data-testid="center">
        Content
      </Center>,
    );

    const center = screen.getByTestId('center');
    expect(center).toHaveClass('silver-ai_center');
    expect(center).not.toHaveClass('silver-jc_center');
  });

  it('renders inline when requested', () => {
    render(
      <Center axis="both" data-testid="center" isInline>
        Content
      </Center>,
    );

    const center = screen.getByTestId('center');
    expect(center).toHaveClass('silver-d_inline-flex');
    expect(center).toHaveClass('silver-ai_center');
    expect(center).toHaveClass('silver-jc_center');
  });

  it('applies numeric width and height as pixels', () => {
    render(
      <Center data-testid="center" height={200} width={300}>
        Content
      </Center>,
    );

    expect(screen.getByTestId('center')).toHaveStyle({
      height: '200px',
      width: '300px',
    });
  });

  it('applies string width and height as-is', () => {
    render(
      <Center data-testid="center" height="100%" width="auto">
        Content
      </Center>,
    );

    expect(screen.getByTestId('center')).toHaveStyle({
      height: '100%',
      width: 'auto',
    });
  });

  it('width and height props take precedence over style', () => {
    render(
      <Center
        data-testid="center"
        height={200}
        style={{width: '50%', height: '50%'}}
        width={300}>
        Content
      </Center>,
    );

    expect(screen.getByTestId('center')).toHaveStyle({
      width: '300px',
      height: '200px',
    });
  });

  it('passes through style when width and height are not set', () => {
    render(
      <Center
        data-testid="center"
        style={{width: '50%', height: '50%', color: 'red'}}>
        Content
      </Center>,
    );

    expect(screen.getByTestId('center')).toHaveStyle({
      width: '50%',
      height: '50%',
      color: 'rgb(255, 0, 0)',
    });
  });

  it('forwards className, ref, and native HTML attributes', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Center
        aria-label="centered region"
        className="custom-center"
        data-testid="center"
        ref={ref}
        role="region">
        Content
      </Center>,
    );

    const center = screen.getByTestId('center');
    expect(center).toHaveClass('custom-center');
    expect(center).toHaveAttribute('aria-label', 'centered region');
    expect(center).toHaveAttribute('role', 'region');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
