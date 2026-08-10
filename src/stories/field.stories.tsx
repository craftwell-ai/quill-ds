import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { usage } from '@/usage/field.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
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
      <FieldLabel htmlFor="course-title">Course title</FieldLabel>
      <Input id="course-title" placeholder="e.g. Watercolor Basics" />
      <FieldDescription>Use a clear, specific title that describes what students will learn.</FieldDescription>
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="email-address">Email address</FieldLabel>
      <Input id="email-address" aria-invalid="true" defaultValue="not-an-email" />
      <FieldError>Please enter a valid email address.</FieldError>
    </Field>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" disabled defaultValue="johndoe" />
      <FieldDescription>Your username cannot be changed.</FieldDescription>
    </Field>
  ),
}

export const HorizontalOrientation: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="notifications-email">Email notifications</FieldLabel>
      <Input id="notifications-email" placeholder="e.g. hello@example.com" />
    </Field>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-5 w-72">
      <Field>
        <FieldLabel htmlFor="all-default">Default</FieldLabel>
        <Input id="all-default" placeholder="e.g. Introduction to Watercolor" />
        <FieldDescription>Helper text appears below the input.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="all-error">With error</FieldLabel>
        <Input id="all-error" aria-invalid="true" defaultValue="bad value" />
        <FieldError>This field has an error.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="all-disabled">Disabled</FieldLabel>
        <Input id="all-disabled" disabled defaultValue="johndoe" />
        <FieldDescription>This field cannot be edited.</FieldDescription>
      </Field>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="data-disabled-dims-label"
      doExample={
        <Field data-disabled>
          <FieldLabel htmlFor="dodont-username-do">Username</FieldLabel>
          <Input id="dodont-username-do" disabled defaultValue="johndoe" />
        </Field>
      }
      dontExample={
        <Field>
          <FieldLabel htmlFor="dodont-username-dont">Username</FieldLabel>
          <Input id="dodont-username-dont" disabled defaultValue="johndoe" />
        </Field>
      }
    />
  ),
}
