import type { Meta, StoryObj } from '@storybook/react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'

const meta = {
  title: 'UI / InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Rules
InputOTP renders digit-by-digit secure code entry (email verification, 2FA).
Each \`InputOTPSlot\` holds one character. Use \`InputOTPSeparator\` to split groups.
Set \`maxLength\` to the total number of characters.
        `,
      },
    },
  },
  argTypes: {
    maxLength: { control: 'number', description: 'Total input length', table: { defaultValue: { summary: '6' } } },
    disabled: { control: 'boolean', description: 'Disable all slots' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <InputOTP maxLength={6}>
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
  ),
}

export const FourDigit: Story = {
  render: () => (
    <InputOTP maxLength={4}>
      <InputOTPGroup>
        {Array.from({ length: 4 }, (_, i) => <InputOTPSlot key={i} index={i} />)}
      </InputOTPGroup>
    </InputOTP>
  ),
}
