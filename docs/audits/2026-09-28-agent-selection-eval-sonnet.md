# Agent-selection eval (core) — 2026-09-28

Model: claude-sonnet-5-5 · Set: core · Cases: 20 · Runs per case: 1 · Before = rules file at v0.13.2 (names only, no skill) · After = this checkout (rules + quill-components skill) · Cost: $2.97

- **before:** 19/20 answers correct
- **after:** 20/20 answers correct
- **Skill loaded (after):** 19/20 sessions

| Case | Right answer | before | after | Guides read (after) |
|---|---|---|---|---|
| delete-project | alert-dialog | ✓ alert-dialog | ✓ alert-dialog | alert-dialog, dialog |
| edit-role | dialog (sheet) | ✓ dialog | ✓ dialog | dialog, popover |
| account-history | activity-feed | ✓ activity-feed | ✓ activity-feed | — |
| unread-alerts | notifications | ✓ notifications | ✓ notifications | — |
| customer-list | data-table | ✓ data-table | ✓ data-table | data-table |
| saved-feedback | sonner | ✓ sonner | ✓ sonner | — |
| section-error | alert (alerts) | ✓ alert | ✓ alert | — |
| site-announcement | announcement-banner | ✓ announcement-banner | ✓ announcement-banner | — |
| country-picker | combobox | ✓ combobox | ✓ combobox | — |
| shipping-speed | radio-group | ✓ radio-group | ✓ radio-group | radio-group |
| email-toggle | switch | ✓ switch | ✓ switch | — |
| passwordless-signin | login-minimal | ✗ otp-verification | ✓ login-minimal | login-minimal, otp-verification |
| enter-code | otp-verification | ✓ otp-verification | ✓ otp-verification | — |
| kpis | stat-cards | ✓ stat-cards | ✓ stat-cards | stat-cards |
| revenue-trend | analytics-charts (chart) | ✓ analytics-charts | ✓ chart | — |
| first-project | empty-state (empty) | ✓ empty-state | ✓ empty-state | — |
| mobile-filters | drawer | ✓ drawer | ✓ drawer | drawer |
| cmd-k | command-palette (command) | ✓ command-palette | ✓ command-palette | command-palette |
| task-board | kanban | ✓ kanban | ✓ kanban | kanban |
| office-map | none | ✓ none | ✓ none | — |
