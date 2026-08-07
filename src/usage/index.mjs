/**
 * Static index of every usage module. Kept by hand so node scripts and tests
 * stay synchronous; scripts/usage-schema.test.mjs fails if a *.usage.mjs file
 * on disk is missing here, so the two cannot drift.
 */
import { usage as alerts } from './alerts.usage.mjs'
import { usage as button } from './button.usage.mjs'
import { usage as dialog } from './dialog.usage.mjs'
import { usage as forgotPassword } from './forgot-password.usage.mjs'
import { usage as login } from './login.usage.mjs'
import { usage as loginMinimal } from './login-minimal.usage.mjs'
import { usage as loginOauth } from './login-oauth.usage.mjs'
import { usage as loginSplitPanel } from './login-split-panel.usage.mjs'
import { usage as otpVerification } from './otp-verification.usage.mjs'
import { usage as signup } from './signup.usage.mjs'
import { usage as signupSocial } from './signup-social.usage.mjs'

export const ALL_USAGE = [
  alerts,
  button,
  dialog,
  forgotPassword,
  login,
  loginMinimal,
  loginOauth,
  loginSplitPanel,
  otpVerification,
  signup,
  signupSocial,
]
