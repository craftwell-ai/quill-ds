import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ConversationHistory, ConversationSidebar, groupConversations, type Conversation } from '@registry/blocks/conversation-history'
import { usage } from '@/usage/conversation-history.usage.mjs'
import { renderUsageDocs } from '@/usage/render.mjs'
import { expectFocusRing } from '../focus-ring'

const NOW = new Date(2026, 9, 6, 12, 0)
const CHATS: Conversation[] = [
  { id: 'a', title: 'Weekly growth review prompt', updatedAt: new Date(2026, 8, 20), pinned: true },
  { id: 'b', title: 'Q3 signups vs target', updatedAt: new Date(2026, 9, 6, 9, 0) },
  { id: 'c', title: 'Launch brief draft', updatedAt: new Date(2026, 9, 6, 0, 0) },
  { id: 'd', title: 'Pricing page copy ideas', updatedAt: new Date(2026, 9, 5, 23, 59) },
  { id: 'e', title: 'Plan my week around the offsite', updatedAt: new Date(2026, 8, 30) },
  { id: 'f', title: 'Hiring plan notes', updatedAt: new Date(2026, 8, 12) },
  { id: 'g', title: 'Summer campaign recap', updatedAt: new Date(2026, 7, 3) },
  { id: 'h', title: 'From the future', updatedAt: new Date(2026, 9, 9) },
  { id: 'i', title: 'No date', updatedAt: 'not a date' },
]
const CARD = 'w-[18.75rem] max-w-full rounded-xl border border-border bg-card p-2 shadow-sm'

const meta = {
  title: 'Patterns / AI / Conversation History',
  component: ConversationHistory,
  tags: ['autodocs'],
  // Centred by the theme wrapper (see AiSidePanel.stories.tsx for why not `layout: 'centered'`).
  parameters: { layout: 'fullscreen', quillCentered: true, docs: { description: { component: renderUsageDocs(usage) } } },
  // A long Undo window by default, so no story's delete commits behind another assertion's back.
  args: { onSelect: fn(), onNew: fn(), onRename: fn(), onPin: fn(), onDelete: fn(), undoSeconds: 60, className: CARD },
} satisfies Meta<typeof ConversationHistory>

export default meta
type Story = StoryObj<typeof meta>

type Args = React.ComponentProps<typeof ConversationHistory>

// The app's side of a controlled list: it owns the chats and applies what the callbacks report.
function Owned({ initial = CHATS, ...args }: Args & { initial?: Conversation[] }) {
  const [chats, setChats] = React.useState(initial)
  const [current, setCurrent] = React.useState<string | null>('b')
  return (
    <ConversationHistory {...args} now={NOW} conversations={chats} currentId={current}
      onSelect={(id) => { setCurrent(id); args.onSelect?.(id) }}
      onRename={(id, title) => { setChats((all) => all.map((chat) => (chat.id === id ? { ...chat, title } : chat))); args.onRename?.(id, title) }}
      onPin={(id, pinned) => { setChats((all) => all.map((chat) => (chat.id === id ? { ...chat, pinned } : chat))); args.onPin?.(id, pinned) }}
      onDelete={(id) => { setChats((all) => all.filter((chat) => chat.id !== id)); args.onDelete?.(id) }} />
  )
}

const page = () => within(document.body)
const rowOf = (canvasElement: HTMLElement, title: string) =>
  [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="chat-row"]')].find((row) => row.textContent?.includes(title)) as HTMLElement
const openMenu = async (canvas: ReturnType<typeof within>, title: string) => {
  await userEvent.click(canvas.getByRole('button', { name: `More for ${title}` }))
  return page().findByRole('menu')
}
// Base UI keeps a closing menu (and its focus guards) mounted through the exit transition; wait for it to go, so the
// a11y scan that runs after the story does not catch that half-closed state (as dropdown-menu.stories.tsx does).
const closeMenu = async () => {
  await userEvent.keyboard('{Escape}')
  await waitFor(() => expect(page().queryByRole('menu')).toBeNull())
}
const groupLabels = (canvasElement: HTMLElement) => [...canvasElement.querySelectorAll('[data-slot="chat-group"]')].map((heading) => heading.textContent)

