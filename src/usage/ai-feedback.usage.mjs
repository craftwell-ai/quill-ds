export const usage = {
  name: 'ai-feedback',
  kind: 'component',
  summary: 'Asks what was wrong after a thumbs-down on an AI answer — a few reasons to pick from, an optional note, and Send — opening under the answer so what is being judged stays in view.',
  useWhen: ['Someone has marked an AI answer as bad and you want to learn why, without taking them away from the answer.'],
  alternatives: [
    { name: 'ai-message', when: 'the thumbs alone are all you collect; they are already on the reply.' },
    { name: 'dialog', when: 'the feedback is a longer survey that needs the person\'s whole attention.' },
    { name: 'contact-form', when: 'people are writing to your team, not rating one answer.' },
  ],
  rules: [
    {
      id: 'six-reasons-at-most',
      do: 'Offer about six short reasons, your own or the defaults, and let people pick several.',
      dont: 'List every reason you can think of — past about six the chips become a wall nobody reads.',
      visual: true,
    },
    {
      id: 'text-is-never-required',
      do: 'Let Send work with a reason alone, or a note alone.',
      dont: 'Force people to type before they can send — most will leave instead.',
      visual: false,
    },
    {
      id: 'under-the-answer',
      do: 'Open the form under the answer it is about (pass it to AiMessage as feedbackForm).',
      dont: 'Cover the answer with a dialog — people need to see what they are judging.',
      visual: false,
    },
    {
      id: 'say-what-is-sent',
      do: 'Keep the line that says what is sent with the feedback, in your own words if the defaults are not true for your app.',
      dont: 'Send the conversation along without saying so.',
      visual: false,
    },
  ],
  a11y: [
    'The form is a group named by its question. The reasons are toggle buttons (aria-pressed) in a group named "Reasons", each with the same 3px focus ring as a Button; a chosen reason is filled in ink, so the choice does not rest on a hue.',
    'The note is a text area named by its label. Send is off until a reason is chosen or something is typed; spaces do not count.',
    'A polite live region (role="status") is on the page from the start, empty. After Send the form is replaced by one line there ("Thanks, that helps."), and keyboard focus moves to that line, because the Send button it was on is gone.',
    'Close is an icon button named "Close", drawn only when onClose is given. Inside an AiMessage, closing the form returns focus to the thumbs-down button.',
    'Inside an AiMessage the form follows the thumbs in reading order, so the next Tab after pressing thumbs-down lands in it. Focus is not moved into it on its own.',
  ],
  tokens: ['--card', '--border', '--input', '--background', '--foreground', '--muted', '--muted-foreground', '--ink-soft', '--ring'],
}
