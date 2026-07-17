import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useFocusTrap} from 'internal/useFocusTrap';

function FocusTrapFixture() {
  const {containerRef, focusFirst} = useFocusTrap<HTMLDivElement>({
    isActive: true,
  });

  return (
    <>
      <button onClick={focusFirst} type="button">
        Focus first
      </button>
      <div ref={containerRef}>
        <svg aria-hidden="true">
          <use href="#first-icon" />
        </svg>
        <a href="#first-link">First link</a>
        <button type="button">Last button</button>
        <svg aria-hidden="true">
          <use href="#last-icon" />
        </svg>
      </div>
    </>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first link instead of a preceding href element', () => {
    render(<FocusTrapFixture />);

    fireEvent.click(screen.getByRole('button', {name: 'Focus first'}));

    expect(screen.getByRole('link', {name: 'First link'})).toHaveFocus();
  });

  it('does not treat non-link href elements as focusable', () => {
    render(<FocusTrapFixture />);

    const first = screen.getByRole('link', {name: 'First link'});
    const last = screen.getByRole('button', {name: 'Last button'});

    last.focus();
    fireEvent.keyDown(document, {key: 'Tab'});
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(document, {key: 'Tab', shiftKey: true});
    expect(last).toHaveFocus();
  });

  it('treats areas with href attributes as focusable links', () => {
    function AreaFocusTrapFixture() {
      const {containerRef} = useFocusTrap<HTMLDivElement>({isActive: true});

      return (
        <div ref={containerRef}>
          <button type="button">First button</button>
          <map name="links">
            <area alt="Last link" href="#last-link" shape="default" />
          </map>
        </div>
      );
    }

    render(<AreaFocusTrapFixture />);

    const first = screen.getByRole('button', {name: 'First button'});
    const last = screen.getByAltText('Last link');
    const focusLast = vi.spyOn(last, 'focus');

    first.focus();
    fireEvent.keyDown(document, {key: 'Tab', shiftKey: true});
    expect(focusLast).toHaveBeenCalledOnce();
  });
});
