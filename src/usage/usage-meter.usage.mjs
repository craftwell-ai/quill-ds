export const usage = {
  name: 'usage-meter',
  kind: 'component',
  summary: 'Shows how much AI credit is left — the number, a bar in the AI gradient, when it renews, what the rest will buy, and a breakdown — with a compact ring for a composer footer.',
  useWhen: ['People spend a limited allowance on AI (credits, messages, tokens) and should see what is left before it runs out.'],
  alternatives: [
    { name: 'progress', when: 'the bar shows how far a task has got, not how much of an allowance is left.' },
    { name: 'stat-cards', when: 'the number is a business metric on a dashboard, not an allowance being spent.' },
    { name: 'ai-notice', when: 'you only need one line of small print under the composer, with no amount.' },
  ],
  rules: [
    {
      id: 'low-says-so-in-words',
      do: 'Let a low bar or card say "Running low" in words beside the amount; the bar itself does not change colour.',
      dont: 'Rely on the short fill alone to say credit is low.',
      visual: true,
    },
    {
      id: 'gradient-is-the-fill-only',
      do: 'Keep the AI gradient on the fill of the bar and the ring. The gradient is laid across the whole bar and the fill reveals it, so a nearly empty bar is plain gold. Everything else on the card is plain.',
      dont: 'Put the gradient on the number, the card or the "Get more" button.',
      visual: false,
    },
    {
      id: 'say-what-it-buys',
      do: 'Add a plain-language line ("About 150 more long answers") so the number means something.',
      dont: 'Show a bare count of credits or tokens and leave people to work out what it buys.',
      visual: false,
    },
    {
      id: 'ring-not-pie',
      do: 'Use the compact ring where space is tight: a composer footer, a sidebar. It looks the same whether or not credit is low.',
      dont: 'Redraw the compact meter as a filled pie wedge, or drop its text and leave the ring alone.',
      visual: false,
    },
  ],
  a11y: [
    'The bar is the stock Progress: a progressbar named by the label plus "left" ("AI credits left"), whose value text is the whole sentence ("1,500 of 5,000 credits left"), with ". Running low" added when it is low.',
    'On the bar and the card, low credit is said in visible words ("Running low", beside the amount), never by the fill alone; the total ("of 5,000") stays on the line.',
    'On the compact ring the visible line does not change when credit is low, so low is said to screen readers only: "Running low: " is read before the amount.',
    'The card is a group named by its label. The breakdown is a table with row headers and a caption for screen readers.',
    'The compact ring is decoration (aria-hidden); the text beside it carries the amount, and screen readers also hear the total, and "Running low: " first when it is low.',
    'The gradient itself does not animate; the fill only eases to its new width when the amount changes, as the stock Progress does.',
  ],
  tokens: ['--card', '--border', '--muted', '--muted-foreground', '--foreground', '--destructive', '--ai-from', '--ai-text-from', '--ai-via', '--ai-to'],
}
