import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from '../Button';
import {Card} from '../Card';
import {Text} from '../Text';
import {Accordion} from './Accordion';
import {AccordionItem} from './AccordionItem';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = {
  render: () => (
    <Card>
      <Accordion aria-label="FAQ" defaultValue="features">
        <AccordionItem trigger="Features" value="features">
          <Text>
            Built with TypeScript, accessible by default, and fully composable.
          </Text>
        </AccordionItem>
        <AccordionItem trigger="Installation" value="installation">
          <Text>
            Install via npm, pnpm, or yarn. No additional peer dependencies.
          </Text>
        </AccordionItem>
        <AccordionItem trigger="Usage" value="usage">
          <Text>
            Import components directly. Tree-shaking is supported out of the
            box.
          </Text>
        </AccordionItem>
      </Accordion>
    </Card>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Card>
      <Accordion
        aria-label="Documentation"
        defaultValue={['features', 'usage']}
        type="multiple">
        <AccordionItem trigger="Features" value="features">
          <Text>
            Built with TypeScript, accessible by default, and fully composable.
          </Text>
        </AccordionItem>
        <AccordionItem trigger="Installation" value="installation">
          <Text>
            Install via npm, pnpm, or yarn. No additional peer dependencies.
          </Text>
        </AccordionItem>
        <AccordionItem trigger="Usage" value="usage">
          <Text>
            Import components directly. Tree-shaking is supported out of the
            box.
          </Text>
        </AccordionItem>
      </Accordion>
    </Card>
  ),
};

export const AllCollapsed: Story = {
  render: () => (
    <Card>
      <Accordion aria-label="Sections" type="single">
        <AccordionItem trigger="Section A" value="a">
          <Text>Content for section A.</Text>
        </AccordionItem>
        <AccordionItem trigger="Section B" value="b">
          <Text>Content for section B.</Text>
        </AccordionItem>
        <AccordionItem trigger="Section C" value="c">
          <Text>Content for section C.</Text>
        </AccordionItem>
      </Accordion>
    </Card>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Card>
      <Accordion aria-label="Settings" defaultValue="general">
        <AccordionItem trigger="General" value="general">
          <Text>General settings content.</Text>
        </AccordionItem>
        <AccordionItem isDisabled trigger="Advanced (locked)" value="advanced">
          <Text>This section is disabled.</Text>
        </AccordionItem>
        <AccordionItem trigger="About" value="about">
          <Text>About this application.</Text>
        </AccordionItem>
      </Accordion>
    </Card>
  ),
};

export const Controlled: Story = {
  render: function Controlled() {
    const [value, setValue] = useState<string | null>('features');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <Button
            label="Open Features"
            onClick={() => {
              setValue('features');
            }}
            variant="secondary"
          />
          <Button
            label="Open Usage"
            onClick={() => {
              setValue('usage');
            }}
            variant="secondary"
          />
          <Button
            label="Close all"
            onClick={() => {
              setValue(null);
            }}
            variant="ghost"
          />
        </div>
        <Card>
          <Accordion
            aria-label="FAQ"
            onChange={setValue}
            type="single"
            value={value}>
            <AccordionItem trigger="Features" value="features">
              <Text>
                Built with TypeScript, accessible by default, and fully
                composable.
              </Text>
            </AccordionItem>
            <AccordionItem trigger="Installation" value="installation">
              <Text>
                Install via npm, pnpm, or yarn. No additional peer dependencies.
              </Text>
            </AccordionItem>
            <AccordionItem trigger="Usage" value="usage">
              <Text>
                Import components directly. Tree-shaking is supported out of the
                box.
              </Text>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    );
  },
};

export const ControlledMultiple: Story = {
  render: function ControlledMultiple() {
    const [value, setValue] = useState<string[]>(['features']);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <Button
            label="Open all"
            onClick={() => {
              setValue(['features', 'installation', 'usage']);
            }}
            variant="secondary"
          />
          <Button
            label="Close all"
            onClick={() => {
              setValue([]);
            }}
            variant="ghost"
          />
        </div>
        <Card>
          <Accordion
            aria-label="FAQ"
            onChange={setValue}
            type="multiple"
            value={value}>
            <AccordionItem trigger="Features" value="features">
              <Text>
                Built with TypeScript, accessible by default, and fully
                composable.
              </Text>
            </AccordionItem>
            <AccordionItem trigger="Installation" value="installation">
              <Text>
                Install via npm, pnpm, or yarn. No additional peer dependencies.
              </Text>
            </AccordionItem>
            <AccordionItem trigger="Usage" value="usage">
              <Text>
                Import components directly. Tree-shaking is supported out of the
                box.
              </Text>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    );
  },
};
