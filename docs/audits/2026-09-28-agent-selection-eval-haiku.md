# Agent-selection eval (core) — 2026-09-28

Model: claude-haiku-4-5-20251001 · Set: core · Cases: 20 · Runs per case: 1 · Before = rules file at v0.13.2 (names only, no skill) · After = this checkout (rules + quill-components skill) · Cost: $1.23

- **before:** 16/20 answers correct
- **after:** 20/20 answers correct
- **Skill loaded (after):** 16/20 sessions

| Case | Right answer | before | after | Guides read (after) |
|---|---|---|---|---|
| delete-project | alert-dialog | ✓ alert-dialog | ✓ alert-dialog | — |
| edit-role | dialog (sheet) | ✓ dialog | ✓ dialog | — |
| account-history | activity-feed | ✓ activity-feed | ✓ activity-feed | — |
| unread-alerts | notifications | ✓ notifications | ✓ notifications | — |
| customer-list | data-table | ✓ data-table | ✓ data-table | — |
| saved-feedback | sonner | ✗ notifications | ✓ sonner | — |
| section-error | alert (alerts) | ✓ alert | ✓ alert | — |
| site-announcement | announcement-banner | ✓ announcement-banner | ✓ announcement-banner | — |
| country-picker | combobox | ✓ combobox | ✓ combobox | — |
| shipping-speed | radio-group | ✓ radio-group | ✓ radio-group | — |
| email-toggle | switch | ✗ settings | ✓ switch | — |
| passwordless-signin | login-minimal | ✗ otp-verification | ✓ login-minimal | — |
| enter-code | otp-verification | ✓ otp-verification | ✓ otp-verification | — |
| kpis | stat-cards | ✓ stat-cards | ✓ stat-cards | — |
| revenue-trend | analytics-charts (chart) | ✓ analytics-charts | ✓ analytics-charts | — |
| first-project | empty-state (empty) | ✓ empty-state | ✓ empty-state | — |
| mobile-filters | drawer | ✗ sheet | ✓ drawer | — |
| cmd-k | command-palette (command) | ✓ command-palette | ✓ command-palette | — |
| task-board | kanban | ✓ kanban | ✓ kanban | — |
| office-map | none | ✓ none | ✓ none | — |
