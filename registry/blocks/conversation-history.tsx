'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Sidebar, SidebarContent, SidebarProvider, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export type Conversation = {
  id: string
  title: string
  /** When the chat was last used. Anything `new Date()` reads. */
  updatedAt: string | number | Date
  pinned?: boolean
  /** Makes the row a link (so it can open in a new tab). Without it the row is a button. */
  href?: string
}

export type ConversationGroup = { key: string; label: string; chats: Conversation[] }

const DAY = 86_400_000
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

// Sample content, dated from "now" so the groups always read Pinned, Today, Yesterday, Previous 7 days.
const sampleChats = (now: Date): Conversation[] => {
  const ago = (days: number) => new Date(now.getTime() - days * DAY)
  return [
    { id: 'weekly', title: 'Weekly growth review prompt', updatedAt: ago(12), pinned: true },
    { id: 'q3', title: 'Q3 signups vs target', updatedAt: ago(0) },
    { id: 'launch', title: 'Launch brief draft', updatedAt: ago(0) },
    { id: 'pricing', title: 'Pricing page copy ideas', updatedAt: ago(1) },
    { id: 'offsite', title: 'Plan my week around the offsite', updatedAt: ago(4) },
  ]
}

// Named through a table on purpose: the Figma parity check counts every <Icon name="…"> literal in this file against
// the frame, and the frame shows the list with its menus closed. The `icon:` key is what puts each name in the
// core icon set apps receive (scripts/build-icons.mjs reads that form).
const MENU_ICON = {
  rename: { icon: 'edit' },
  pin: { icon: 'keep' },
  remove: { icon: 'delete' },
} as const

// The "more" button is 24px in a 32px row, so it sits 4px inside the row's highlighted background.
// 4 + 2 puts the menu 2px below that background (Ryan's note on the sketch, 2026-10-04).
const MENU_GAP = 6

const OPEN = 'min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 text-left text-sm text-foreground no-underline outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current]:font-medium'
// Faint until wanted, never out of reach: hover, keyboard focus anywhere in the row, the open chat, an open menu, and any touch screen show it.
const MORE = 'mr-1 shrink-0 text-muted-foreground opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 group-has-[[aria-current]]/row:opacity-100 aria-expanded:opacity-100 pointer-coarse:opacity-100'

