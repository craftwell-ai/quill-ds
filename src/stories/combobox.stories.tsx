'use client'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within, screen } from 'storybook/test'
import {
  Combobox,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxContent,
  ComboboxList,
  ComboboxCollection,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxInput,
} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'

const frameworks = ['Next.js', 'Remix', 'Astro', 'SvelteKit', 'Nuxt', 'TanStack Start']

const meta = {
  title: 'UI / Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
Base UI's Combobox has two wiring requirements for filtering to work:

1. Pass the full item array to \`<Combobox items={…}>\` on the root.
2. Wrap items in \`<ComboboxCollection>\` with a **render-function** child — the collection calls it for each filtered item.

Without \`items\` on the root, filtering never runs and all items always show.

**Inline pattern** — \`ComboboxInput\` is the trigger itself.
**Button + popup pattern** — a \`ComboboxTrigger\` button opens a popup containing \`ComboboxInput\`.

> Note on \`render=\`: Base UI's \`render\` prop replaces the root element but uses the *component's* children, not the render element's children. Pass \`ComboboxValue\` as a child of \`ComboboxTrigger\`, not inside the \`render\` prop's JSX.
        `,
      },
    },
  },
  argTypes: {
    disabled: { control: 'boolean', description: 'Disable the combobox', table: { defaultValue: { summary: 'false' } } },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxTrigger render={<Button variant="outline" className="w-52 justify-between" />}>
        <ComboboxValue placeholder="Select framework…" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search…" />
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxCollection>
            {(fw: string) => (
              <ComboboxItem key={fw} value={fw}>{fw}</ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the trigger to open the popup
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)

    // Popup renders via portal — use screen (whole document)
    const input = await screen.findByPlaceholderText('Search…')
    expect(input).toBeInTheDocument()

    // Type to filter — ComboboxCollection renders only matching items
    await userEvent.type(input, 'ast')
    const astroItem = await screen.findByText('Astro')
    expect(astroItem).toBeInTheDocument()

    // Non-matching items removed from DOM by ComboboxCollection
    expect(screen.queryByText('Remix')).not.toBeInTheDocument()
  },
}

export const Inline: Story = {
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="Search framework…" className="w-52" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxCollection>
            {(fw: string) => (
              <ComboboxItem key={fw} value={fw}>{fw}</ComboboxItem>
            )}
          </ComboboxCollection>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click to open, type to filter
    const input = canvas.getByPlaceholderText('Search framework…')
    await userEvent.click(input)
    await userEvent.type(input, 'nu')

    // Items rendered via portal
    const nuxtItem = await screen.findByText('Nuxt')
    expect(nuxtItem).toBeInTheDocument()

    // Astro doesn't match 'nu' — removed from DOM
    expect(screen.queryByText('Astro')).not.toBeInTheDocument()
  },
}
