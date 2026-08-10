import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OtpVerification as OtpVerificationBlock } from '@registry/blocks/otp-verification'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { usage } from '@/usage/otp-verification.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from '../DoDont'

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

export const DoDont: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="communicate-expiry"
      doExample={
        <div className="flex w-[240px] flex-col items-center gap-3 rounded-xl border bg-card p-6">
          <Label htmlFor="dodont-otp-do" className="sr-only">
            Verification code
          </Label>
          <InputOTP id="dodont-otp-do" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-muted-foreground">The code expires in 10 minutes.</p>
        </div>
      }
      dontExample={
        <div className="flex w-[240px] flex-col items-center gap-3 rounded-xl border bg-card p-6">
          <Label htmlFor="dodont-otp-dont" className="sr-only">
            Verification code
          </Label>
          <InputOTP id="dodont-otp-dont" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      }
    />
  ),
}
