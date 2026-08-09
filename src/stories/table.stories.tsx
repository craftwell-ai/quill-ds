import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { expect } from 'storybook/test'
import { usage } from '@/usage/table.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const courses = [
  { name: 'Watercolor Basics', instructor: 'Ana Rivera', enrolled: 42, status: 'Active' },
  { name: 'Calligraphy', instructor: 'James Lee', enrolled: 18, status: 'Active' },
  { name: 'Lino Printing', instructor: 'Sofia Park', enrolled: 7, status: 'Draft' },
  { name: 'Bookbinding', instructor: 'Marcus Chen', enrolled: 31, status: 'Active' },
]

const meta = {
  title: 'Components / Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: { className: { table: { disable: true } } },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Course catalogue</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead className="text-right">Enrolled</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.name}>
            <TableCell className="font-medium">{course.name}</TableCell>
            <TableCell>{course.instructor}</TableCell>
            <TableCell className="text-right">{course.enrolled}</TableCell>
            <TableCell>
              <Badge variant={course.status === 'Active' ? 'default' : 'outline'}>
                {course.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total students</TableCell>
          <TableCell className="text-right">
            {courses.reduce((sum, c) => sum + c.enrolled, 0)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const wrapper = canvasElement.querySelector('[data-theme]')
    if (!wrapper) throw new Error('themed wrapper not found')
    expect(wrapper.getBoundingClientRect().height).toBeLessThan(window.innerHeight)
  },
}

export const WithSelectedRow: Story = {
  render: () => (
    <Table>
      <TableCaption>Course catalogue — Calligraphy row selected</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead className="text-right">Enrolled</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow
            key={course.name}
            data-state={course.name === 'Calligraphy' ? 'selected' : undefined}
          >
            <TableCell className="font-medium">{course.name}</TableCell>
            <TableCell>{course.instructor}</TableCell>
            <TableCell className="text-right">{course.enrolled}</TableCell>
            <TableCell>
              <Badge variant={course.status === 'Active' ? 'default' : 'outline'}>
                {course.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Simple: Story = {
  render: () => (
    <Table>
      <TableCaption>Design token colour values</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[['Primary', '#C4684B'], ['Paper', '#F5EDDD'], ['Ink', '#2A2622']].map(([name, value]) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell className="font-mono text-xs">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="always-caption"
      doExample={
        <Table>
          <TableCaption>Design token colour values</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[['Primary', '#C4684B'], ['Paper', '#F5EDDD']].map(([name, value]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell className="font-mono text-xs">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
      dontExample={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[['Primary', '#C4684B'], ['Paper', '#F5EDDD']].map(([name, value]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell className="font-mono text-xs">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    />
  ),
}
