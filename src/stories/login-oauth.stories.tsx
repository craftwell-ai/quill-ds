import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LoginOauth } from '../../registry/blocks/login-oauth'

const meta = {
  title: 'Blocks / Login with OAuth',
  component: LoginOauth,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--primary\` · \`--muted-foreground\` · \`--border\` · \`--radius\`

### Rules
Provider buttons are the primary path — order them by what your users actually have, most common first. The email form below the rule is a fallback; delete it entirely for provider-only apps.
Brand marks are inlined artwork, not icon-set glyphs: logos are trademarked, live on their own grids, and each provider's guidelines expect its own treatment. Google keeps its four-colour mark; GitHub and Apple are monochrome per their guidelines and inherit \`currentColor\` so they invert correctly in Dusk.
Never restyle a provider mark to match your palette — that breaks the brand guidelines you're agreeing to when you use their sign-in.
        `,
      },
    },
  },
} satisfies Meta<typeof LoginOauth>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
