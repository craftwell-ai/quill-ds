'use client'
import type { Meta, StoryObj } from '@storybook/react'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

const meta = {
  title: 'UI / Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--paper-warm\` · \`--primary\` · \`--accent\` · \`--radius-lg\`

### Rules
Calendar uses react-day-picker v9. Selected day fills with \`--primary\` (ink).
Today is indicated with a terracotta dot. For date range selection pass \`mode="range"\`.
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
      description: 'Selection mode',
      table: { defaultValue: { summary: 'single' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    return <Calendar mode="single" selected={date} onSelect={setDate} />
  },
}

export const Range: Story = {
  render: () => {
    const [range, setRange] = useState<{ from: Date | undefined; to?: Date } | undefined>()
    return <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
  },
}
