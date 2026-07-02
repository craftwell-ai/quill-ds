import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI / Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Design tokens
\`--card\` · \`--ink\` · \`--destructive\` · \`--radius-lg\`

### Rules
Use \`variant="default"\` for informational and success alerts.
Use \`variant="destructive"\` only for errors. Include an icon when possible — it improves scannability.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Visual emphasis level',
      table: { defaultValue: { summary: 'default' } },
    },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => (
    <Alert {...args}>
      <Icon name="info" />
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>Your profile changes have been saved.</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args}>
      <Icon name="warning" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Unable to save changes. Please try again.</AlertDescription>
    </Alert>
  ),
}

export const NoIcon: Story = {
  args: { variant: 'default' },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>You can also use alerts without an icon when the message is self-explanatory.</AlertDescription>
    </Alert>
  ),
}

export const WithAction: Story = {
  args: { variant: 'default' },
  render: (args) => (
    <Alert {...args}>
      <Icon name="info" />
      <AlertTitle>New version available</AlertTitle>
      <AlertDescription>Refresh the page to get the latest features and bug fixes.</AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="icon" aria-label="Dismiss">
          <Icon name="close" />
        </Button>
      </AlertAction>
    </Alert>
  ),
}

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="default">
        <Icon name="info" />
        <AlertTitle>Informational</AlertTitle>
        <AlertDescription>This is a default alert with an icon.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <Icon name="warning" />
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>Something went wrong with your request.</AlertDescription>
      </Alert>
      <Alert variant="default">
        <AlertTitle>No icon</AlertTitle>
        <AlertDescription>Alerts can omit the icon when the message is self-explanatory.</AlertDescription>
      </Alert>
      <Alert variant="default">
        <Icon name="info" />
        <AlertTitle>With action</AlertTitle>
        <AlertDescription>Alerts can include an inline dismiss or action button.</AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="icon" aria-label="Dismiss">
            <Icon name="close" />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  ),
}
