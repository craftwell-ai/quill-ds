/**
 * Static index of every usage module. Kept by hand so node scripts and tests
 * stay synchronous; scripts/usage-schema.test.mjs fails if a *.usage.mjs file
 * on disk is missing here, so the two cannot drift.
 */
import { usage as activityFeed } from './activity-feed.usage.mjs'
import { usage as alerts } from './alerts.usage.mjs'
import { usage as analyticsCharts } from './analytics-charts.usage.mjs'
import { usage as announcementBanner } from './announcement-banner.usage.mjs'
import { usage as badgeOnCard } from './badge-on-card.usage.mjs'
import { usage as button } from './button.usage.mjs'
import { usage as calendarPage } from './calendar-page.usage.mjs'
import { usage as calendarRange } from './calendar-range.usage.mjs'
import { usage as chat } from './chat.usage.mjs'
import { usage as checkout } from './checkout.usage.mjs'
import { usage as contactForm } from './contact-form.usage.mjs'
import { usage as dataTable } from './data-table.usage.mjs'
import { usage as dialog } from './dialog.usage.mjs'
import { usage as faq } from './faq.usage.mjs'
import { usage as featureSection } from './feature-section.usage.mjs'
import { usage as fileUpload } from './file-upload.usage.mjs'
import { usage as footer } from './footer.usage.mjs'
import { usage as forgotPassword } from './forgot-password.usage.mjs'
import { usage as hero } from './hero.usage.mjs'
import { usage as invoice } from './invoice.usage.mjs'
import { usage as kanban } from './kanban.usage.mjs'
import { usage as login } from './login.usage.mjs'
import { usage as loginMinimal } from './login-minimal.usage.mjs'
import { usage as loginOauth } from './login-oauth.usage.mjs'
import { usage as loginSplitPanel } from './login-split-panel.usage.mjs'
import { usage as newsletter } from './newsletter.usage.mjs'
import { usage as notifications } from './notifications.usage.mjs'
import { usage as orderSummary } from './order-summary.usage.mjs'
import { usage as otpVerification } from './otp-verification.usage.mjs'
import { usage as pricing } from './pricing.usage.mjs'
import { usage as profileCard } from './profile-card.usage.mjs'
import { usage as searchResults } from './search-results.usage.mjs'
import { usage as settings } from './settings.usage.mjs'
import { usage as signup } from './signup.usage.mjs'
import { usage as signupSocial } from './signup-social.usage.mjs'
import { usage as statCards } from './stat-cards.usage.mjs'
import { usage as statsBand } from './stats-band.usage.mjs'
import { usage as teamSection } from './team-section.usage.mjs'
import { usage as testimonial } from './testimonial.usage.mjs'
import { usage as wizard } from './wizard.usage.mjs'

export const ALL_USAGE = [
  activityFeed,
  alerts,
  analyticsCharts,
  announcementBanner,
  badgeOnCard,
  button,
  calendarPage,
  calendarRange,
  chat,
  checkout,
  contactForm,
  dataTable,
  dialog,
  faq,
  featureSection,
  fileUpload,
  footer,
  forgotPassword,
  hero,
  invoice,
  kanban,
  login,
  loginMinimal,
  loginOauth,
  loginSplitPanel,
  newsletter,
  notifications,
  orderSummary,
  otpVerification,
  pricing,
  profileCard,
  searchResults,
  settings,
  signup,
  signupSocial,
  statCards,
  statsBand,
  teamSection,
  testimonial,
  wizard,
]
