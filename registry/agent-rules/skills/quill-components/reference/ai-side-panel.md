# ai-side-panel (pattern)

An AI assistant docked beside the page — a header with History and Close, a removable chip saying what it is looking at, a short thread, and the small composer, on one soft top-to-bottom AI wash.

### When to use
- People are working on a page (a report, a record, a document) and should be able to ask the AI about it without leaving.

### Reach for instead
- **ai-chat** — when the conversation is the whole page, not a helper beside other work.
- **sheet** — when the side panel holds an ordinary form or details, not an AI assistant.
- **ai-popover** — when the AI suggests one edit to selected text and no conversation is needed.

### Rules
- **Do:** Keep the "Looking at" chip so people know what the assistant can read, and let them remove it. **Don't:** Send the page to the AI without saying so, or pin a scope people cannot drop.
- **Do:** Let the one wash run from the top of the panel to the bottom, behind the header, the thread and the composer. **Don't:** Give the header its own gradient band or add a second wash — a band reads as a hard edge.
- **Do:** Wire History to your own list of past chats with onHistory; the conversation-history block is that list, and passing it as body shows it in the panel itself, in place of the thread, until you stop passing it (anything React draws nothing for shows the thread: undefined, null, true, false, an empty string; so open ? list : null and open && list both work). History only calls onHistory, and with it left out the button is not drawn. **Don't:** Ship a History button that does nothing, or put the list among the messages — it is not a turn of the conversation.
- **Do:** Use the small composer and the list layout for suggestions; the panel is narrow. **Don't:** Put the large composer or starter cards in the panel — they belong to the AI home page.
- **Do:** Pass your conversation as children and drive the composer with status, onStop and onSubmit. The conversation shown without children is sample content. For a conversation with nothing in it yet pass null, false or an empty list: unlike body, anything but undefined counts as passed here, and only undefined shows the sample. **Don't:** Ship the sample conversation, or edit the block to hard-code yours — the block is overwritten on update.
- **Do:** Keep the composer's gradient edge on the washed panel here. It is on purpose, even though the general rule puts the edge on page-background surfaces. **Don't:** Take it as a reason to put the edge on other tinted surfaces.

### Accessibility
- In the Sheet the panel is a modal dialog named by its title. Escape or Close closes it and focus returns to what opened it; opening it puts the cursor in the message box. Opened by a touch on its trigger, focus goes to the panel itself instead, so the on-screen keyboard stays down until the box is pressed; opened by your app through the open prop, the same happens on a device whose main pointer is a finger (pointer: coarse).
- On a phone (under 640px wide) the Sheet covers the whole screen, so Close in the header is the way out besides Escape; from 640px up it is the stock 24rem panel.
- Placed in a layout on its own (AiPanel), the panel is a region named by its title.
- The thread is a log named "Messages", a polite live region, so each new turn is read out as it is added. The thread scrolls inside the panel; the header and the composer stay in view. Messages scrolled under the header fade out; at the top of the thread nothing fades, and a control reached by keyboard is scrolled clear of the fade.
- The sample replies do not show their name, because the header already says it; the name is still read to screen readers. Pass hideName on the replies in your own conversation for the same.
- With your own conversation the panel opens on the newest turn, and brings the newest into view when a turn is added or a reply starts being written (status "working"). Each turn has to be a direct child for an added one to be noticed. Stop moves the cursor back to the message box.
- While body is passed, the thread is hidden, the scope chip and the log with it, so nothing in it is read or reached by Tab; the header and the composer stay. What you pass names itself (the conversation-history block is a navigation landmark). When body goes away the thread is back where it was scrolled to, and if the cursor was on something in the body it lands in the message box; on a device whose main pointer is a finger (pointer: coarse) it lands on the panel itself instead, so the on-screen keyboard stays down (drawn inline, the panel is focusable only until focus leaves it again; an element of your own around it is never touched).
- The chip's remove button is named "Stop looking at" followed by the scope and shows the same 3px focus ring as a Button; removing the chip moves the cursor to the composer. A scope your app controls, with no onScopeRemove, shows no remove button.
- History and Close are icon buttons with names. History is drawn only when onHistory is given.

### Design tokens
`--popover` · `--popover-foreground` · `--background` · `--border` · `--input` · `--muted` · `--ink-soft` · `--foreground` · `--ai-from` · `--ai-via` · `--ai-to`

