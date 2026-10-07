# conversation-history (pattern)

Past AI chats grouped by when they happened — pinned first, then today, yesterday, the last week and earlier months — with the open chat filled and a menu on each row to rename, pin or delete it.

### When to use
- People come back to earlier conversations with an AI and need to find one, reopen it, and tidy the list.

### Reach for instead
- **ai-chat** — when you want the whole chat page; it carries a short list of its own.
- **sidebar-nav** — when the side column moves between sections of the app, not between past chats.
- **command-palette** — when people look a chat up by typing its name instead of browsing by date.

### Rules
- **Do:** Pass your chats as conversations and wire onSelect, onRename, onPin and onDelete. The five chats shown without it are sample content. **Don't:** Ship the sample list, or edit the block to hard-code yours — the block is overwritten on update.
- **Do:** Leave both steps in: the confirmation before, and Undo in the list for a few seconds after. onDelete is called at most once for each confirmed delete: when the Undo time has passed, or sooner if another delete is confirmed, the list is removed, or the page is hidden or closed. Send your request from onDelete with keepalive (or sendBeacon) so one made as the page closes is not dropped. **Don't:** Delete on the first press, or delete on your side before onDelete is called — Undo could not bring the chat back.
- **Do:** Pass now again (for example when the window regains focus) if the list can stay open overnight; "Today" is worked out when the list is first drawn. **Don't:** Expect the groups to roll over at midnight by themselves.
- **Do:** Leave out a callback you do not support; its menu item is not drawn. **Don't:** Pass a callback that does nothing so the menu looks complete.
- **Do:** Open this list from the AI side panel's History button (onHistory). Pass it as the panel's body to show it in the panel itself, in place of the thread, and pass undefined again once a chat is chosen; or show it in your own sheet or column. **Don't:** Expect the side panel to show it by itself — History only calls onHistory, and the list appears when you pass it.
- **Do:** Pass timeZone (the person's zone) and now when the list is rendered on a server, so the server and the browser put each chat in the same group. **Don't:** Leave the zone to the server's clock — a chat from this evening reads as Yesterday on the server and Today in the browser.

### Accessibility
- The list is a navigation landmark named "Past chats". Each group is a list named by its heading. The open chat is marked aria-current and set in medium weight, so it does not rest on the fill alone.
- Each row's "more" button is named "More for" followed by the chat's title. It is hidden until the row is hovered, and fully shown on keyboard focus, on touch screens, on the open chat and while its menu is open.
- The menu is the stock DropdownMenu: arrow keys, Escape, and Delete set apart and in the destructive colour.
- Rename turns the row into a text field named "Rename" followed by the title, with the cursor in it and the text selected. Enter saves, Escape cancels, and focus returns to the row. Moving away with the pointer saves and leaves focus where it was put.
- Delete opens the stock AlertDialog first. After it is confirmed the row becomes a line saying what was deleted with an Undo button, and focus moves to Undo. The countdown waits while the pointer or keyboard focus is on that line.
- A polite live region (role="status") is on the page from the start; it says when a chat is deleted and that Undo is available, and when a chat is restored.

### Design tokens
`--background` · `--foreground` · `--muted` · `--muted-foreground` · `--border` · `--input` · `--ring` · `--destructive` · `--popover` · `--sidebar` · `--sidebar-border`