// With no props: the sample, kept by the list itself. This is what the docs page and the Figma frame show.
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const nav = canvas.getByRole('navigation', { name: 'Past chats' })
    await expect(within(nav).getByRole('button', { name: 'New chat' })).toBeVisible()
    await expect(groupLabels(canvasElement)).toEqual(['Pinned', 'Today', 'Yesterday', 'Previous 7 days'])
    await expect(within(nav).getByRole('list', { name: 'Today' })).toBeVisible()
    const open = within(nav).getByRole('button', { name: 'Q3 signups vs target' })
    await expect(open).toHaveAttribute('aria-current', 'true')
    await expect(within(nav).getAllByRole('button', { name: /^More for / })).toHaveLength(5)
    // The live region is on the page, empty, before anything happens.
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement()
  },
}

// The sample is live: it can be renamed without an app behind it. Kept out of Default, whose end state is what the
// Figma visual diff captures.
export const SampleIsLive: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(await within(await openMenu(canvas, 'Launch brief draft')).findByRole('menuitem', { name: 'Rename' }))
    const field = await canvas.findByRole('textbox', { name: 'Rename Launch brief draft' })
    await userEvent.clear(field)
    await userEvent.type(field, 'Launch brief v2{Enter}')
    await expect(await canvas.findByRole('button', { name: 'Launch brief v2' })).toBeVisible()
  },
}

export const GroupsByDate: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(groupLabels(canvasElement)).toEqual(['Pinned', 'Today', 'Yesterday', 'Previous 7 days', 'September 2026', 'August 2026', 'Earlier'])
    // Newest first inside a group; a date in the future is not lost, it reads as today; midnight belongs to its own day.
    const today = within(canvas.getByRole('list', { name: 'Today' })).getAllByRole('listitem').map((row) => row.textContent)
    await expect(today).toEqual(['From the future', 'Q3 signups vs target', 'Launch brief draft'])
    await expect(within(canvas.getByRole('list', { name: 'Yesterday' })).getByText('Pricing page copy ideas')).toBeVisible()
    await expect(within(canvas.getByRole('list', { name: 'Earlier' })).getByText('No date')).toBeVisible()
    // The same rule, as a function: a pinned chat is only ever under Pinned.
    const groups = groupConversations(CHATS, NOW)
    await expect(groups.flatMap((group) => group.chats).filter((chat) => chat.id === 'a')).toHaveLength(1)
    await expect(groups[0].key).toBe('pinned')
  },
}

export const SelectAChat: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Launch brief draft' }))
    await expect(args.onSelect).toHaveBeenCalledWith('c')
    await expect(canvas.getByRole('button', { name: 'Launch brief draft' })).toHaveAttribute('aria-current', 'true')
    await expect(canvas.getByRole('button', { name: 'Q3 signups vs target' })).not.toHaveAttribute('aria-current')
  },
}

// Faint until wanted, but never out of reach: hover, keyboard focus, the open chat, and an open menu all show it.
export const MoreButtonShows: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas }) => {
    const idle = canvas.getByRole('button', { name: 'More for Launch brief draft' })
    const onOpenChat = canvas.getByRole('button', { name: 'More for Q3 signups vs target' })
    await expect(getComputedStyle(onOpenChat).opacity).toBe('1')
    // Only meaningful where there is a mouse; on a touch screen it is always shown.
    if (window.matchMedia('(pointer: fine)').matches) await expect(getComputedStyle(idle).opacity).toBe('0')
    idle.focus()
    // The stock Button eases every property it changes, opacity included; read it once it has settled.
    await waitFor(() => expect(getComputedStyle(idle).opacity).toBe('1'))
    await userEvent.click(idle)
    await page().findByRole('menu')
    await expect(idle).toHaveAttribute('aria-expanded', 'true')
    await expect(getComputedStyle(idle).opacity).toBe('1')
    await closeMenu()
  },
}

