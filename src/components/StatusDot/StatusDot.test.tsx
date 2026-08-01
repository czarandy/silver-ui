import {render, screen} from '@testing-library/react';
import {Check} from 'lucide-react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {StatusDot} from 'components/StatusDot/StatusDot';

describe('StatusDot', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an image role with the accessible label', () => {
    render(<StatusDot label="Online" />);

    expect(screen.getByRole('img', {name: 'Online'})).toBeInTheDocument();
  });

  it('defaults to the success variant', () => {
    render(<StatusDot label="Online" />);

    expect(screen.getByRole('img')).toHaveClass('silver-bg_presence.success');
  });

  it('applies neutral and error variants', () => {
    const {rerender} = render(<StatusDot label="Away" variant="neutral" />);

    expect(screen.getByRole('img')).toHaveClass('silver-bg_presence.neutral');

    rerender(<StatusDot label="Offline" variant="error" />);

    expect(screen.getByRole('img')).toHaveClass('silver-bg_presence.error');
  });

  it('defaults to the md size', () => {
    render(<StatusDot label="Online" />);

    expect(screen.getByRole('img')).toHaveClass(
      'silver---status-dot-size_20px',
    );
  });

  it('applies size variants', () => {
    const {rerender} = render(<StatusDot label="Online" size="sm" />);

    expect(screen.getByRole('img')).toHaveClass(
      'silver---status-dot-size_10px',
    );

    rerender(<StatusDot label="Online" size="lg" />);

    expect(screen.getByRole('img')).toHaveClass(
      'silver---status-dot-size_32px',
    );
  });

  it('renders without a ring by default', () => {
    render(<StatusDot label="Online" />);

    expect(screen.getByRole('img')).not.toHaveClass(
      'silver-bd-w_var(--status-dot-border)',
      'silver-bd-c_bg',
    );
  });

  it('renders a background-colored ring when hasRing is set', () => {
    render(<StatusDot hasRing label="Online" />);

    expect(screen.getByRole('img')).toHaveClass(
      'silver-bd-w_var(--status-dot-border)',
    );
  });

  it('renders the icon at md and lg sizes without changing the label', () => {
    render(<StatusDot icon={<Check data-testid="check" />} label="Verified" />);

    expect(screen.getByTestId('check')).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Verified'})).toBeInTheDocument();
  });

  it('does not render the icon at the sm size', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <StatusDot
        icon={<Check data-testid="check" />}
        label="Verified"
        size="sm"
      />,
    );

    expect(screen.queryByTestId('check')).not.toBeInTheDocument();
  });

  it('warns in development when the icon is not visible at the sm size', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<StatusDot icon={<Check />} label="Verified" size="sm" />);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('icon'));
  });

  it('does not warn when the icon is visible', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<StatusDot icon={<Check />} label="Verified" />);

    expect(warn).not.toHaveBeenCalled();
  });

  it('applies className, style, data-testid, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <StatusDot
        className="custom-class"
        data-testid="dot"
        label="Online"
        ref={ref}
        style={{margin: 4}}
      />,
    );

    const root = screen.getByTestId('dot');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({margin: '4px'});
    expect(ref).toHaveBeenCalledWith(root);
  });
});
