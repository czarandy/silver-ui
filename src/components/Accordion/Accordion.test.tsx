import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Accordion} from 'components/Accordion/Accordion';
import {AccordionItem} from 'components/Accordion/AccordionItem';

describe('AccordionItem (standalone)', () => {
  it('renders trigger and children', () => {
    render(
      <AccordionItem trigger="My Trigger">
        <p>Content</p>
      </AccordionItem>,
    );
    expect(screen.getByText('My Trigger')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('starts open by default', () => {
    render(
      <AccordionItem trigger="Details">
        <p>Visible content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Visible content')).toBeVisible();
  });

  it('toggles content on click', async () => {
    const user = userEvent.setup();
    render(
      <AccordionItem trigger="Details">
        <p>Collapsible content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Collapsible content')).not.toBeVisible();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Collapsible content')).toBeVisible();
  });

  it('starts collapsed when defaultIsOpen is false', () => {
    render(
      <AccordionItem isDefaultOpen={false} trigger="Details">
        <p>Hidden content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Hidden content')).not.toBeVisible();
  });

  it('respects controlled isOpen/onOpenChange', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    const {rerender} = render(
      <AccordionItem
        isOpen={true}
        onOpenChange={onOpenChange}
        trigger="Controlled">
        <p>Controlled content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Controlled/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <AccordionItem
        isOpen={false}
        onOpenChange={onOpenChange}
        trigger="Controlled">
        <p>Controlled content</p>
      </AccordionItem>,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Controlled content')).not.toBeVisible();
  });

  it('toggles internal state and calls onOpenChange in uncontrolled mode', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AccordionItem onOpenChange={onOpenChange} trigger="Notified">
        <p>Content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Notified/});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('activates via keyboard (Enter and Space)', async () => {
    const user = userEvent.setup();
    render(
      <AccordionItem trigger="Keyboard">
        <p>Content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Keyboard/});
    trigger.focus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('links trigger to content panel via aria-controls', () => {
    render(
      <AccordionItem trigger="Details">
        <p>Content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Details/});
    const panel = screen.getByRole('region');

    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('disables the trigger when isDisabled is true', async () => {
    const user = userEvent.setup();
    render(
      <AccordionItem isDisabled trigger="Disabled">
        <p>Content</p>
      </AccordionItem>,
    );

    const trigger = screen.getByRole('button', {name: /Disabled/});
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Accordion', () => {
  describe('single mode', () => {
    it('only allows one item open at a time', async () => {
      const user = userEvent.setup();
      render(
        <Accordion defaultValue="a" type="single">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
          <AccordionItem trigger="Item C" value="c">
            <p>Content C</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).not.toBeVisible();

      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
      expect(screen.getByText('Content C')).not.toBeVisible();
    });

    it('closes the open item when clicking it again', async () => {
      const user = userEvent.setup();
      render(
        <Accordion defaultValue="a" type="single">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      await user.click(screen.getByRole('button', {name: /Item A/}));
      expect(screen.getByText('Content A')).not.toBeVisible();
    });
  });

  describe('multiple mode', () => {
    it('allows multiple items to be open simultaneously', async () => {
      const user = userEvent.setup();
      render(
        <Accordion defaultValue={['a']} type="multiple">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });
  });

  describe('controlled mode', () => {
    it('respects value and onChange in single mode', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      const {rerender} = render(
        <Accordion onChange={onChange} type="single" value="a">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(onChange).toHaveBeenCalledWith('b');

      rerender(
        <Accordion onChange={onChange} type="single" value="b">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('emits null when closing the active item in single mode', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Accordion onChange={onChange} type="single" value="a">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
        </Accordion>,
      );

      await user.click(screen.getByRole('button', {name: /Item A/}));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('respects value and onChange in multiple mode', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      const {rerender} = render(
        <Accordion onChange={onChange} type="multiple" value={['a']}>
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();

      await user.click(screen.getByRole('button', {name: /Item B/}));
      expect(onChange).toHaveBeenCalledWith(['a', 'b']);

      rerender(
        <Accordion onChange={onChange} type="multiple" value={['a', 'b']}>
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();

      await user.click(screen.getByRole('button', {name: /Item A/}));
      expect(onChange).toHaveBeenCalledWith(['b']);
    });
  });

  describe('defaultValue', () => {
    it('opens the specified item by default', () => {
      render(
        <Accordion defaultValue="b">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).not.toBeVisible();
      expect(screen.getByText('Content B')).toBeVisible();
    });

    it('opens multiple items by default in multiple mode', () => {
      render(
        <Accordion defaultValue={['a', 'c']} type="multiple">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
          <AccordionItem trigger="Item C" value="c">
            <p>Content C</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
      expect(screen.getByText('Content C')).toBeVisible();
    });
  });

  describe('accessibility', () => {
    it('sets aria-expanded on triggers', () => {
      render(
        <Accordion defaultValue="a" type="single">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('button', {name: /Item A/})).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('button', {name: /Item B/})).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('links each trigger to its content panel via aria-controls', () => {
      render(
        <Accordion defaultValue="a" type="single">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      const triggers = screen.getAllByRole('button');
      const panels = screen.getAllByRole('region', {hidden: true});
      expect(panels).toHaveLength(2);

      for (const [i, trigger] of triggers.entries()) {
        const panel = panels[i];
        expect(trigger).toHaveAttribute('aria-controls', panel.id);
        expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
      }
    });

    it('throws when an item inside Accordion has no value', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <Accordion defaultValue="a" type="single">
            <AccordionItem trigger="Item A" value="a">
              <p>Content A</p>
            </AccordionItem>
            <AccordionItem trigger="No Value">
              <p>Content B</p>
            </AccordionItem>
          </Accordion>,
        );
      }).toThrow('`value` prop is required');

      errorSpy.mockRestore();
    });
  });

  describe('root element props', () => {
    it('applies className, style, data-testid, and ref', () => {
      const ref = vi.fn<(el: HTMLDivElement | null) => void>();

      render(
        <Accordion
          className="custom-accordion"
          data-testid="my-accordion"
          defaultValue="a"
          ref={ref}
          style={{color: 'red'}}>
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
        </Accordion>,
      );

      const root = screen.getByTestId('my-accordion');
      expect(root).toHaveClass('custom-accordion');
      expect(root).toHaveStyle({color: 'rgb(255, 0, 0)'});
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it('forwards aria-label and is discoverable by role', () => {
      render(
        <Accordion aria-label="FAQ" defaultValue="a">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByRole('group', {name: 'FAQ'})).toBeInTheDocument();
    });

    it('forwards aria-labelledby and is discoverable by role', () => {
      render(
        <>
          <h2 id="heading">Frequently Asked Questions</h2>
          <Accordion aria-labelledby="heading" defaultValue="a">
            <AccordionItem trigger="Item A" value="a">
              <p>Content A</p>
            </AccordionItem>
          </Accordion>
        </>,
      );

      expect(
        screen.getByRole('group', {name: 'Frequently Asked Questions'}),
      ).toBeInTheDocument();
    });
  });

  describe('grouped item behavior', () => {
    it('ignores isDefaultOpen on items inside an Accordion', () => {
      render(
        <Accordion defaultValue="a" type="single">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem isDefaultOpen trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
    });

    it('does not toggle a disabled item inside an Accordion', async () => {
      const user = userEvent.setup();

      render(
        <Accordion defaultValue="a" type="single">
          <AccordionItem trigger="Item A" value="a">
            <p>Content A</p>
          </AccordionItem>
          <AccordionItem isDisabled trigger="Item B" value="b">
            <p>Content B</p>
          </AccordionItem>
        </Accordion>,
      );

      const triggerB = screen.getByRole('button', {name: /Item B/});
      expect(triggerB).toBeDisabled();

      await user.click(triggerB);
      expect(screen.getByText('Content A')).toBeVisible();
      expect(screen.getByText('Content B')).not.toBeVisible();
    });
  });
});