// Ryan's note on the sketch: 2px between the row's highlighted background and its menu.
export const MenuSitsTwoPixelsBelowTheRow: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, canvasElement }) => {
    const menu = await openMenu(canvas, 'Q3 signups vs target')
    const row = rowOf(canvasElement, 'Q3 signups vs target')
    // The menu eases in; measure once it has settled.
    await waitFor(() => expect(Math.abs(menu.getBoundingClientRect().top - row.getBoundingClientRect().bottom - 2)).toBeLessThanOrEqual(0.5))
    // And it hangs from the row's right edge, as drawn.
    await expect(Math.abs(menu.getBoundingClientRect().right - row.getBoundingClientRect().right)).toBeLessThanOrEqual(6)
    const items = within(menu).getAllByRole('menuitem').map((item) => item.textContent)
    await expect(items).toEqual(['Rename', 'Pin', 'Delete'])
    await expect(within(menu).getByRole('separator')).toBeVisible()
    await closeMenu()
  },
}

export const RenameByKeyboard: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, args }) => {
    canvas.getByRole('button', { name: 'More for Launch brief draft' }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.click(await within(await page().findByRole('menu')).findByRole('menuitem', { name: 'Rename' }))
    const field = await canvas.findByRole('textbox', { name: 'Rename Launch brief draft' }) as HTMLInputElement
    await waitFor(() => expect(field).toHaveFocus())
    // The whole title is selected, so typing replaces it.
    await expect(field.selectionEnd! - field.selectionStart!).toBe('Launch brief draft'.length)
    await userEvent.keyboard('Launch brief, final{Enter}')
    const row = await canvas.findByRole('button', { name: 'Launch brief, final' })
    await waitFor(() => expect(row).toHaveFocus())
    await expect(args.onRename).toHaveBeenCalledTimes(1)
    await expect(args.onRename).toHaveBeenCalledWith('c', 'Launch brief, final')

    // Escape leaves the title as it was and reports nothing; so does a blank name.
    await userEvent.click(await within(await openMenu(canvas, 'Pricing page copy ideas')).findByRole('menuitem', { name: 'Rename' }))
    await userEvent.type(await canvas.findByRole('textbox', { name: 'Rename Pricing page copy ideas' }), ' changed{Escape}')
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Pricing page copy ideas' })).toHaveFocus())
    await userEvent.click(await within(await openMenu(canvas, 'Pricing page copy ideas')).findByRole('menuitem', { name: 'Rename' }))
    const blank = await canvas.findByRole('textbox', { name: 'Rename Pricing page copy ideas' })
    await userEvent.clear(blank)
    await userEvent.type(blank, '   {Enter}')
    await expect(await canvas.findByRole('button', { name: 'Pricing page copy ideas' })).toBeVisible()
    await expect(args.onRename).toHaveBeenCalledTimes(1)
  },
}

export const PinMovesIt: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(await within(await openMenu(canvas, 'Launch brief draft')).findByRole('menuitem', { name: 'Pin' }))
    await expect(args.onPin).toHaveBeenCalledWith('c', true)
    await waitFor(() => expect(within(canvas.getByRole('list', { name: 'Pinned' })).getByText('Launch brief draft')).toBeVisible())
    await expect(within(canvas.getByRole('list', { name: 'Today' })).queryByText('Launch brief draft')).toBeNull()
    // The row moved; the cursor went with it.
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Launch brief draft' })).toHaveFocus())
    const menu = await openMenu(canvas, 'Launch brief draft')
    await expect(within(menu).getByRole('menuitem', { name: 'Unpin' })).toBeVisible()
    await closeMenu()
  },
}

