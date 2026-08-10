# otp-verification (pattern)

A six-digit one-time-passcode entry card for verifying an email, with expiry messaging and a resend action.

### When to use
- You need to verify an email with a six-digit one-time passcode and resend.

### Reach for instead
- **login-minimal** — when you're sending the initial one-time code, not verifying a code the user already received — that's a separate step upstream of this card.
- **forgot-password** — when recovery works by emailed link, not a typed code.

### Rules
- **Do:** State the code's expiry window in the card body ("expires in 10 minutes"), not just in the email. **Don't:** Leave users guessing why a code that worked a moment ago now fails.

### Accessibility
- The OTP field's accessible name comes from a visually-hidden &lt;Label> (sr-only), since the six boxed slots have no room for visible text.
- The six slots read to assistive tech as one field via the shared label, not as six separate unlabeled boxes.

### Design tokens
`--input` · `--ring` · `--destructive` · `--foreground`

