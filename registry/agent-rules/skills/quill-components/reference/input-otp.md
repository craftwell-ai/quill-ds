# input-otp (component)

Digit-by-digit secure code entry — email verification, 2FA, PIN.

### When to use
- You're collecting a fixed-length code (verification, 2FA, PIN) and want one boxed slot per character instead of a single text field.

### Reach for instead
- **input** — when the value isn't a fixed-length code — free-form text belongs in a single Input.

### Rules
- **Do:** Set maxLength to match the total number of rendered InputOTPSlot elements (e.g. 6 slots → maxLength={6}). **Don't:** Let maxLength drift from the rendered slot count — fewer slots than maxLength hides digits the user already typed; more slots than maxLength leaves boxes that can never fill.
- **Do:** Set aria-invalid on InputOTPGroup to mark that group of slots as errored. **Don't:** Style an error state by hand-coloring individual slots instead of using aria-invalid.

### Accessibility
- Under the hood, one real (transparent, overlaid) `<input>` handles all keyboard input, paste, and autofill — the visible InputOTPSlot boxes are decorative, not separate form fields.
- autoComplete defaults to "one-time-code", so mobile browsers can offer SMS-code autofill with no extra wiring.
- InputOTPSeparator has role="separator" and an aria-hidden icon, so it is not announced as a character slot.

### Design tokens
`--input` · `--ring` · `--destructive` · `--radius-lg`