const confirmDelete = async (canvas: ReturnType<typeof within>, title: string) => {
  await userEvent.click(await within(await openMenu(canvas, title)).findByRole('menuitem', { name: 'Delete' }))
  const dialog = await page().findByRole('alertdialog', { name: 'Delete this chat?' })
  await expect(dialog).toHaveTextContent(title)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
}

export const DeleteThenUndo: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, args }) => {
    // It asks first, and Cancel changes nothing.
    await userEvent.click(await within(await openMenu(canvas, 'Launch brief draft')).findByRole('menuitem', { name: 'Delete' }))
    const dialog = await page().findByRole('alertdialog', { name: 'Delete this chat?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(page().queryByRole('alertdialog')).toBeNull())
    await expect(canvas.getByRole('button', { name: 'Launch brief draft' })).toBeVisible()

    await confirmDelete(canvas, 'Launch brief draft')
    // The row becomes one line, in the same place, with Undo holding the cursor.
    const today = canvas.getByRole('list', { name: 'Today' })
    await waitFor(() => expect(within(today).getByText(/Deleted .Launch brief draft./)).toBeVisible())
    await expect(canvas.queryByRole('button', { name: 'Launch brief draft' })).toBeNull()
    const undo = within(today).getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).toHaveFocus())
    await expect(canvas.getByRole('status')).toHaveTextContent('Deleted Launch brief draft. Undo is available.')
    await expect(args.onDelete).not.toHaveBeenCalled()

    await userEvent.click(undo)
    const row = await canvas.findByRole('button', { name: 'Launch brief draft' })
    await waitFor(() => expect(row).toHaveFocus())
    await expect(canvas.getByRole('status')).toHaveTextContent('Restored Launch brief draft.')
    await expect(args.onDelete).not.toHaveBeenCalled()
  },
}

export const DeleteCommits: Story = {
  args: { undoSeconds: 0.3 },
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, args }) => {
    await confirmDelete(canvas, 'Launch brief draft')
    const undo = await canvas.findByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).toHaveFocus())
    // While the cursor rests on Undo the countdown waits: half a second later the chat is still recoverable.
    await new Promise((resolve) => setTimeout(resolve, 500))
    await expect(args.onDelete).not.toHaveBeenCalled()
    // Moving on lets it run out.
    canvas.getByRole('button', { name: 'New chat' }).focus()
    await waitFor(() => expect(args.onDelete).toHaveBeenCalledTimes(1), { timeout: 3000 })
    await expect(args.onDelete).toHaveBeenCalledWith('c')
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Undo' })).toBeNull())
    await expect(canvas.queryByText(/Launch brief draft/)).toBeNull()
  },
}

// A second delete settles the first at once; undoing the second leaves the first deleted.
export const TwoDeletes: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas, args }) => {
    await confirmDelete(canvas, 'Launch brief draft')
    await canvas.findByRole('button', { name: 'Undo' })
    await confirmDelete(canvas, 'Pricing page copy ideas')
    await waitFor(() => expect(args.onDelete).toHaveBeenCalledTimes(1))
    await expect(args.onDelete).toHaveBeenCalledWith('c')
    await expect(canvas.getAllByRole('button', { name: 'Undo' })).toHaveLength(1)
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }))
    await expect(await canvas.findByRole('button', { name: 'Pricing page copy ideas' })).toBeVisible()
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

function Leavable(args: Args) {
  const [here, setHere] = React.useState(true)
  return (
    <div className="grid gap-3">
      <button type="button" onClick={() => setHere(false)}>Leave</button>
      {here ? <Owned {...args} /> : <p>Gone</p>}
    </div>
  )
}

// Confirmed and not undone: leaving the page must not quietly cancel the delete.
export const UnmountCommits: Story = {
  render: (args) => <Leavable {...args} />,
  play: async ({ canvas, args }) => {
    await confirmDelete(canvas, 'Launch brief draft')
    await canvas.findByRole('button', { name: 'Undo' })
    await expect(args.onDelete).not.toHaveBeenCalled()
    await userEvent.click(canvas.getByRole('button', { name: 'Leave' }))
    await expect(await canvas.findByText('Gone')).toBeVisible()
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
    await expect(args.onDelete).toHaveBeenCalledWith('c')
  },
}

