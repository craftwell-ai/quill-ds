import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DataTable as DataTableBlock } from '@registry/blocks/data-table'
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usage } from '@/usage/data-table.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Data table',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const DataTable: Story = {
  render: () => <DataTableBlock />,
}

// dontExample ships icon-only row-action buttons with no accessible name — a
// genuine a11y violation, not just a stylistic anti-pattern, so this story is
// exempted from the axe CI gate (see Global Constraints, Visual pair
// authoring rule 4).
export const DoDont: Story = {
  parameters: { controls: { disable: true }, a11y: { test: 'off' } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="row-actions-need-labels"
      doExample={
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Ada Lovelace</TableCell>
                <TableCell className="w-10">
                  <Button variant="ghost" size="icon" aria-label="Actions for Ada Lovelace">
                    <Icon name="more_horiz" size={18} />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Alan Turing</TableCell>
                <TableCell className="w-10">
                  <Button variant="ghost" size="icon" aria-label="Actions for Alan Turing">
                    <Icon name="more_horiz" size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      }
      dontExample={
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Ada Lovelace</TableCell>
                <TableCell className="w-10">
                  <Button variant="ghost" size="icon">
                    <Icon name="more_horiz" size={18} />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Alan Turing</TableCell>
                <TableCell className="w-10">
                  <Button variant="ghost" size="icon">
                    <Icon name="more_horiz" size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      }
    />
  ),
}
