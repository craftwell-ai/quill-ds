export const usage = {
  name: 'input-otp',
  kind: 'component',
  summary: 'Digit-by-digit secure code entry — email verification, 2FA, PIN.',
  useWhen: [
    "You're collecting a fixed-length code (verification, 2FA, PIN) and want one boxed slot per character instead of a single text field.",
  ],
  alternatives: [
    { name: 'input', when: "the value isn't a fixed-length code — free-form text belongs in a single Input." },
  ],
  rules: [
    {
      id: 'maxlength-matches-slot-count',
      do: 'Set maxLength to match the total number of rendered InputOTPSlot elements (e.g. 6 slots → maxLength={6}).',
      dont: 'Let maxLength drift from the rendered slot count — fewer slots than maxLength hides digits the user already typed; more slots than maxLength leaves boxes that can never fill.',
      visual: true,
    },
    {
      id: 'aria-invalid-on-group',
      do: 'Set aria-invalid on InputOTPGroup to mark that group of slots as errored.',
      dont: 'Style an error state by hand-coloring individual slots instead of using aria-invalid.',
      visual: false,
    },
  ],
  a11y: [
    'Under the hood, one real (transparent, overlaid) `<input>` handles all keyboard input, paste, and autofill — the visible InputOTPSlot boxes are decorative, not separate form fields.',
    'autoComplete defaults to "one-time-code", so mobile browsers can offer SMS-code autofill with no extra wiring.',
    'InputOTPSeparator has role="separator" and an aria-hidden icon, so it is not announced as a character slot.',
  ],
  tokens: ['--input', '--ring', '--destructive', '--radius-lg'],
}
