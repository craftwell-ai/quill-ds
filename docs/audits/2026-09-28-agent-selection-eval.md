# Agent-selection eval — 2026-09-28

Model: claude-opus-5-5 · Cases: 20 · Before = rules file at v0.13.2 (names only, no skill) · After = this checkout (rules + quill-components skill) · Cost: $5.80

- **before:** 19/20 correct
- **after:** 20/20 correct
- **Skill loaded (after):** 20/20

| Case | Right answer | before pick | after pick | Guides read (after) |
|---|---|---|---|---|
| delete-project | alert-dialog | ✓ alert-dialog | ✓ alert-dialog | alert-dialog |
| edit-role | dialog (sheet) | ✓ dialog | ✓ dialog | — |
| account-history | activity-feed | ✓ activity-feed | ✓ activity-feed | — |
| unread-alerts | notifications | ✓ notifications | ✓ notifications | notifications |
| customer-list | data-table | ✓ data-table | ✓ data-table | data-table |
| saved-feedback | sonner | ✓ sonner | ✓ sonner | — |
| section-error | alert (alerts) | ✓ alert | ✓ alert | alert |
| site-announcement | announcement-banner | ✓ announcement-banner | ✓ announcement-banner | — |
| country-picker | combobox | ✓ combobox | ✓ combobox | combobox |
| shipping-speed | radio-group | ✓ radio-group | ✓ radio-group | radio-group |
| email-toggle | switch | ✓ switch | ✓ switch | — |
| passwordless-signin | login-minimal | ✗ otp-verification | ✓ login-minimal | login-minimal |
| enter-code | otp-verification | ✓ otp-verification | ✓ otp-verification | — |
| kpis | stat-cards | ✓ stat-cards | ✓ stat-cards | stat-cards |
| revenue-trend | analytics-charts (chart) | ✓ analytics-charts | ✓ chart | — |
| first-project | empty-state (empty) | ✓ empty-state | ✓ empty-state | — |
| mobile-filters | drawer | ✓ drawer | ✓ drawer | drawer |
| cmd-k | command-palette (command) | ✓ command-palette | ✓ command-palette | command-palette |
| task-board | kanban | ✓ kanban | ✓ kanban | — |
| office-map | none | ✓ none | ✓ none | — |
