import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from 'lucide-react'

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
      <Button variant="outline" size="icon" aria-label="Align left"><AlignLeftIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Align center"><AlignCenterIcon /></Button>
      <Button variant="outline" size="icon" aria-label="Align right"><AlignRightIcon /></Button>
    </ButtonGroup>
  ),
}
