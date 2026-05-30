import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Pagination} from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: function Default() {
    const [page, setPage] = useState(1);
    return <Pagination onChange={setPage} page={page} totalPages={10} />;
  },
};

export const CountVariant: Story = {
  render: function CountVariant() {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        onChange={setPage}
        page={page}
        totalItems={95}
        variant="count"
      />
    );
  },
};

export const CompactVariant: Story = {
  render: function CompactVariant() {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        onChange={setPage}
        page={page}
        totalPages={10}
        variant="compact"
      />
    );
  },
};

export const NoneVariant: Story = {
  render: function NoneVariant() {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        onChange={setPage}
        page={page}
        totalPages={10}
        variant="none"
      />
    );
  },
};

export const SmallSize: Story = {
  render: function SmallSize() {
    const [page, setPage] = useState(1);
    return (
      <Pagination onChange={setPage} page={page} size="sm" totalPages={10} />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Pagination isDisabled onChange={() => {}} page={3} totalPages={10} />
  ),
};

export const UnknownTotal: Story = {
  render: function UnknownTotal() {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        hasMore={page < 5}
        onChange={setPage}
        page={page}
        variant="none"
      />
    );
  },
};

export const ManyPages: Story = {
  render: function ManyPages() {
    const [page, setPage] = useState(50);
    return <Pagination onChange={setPage} page={page} totalPages={100} />;
  },
};

export const CustomSiblingCount: Story = {
  render: function CustomSiblingCount() {
    const [page, setPage] = useState(10);
    return (
      <Pagination
        onChange={setPage}
        page={page}
        siblingCount={2}
        totalPages={20}
      />
    );
  },
};

export const Controlled: Story = {
  render: function Controlled() {
    const [page, setPage] = useState(1);
    const totalPages = 10;
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
          <span>Current page: {page}</span>
          <button onClick={() => setPage(1)} type="button">
            Reset
          </button>
          <button onClick={() => setPage(totalPages)} type="button">
            Go to last
          </button>
        </div>
        <Pagination onChange={setPage} page={page} totalPages={totalPages} />
      </div>
    );
  },
};
