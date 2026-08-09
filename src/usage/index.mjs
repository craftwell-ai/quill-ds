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
import { usage as buttonGroup } from './button-group.usage.mjs'
import { usage as calendarPage } from './calendar-page.usage.mjs'
import { usage as calendarRange } from './calendar-range.usage.mjs'
import { usage as chat } from './chat.usage.mjs'
import { usage as checkbox } from './checkbox.usage.mjs'
import { usage as checkout } from './checkout.usage.mjs'
import { usage as combobox } from './combobox.usage.mjs'
import { usage as commandPalette } from './command-palette.usage.mjs'
import { usage as contactForm } from './contact-form.usage.mjs'
import { usage as cookieConsent } from './cookie-consent.usage.mjs'
import { usage as dashboard } from './dashboard.usage.mjs'
import { usage as dataTable } from './data-table.usage.mjs'
import { usage as dialog } from './dialog.usage.mjs'
import { usage as emptyState } from './empty-state.usage.mjs'
import { usage as error404 } from './error-404.usage.mjs'
import { usage as faq } from './faq.usage.mjs'
import { usage as featureSection } from './feature-section.usage.mjs'
import { usage as field } from './field.usage.mjs'
import { usage as fileUpload } from './file-upload.usage.mjs'
import { usage as footer } from './footer.usage.mjs'
import { usage as forgotPassword } from './forgot-password.usage.mjs'
import { usage as hero } from './hero.usage.mjs'
import { usage as input } from './input.usage.mjs'
import { usage as inputGroup } from './input-group.usage.mjs'
import { usage as inputOtp } from './input-otp.usage.mjs'
import { usage as invoice } from './invoice.usage.mjs'
import { usage as kanban } from './kanban.usage.mjs'
import { usage as label } from './label.usage.mjs'
import { usage as listDetail } from './list-detail.usage.mjs'
import { usage as login } from './login.usage.mjs'
import { usage as loginMinimal } from './login-minimal.usage.mjs'
import { usage as loginOauth } from './login-oauth.usage.mjs'
import { usage as loginSplitPanel } from './login-split-panel.usage.mjs'
import { usage as mailShell } from './mail-shell.usage.mjs'
import { usage as nativeSelect } from './native-select.usage.mjs'
import { usage as navbar } from './navbar.usage.mjs'
import { usage as newsletter } from './newsletter.usage.mjs'
import { usage as notifications } from './notifications.usage.mjs'
import { usage as onboarding } from './onboarding.usage.mjs'
import { usage as orderSummary } from './order-summary.usage.mjs'
import { usage as otpVerification } from './otp-verification.usage.mjs'
import { usage as pageHeader } from './page-header.usage.mjs'
import { usage as pricing } from './pricing.usage.mjs'
import { usage as profileCard } from './profile-card.usage.mjs'
import { usage as radioGroup } from './radio-group.usage.mjs'
import { usage as searchResults } from './search-results.usage.mjs'
import { usage as select } from './select.usage.mjs'
import { usage as settings } from './settings.usage.mjs'
import { usage as sidebarNav } from './sidebar-nav.usage.mjs'
import { usage as signup } from './signup.usage.mjs'
import { usage as signupSocial } from './signup-social.usage.mjs'
import { usage as slider } from './slider.usage.mjs'
import { usage as statCards } from './stat-cards.usage.mjs'
import { usage as statsBand } from './stats-band.usage.mjs'
import { usage as switchUsage } from './switch.usage.mjs'
import { usage as tabsPage } from './tabs-page.usage.mjs'
import { usage as teamSection } from './team-section.usage.mjs'
import { usage as testimonial } from './testimonial.usage.mjs'
import { usage as textarea } from './textarea.usage.mjs'
import { usage as themeSelector } from './theme-selector.usage.mjs'
import { usage as toggle } from './toggle.usage.mjs'
import { usage as toggleGroup } from './toggle-group.usage.mjs'
import { usage as wizard } from './wizard.usage.mjs'

export const ALL_USAGE = [
  activityFeed,
  alerts,
  analyticsCharts,
  announcementBanner,
  badgeOnCard,
  button,
  buttonGroup,
  calendarPage,
  calendarRange,
  chat,
  checkbox,
  checkout,
  combobox,
  commandPalette,
  contactForm,
  cookieConsent,
  dashboard,
  dataTable,
  dialog,
  emptyState,
  error404,
  faq,
  featureSection,
  field,
  fileUpload,
  footer,
  forgotPassword,
  hero,
  input,
  inputGroup,
  inputOtp,
  invoice,
  kanban,
  label,
  listDetail,
  login,
  loginMinimal,
  loginOauth,
  loginSplitPanel,
  mailShell,
  nativeSelect,
  navbar,
  newsletter,
  notifications,
  onboarding,
  orderSummary,
  otpVerification,
  pageHeader,
  pricing,
  profileCard,
  radioGroup,
  searchResults,
  select,
  settings,
  sidebarNav,
  signup,
  signupSocial,
  slider,
  statCards,
  statsBand,
  switchUsage,
  tabsPage,
  teamSection,
  testimonial,
  textarea,
  themeSelector,
  toggle,
  toggleGroup,
  wizard,
]
