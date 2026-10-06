# usage-meter (component)

Shows how much AI credit is left — the number, a bar in the AI gradient, when it renews, what the rest will buy, and a breakdown — with a compact ring for a composer footer.

### When to use
- People spend a limited allowance on AI (credits, messages, tokens) and should see what is left before it runs out.

### Reach for instead
- **progress** — when the bar shows how far a task has got, not how much of an allowance is left.
- **stat-cards** — when the number is a business metric on a dashboard, not an allowance being spent.
- **ai-notice** — when you only need one line of small print under the composer, with no amount.

### Rules
- **Do:** Let a low meter say "Running low" in words; the bar and the ring turn terracotta as well. **Don't:** Signal low credit with colour alone — people who cannot tell the colours apart see a normal meter.
- **Do:** Keep the AI gradient on the fill of the bar and the ring. Everything else on the card is plain. **Don't:** Put the gradient on the number, the card or the "Get more" button, or keep it on a low meter.
- **Do:** Add a plain-language line ("About 150 more long answers") so the number means something. **Don't:** Show a bare count of credits or tokens and leave people to work out what it buys.
- **Do:** Use the compact ring where space is tight: a composer footer, a sidebar. **Don't:** Redraw the compact meter as a filled pie wedge, or drop its text and leave the ring alone.

### Accessibility
- The bar is the stock Progress: a progressbar named by the label plus "left" ("AI credits left"), whose value text is the whole sentence ("1,500 of 5,000 credits left"), with ". Running low" added when it is low.
- Low credit is said in visible words in every variant, never by colour alone.
- The card is a group named by its label. The breakdown is a table with row headers and a caption for screen readers.
- The compact ring is decoration (aria-hidden); the text beside it carries the amount, and screen readers also hear the total.
- Nothing moves: the gradient fill is still.

### Design tokens
`--card` · `--border` · `--muted` · `--muted-foreground` · `--foreground` · `--destructive` · `--terracotta-deep` · `--ai-from` · `--ai-text-from` · `--ai-via` · `--ai-to`

