import type { Meta, StoryObj } from '@storybook/react'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const meta = {
  title: 'UI / Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
\`Field\` is a form field wrapper that connects a \`Label\`, \`FieldDescription\`, and \`FieldError\` to a control.
It uses CSS \`has-\` selectors to automatically dim the label when the input is disabled.
Always use \`Field\` around inputs in forms — it handles aria associations and error display.
        `,
      },
    },
  },
  argTypes: {
    className: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel>Course title</FieldLabel>
      <Input placeholder="e.g. Watercolor Basics" />
      <FieldDescription>Use a clear, specific title that describes what students will learn.</FieldDescription>
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field>
      <FieldLabel>Email address</FieldLabel>
      <Input aria-invalid="true" defaultValue="not-an-email" />
      <FieldError>Please enter a valid email address.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field>
      <FieldLabel>Username</FieldLabel>
      <Input disabled defaultValue="ryanphillips" />
      <FieldDescription>Your username cannot be changed.</FieldDescription>
    </Field>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-5 w-72">
      <Field>
        <FieldLabel>Default</FieldLabel>
        <Input placeholder="Placeholder text" />
        <FieldDescription>Helper text below the input.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>With error</FieldLabel>
        <Input aria-invalid="true" defaultValue="bad value" />
        <FieldError>This field has an error.</FieldError>
      </Field>
    </div>
  ),
}
