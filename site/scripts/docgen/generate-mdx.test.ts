import {describe, expect, it} from 'vitest';
import {componentMdx} from './generate-mdx';
import {readmeDescriptions} from './readme-descriptions';

describe('componentMdx', () => {
  it('renders frontmatter, lead, and one API section per export', () => {
    const mdx = componentMdx({
      name: 'Stack',
      slug: 'stack',
      category: 'Layout & Structure',
      description: 'Flex containers with gap.',
      exports: [
        {name: 'HStack', description: '', groups: [{props: []}]},
        {name: 'VStack', description: '', groups: [{props: []}]},
      ],
    });
    expect(mdx).toContain('title: "Stack"');
    expect(mdx).toContain('description: "Flex containers with gap."');
    expect(mdx).toContain('<ComponentDoc name="Stack" />');
    expect(mdx).toContain('### HStack');
    expect(mdx).toContain(
      '<PropsTable component="Stack" exportName="HStack" />',
    );
    expect(mdx).toContain('### VStack');
  });

  it('escapes quotes in descriptions via JSON stringification', () => {
    const mdx = componentMdx({
      name: 'Kbd',
      slug: 'kbd',
      category: 'Data Display',
      description: 'Shows "keyboard" keys.',
      exports: [{name: 'Kbd', description: '', groups: [{props: []}]}],
    });
    expect(mdx).toContain('description: "Shows \\"keyboard\\" keys."');
  });
});

describe('readmeDescriptions', () => {
  it('maps component names to their README one-liners', () => {
    const descriptions = readmeDescriptions();
    expect(descriptions.get('Button')).toContain('action element');
    // Combined entries map each name.
    expect(descriptions.get('HStack')).toContain('flex containers');
    expect(descriptions.get('VStack')).toContain('flex containers');
  });
});
