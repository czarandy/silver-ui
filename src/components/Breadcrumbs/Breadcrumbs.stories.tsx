import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChevronRight, Home} from 'lucide-react';
import {Icon} from '../Icon';
import {BreadcrumbItem} from './BreadcrumbItem';
import {Breadcrumbs} from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/silver">Silver</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Breadcrumbs separator=">">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Page</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs
        separator={<Icon color="secondary" icon={ChevronRight} size="sm" />}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Page</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
};

export const SupportingVariant: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Default</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs variant="supporting">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Supporting</BreadcrumbItem>
      </Breadcrumbs>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/" startIcon={Home}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Settings</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const ButtonItems: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem onClick={() => undefined}>Projects</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
    </Breadcrumbs>
  ),
};

export const LongTrail: Story = {
  render: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/org">Organization</BreadcrumbItem>
      <BreadcrumbItem href="/org/team">Team</BreadcrumbItem>
      <BreadcrumbItem href="/org/team/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/org/team/projects/silver">Silver</BreadcrumbItem>
      <BreadcrumbItem href="/org/team/projects/silver/settings">
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Permissions</BreadcrumbItem>
    </Breadcrumbs>
  ),
};
