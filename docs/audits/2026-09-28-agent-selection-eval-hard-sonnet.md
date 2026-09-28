# Agent-selection eval (hard) — 2026-09-28

Model: claude-sonnet-5-5 · Set: hard · Cases: 21 · Runs per case: 1 · Before = rules file at v0.13.2 (names only, no skill) · After = this checkout (rules + quill-components skill) · Cost: $3.13

- **before:** 20/21 answers correct
- **after:** 21/21 answers correct
- **Skill loaded (after):** 20/21 sessions

| Case | Right answer | before | after | Guides read (after) |
|---|---|---|---|---|
| unsaved-changes | alert-dialog | ✓ alert-dialog | ✓ alert-dialog | alert-dialog, dialog |
| author-preview | hover-card | ✓ hover-card | ✓ hover-card | — |
| loading-rows | skeleton | ✓ skeleton | ✓ skeleton | — |
| unknown-wait | spinner | ✓ spinner | ✓ spinner | spinner |
| setup-checklist | onboarding | ✓ onboarding | ✓ onboarding | onboarding, wizard |
| store-steps | wizard | ✓ wizard | ✓ wizard | wizard |
| text-align | toggle-group | ✓ toggle-group | ✓ toggle-group | — |
| bold-button | toggle | ✓ toggle | ✓ toggle | — |
| accept-terms | checkbox | ✓ checkbox | ✓ checkbox | checkbox |
| price-range | slider | ✓ slider | ✓ slider | — |
| past-payment | invoice | ✓ invoice | ✓ invoice | invoice |
| cart-review | order-summary | ✓ order-summary | ✓ order-summary | — |
| dead-link | error-404 | ✗ empty-state | ✓ error-404 | — |
| right-click-file | context-menu | ✓ context-menu | ✓ context-menu | context-menu, dropdown-menu |
| row-more | dropdown-menu | ✓ dropdown-menu | ✓ dropdown-menu | dropdown-menu, data-table |
| editor-menus | menubar | ✓ menubar | ✓ menubar | menubar |
| marketing-numbers | stats-band | ✓ stats-band | ✓ stats-band | stats-band |
| tshirt-size | native-select | ✓ native-select | ✓ native-select | native-select, select |
| authenticator-code | input-otp | ✓ input-otp | ✓ input-otp | input-otp, otp-verification |
| settings-sections | tabs-page | ✓ tabs-page | ✓ tabs-page | tabs-page |
| rich-text | none | ✓ none | ✓ none | — |
