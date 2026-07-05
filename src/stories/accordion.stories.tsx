import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const meta = {
  title: 'Components / Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--paper-warm\` · \`--ink\` · \`--line-soft\` · \`--radius-lg\`

### Rules
Each item is separated by a hairline border. The trigger underlines on hover — no background fill — to stay light.
Chevron swaps between up/down via \`data-open\`. Wrap in a fixed-width container (280–480px).
        `,
      },
    },
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow multiple items open simultaneously',
      table: { defaultValue: { summary: 'false' } },
    },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Quill?</AccordionTrigger>
        <AccordionContent>
          Quill is a design system — a platform for publishing hand-crafted skill courses.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What fonts does it use?</AccordionTrigger>
        <AccordionContent>
          Fraunces for display and editorial moments; Inter for interface text.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is there a dark mode?</AccordionTrigger>
        <AccordionContent>
          Components support a `.dark` class for consumer dark surfaces, though Quill itself publishes in light mode.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const DefaultOpen: Story = {
  render: () => (
    <Accordion defaultValue={['item-1']}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Quill?</AccordionTrigger>
        <AccordionContent>
          Quill is a design system — a platform for publishing hand-crafted skill courses.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What fonts does it use?</AccordionTrigger>
        <AccordionContent>
          Fraunces for display and editorial moments; Inter for interface text.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is there a dark mode?</AccordionTrigger>
        <AccordionContent>
          Components support a `.dark` class for consumer dark surfaces, though Quill itself publishes in light mode.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const MultipleOpen: Story = {
  render: () => (
    <Accordion multiple defaultValue={['a', 'b']}>
      <AccordionItem value="a">
        <AccordionTrigger>What is Quill?</AccordionTrigger>
        <AccordionContent>
          Quill is a design system — a platform for publishing hand-crafted skill courses.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>What fonts does it use?</AccordionTrigger>
        <AccordionContent>
          Fraunces for display and editorial moments; Inter for interface text.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Is there a dark mode?</AccordionTrigger>
        <AccordionContent>
          Components support a `.dark` class for consumer dark surfaces, though Quill itself publishes in light mode.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Dark: Story = {
  parameters: { globals: { theme: 'dark' } },
  render: () => (
    <Accordion>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Quill?</AccordionTrigger>
        <AccordionContent>
          Quill is a design system — a platform for publishing hand-crafted skill courses.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What fonts does it use?</AccordionTrigger>
        <AccordionContent>
          Fraunces for display and editorial moments; Inter for interface text.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
