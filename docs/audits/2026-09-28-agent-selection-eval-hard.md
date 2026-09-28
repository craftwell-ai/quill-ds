# Agent-selection eval (hard) — 2026-09-28

Model: claude-opus-5-5 · Set: hard · Cases: 21 · Runs per case: 1 · Before = rules file at v0.13.2 (names only, no skill) · After = this checkout (rules + quill-components skill) · Cost: $6.07

- **before:** 20/21 answers correct
- **after:** 21/21 answers correct
- **Skill loaded (after):** 21/21 sessions

| Case | Right answer | before | after | Guides read (after) |
|---|---|---|---|---|
| unsaved-changes | alert-dialog | ✓ alert-dialog | ✓ alert-dialog | — |
| author-preview | hover-card | ✓ hover-card | ✓ hover-card | hover-card |
| loading-rows | skeleton | ✓ skeleton | ✓ skeleton | — |
| unknown-wait | spinner | ✓ spinner | ✓ spinner | spinner |
| setup-checklist | onboarding | ✓ onboarding | ✓ onboarding | onboarding |
| store-steps | wizard | ✓ wizard | ✓ wizard | wizard |
| text-align | toggle-group | ✓ toggle-group | ✓ toggle-group | toggle-group |
| bold-button | toggle | ✓ toggle | ✓ toggle | — |
| accept-terms | checkbox | ✓ checkbox | ✓ checkbox | checkbox, signup |
| price-range | slider | ✓ slider | ✓ slider | — |
| past-payment | invoice | ✓ invoice | ✓ invoice | invoice |
| cart-review | order-summary | ✓ order-summary | ✓ order-summary | order-summary |
| dead-link | error-404 | ✓ error-404 | ✓ error-404 | error-404 |
| right-click-file | context-menu | ✓ context-menu | ✓ context-menu | context-menu |
| row-more | dropdown-menu | ✓ dropdown-menu | ✓ dropdown-menu | dropdown-menu |
| editor-menus | menubar | ✓ menubar | ✓ menubar | — |
| marketing-numbers | stats-band | ✓ stats-band | ✓ stats-band | stats-band |
| tshirt-size | native-select | ✓ native-select | ✓ native-select | — |
| authenticator-code | input-otp | ✓ input-otp | ✓ input-otp | — |
| settings-sections | tabs-page | ✗ settings | ✓ tabs-page | tabs-page |
| rich-text | none | ✓ none | ✓ none | — |
