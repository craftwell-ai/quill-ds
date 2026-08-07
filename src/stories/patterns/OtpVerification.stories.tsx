import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OtpVerification as OtpVerificationBlock } from '@registry/blocks/otp-verification'
import { usage } from '@/usage/otp-verification.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'

const meta = {
  title: 'Patterns / Auth / OTP verification',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
} satisfies Meta
export default meta
type Story = StoryObj

export const OtpVerification: Story = {
  render: () => <OtpVerificationBlock />,
}
