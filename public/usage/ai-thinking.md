# ai-thinking (component)

Shows an AI working before its answer — a shimmering "Thinking" with what it is doing — then folds into one quiet "Thought for 8 s" row that opens the reasoning.

### When to use
- An AI takes a noticeable moment before answering and people should see it is working, and later how it got there.

### Reach for instead
- **spinner** — when something that is not AI is loading.
- **skeleton** — when a page or card is loading its layout, not an AI thinking.

### Rules
- **Do:** Switch to status="done" the moment the answer starts, so the shimmer and line stop. **Don't:** Leave the shimmer running beside a finished answer — motion means the AI is still working.
- **Do:** Keep the reasoning folded behind "Thought for N s" once the answer is there. **Don't:** Show the reasoning open by default after the answer lands — it pushes the answer down.

### Accessibility
- The working state is a polite live region (role="status"), so "Thinking" and each activity line are announced without moving focus.
- The finished row is a button with aria-expanded that controls the reasoning list.
- Under reduced motion the shimmer and sweeping line hold still; the label stays readable.

### Design tokens
`--ai-from` · `--ai-via` · `--ai-to` · `--ai-text-via` · `--muted-foreground` · `--border`

