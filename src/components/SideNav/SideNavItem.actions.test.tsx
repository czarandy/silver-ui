import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {MouseEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {SideNav} from 'components/SideNav/SideNav';
import {SideNavItem} from 'components/SideNav/SideNavItem';

describe('SideNavItem actions', () => {
  it('does not toggle children when a secondary action is activated', async () => {
    const user = userEvent.setup();
    render(
      <SideNavItem
        actions={<button type="button">Edit</button>}
        isCollapsible
        label="Projects">
        <SideNavItem href="#child" label="Child" />
      </SideNavItem>,
    );
    await user.click(screen.getByRole('button', {name: 'Edit'}));
    expect(screen.getByRole('button', {name: 'Projects'})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await user.click(screen.getByRole('button', {name: 'Projects'}));
    expect(screen.queryByRole('link', {name: 'Child'})).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Edit'})).toHaveFocus();
  });
  it.each(['link', 'button', 'toggle'] as const)(
    'keeps actions outside the %s target and activates them independently',
    async kind => {
      const user = userEvent.setup();
      const onPrimary = vi.fn((event: MouseEvent<HTMLElement>) =>
        event.preventDefault(),
      );
      const onAction = vi.fn();
      render(
        <SideNavItem
          actions={
            <button onClick={onAction} type="button">
              Edit
            </button>
          }
          href={kind === 'link' ? '#projects' : undefined}
          isCollapsible={kind === 'toggle'}
          label="Projects"
          onClick={kind === 'toggle' ? undefined : onPrimary}>
          {kind === 'toggle' ? (
            <SideNavItem href="#child" label="Child" />
          ) : null}
        </SideNavItem>,
      );
      const primary = screen.getByRole(kind === 'link' ? 'link' : 'button', {
        name: 'Projects',
      });
      expect(
        within(primary).queryByRole('button', {name: 'Edit'}),
      ).not.toBeInTheDocument();
      await user.tab();
      expect(primary).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', {name: 'Edit'})).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.click(screen.getByRole('button', {name: 'Edit'}));
      expect(onAction).toHaveBeenCalledTimes(2);
      expect(onPrimary).not.toHaveBeenCalled();
    },
  );

  it.each(['link', 'button'] as const)(
    'orders %s, toggle, actions, and expanded children',
    async kind => {
      const user = userEvent.setup();
      render(
        <>
          <SideNavItem
            actions={<button type="button">Edit</button>}
            href={kind === 'link' ? '#projects' : undefined}
            isCollapsible
            label="Projects"
            onClick={() => {}}>
            <SideNavItem href="#child" label="Child" />
          </SideNavItem>
          <button type="button">Next</button>
        </>,
      );
      const toggle = screen.getByRole('button', {name: 'Collapse Projects'});
      for (const control of [
        screen.getByRole(kind === 'link' ? 'link' : 'button', {
          name: 'Projects',
        }),
        toggle,
        screen.getByRole('button', {name: 'Edit'}),
        screen.getByRole('link', {name: 'Child'}),
      ]) {
        await user.tab();
        expect(control).toHaveFocus();
      }
      await user.click(toggle);
      expect(
        screen.queryByRole('link', {name: 'Child'}),
      ).not.toBeInTheDocument();
      await user.tab();
      expect(screen.getByRole('button', {name: 'Edit'})).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', {name: 'Next'})).toHaveFocus();
      await user.click(toggle);
      await user.tab();
      await user.tab();
      expect(screen.getByRole('link', {name: 'Child'})).toHaveFocus();
    },
  );

  it.each(['link', 'button', 'toggle'] as const)(
    'lets actions own their disabled state on a disabled %s row',
    async kind => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const onPrimary = vi.fn();
      render(
        <SideNavItem
          actions={
            <>
              <button onClick={onAction} type="button">
                Edit
              </button>
              <button disabled type="button">
                Delete
              </button>
            </>
          }
          href={kind === 'link' ? '#projects' : undefined}
          isCollapsible
          isDefaultExpanded={false}
          isDisabled
          label="Projects"
          onClick={kind === 'toggle' ? undefined : onPrimary}>
          <SideNavItem href="#child" label="Child" />
        </SideNavItem>,
      );
      expect(screen.getByRole('button', {name: 'Projects'})).toBeDisabled();
      for (const control of screen.getAllByRole('button', {name: /Projects/})) {
        expect(control).toBeDisabled();
      }
      await user.tab();
      expect(screen.getByRole('button', {name: 'Edit'})).toHaveFocus();
      await user.keyboard(' ');
      expect(onAction).toHaveBeenCalledOnce();
      expect(onPrimary).not.toHaveBeenCalled();
      expect(screen.getByRole('button', {name: 'Delete'})).toBeDisabled();
    },
  );

  it('removes actions in the collapsed rail and restores them when expanded', async () => {
    const user = userEvent.setup();
    render(
      <SideNav collapseBreakpoint="none" isCollapsible>
        <SideNavItem
          actions={<button type="button">Edit</button>}
          href="#projects"
          label="Projects"
        />
      </SideNav>,
    );
    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));
    expect(
      screen.queryByRole('button', {name: 'Edit'}),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Projects'})).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Expand sidebar'}));
    expect(screen.getByRole('button', {name: 'Edit'})).toBeInTheDocument();
  });
});
