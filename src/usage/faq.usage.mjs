export const usage = {
  name: 'faq',
  kind: 'pattern',
  summary: 'A centered FAQ section — an accordion of common questions with a contact call-to-action footer.',
  useWhen: [
    'You need to answer common questions in an accordion with a contact fallback.',
  ],
  alternatives: [
    { name: 'accordion', when: 'you need a bare accordion with no marketing framing (heading, contact footer) around it.' },
    { name: 'contact-form', when: 'the user needs to ask something not covered — this pattern only offers a CTA button, not the form itself.' },
  ],
  rules: [
    {
      id: 'default-open-first-item',
      do: "Open the first question by default (defaultValue=['item-0']) so the section doesn't read as empty on load.",
      dont: 'Start every item collapsed and force a first click just to prove the section has content.',
      visual: false,
    },
  ],
  a11y: [
    'AccordionTrigger elements are real buttons — each question is reachable and operable by keyboard, not just click.',
    'The contact fallback card pairs plain text ("Still curious?") with a real button, not a bare link buried in a paragraph.',
  ],
  tokens: ['--card', '--border', '--muted-foreground'],
}
