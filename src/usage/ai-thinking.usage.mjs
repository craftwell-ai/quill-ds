export const usage = {
  name: 'ai-thinking',
  kind: 'component',
  summary: 'Shows an AI working before its answer — a shimmering "Thinking" with what it is doing — then folds into one quiet "Thought for 8 s" row that opens the reasoning.',
  useWhen: ['An AI takes a noticeable moment before answering and people should see it is working, and later how it got there.'],
  alternatives: [
    { name: 'spinner', when: 'something that is not AI is loading.' },
    { name: 'skeleton', when: 'a page or card is loading its layout, not an AI thinking.' },
  ],
  rules: [
    {
      id: 'motion-only-while-working',
      do: 'Switch to status="done" the moment the answer starts, so the shimmer and line stop.',
      dont: 'Leave the shimmer running beside a finished answer — motion means the AI is still working.',
      visual: true,
    },
    {
      id: 'reasoning-folded',
      do: 'Keep the reasoning folded behind "Thought for N s" once the answer is there.',
      dont: 'Show the reasoning open by default after the answer lands — it pushes the answer down.',
      visual: false,
    },
  ],
  a11y: [
    'A polite live region (role="status") is on the page from the first paint in both states. It starts empty and is filled a moment after the component mounts, then follows the label and activity as they change, without moving focus. The visible label is hidden from screen readers so it is not read twice; the region holds the one copy. When the work is done it empties and announces nothing, so a finished reply restored from history stays quiet.',
    'The finished row is a button with aria-expanded that controls the reasoning list, with the same 3px focus ring as a Button.',
    'Under reduced motion the shimmer and sweeping line hold still; the label stays readable.',
  ],
  tokens: ['--ai-from', '--ai-via', '--ai-to', '--ai-text-via', '--muted-foreground', '--border'],
}
