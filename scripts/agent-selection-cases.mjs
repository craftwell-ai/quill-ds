/**
 * The requests the agent-selection eval asks, with the component Quill's own
 * usage guides say is right. Each request describes the job, never a component
 * name, so the eval measures choosing rather than recognising a word.
 *
 * `expect` is the guide's answer; `accept` adds picks the guides also support
 * (a block and the primitive it is built on, for instance). `none` means
 * nothing in Quill fits, which tests the "nothing fits" rule.
 * `scripts/agent-selection-eval.test.mjs` checks every name still has a guide.
 */
export const CASES = [
  { id: 'delete-project', expect: 'alert-dialog', request: 'Before a project is permanently deleted, the user has to confirm it.' },
  { id: 'edit-role', expect: 'dialog', accept: ['sheet'], request: "Admins change a team member's role with a short form, without leaving the members page." },
  { id: 'account-history', expect: 'activity-feed', request: 'Show what has happened on an account recently: who did what, and when.' },
  { id: 'unread-alerts', expect: 'notifications', request: 'Give users one place to see everything that needs their attention, with unread items marked and a way to mark them all as read.' },
  { id: 'customer-list', expect: 'data-table', request: 'Admins need to filter and sort a few hundred customer records and take an action on each one.' },
  { id: 'saved-feedback', expect: 'sonner', request: 'After the user saves their profile, briefly confirm it worked without interrupting them.' },
  { id: 'section-error', expect: 'alert', accept: ['alerts'], request: "One section of a checkout form needs a persistent message saying the billing address couldn't be verified." },
  { id: 'site-announcement', expect: 'announcement-banner', request: 'Announce a new feature across the whole site, and let people dismiss the message.' },
  { id: 'country-picker', expect: 'combobox', request: 'Users pick their country from about 200 options and should be able to type to narrow the list.' },
  { id: 'shipping-speed', expect: 'radio-group', request: 'Customers choose one of three shipping speeds, with all three options visible at once.' },
  { id: 'email-toggle', expect: 'switch', request: 'A setting that turns email notifications on or off and takes effect immediately.' },
  { id: 'passwordless-signin', expect: 'login-minimal', request: 'A sign-in screen where people enter their email and we send them a code. No passwords.' },
  { id: 'enter-code', expect: 'otp-verification', request: 'The screen where users type the six-digit code we just emailed them.' },
  { id: 'kpis', expect: 'stat-cards', request: "At the top of a dashboard, show this month's revenue, churn and active users, each with the change from last month." },
  { id: 'revenue-trend', expect: 'analytics-charts', accept: ['chart'], request: 'Show how revenue has trended over the last twelve months.' },
  { id: 'first-project', expect: 'empty-state', accept: ['empty'], request: 'A brand-new user opens the projects page and has no projects yet. Help them create the first one.' },
  { id: 'mobile-filters', expect: 'drawer', request: 'On phones, filters should slide up from the bottom and be swiped away to close.' },
  { id: 'cmd-k', expect: 'command-palette', accept: ['command'], request: 'Power users want to press Cmd+K to jump to any page or run an action.' },
  { id: 'task-board', expect: 'kanban', request: 'Track tasks by status (to do, in progress, done) and move cards between the columns.' },
  { id: 'office-map', expect: 'none', request: 'Show our office locations on an interactive map that users can pan and zoom.' },
  { id: 'ai-disclaimer', expect: 'ai-notice', request: 'Under the assistant\'s input box, tell people the AI can get things wrong.' },
  { id: 'ai-working-state', expect: 'ai-thinking', request: 'While the assistant is preparing its answer, show that it is working and what it is reading.' },
  { id: 'follow-up-questions', expect: 'suggested-prompts', request: 'After the assistant answers, offer two or three follow-up questions people can click to ask next.' },
  { id: 'answer-sources', expect: 'citations', request: 'The assistant\'s answers should show which document each statement came from, with the full list underneath.' },
  { id: 'assistant-reply', expect: 'ai-message', request: 'Show the assistant\'s answer in the conversation with buttons to copy it, retry, and rate it.' },
  { id: 'summarize-button', expect: 'ai-button', request: 'Add a Summarize button above a long document that asks AI to condense it.' },
  { id: 'ai-draft-label', expect: 'ai-badge', request: 'Reply drafts the assistant wrote should be labelled so agents know a person has not checked them yet.' },
  { id: 'ask-assistant-box', expect: 'prompt-composer', accept: ['ai-home'], request: 'Users type a question to our assistant; it should grow as they type and let them stop the answer halfway.' },
  { id: 'assistant-start-page', expect: 'ai-home', accept: ['prompt-composer'], request: 'The landing page of our assistant: a greeting, a big box to ask in, and a few example tasks to start from.' },
  { id: 'ai-icon', expect: 'ai-mark', accept: ['ai-badge'], request: 'Put a small icon next to the Summarize button so people can tell it uses AI.' },
]

