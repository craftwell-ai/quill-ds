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
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'

const frameworks = ['Next.js', 'Remix', 'Astro', 'SvelteKit', 'Nuxt', 'TanStack Start']

const jsFrameworks = ['Next.js', 'Remix', 'TanStack Start']
const otherFrameworks = ['Astro', 'SvelteKit', 'Nuxt']

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
      <ComboboxContent className="min-w-(--anchor-width)">
        <ComboboxInput placeholder="Search…" showTrigger={false} />
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
      <ComboboxInput placeholder="Search framework…" className="w-52" aria-label="Search framework" />
      <ComboboxContent className="min-w-(--anchor-width)">
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

export const WithClear: Story = {
  name: 'With Clear Button',
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxInput
        placeholder="Search framework…"
        className="w-52"
        aria-label="Search framework"
        showTrigger
        showClear
      />
      <ComboboxContent className="min-w-(--anchor-width)">
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
}

export const WithGroups: Story = {
  name: 'With Groups',
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxTrigger render={<Button variant="outline" className="w-52 justify-between" />}>
        <ComboboxValue placeholder="Select framework…" />
      </ComboboxTrigger>
      <ComboboxContent className="min-w-(--anchor-width)">
        <ComboboxInput placeholder="Search…" showTrigger={false} />
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxGroup>
            <ComboboxLabel>JavaScript</ComboboxLabel>
            <ComboboxCollection>
              {(fw: string) => jsFrameworks.includes(fw)
                ? <ComboboxItem key={fw} value={fw}>{fw}</ComboboxItem>
                : null
              }
            </ComboboxCollection>
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>Other</ComboboxLabel>
            <ComboboxCollection>
              {(fw: string) => otherFrameworks.includes(fw)
                ? <ComboboxItem key={fw} value={fw}>{fw}</ComboboxItem>
                : null
              }
            </ComboboxCollection>
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
}

function MultiSelectDemo() {
  const anchor = useComboboxAnchor()
  return (
    <Combobox items={frameworks} multiple>
      <ComboboxChips ref={anchor} className="w-72">
        <ComboboxChipsInput placeholder="Select frameworks…" aria-label="Select frameworks" />
      </ComboboxChips>
      <ComboboxContent anchor={anchor} className="min-w-(--anchor-width)">
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
  )
}

export const MultiSelect: Story = {
  name: 'Multi-select (Chips)',
  render: () => <MultiSelectDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const input = canvas.getByPlaceholderText('Select frameworks…')
    await userEvent.click(input)

    // Select two items from the popup
    const nextItem = await screen.findByText('Next.js')
    await userEvent.click(nextItem)

    const astroItem = await screen.findByText('Astro')
    await userEvent.click(astroItem)

    // Both selections should appear as chips in the input area
    expect(canvas.getByText('Next.js')).toBeInTheDocument()
    expect(canvas.getByText('Astro')).toBeInTheDocument()
  },
}
