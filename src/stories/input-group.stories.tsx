import type { Meta, StoryObj } from '@storybook/react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { SearchIcon, GlobeIcon } from 'lucide-react'

const meta = {
  title: 'UI / InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
InputGroup merges an input with prefix/suffix addons (icons, buttons, text).
Use \`InputGroupAddon\` for non-interactive prefixes/suffixes (icons, labels).
Use \`InputGroupButton\` for interactive suffix actions (search, copy, clear).
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const WithPrefixIcon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon><SearchIcon /></InputGroupAddon>
      <InputGroupInput placeholder="Search courses…" />
    </InputGroup>
  ),
}

export const WithSuffix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon><GlobeIcon /></InputGroupAddon>
      <InputGroupInput placeholder="yourdomain.com" />
      <InputGroupButton><Button size="sm">Connect</Button></InputGroupButton>
    </InputGroup>
  ),
}

export const WithTextPrefix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput placeholder="quill.design" />
    </InputGroup>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <InputGroup>
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput placeholder="Icon prefix" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="Text prefix" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="With button suffix" />
        <InputGroupButton><Button size="sm">Search</Button></InputGroupButton>
      </InputGroup>
    </div>
  ),
}
