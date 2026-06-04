import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {AspectRatio} from './AspectRatio';

describe('AspectRatio', () => {
  it('renders with the provided aspect ratio', () => {
    render(
      <AspectRatio data-testid="ratio" ratio={16 / 9}>
        <div>Content</div>
      </AspectRatio>,
    );

    expect(screen.getByTestId('ratio')).toHaveStyle({
      aspectRatio: String(16 / 9),
    });
  });

  it('renders children inside the ratio container', () => {
    render(
      <AspectRatio ratio={1}>
        <img alt="Preview" src="/preview.png" />
      </AspectRatio>,
    );

    expect(screen.getByRole('img', {name: 'Preview'})).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <AspectRatio
        className="custom-ratio"
        data-testid="ratio"
        ratio={1}
        ref={ref}
        style={{color: 'red'}}>
        <div>Content</div>
      </AspectRatio>,
    );

    const ratio = screen.getByTestId('ratio');
    expect(ratio).toHaveClass('custom-ratio');
    expect(ratio).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards additional HTML attributes to the root element', () => {
    render(
      <AspectRatio
        aria-label="media container"
        data-testid="ratio"
        id="hero-media"
        ratio={16 / 9}
        role="img">
        <div>Content</div>
      </AspectRatio>,
    );

    const root = screen.getByTestId('ratio');
    expect(root).toHaveAttribute('id', 'hero-media');
    expect(root).toHaveAttribute('role', 'img');
    expect(root).toHaveAttribute('aria-label', 'media container');
  });

  it('ratio prop takes precedence over aspectRatio in style', () => {
    render(
      <AspectRatio
        data-testid="ratio"
        ratio={16 / 9}
        style={{aspectRatio: '1/1'}}>
        <div>Content</div>
      </AspectRatio>,
    );

    expect(screen.getByTestId('ratio')).toHaveStyle({
      aspectRatio: String(16 / 9),
    });
  });

  it('throws in development for invalid ratio values', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <AspectRatio ratio={0}>
          <div>Content</div>
        </AspectRatio>,
      );
    }).toThrow('finite positive number');

    expect(() => {
      render(
        <AspectRatio ratio={-1}>
          <div>Content</div>
        </AspectRatio>,
      );
    }).toThrow('finite positive number');

    expect(() => {
      render(
        <AspectRatio ratio={NaN}>
          <div>Content</div>
        </AspectRatio>,
      );
    }).toThrow('finite positive number');

    expect(() => {
      render(
        <AspectRatio ratio={Infinity}>
          <div>Content</div>
        </AspectRatio>,
      );
    }).toThrow('finite positive number');

    errorSpy.mockRestore();
  });
});
