# model-picker (component)

Lets people choose which AI model answers — a quiet name-and-chevron trigger in the composer that opens a list with Auto first, a line on what each model is good for, and a check on the current one.

### When to use
- An app offers more than one AI model or speed and people may want to switch per message.

### Reach for instead
- **select** — when the choice is an ordinary form setting, not an AI model.
- **radio-group** — when the model is chosen once on a settings page; show the same options as radios.

### Rules
- **Do:** Give every model a one-line description of what it is good for ("Fast answers, fewer credits"). **Don't:** List bare model names — people cannot choose between names they do not know.
- **Do:** Offer Auto first so people who do not care never have to choose. **Don't:** Make people pick a model before their first message.

### Accessibility
- The trigger is named with the current choice ("Model: Auto"); the menu is a radio group, so arrow keys move and the current model is announced as checked.

### Design tokens
`--popover` · `--accent` · `--muted` · `--ink-soft` · `--muted-foreground`

