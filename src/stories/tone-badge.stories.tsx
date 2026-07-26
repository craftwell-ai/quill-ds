import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ToneBadge } from '../../registry/lib/tone-badge'

const meta = {
  title: 'Components / ToneBadge',
  component: ToneBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--moss\` · \`--gold\` · \`--terracotta\` · \`--indigo\` (+ their \`-deep\` shades) · \`--paper-deep\` · \`--text-2xs\` · \`--tracking-wide\`

### Rules
The one uppercase tag pill — status, tiers, labels. Tinted by default; \`solid\` only for the strong cue (a "current" marker, a live state).
Two sizes and only two: \`md\` (20px) and \`sm\` (16px, the count-pill scale). Type stays \`--text-2xs\` at 0.1em tracking in both — never tighten tracking to shrink a pill.
Hand-rolled \`rounded-full … uppercase\` spans are a contract violation; render every tag pill through ToneBadge.
        `,
      },
    },
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['moss', 'gold', 'terracotta', 'indigo', 'neutral', 'muted'],
      description: 'Pigment vocabulary',
    },
    size: {
      control: 'select',
      options: ['md', 'sm'],
      description: 'md = 20px badge · sm = 16px count-pill scale',
      table: { defaultValue: { summary: 'md' } },
    },
    solid: {
      control: 'boolean',
      description: 'Filled pigment for the strong cue',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { control: 'text', description: 'Pill label (1–2 words)' },
  },
} satisfies Meta<typeof ToneBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Tinted: Story = { args: { tone: 'moss', children: 'trusted' } }
export const Solid: Story = { args: { tone: 'moss', solid: true, children: 'current' } }
export const Small: Story = { args: { tone: 'moss', solid: true, size: 'sm', children: 'current' } }
export const Caution: Story = { args: { tone: 'gold', children: 'developing' } }
export const Attention: Story = { args: { tone: 'terracotta', children: 'red flag' } }
export const Informational: Story = { args: { tone: 'indigo', size: 'sm', children: 'dormant' } }
export const Muted: Story = { args: { tone: 'muted', children: 'building' } }

export const AllTones: Story = {
  args: { tone: 'moss', children: 'tone' },
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['moss', 'gold', 'terracotta', 'indigo', 'neutral', 'muted'] as const).map((tone) => (
          <ToneBadge key={tone} tone={tone}>
            {tone}
          </ToneBadge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(['moss', 'gold', 'terracotta', 'indigo', 'neutral', 'muted'] as const).map((tone) => (
          <ToneBadge key={tone} tone={tone} solid size="sm">
            {tone}
          </ToneBadge>
        ))}
      </div>
    </div>
  ),
}
