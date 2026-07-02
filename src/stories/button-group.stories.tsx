import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const meta = {
  title: 'UI / ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
ButtonGroup collapses adjacent buttons into a single compound control, merging their borders.
Use for mutually exclusive options (alignment, view mode) or sequential actions (prev/next).
        `,
      },
    },
  },
  argTypes: {
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Previous</Button>
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
}

export const IconGroup: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Align left"><Icon name="format_align_left" /></Button>
      <Button variant="outline" size="icon" aria-label="Align center"><Icon name="format_align_center" /></Button>
      <Button variant="outline" size="icon" aria-label="Align right"><Icon name="format_align_right" /></Button>
    </ButtonGroup>
  ),
}

export const ActiveState: Story = {
  render: () => {
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left')
    return (
      <ButtonGroup>
        <Button
          variant={alignment === 'left' ? 'default' : 'outline'}
          size="icon"
          aria-label="Align left"
          aria-pressed={alignment === 'left'}
          onClick={() => setAlignment('left')}
        >
          <Icon name="format_align_left" />
        </Button>
        <Button
          variant={alignment === 'center' ? 'default' : 'outline'}
          size="icon"
          aria-label="Align center"
          aria-pressed={alignment === 'center'}
          onClick={() => setAlignment('center')}
        >
          <Icon name="format_align_center" />
        </Button>
        <Button
          variant={alignment === 'right' ? 'default' : 'outline'}
          size="icon"
          aria-label="Align right"
          aria-pressed={alignment === 'right'}
          onClick={() => setAlignment('right')}
        >
          <Icon name="format_align_right" />
        </Button>
      </ButtonGroup>
    )
  },
}

export const VerticalGroup: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Bold</Button>
      <Button variant="outline">Italic</Button>
      <Button variant="outline">Underline</Button>
    </ButtonGroup>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon" aria-label="Bold"><Icon name="format_bold" /></Button>
      <Button variant="outline" size="icon" aria-label="Italic"><Icon name="format_italic" /></Button>
      <ButtonGroupSeparator />
      <Button variant="outline" size="icon" aria-label="Underline"><Icon name="format_underlined" /></Button>
    </ButtonGroup>
  ),
}

export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>Sort by</ButtonGroupText>
      <Button variant="outline">Date</Button>
      <Button variant="outline">Name</Button>
      <Button variant="outline">Size</Button>
    </ButtonGroup>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-6">
      <ButtonGroup>
        <Button variant="outline">Previous</Button>
        <Button variant="outline">Next</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Align left"><Icon name="format_align_left" /></Button>
        <Button variant="outline" size="icon" aria-label="Align center"><Icon name="format_align_center" /></Button>
        <Button variant="outline" size="icon" aria-label="Align right"><Icon name="format_align_right" /></Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Bold"><Icon name="format_bold" /></Button>
        <Button variant="outline" size="icon" aria-label="Italic"><Icon name="format_italic" /></Button>
        <ButtonGroupSeparator />
        <Button variant="outline" size="icon" aria-label="Underline"><Icon name="format_underlined" /></Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText>Sort by</ButtonGroupText>
        <Button variant="outline">Date</Button>
        <Button variant="outline">Name</Button>
      </ButtonGroup>
    </div>
  ),
}