/**
 * Harder requests: each sits on a line a usage guide draws, where the obvious
 * pick is the wrong one (discarding work is destructive, a wait with no known
 * end is not progress, a short list on a phone wants the OS picker). The first
 * run of CASES scored 19/20 without the skill, too easy to tell the arms apart.
 */
export const HARD_CASES = [
  { id: 'unsaved-changes', expect: 'alert-dialog', request: 'When someone closes the editor with unsaved changes, ask whether to throw those changes away.' },
  { id: 'author-preview', expect: 'hover-card', request: "Pointing at an author's name in a comment should show their photo, short bio and follower count, without leaving the page." },
  { id: 'loading-rows', expect: 'skeleton', request: "While order history is still loading, show placeholders shaped like the rows so the page doesn't jump when they arrive." },
  { id: 'unknown-wait', expect: 'spinner', request: "While a report is being generated, and we can't tell how long it will take, show that something is happening." },
  { id: 'setup-checklist', expect: 'onboarding', request: 'New workspace owners have a few setup tasks (invite the team, connect a calendar, add billing) to do over the next few days, and should see how far along they are.' },
  { id: 'store-steps', expect: 'wizard', request: 'Creating a new store takes four steps that must be done in order, in one sitting, with back and continue buttons.' },
  { id: 'text-align', expect: 'toggle-group', request: 'In a text editor toolbar, users choose left, center or right alignment with three icon buttons, and the current one stays highlighted.' },
  { id: 'bold-button', expect: 'toggle', request: 'A bold button in the editor toolbar that stays pressed while bold is on.' },
  { id: 'accept-terms', expect: 'checkbox', request: 'In the sign-up form, people agree to the terms of service before they submit.' },
  { id: 'price-range', expect: 'slider', request: 'Shoppers filter products to a price between a minimum and a maximum by dragging.' },
  { id: 'past-payment', expect: 'invoice', request: 'Show a customer the full record of a payment they made last month, with line items, totals and a way to download it.' },
  { id: 'cart-review', expect: 'order-summary', request: 'Before paying, customers look over what they are buying, apply a promo code and see the total. Card details are collected on the next screen.' },
  { id: 'dead-link', expect: 'error-404', request: 'A user follows an old link to a project that has since been deleted.' },
  { id: 'right-click-file', expect: 'context-menu', request: 'On desktop, right-clicking a file in the list shows rename, move and delete.' },
  { id: 'row-more', expect: 'dropdown-menu', request: 'Each row in the members table has a "⋯" button that opens edit, resend invite and remove.' },
  { id: 'editor-menus', expect: 'menubar', request: 'Our in-browser design tool needs File, Edit and View menus across the top, like a desktop app.' },
  { id: 'marketing-numbers', expect: 'stats-band', request: 'On the marketing homepage, a strip that reads "10,000 teams · 99.9% uptime · 40 countries".' },
  { id: 'tshirt-size', expect: 'native-select', request: "Most of our shoppers are on phones. They pick a T-shirt size (S, M, L, XL) and it should use the phone's own picker." },
  { id: 'authenticator-code', expect: 'input-otp', request: 'In account security settings, a field where users type the 6-digit code from their authenticator app to turn on two-step login.' },
  { id: 'settings-sections', expect: 'tabs-page', request: 'Account settings are split into account, notifications and security sections that users move between on one screen.' },
  { id: 'rich-text', expect: 'none', request: 'A rich-text editor for writing blog posts with headings, links and embedded images.' },
]

export const SETS = { core: CASES, hard: HARD_CASES }

export const acceptedPicks = (c) => [c.expect, ...(c.accept ?? [])]
