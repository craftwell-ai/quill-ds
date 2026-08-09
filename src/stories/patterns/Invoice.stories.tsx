import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Invoice as InvoiceBlock } from '@registry/blocks/invoice'
import { Table, TableBody, TableFooter, TableRow, TableCell } from '@/components/ui/table'
import { usage } from '@/usage/invoice.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

const meta = {
  title: 'Patterns / Data / Invoice',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const Invoice: Story = {
  render: () => <InvoiceBlock />,
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="total-is-unambiguous"
      doExample={
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">Design system retainer — June</TableCell>
                <TableCell className="text-right text-foreground">$3,200.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Brand lock-up refinements</TableCell>
                <TableCell className="text-right text-foreground">$840.00</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell className="text-right">$4,040.00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      }
      dontExample={
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-foreground">Design system retainer — June</TableCell>
                <TableCell className="text-right text-foreground">$3,200.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Brand lock-up refinements</TableCell>
                <TableCell className="text-right text-foreground">$840.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">Total</TableCell>
                <TableCell className="text-right text-foreground">$4,040.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      }
    />
  ),
}
