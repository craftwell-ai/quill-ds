import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Input } from '@/components/ui/input'
import { usage } from '@/usage/input.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
      description: 'HTML input type',
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: { control: 'text', description: 'Placeholder text' },
    disabled: { control: 'boolean', description: 'Disables the input', table: { defaultValue: { summary: 'false' } } },
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { placeholder: 'Enter text…', 'aria-label': 'Text input' } }
export const WithValue: Story = { args: { defaultValue: 'Watercolor Basics', 'aria-label': 'Course title' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Disabled input', 'aria-label': 'Disabled input' } }
export const Invalid: Story = { render: () => <Input aria-invalid="true" defaultValue="bad@value" aria-label="Invalid input" /> }
export const Password: Story = { args: { type: 'password', placeholder: 'Enter password…', 'aria-label': 'Password' } }

export const WithLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="email" className="text-sm font-medium leading-none">
        Email address
      </label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Input placeholder="Default" aria-label="Default input" />
      <Input defaultValue="With value" aria-label="Input with value" />
      <Input disabled defaultValue="Disabled" aria-label="Disabled input" />
      <Input aria-invalid="true" defaultValue="Invalid" aria-label="Invalid input" />
      <Input type="password" placeholder="Enter password…" aria-label="Password" />
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="label-not-placeholder"
      doExample={
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dodont-email" className="text-sm font-medium leading-none">
            Email address
          </label>
          <Input id="dodont-email" type="email" placeholder="you@example.com" />
        </div>
      }
      dontExample={<Input type="email" placeholder="Email address" />}
    />
  ),
}
