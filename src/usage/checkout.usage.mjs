export const usage = {
  name: 'checkout',
  kind: 'pattern',
  summary: 'A two-column checkout — payment method picker and card form beside an order summary sidebar.',
  useWhen: [
    'You need to collect payment and card details alongside an order summary.',
  ],
  alternatives: [
    { name: 'order-summary', when: 'you only need the cart-review card, not the full payment form beside it.' },
    { name: 'wizard', when: 'payment is one step in a longer multi-step flow, not a single standalone page.' },
  ],
  rules: [
    {
      id: 'payment-method-is-radio',
      do: "Use a RadioGroup for payment-method choice (Card/Bank/Wallet) — it's a single mutually exclusive choice, styled as cards.",
      dont: 'Use checkboxes or a dropdown for a single mutually exclusive payment method.',
      visual: false,
    },
  ],
  a11y: [
    'The RadioGroup carries an explicit aria-label ("Payment method") since there is no visible fieldset legend for the icon-card options.',
    "Each payment-method option's actual radio input is sr-only, but the whole label (icon + text) is the click target and carries the accessible name.",
  ],
  tokens: ['--card', '--input', '--primary', '--ring', '--border'],
}
