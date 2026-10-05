export const usage = {
  name: 'ai-popover',
  kind: 'component',
  summary: 'An AI suggestion beside the text it is about — what the AI did, the suggested text on a soft AI wash, then Discard, Try again and Replace.',
  useWhen: ['Someone selects text (or presses an AI action on a field) and the AI offers a rewrite they can take or leave without leaving the page.'],
  alternatives: [
    { name: 'popover', when: 'the overlay holds an ordinary form or filter, not an AI suggestion.' },
    { name: 'ai-message', when: 'the AI answers in a conversation rather than suggesting an edit to text on the page.' },
  ],
  rules: [
    {
      id: 'replace-stays-plain',
      do: 'Leave Replace as the plain solid button; the wash and the mark already say this came from AI.',
      dont: 'Put the AI gradient on Replace or on the suggested text — accepting has to feel like any other decision.',
      visual: true,
    },
    {
      id: 'keep-the-original-in-view',
      do: 'Wrap the selected text as the popover\'s anchor so it stays highlighted underneath for comparison.',
      dont: 'Cover or remove the original before the person has chosen.',
      visual: false,
    },
    {
      id: 'say-what-it-did',
      do: 'Title the popover with the action and its flavour: "Rewrite: shorter".',
      dont: 'Title it "AI" or "Suggestion" — people should know what was asked without remembering it.',
      visual: false,
    },
  ],
  a11y: [
    'The popover is a dialog named by its title. It opens on a press, moves focus into itself, and returns focus to its anchor when it closes.',
    'It stays open while you press inside it; Escape, a press outside it, or a second press on its anchor closes it.',
    'An anchor that is not a button (highlighted text) is given the button role and a place in the Tab order.',
    'While the AI is writing, a polite live region (role="status") says the working label; when a suggestion follows it says "Suggestion ready". The region is in the popover from its first paint, empty, and the visible label is hidden from screen readers so it is not read twice. A popover that opens with a finished suggestion announces nothing extra.',
    'Under reduced motion the shimmer and the line hold still; the label stays readable.',
  ],
  tokens: ['--popover', '--background', '--input', '--foreground', '--muted-foreground', '--primary', '--ai-from', '--ai-via', '--ai-to', '--ai-text-via'],
}
