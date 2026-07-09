import {beforeAll, describe, expect, it} from 'vitest';
import {createLibraryProgram, extractComponentExports} from './extract-props';
import type {ExportDoc, PropDoc} from './types';

// One shared program over the components under test; creating it is the
// expensive part (~seconds), extraction is cheap.
let programExports: Record<string, ExportDoc[]>;

function prop(exported: ExportDoc, groupIndex: number, name: string): PropDoc {
  const found = exported.groups[groupIndex].props.find(p => p.name === name);
  if (found == null) {
    throw new Error(`prop ${name} not found in group ${groupIndex}`);
  }
  return found;
}

beforeAll(() => {
  const names = ['Button', 'Badge', 'DateInput', 'Stack', 'TopNav'];
  const program = createLibraryProgram(names);
  programExports = Object.fromEntries(
    names.map(name => [name, extractComponentExports(program, name)]),
  );
});

describe('extractComponentExports', () => {
  it('documents the discriminated union branches of ButtonProps', () => {
    const [button] = programExports.Button;
    expect(button.name).toBe('Button');
    expect(button.groups.map(group => group.label)).toEqual([
      'isIconOnly: true',
      'isIconOnly: false',
    ]);
    // icon is required in icon-only mode, optional otherwise.
    expect(prop(button, 0, 'icon')).toMatchObject({
      type: 'IconComponent',
      required: true,
    });
    expect(prop(button, 1, 'icon')).toMatchObject({required: false});
  });

  it('expands literal-union aliases and keeps rich aliases by name', () => {
    const [button] = programExports.Button;
    expect(prop(button, 0, 'size').type).toBe('"sm" | "md" | "lg"');
    expect(prop(button, 0, 'endContent').type).toBe('ReactNode');
    expect(prop(button, 0, 'isDisabled').type).toBe('boolean');
  });

  it('keeps locally re-declared aria props with their JSDoc', () => {
    const [button] = programExports.Button;
    const ariaLabel = prop(button, 0, 'aria-label');
    expect(ariaLabel.description).toContain('Accessible label');
  });

  it('captures @default JSDoc tags', () => {
    const [dateInput] = programExports.DateInput;
    expect(prop(dateInput, 0, 'hasClear')).toMatchObject({
      defaultValue: 'false',
      required: false,
    });
  });

  it('documents required props and descriptions on a simple component', () => {
    const [badge] = programExports.Badge;
    expect(badge.description).toContain('status label');
    expect(badge.groups).toHaveLength(1);
    expect(prop(badge, 0, 'label').required).toBe(true);
  });

  it('documents every exported component with a Props pair', () => {
    expect(programExports.Stack.map(e => e.name).sort()).toEqual([
      'HStack',
      'VStack',
    ]);
    const topNav = programExports.TopNav.map(e => e.name);
    // The directory-named export comes first.
    expect(topNav[0]).toBe('TopNav');
    expect(topNav).toContain('TopNavItem');
    expect(topNav).toContain('TopNavHeading');
  });
});
