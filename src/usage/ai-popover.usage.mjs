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
    {
      id: 'tile-takes-the-divider-line',
      do: 'Leave the suggestion tile on the soft divider line (border-border). It is read-only content, told apart from the popover by its fill.',
      dont: 'Outline it with the control line (border-input) — that line marks things people press or type in.',
      visual: false,
    },
  ],
  a11y: [
    'The popover is a dialog named by its title. It opens on a press and focus lands on the popover itself (with a visible ring), not on a button, so a held Enter cannot press Discard. Try again keeps focus inside the popover while the suggestion is replaced, and closing it any way returns focus to its anchor, where the person was.',
    'After Replace, put focus in the new text yourself: the anchor the popover wrapped may be gone, so focus has nowhere to return to.',
    'The popover anchors to an element your app renders (a button, or text you wrap), not to a selection inside a text box or an editor.',
    'On a short screen the popover is capped to the space left; the suggestion scrolls while the header and the buttons stay in view. While it overflows, the scrolling area is a Tab stop named "Suggested text" with the usual focus ring, so the arrow and Page keys scroll it; a suggestion that fits adds no Tab stop.',
    'It stays open while you press inside it; Escape, a press outside it, or a second press on its anchor closes it.',
    'An anchor that is not a button (highlighted text) is given the button role and a place in the Tab order.',
    'While the AI is writing, a polite live region (role="status") says the working label; when a suggestion follows it says "Suggestion ready". The region is in the popover from its first paint, empty, and the visible label is hidden from screen readers so it is not read twice. A popover that opens with a finished suggestion announces nothing extra.',
    'Under reduced motion the shimmer and the line hold still; the label stays readable.',
  ],
  tokens: ['--popover', '--background', '--border', '--foreground', '--muted-foreground', '--primary', '--ai-from', '--ai-via', '--ai-to', '--ai-text-via'],
}