// An app's own list only offers what the app wired. No dead menu items, no dead buttons.
export const OnlyWhatIsWired: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <ConversationHistory className={args.className} label="Rename only" now={NOW} conversations={CHATS.slice(1, 3)} onRename={args.onRename} />
      <ConversationHistory className={args.className} label="Read only" now={NOW} conversations={CHATS.slice(1, 3)} />
    </div>
  ),
  play: async ({ canvas }) => {
    const renameOnly = canvas.getByRole('navigation', { name: 'Rename only' })
    await expect(within(renameOnly).queryByRole('button', { name: 'New chat' })).toBeNull()
    await userEvent.click(within(renameOnly).getByRole('button', { name: 'More for Q3 signups vs target' }))
    const menu = await page().findByRole('menu')
    await expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Rename'])
    await expect(within(menu).queryByRole('separator')).toBeNull()
    await closeMenu()
    const readOnly = canvas.getByRole('navigation', { name: 'Read only' })
    await expect(within(readOnly).queryByRole('button', { name: /^More for / })).toBeNull()
    await expect(within(readOnly).getAllByRole('button')).toHaveLength(2)
  },
}

export const Empty: Story = {
  args: { conversations: [], now: NOW },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No chats yet.')).toBeVisible()
    await expect(canvas.queryByRole('list')).toBeNull()
    await expect(canvas.getByRole('button', { name: 'New chat' })).toBeVisible()
  },
}

export const LongAndLinked: Story = {
  args: {
    now: NOW,
    conversations: [
      { id: 'long', title: 'A very long title that will never fit on one line of a three hundred pixel column', updatedAt: NOW },
      { id: 'link', title: 'Opens as a link', updatedAt: NOW, href: '#link' },
    ],
    currentId: 'link',
  },
  play: async ({ canvas, canvasElement }) => {
    const nav = canvas.getByRole('navigation', { name: 'Past chats' })
    const long = canvas.getByRole('button', { name: /^A very long title/ })
    // One line, cut with an ellipsis; the column does not grow or scroll sideways.
    await expect(long.scrollWidth).toBeGreaterThan(long.clientWidth)
    await expect(nav.scrollWidth).toBeLessThanOrEqual(nav.clientWidth)
    await expect(rowOf(canvasElement, 'A very long title').getBoundingClientRect().height).toBeLessThanOrEqual(34)
    // A chat with an href is a real link, and the open one is the current page.
    const link = canvas.getByRole('link', { name: 'Opens as a link' })
    await expect(link).toHaveAttribute('href', '#link')
    await expect(link).toHaveAttribute('aria-current', 'page')
  },
}

export const RowShowsFocusRing: Story = {
  render: (args) => <Owned {...args} />,
  play: async ({ canvas }) => {
    await expectFocusRing(canvas.getByRole('button', { name: 'Launch brief draft' }))
  },
}

// The same list docked in the stock Sidebar, with the page beside it.
export const Docked: Story = {
  parameters: { quillCentered: false },
  render: (args) => (
    <ConversationSidebar {...args} className={undefined} now={NOW} conversations={CHATS} currentId="b" title="Q3 signups vs target">
      <p className="text-sm text-muted-foreground">The open chat goes here.</p>
    </ConversationSidebar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('The open chat goes here.')).toBeVisible()
    // The stock rail carries the same name as the trigger; the trigger is the one in the top bar.
    const trigger = canvas.getAllByRole('button', { name: 'Toggle Sidebar' }).find((button) => button.dataset.slot === 'sidebar-trigger')
    await expect(trigger).toBeVisible()
    // On a desktop window the list is docked and in view.
    if (window.innerWidth >= 768) await expect(canvas.getByRole('navigation', { name: 'Past chats' })).toBeVisible()
  },
}
