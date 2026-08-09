import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { usage } from '@/usage/input-otp.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: renderUsageDocs(usage) } },
  },
  argTypes: {
    maxLength: { control: 'number', description: 'Total input length', table: { defaultValue: { summary: '6' } } },
    disabled: { control: 'boolean', description: 'Disable all slots' },
    className: { table: { disable: true } },
  },
} as Meta<typeof InputOTP>

export default meta
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Story = StoryObj<any>

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="otp" className="text-sm font-medium">
        Verification code
      </label>
      <InputOTP id="otp" maxLength={6}>
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
      <p className="text-xs text-muted-foreground">
        Enter the 6-digit code sent to your email.
      </p>
    </div>
  ),
}

export const PinEntry: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="pin" className="text-sm font-medium">
        Enter PIN
      </label>
      <InputOTP id="pin" maxLength={4}>
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, i) => <InputOTPSlot key={i} index={i} />)}
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="otp-disabled" className="text-sm font-medium">
        Verification code
      </label>
      <InputOTP id="otp-disabled" maxLength={6} disabled>
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
  ),
}

export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <label htmlFor="otp-invalid" className="text-sm font-medium">
        Verification code
      </label>
      <InputOTP id="otp-invalid" maxLength={6}>
        <InputOTPGroup aria-invalid>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup aria-invalid>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-xs text-destructive">
        Invalid code. Please check and try again.
      </p>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <DoDontPair
      usage={usage}
      id="maxlength-matches-slot-count"
      doExample={
        <InputOTP maxLength={6} aria-label="One-time code">
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
      }
      dontExample={
        <InputOTP maxLength={6} aria-label="One-time code">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      }
    />
  ),
}
