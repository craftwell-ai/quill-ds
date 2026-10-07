'use client'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { tabTo } from '../focus-ring'

// Keyboard focus in Windows High Contrast (the browser's "forced colours" mode). That mode removes every
// box-shadow, and the stock controls below draw their focus ring as one while their own `outline-none` removes the
// outline, so focus used to be invisible there. The theme now carries one rule for that mode: every focused
// element gets a 2px outline in the system's highlight colour.
//
// To see it by hand: DevTools → Rendering → "Emulate CSS media feature forced-colors" → active, then press Tab.
// The test run does the same through the browser and measures each control (.storybook/forced-colors-guard.ts);
// the play function below checks the other half, that nothing changes when the mode is off.
const meta = {
  title: 'Foundations / Forced Colours',
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    // Read by the test-only guard: after the play function it turns forced colours on and measures these controls.
    forcedColorsFocus: true,
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// Marks the controls the guard measures, in Tab order. Stock components, exactly as an app has them.
const FORCED_COLORS_PROBE = 'data-forced-colors-probe'
const probe = { [FORCED_COLORS_PROBE]: '' }

export const KeyboardFocus: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fc-name">Name</Label>
        <Input id="fc-name" placeholder="Ada Lovelace" {...probe} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fc-topic">Topic</Label>
        <Select>
          <SelectTrigger id="fc-topic" className="w-full" {...probe}>
            <SelectValue placeholder="Choose a topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="access">Access</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fc-note">Note</Label>
        <Textarea id="fc-note" rows={3} placeholder="Anything we should know?" {...probe} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="fc-copy" {...probe} />
        <Label htmlFor="fc-copy">Send me a copy</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="fc-urgent" {...probe} />
        <Label htmlFor="fc-urgent">Mark as urgent</Label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button {...probe}>Send</Button>
        <Button variant="outline" {...probe}>Save draft</Button>
        <Button variant="ghost" {...probe}>Cancel</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const controls = [...canvasElement.querySelectorAll<HTMLElement>(`[${FORCED_COLORS_PROBE}]`)]
    await expect(controls).toHaveLength(8)
    // With the mode off, the rule must change nothing: the stock controls keep their ring (a box-shadow) and still
    // draw no outline. A rule that leaked out of its media query would show up here as a solid outline.
    await expect(window.matchMedia('(forced-colors: active)').matches).toBe(false)
    for (const control of controls) {
      await tabTo(control)
      await waitFor(() => expect(getComputedStyle(control).boxShadow, `${control.id || control.textContent}: focus ring`).not.toBe('none'))
      await expect(getComputedStyle(control).outlineStyle, `${control.id || control.textContent}: outline with the mode off`).toBe('none')
    }
  },
}
