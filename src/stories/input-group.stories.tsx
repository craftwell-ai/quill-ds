import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Icon } from '@/components/ui/icon'

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
Use \`InputGroupText\` for plain text spans inside an addon.
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
      <InputGroupAddon><Icon name="search" /></InputGroupAddon>
      <InputGroupInput placeholder="Search courses…" aria-label="Search courses" />
    </InputGroup>
  ),
}

export const WithSuffix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon><Icon name="language" /></InputGroupAddon>
      <InputGroupInput placeholder="yourdomain.com" aria-label="Domain name" />
      <InputGroupButton>Connect</InputGroupButton>
    </InputGroup>
  ),
}

export const WithTextPrefix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput placeholder="quill.design" aria-label="Website URL" />
    </InputGroup>
  ),
}

export const WithSuffixIcon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon><Icon name="attach_money" /></InputGroupAddon>
      <InputGroupInput placeholder="0.00" aria-label="Amount in USD" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>USD</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithCopyButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput defaultValue="https://quill.design/share/abc123" readOnly aria-label="Share link" />
      <InputGroupButton aria-label="Copy link"><Icon name="content_copy" /></InputGroupButton>
    </InputGroup>
  ),
}

export const WithTextarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="block-start">Note</InputGroupAddon>
      <InputGroupTextarea placeholder="Add a note about this student…" rows={3} aria-label="Note" />
    </InputGroup>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <InputGroup>
        <InputGroupAddon><Icon name="search" /></InputGroupAddon>
        <InputGroupInput placeholder="Icon prefix" aria-label="Search" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="Text prefix" aria-label="Website URL" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="With button suffix" aria-label="Search query" />
        <InputGroupButton>Search</InputGroupButton>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon><Icon name="attach_money" /></InputGroupAddon>
        <InputGroupInput placeholder="0.00" aria-label="Amount" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon align="block-start">Note</InputGroupAddon>
        <InputGroupTextarea placeholder="Multiline input…" rows={2} aria-label="Note" />
      </InputGroup>
    </div>
  ),
}
