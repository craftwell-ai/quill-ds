# faq (pattern)

A centered FAQ section — an accordion of common questions with a contact call-to-action footer.

### When to use
- You need to answer common questions in an accordion with a contact fallback.

### Reach for instead
- **accordion** — when you need a bare accordion with no marketing framing (heading, contact footer) around it.
- **contact-form** — when the user needs to ask something not covered — this pattern only offers a CTA button, not the form itself.

### Rules
- **Do:** Open the first question by default (defaultValue=['item-0']) so the section doesn't read as empty on load. **Don't:** Start every item collapsed and force a first click just to prove the section has content.

### Accessibility
- AccordionTrigger elements are real buttons — each question is reachable and operable by keyboard, not just click.
- The contact fallback card pairs plain text ("Still curious?") with a real button, not a bare link buried in a paragraph.

### Design tokens
`--card` · `--border` · `--muted-foreground`

