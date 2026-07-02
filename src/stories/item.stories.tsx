import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
  ItemSeparator,
  ItemHeader,
  ItemFooter,
} from '@/components/ui/item'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <Item>
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const Outline: Story = {
  render: () => (
    <ItemGroup>
      <Item variant="outline">
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const Muted: Story = {
  render: () => (
    <ItemGroup>
      <Item variant="muted">
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <Item variant="muted">
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const SmallSize: Story = {
  render: () => (
    <ItemGroup>
      <Item size="sm">
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <Item size="sm">
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const ExtraSmallSize: Story = {
  render: () => (
    <ItemGroup>
      <Item size="xs">
        <ItemMedia><Icon name="menu_book" className="size-3.5 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="xs">
        <ItemMedia><Icon name="menu_book" className="size-3.5 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
        </ItemContent>
      </Item>
      <Item size="xs">
        <ItemMedia><Icon name="menu_book" className="size-3.5 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Oil Painting Fundamentals</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <ItemGroup>
      <Item>
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Oil Painting Fundamentals</ItemTitle>
          <ItemDescription>20 lessons · Intermediate</ItemDescription>
        </ItemContent>
        <ItemActions><Button variant="ghost" size="sm">Open</Button></ItemActions>
      </Item>
    </ItemGroup>
  ),
}

export const WithHeaderAndFooter: Story = {
  render: () => (
    <ItemGroup>
      <Item className="flex-col items-start">
        <ItemHeader>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <Badge variant="secondary">Beginner</Badge>
        </ItemHeader>
        <ItemContent>
          <ItemDescription>
            Learn foundational watercolor techniques including wet-on-wet, glazing, and color mixing.
          </ItemDescription>
        </ItemContent>
        <ItemFooter>
          <span className="text-xs text-muted-foreground">12 lessons · 3h 40m</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" aria-label="Edit"><Icon name="edit" className="size-4" /></Button>
            <Button variant="ghost" size="sm" aria-label="Delete"><Icon name="delete" className="size-4" /></Button>
          </div>
        </ItemFooter>
      </Item>
      <Item className="flex-col items-start">
        <ItemHeader>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <Badge variant="secondary">Beginner</Badge>
        </ItemHeader>
        <ItemContent>
          <ItemDescription>
            Master brush pen calligraphy with step-by-step drills for letterforms and flourishes.
          </ItemDescription>
        </ItemContent>
        <ItemFooter>
          <span className="text-xs text-muted-foreground">8 lessons · 2h 15m</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" aria-label="Edit"><Icon name="edit" className="size-4" /></Button>
            <Button variant="ghost" size="sm" aria-label="Delete"><Icon name="delete" className="size-4" /></Button>
          </div>
        </ItemFooter>
      </Item>
    </ItemGroup>
  ),
}

export const AsLink: Story = {
  render: () => (
    <ItemGroup>
      <Item render={<a href="#watercolor" />}>
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Watercolor Basics</ItemTitle>
          <ItemDescription>12 lessons · Beginner</ItemDescription>
        </ItemContent>
      </Item>
      <Item render={<a href="#calligraphy" />}>
        <ItemMedia><Icon name="menu_book" className="size-4 text-ink-muted" /></ItemMedia>
        <ItemContent>
          <ItemTitle>Calligraphy for Beginners</ItemTitle>
          <ItemDescription>8 lessons · Beginner</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
}