/** Pinned first, then Today, Yesterday, Previous 7 days, then one group per month, newest first. */
export function groupConversations(conversations: Conversation[], now: Date, locale = 'en-US'): ConversationGroup[] {
  const today = startOfDay(now)
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
  const groups = new Map<string, { label: string; order: number; rows: { chat: Conversation; time: number }[] }>()
  const put = (key: string, label: string, order: number, chat: Conversation, time: number) => {
    const group = groups.get(key) ?? { label, order, rows: [] }
    group.rows.push({ chat, time })
    groups.set(key, group)
  }
  for (const chat of conversations) {
    const date = new Date(chat.updatedAt)
    const readable = !Number.isNaN(date.getTime())
    const time = readable ? date.getTime() : 0
    if (chat.pinned) { put('pinned', 'Pinned', 0, chat, time); continue }
    // A date that cannot be read is not thrown away; it goes last.
    if (!readable) { put('earlier', 'Earlier', Number.MAX_SAFE_INTEGER, chat, time); continue }
    // Whole calendar days, so 23:59 yesterday is Yesterday and a clock set ahead still reads as Today.
    const days = Math.round((today - startOfDay(date)) / DAY)
    if (days <= 0) put('today', 'Today', 1, chat, time)
    else if (days === 1) put('yesterday', 'Yesterday', 2, chat, time)
    else if (days <= 7) put('week', 'Previous 7 days', 3, chat, time)
    else {
      const monthsAgo = Math.max(0, (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth())
      put(`month-${monthsAgo}`, monthName.format(date), 4 + monthsAgo, chat, time)
    }
  }
  return [...groups.entries()]
    .sort(([, first], [, second]) => first.order - second.order)
    .map(([key, group]) => ({ key, label: group.label, chats: group.rows.sort((first, second) => second.time - first.time).map((row) => row.chat) }))
}

export type ConversationHistoryProps = {
  /** Your chats. Leave it out and the list shows five sample chats and keeps them itself. */
  conversations?: Conversation[]
  /** The open chat. Pass an id or null to control it; leave it out and the list keeps its own. */
  currentId?: string | null
  /** "Today", for grouping. Defaults to the moment the list first renders. */
  now?: Date
  onSelect?: (id: string) => void
  /** Shows New chat. (The sample list shows it either way.) */
  onNew?: () => void
  /** With your own conversations, each of these three also decides whether its menu item is drawn. */
  onRename?: (id: string, title: string) => void
  onPin?: (id: string, pinned: boolean) => void
  /** Called once the Undo time has passed, not when Delete is confirmed. */
  onDelete?: (id: string) => void
  /** How long Undo stays after a delete. The countdown waits while the pointer or keyboard focus is on that line. */
  undoSeconds?: number
  /** Names the list for screen readers. */
  label?: string
  /** How month names are written. Fixed by default so the server and the browser agree. */
  locale?: string
  className?: string
}

/** Past AI chats grouped by when they happened — pinned first, then today, yesterday, the last week and earlier months — with the open chat filled and a menu on each row to rename, pin or delete it. */
export function ConversationHistory({
  conversations, currentId, now, onSelect, onNew, onRename, onPin, onDelete,
  undoSeconds = 6, label = 'Past chats', locale = 'en-US', className,
}: ConversationHistoryProps) {
  const baseId = React.useId()
  const [mountedAt] = React.useState(() => new Date())
  const today = now ?? mountedAt
  const controlled = conversations !== undefined
  const [ownChats, setOwnChats] = React.useState<Conversation[]>(() => sampleChats(today))
  const chats = conversations ?? ownChats
  const [ownCurrent, setOwnCurrent] = React.useState<string | null>(controlled ? null : 'q3')
  const current = currentId === undefined ? ownCurrent : currentId
  const [renaming, setRenaming] = React.useState<{ id: string; draft: string } | null>(null)
  // The dialog keeps the chat it asked about while it closes, so its words do not vanish mid-fade.
  const [asking, setAsking] = React.useState<{ id: string; title: string } | null>(null)
  const [askOpen, setAskOpen] = React.useState(false)
  // Confirmed, not yet final: shown as a line with Undo in the row's place.
  const [pending, setPending] = React.useState<{ id: string; title: string } | null>(null)
  const [hovering, setHovering] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [said, setSaid] = React.useState('')
  const navRef = React.useRef<HTMLElement>(null)
  const renameSettled = React.useRef(true)
  // Where the cursor should land after the update a handler just asked for.
  const [focusRequest, setFocusRequest] = React.useState<{ selector: string } | null>(null)
  // What a closing menu or dialog does with focus: unset, it hands focus back to what opened it (the stock
  // behaviour); a selector sends it there instead; null leaves focus where it is.
  const handoff = React.useRef<{ selector: string | null } | undefined>(undefined)

  // With the app's own list, an action it did not wire is not offered. The sample offers all three.
  const canRename = !controlled || Boolean(onRename)
  const canPin = !controlled || Boolean(onPin)
  const canDelete = !controlled || Boolean(onDelete)
  const hasMenu = canRename || canPin || canDelete
  const showNew = !controlled || Boolean(onNew)

  // Menus and the dialog hand focus back to what opened them as they close. When the cursor belongs somewhere else
  // (the rename field, a row that moved, Undo) two things carry it there, and neither is a timer: the closing menu
  // or dialog is told where to put focus (Base UI's finalFocus), and an effect moves it once the row, field or
  // button named is on the page. Whichever runs last, focus ends in the same place.
  const focusIn = (selector: string) => {
    handoff.current = { selector }
    setFocusRequest({ selector })
  }
  React.useEffect(() => {
    if (focusRequest) navRef.current?.querySelector<HTMLElement>(focusRequest.selector)?.focus()
  }, [focusRequest])
  const finalFocus = () => {
    const next = handoff.current
    if (next === undefined) return true
    return (next.selector ? navRef.current?.querySelector<HTMLElement>(next.selector) : null) ?? false
  }
  const rowSelector = (id: string) => `[data-chat-id="${CSS.escape(id)}"] [data-slot="chat-open"]`
  const moreSelector = (id: string) => `[data-chat-id="${CSS.escape(id)}"] [data-slot="dropdown-menu-trigger"]`

  const commitDelete = (id: string) => {
    if (!controlled) setOwnChats((all) => all.filter((chat) => chat.id !== id))
    if (currentId === undefined) setOwnCurrent((was) => (was === id ? null : was))
    onDelete?.(id)
  }

  // What the timer and the unmount need, as they stand now: both run long after the render that set them up.
  const latest = React.useRef({ commitDelete, pending })
  React.useEffect(() => { latest.current = { commitDelete, pending } })

  React.useEffect(() => {
    return () => {
      // Confirmed and not undone: leaving the page must not quietly cancel the delete.
      if (latest.current.pending) latest.current.commitDelete(latest.current.pending.id)
    }
  }, [])

  // The Undo window. It waits while the pointer or keyboard focus is on the line, and starts over when they leave.
  React.useEffect(() => {
    if (!pending || hovering || focused) return
    const timer = window.setTimeout(() => {
      latest.current.commitDelete(pending.id)
      setPending(null)
      setSaid('')
    }, Math.max(0, Number.isFinite(undoSeconds) ? undoSeconds : 6) * 1000)
    return () => window.clearTimeout(timer)
  }, [pending, hovering, focused, undoSeconds])

  const select = (id: string) => {
    if (currentId === undefined) setOwnCurrent(id)
    onSelect?.(id)
  }
  const startRename = (chat: Conversation) => {
    renameSettled.current = false
    setRenaming({ id: chat.id, draft: chat.title })
    focusIn('[data-slot="chat-rename"]')
  }
  // Enter and a click elsewhere both end a rename, and removing the field can send one more blur: settle once.
  const finishRename = (save: boolean, refocus: boolean) => {
    if (!renaming || renameSettled.current) return
    renameSettled.current = true
    const { id, draft } = renaming
    const next = draft.trim()
    const before = chats.find((chat) => chat.id === id)?.title
    setRenaming(null)
    if (save && next && before !== undefined && next !== before) {
      if (!controlled) setOwnChats((all) => all.map((chat) => (chat.id === id ? { ...chat, title: next } : chat)))
      onRename?.(id, next)
    }
    // After a key press the field that had focus is gone. After a click elsewhere, focus is where the person put it.
    if (refocus) focusIn(rowSelector(id))
  }
  const togglePin = (chat: Conversation) => {
    const pinned = !chat.pinned
    if (!controlled) setOwnChats((all) => all.map((each) => (each.id === chat.id ? { ...each, pinned } : each)))
    onPin?.(chat.id, pinned)
    // The row moves to another group and is drawn afresh there; take the cursor along.
    focusIn(rowSelector(chat.id))
  }
  const askDelete = (chat: Conversation) => {
    // The dialog takes the cursor itself; the closing menu must not pull it back to the row.
    handoff.current = { selector: null }
    setAsking({ id: chat.id, title: chat.title })
    setAskOpen(true)
  }
  // Cancel and Escape (a confirmed delete closes the dialog itself and sends the cursor to Undo).
  const closeAsk = (open: boolean) => {
    if (!open && asking) handoff.current = { selector: moreSelector(asking.id) }
    setAskOpen(open)
  }
  const confirmDelete = () => {
    if (!asking) return
    setAskOpen(false)
    // A second delete settles the first at once: one Undo at a time.
    if (pending) commitDelete(pending.id)
    setPending(asking)
    setHovering(false)
    setFocused(false)
    setSaid(`Deleted ${asking.title}. Undo is available.`)
    focusIn('[data-slot="chat-undo"] button')
  }
  const undo = () => {
    if (!pending) return
    setSaid(`Restored ${pending.title}.`)
    focusIn(rowSelector(pending.id))
    setPending(null)
    setHovering(false)
    setFocused(false)
  }

  const groups = groupConversations(chats, today, locale)

  return (
    <nav ref={navRef} aria-label={label} data-slot="conversation-history" className={cn('grid grid-cols-[minmax(0,1fr)] content-start gap-0.5 text-sm', className)}>
      {/* sr-only makes the region a real box that takes no space; it is here, empty, before anything is said. */}
      <div role="status" className="sr-only">{said}</div>
      {showNew ? (
        <Button type="button" variant="outline" size="sm" className="mb-1.5 justify-start" onClick={() => onNew?.()}><Icon name="add" />New chat</Button>
      ) : null}
      {groups.length === 0 ? <p className="px-2.5 py-2 text-muted-foreground">No chats yet.</p> : null}
      {groups.map((group) => (
        <React.Fragment key={group.key}>
          <p id={`${baseId}-${group.key}`} data-slot="chat-group" className="px-2.5 pt-2.5 pb-1 text-xs font-semibold text-muted-foreground">{group.label}</p>
          <ul aria-labelledby={`${baseId}-${group.key}`} className="grid grid-cols-[minmax(0,1fr)] gap-0.5">
            {group.chats.map((chat) => {
              if (pending?.id === chat.id) {
                return (
                  <li key={chat.id} data-slot="chat-undo" className="flex min-h-8 items-center gap-2 rounded-lg pl-2.5 text-muted-foreground"
                    onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
                    <span className="min-w-0 flex-1 truncate">Deleted “{chat.title}”</span>
                    <Button type="button" variant="ghost" size="xs" className="shrink-0 text-foreground" onClick={undo}>Undo</Button>
                  </li>
                )
              }
              if (renaming?.id === chat.id) {
                return (
                  <li key={chat.id} className="flex min-h-8 items-center">
                    <Input data-slot="chat-rename" aria-label={`Rename ${chat.title}`} value={renaming.draft} className="h-8 bg-background"
                      onChange={(event) => setRenaming({ id: chat.id, draft: event.target.value })}
                      onFocus={(event) => event.currentTarget.select()}
                      onBlur={() => finishRename(true, false)}
                      onKeyDown={(event) => {
                        // The Enter that confirms a word in Japanese or Chinese input is not the Enter that saves.
                        if (event.nativeEvent.isComposing) return
                        if (event.key !== 'Enter' && event.key !== 'Escape') return
                        event.preventDefault()
                        finishRename(event.key === 'Enter', true)
                        // Let go of the field now, while it is still on the page: removed with focus in it, it would
                        // send its blur from the middle of React's own update.
                        event.currentTarget.blur()
                      }} />
                  </li>
                )
              }
              const isCurrent = chat.id === current
              return (
                <li key={chat.id} data-slot="chat-row" data-chat-id={chat.id}
                  className="group/row flex min-h-8 items-center rounded-lg hover:bg-muted has-[[aria-current]]:bg-muted">
                  {chat.href ? (
                    <a href={chat.href} data-slot="chat-open" aria-current={isCurrent ? 'page' : undefined} onClick={() => select(chat.id)} className={OPEN}>{chat.title}</a>
                  ) : (
                    <button type="button" data-slot="chat-open" aria-current={isCurrent ? 'true' : undefined} onClick={() => select(chat.id)} className={OPEN}>{chat.title}</button>
                  )}
                  {hasMenu ? (
                    <DropdownMenu onOpenChange={(open) => { if (open) handoff.current = undefined }}>
                      <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label={`More for ${chat.title}`} className={MORE} />}>
                        <Icon name="more_horiz" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={MENU_GAP} className="w-44" finalFocus={finalFocus}>
                        {canRename ? <DropdownMenuItem onClick={() => startRename(chat)}><Icon name={MENU_ICON.rename.icon} />Rename</DropdownMenuItem> : null}
                        {canPin ? <DropdownMenuItem onClick={() => togglePin(chat)}><Icon name={MENU_ICON.pin.icon} />{chat.pinned ? 'Unpin' : 'Pin'}</DropdownMenuItem> : null}
                        {canDelete && (canRename || canPin) ? <DropdownMenuSeparator /> : null}
                        {canDelete ? <DropdownMenuItem variant="destructive" onClick={() => askDelete(chat)}><Icon name={MENU_ICON.remove.icon} />Delete</DropdownMenuItem> : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </React.Fragment>
      ))}
      <AlertDialog open={askOpen} onOpenChange={closeAsk}>
        <AlertDialogContent size="sm" finalFocus={finalFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>“{asking?.title}” will be deleted. You can undo this for a few seconds afterwards.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}

/** The same list docked in the stock Sidebar, with the page beside it. */
export function ConversationSidebar({ children, title = 'Chats', className, ...list }: ConversationHistoryProps & { children?: React.ReactNode; title?: string }) {
  return (
    <SidebarProvider>
      <div className={cn('flex h-[560px] w-full', className)}>
        <Sidebar collapsible="offcanvas">
          <SidebarContent className="p-2">
            <ConversationHistory {...list} />
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <SidebarTrigger />
            <span className="truncate text-sm text-muted-foreground">{title}</span>
          </header>
          <main className="flex flex-1 flex-col gap-6 overflow-auto p-4">
            {children ?? <p className="text-sm text-muted-foreground">Pick a chat to open it here.</p>}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
