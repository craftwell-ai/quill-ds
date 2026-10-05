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
- **Do:** Wire History to your own list of past chats with onHistory. It only calls onHistory: Quill's past-chats view (conversation-history) comes in a later release. Leave onHistory out and the button is not drawn. **Don't:** Ship a History button that does nothing.
- **Do:** Use the small composer and the list layout for suggestions; the panel is narrow. **Don't:** Put the large composer or starter cards in the panel — they belong to the AI home page.

### Accessibility
- In the Sheet the panel is a modal dialog named by its title. Escape or Close closes it and focus returns to what opened it; opening it puts focus on the first control inside.
- Placed in a layout on its own (AiPanel), the panel is a region named by its title.
- The thread is a log named "Messages", a polite live region, so each new turn is read out as it is added. The thread scrolls inside the panel; the header and the composer stay in view.
- The chip's remove button is named "Stop looking at" followed by the scope and shows the same 3px focus ring as a Button; removing the chip moves the cursor to the composer. A scope your app controls, with no onScopeRemove, shows no remove button.
- History and Close are icon buttons with names. History is drawn only when onHistory is given.

### Design tokens
`--popover` · `--popover-foreground` · `--background` · `--border` · `--input` · `--muted` · `--ink-soft` · `--foreground` · `--ai-from` · `--ai-via` · `--ai-to`

