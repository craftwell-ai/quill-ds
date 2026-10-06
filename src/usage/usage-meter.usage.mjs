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
      do: 'Let a low meter say "Running low" in words; the bar and the ring turn terracotta as well.',
      dont: 'Signal low credit with colour alone — people who cannot tell the colours apart see a normal meter.',
      visual: true,
    },
    {
      id: 'gradient-is-the-fill-only',
      do: 'Keep the AI gradient on the fill of the bar and the ring. Everything else on the card is plain.',
      dont: 'Put the gradient on the number, the card or the "Get more" button, or keep it on a low meter.',
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
      do: 'Use the compact ring where space is tight: a composer footer, a sidebar.',
      dont: 'Redraw the compact meter as a filled pie wedge, or drop its text and leave the ring alone.',
      visual: false,
    },
  ],
  a11y: [
    'The bar is the stock Progress: a progressbar named by the label plus "left" ("AI credits left"), whose value text is the whole sentence ("1,500 of 5,000 credits left"), with ". Running low" added when it is low.',
    'Low credit is said in visible words in every variant, never by colour alone.',
    'The card is a group named by its label. The breakdown is a table with row headers and a caption for screen readers.',
    'The compact ring is decoration (aria-hidden); the text beside it carries the amount, and screen readers also hear the total.',
    'The gradient itself does not animate; the fill only eases to its new width when the amount changes, as the stock Progress does.',
  ],
  tokens: ['--card', '--border', '--muted', '--muted-foreground', '--foreground', '--destructive', '--terracotta-deep', '--ai-from', '--ai-text-from', '--ai-via', '--ai-to'],
}
