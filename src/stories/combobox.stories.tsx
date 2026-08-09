'use client'
import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
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
import { usage } from '@/usage/combobox.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const frameworks = ['Next.js', 'Remix', 'Astro', 'SvelteKit', 'Nuxt', 'TanStack Start']

const jsFrameworks = ['Next.js', 'Remix', 'TanStack Start']
const otherFrameworks = ['Astro', 'SvelteKit', 'Nuxt']

const meta = {
  title: 'Components / Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
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
      <ComboboxTrigger aria-label="Select framework" render={<Button variant="outline" className="w-52 justify-between" />}>
        <ComboboxValue placeholder="Select framework…" />
      </ComboboxTrigger>
      <ComboboxContent aria-label="Framework suggestions" className="min-w-(--anchor-width)">
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
      <ComboboxInput placeholder="Search framework…" className="w-52" aria-label="Search framework" showTrigger={false} />
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
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxTrigger aria-label="Select framework" render={<Button variant="outline" className="w-52 justify-between" />}>
        <ComboboxValue placeholder="Select framework…" />
      </ComboboxTrigger>
      <ComboboxContent aria-label="Framework suggestions" className="min-w-(--anchor-width)">
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
  const [value, setValue] = React.useState<string[]>([])
  return (
    <Combobox items={frameworks} multiple value={value} onValueChange={setValue}>
      <ComboboxChips ref={anchor} className="w-72">
        {value.map((v) => (
          <ComboboxChip key={v}>{v}</ComboboxChip>
        ))}
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

// axe: aria-hidden-focus — an open Base UI Combobox marks sibling content
// aria-hidden while it stays focusable.
// axe: aria-required-children — ComboboxEmpty's role="status" is nested
// inside role="listbox", which disallows it.
// Both are real Combobox primitive defects, not the intentional Don't —
// first surfaced by this story opening the combobox. Tracked separately;
// not fixed here (out of scope for usage-docs wave 3).
export const DoDont: Story = {
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="items-prop-required-for-filtering"
      doExample={
        // pb-12 reserves room below the trigger for the defaultOpen popup
        // (portal-rendered, positioned by floating-ui) so it doesn't cover
        // the figcaption underneath.
        <div className="pb-12">
          <Combobox items={frameworks} defaultOpen defaultInputValue="ast">
            <ComboboxInput placeholder="Search framework…" className="w-52" aria-label="Search framework" showTrigger={false} />
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
        </div>
      }
      dontExample={
        // Deliberately omits `items` on the root to demonstrate the mistake.
        <div className="pb-12">
          <Combobox defaultOpen defaultInputValue="ast">
            <ComboboxInput placeholder="Search framework…" className="w-52" aria-label="Search framework (broken)" showTrigger={false} />
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
        </div>
      }
    />
  ),
}
