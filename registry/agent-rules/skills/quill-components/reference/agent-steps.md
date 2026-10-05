# agent-steps (component)

Shows the steps an AI agent is working through — done, running, waiting or failed — with a count in the header and rows that open to show what happened.

### When to use
- An AI agent does a task in several steps and people should see where it is, what is finished and what went wrong.

### Reach for instead
- **ai-thinking** — when the AI is only thinking before one answer; there are no separate steps to follow.
- **progress** — when you know a percentage and there is nothing to read step by step.
- **wizard** — when the person, not the AI, moves through the steps.

### Rules
- **Do:** Leave the ticks and the spinner in moss; the AI mark in the header already says an agent is working. **Don't:** Paint progress with the AI gradient — the gradient marks AI, moss marks progress.
- **Do:** Let finished steps go muted so the running step stands out. **Don't:** Strike finished steps through — long labels become hard to read.
- **Do:** Put what a step found in its detail, opened by pressing the row. **Don't:** Print every step's detail in the list — the list has to stay scannable.

### Accessibility
- The card is a group named by its title; the steps are an ordered list.
- Every row starts with its state in words for screen readers ("Done:", "Running:", "Waiting:", "Failed:"), so the state never rests on the icon or its colour.
- A row with detail is a button with aria-expanded that controls the detail, with the same 3px focus ring as a Button. A row without detail is plain text, not a button.
- A polite live region (role="status") is on the page from the first paint, empty. While a step is running or has failed it says which one and the count ("Running: Drafting the summary. 2 of 5 done") and follows the list as it changes; the visible count is hidden from screen readers while the region speaks, so it is not read twice. A list that is already finished when it appears announces nothing.
- Retry is a Button named "Retry: " followed by the step.
- Under reduced motion the spinner holds still; the row still says "running".

### Design tokens
`--card` · `--border` · `--input` · `--muted` · `--muted-foreground` · `--foreground` · `--ink-soft` · `--moss-deep` · `--terracotta-deep` · `--paper` · `--destructive` · `--ai-from` · `--ai-via` · `--ai-to`

