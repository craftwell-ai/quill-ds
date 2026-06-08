import type { Meta, StoryObj } from '@storybook/react'
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
} from '@/components/ui/item'
import { BookOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI / Item',
  component: Item,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
Item is a general-purpose list row — course card compact, search result, settings row.
Compose with \`ItemMedia\` (icon/avatar), \`ItemContent\` (title + description), and \`ItemActions\` (right-side CTA).
        `,
      },
    },
  },
  argTypes: { className: { table: { disable: true } } },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ItemGroup>
      <Item>
        <ItemMedia><BookOpenIcon className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <Item>
        <ItemMedia><BookOpenIcon className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
    </ItemGroup>
  ),
}
