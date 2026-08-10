import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { usage } from '@/usage/aspect-ratio.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    ratio: {
      control: 'number',
      description: 'Width ÷ height (e.g. 16/9)',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => (
    <AspectRatio {...args} className="rounded-lg overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        alt="A mountain landscape at golden hour"
        className="object-cover w-full h-full"
      />
    </AspectRatio>
  ),
}

export const SixteenByNine: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => (
    <AspectRatio {...args} className="bg-paper-deep rounded-lg overflow-hidden">
      <div className="flex items-center justify-center h-full text-ink-muted text-sm">16 / 9</div>
    </AspectRatio>
  ),
}

export const Square: Story = {
  args: { ratio: 1 },
  render: (args) => (
    <AspectRatio {...args} className="bg-paper-deep rounded-lg overflow-hidden">
      <div className="flex items-center justify-center h-full text-ink-muted text-sm">1 / 1</div>
    </AspectRatio>
  ),
}

export const AllVariants: Story = {
  args: { ratio: 16 / 9 },
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex gap-4 items-start">
      {([16 / 9, 4 / 3, 1, 3 / 4] as const).map((ratio, i) => (
        <div key={i} className="w-32">
          <AspectRatio ratio={ratio} className="bg-paper-deep rounded-lg overflow-hidden">
            <div className="flex items-center justify-center h-full text-ink-muted text-xs">
              {ratio === 16 / 9 ? '16:9' : ratio === 4 / 3 ? '4:3' : ratio === 1 ? '1:1' : '3:4'}
            </div>
          </AspectRatio>
        </div>
      ))}
    </div>
  ),
}

export const DoDont: Story = {
  args: { ratio: 16 / 9 },
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="object-cover-for-images"
      doExample={
        <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-paper-deep">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="A mountain landscape at golden hour"
            className="object-cover w-full h-full"
          />
        </AspectRatio>
      }
      dontExample={
        <AspectRatio ratio={16 / 9} className="rounded-lg bg-paper-deep">
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="A mountain landscape at golden hour"
            className="w-full"
          />
        </AspectRatio>
      }
    />
  ),
}
