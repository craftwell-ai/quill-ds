# Pass 1 — line-height reflow QA (Figma vs Storybook)

**50 roots checked, 49 clean, 1 with problems** (and that one is a horizontal overflow, not a reflow artifact — see below).

Method: for every root, one read-only `node.screenshot({scale:1})` of the Figma component (file `Dcf8lEB7Ash71iNl7WN4Jq`), compared against the Storybook PNG in `sb/` (2× device pixels, Dawn, 1280×900). Storybook sizes below are CSS px (png px ÷ 2). Where a Figma frame came out noticeably taller than the code, I inspected the node chain (read-only) to find the cause before classifying.

## Table

| # | root | Figma size | Storybook size (CSS px) | verdict | evidence |
|---|---|---|---|---|---|
| 1 | activity-feed (696:2) | 420×318 | 420×318 | CLEAN | 4 rows, avatars centred on rows, timeline line intact, no clipping |
| 2 | analytics-charts (696:3) | 880×318 | 885×318 | CLEAN | two cards same height; axis labels + legend aligned. SB capture shows empty plots (Recharts animation timing) — not a Figma issue |
| 3 | announcement-banner (696:4) | 880×122 | 880×122 | CLEAN | both banners; badge/CTA/close on the text line |
| 4 | calendar-page (696:5) | 510×444 | 510×354 | CLEAN | right-hand session list matches (55 px rows). +90 px comes from the calendar grid: day text is unstyled (no text style, LH 100%) in fixed 28×28 cells, Month frame gap 16 + Week padTop 8 → 52 px rows vs 36 px in code. Pre-existing, unrelated to the change |
| 5 | calendar-range (696:6) | 458×557 | 458×451 | CLEAN | same calendar-grid row cause (6 rows); header, range highlight, footer all match |
| 6 | chat (696:7) | 400×480 | 400×480 | CLEAN | bubbles wrap identically; empty space under messages is a fixed-height scroll area in code too |
| 7 | checkout (696:8) | 820×451 | 820×464 | CLEAN | 13 px shorter (intended); order summary 180 vs 182; labels/inputs/footer aligned |
| 8 | contact-form (696:9) | 440×481 | 440×467 | CLEAN | +14 px spread over field gaps (1–2 px each) + textarea 69 vs 62; no gap/clip/overlap |
| 9 | cookie-consent (696:10) | 520×112 | 520×112 | CLEAN | icon tile aligned to first line; button row intact |
| 10 | dashboard (696:11) | 880×600 | ~1200×600 | CLEAN | width = viewport step; sidebar 224 vs 225, nav rows 39 px both, stat cards 130 vs 134 |
| 11 | data-table (696:12) | 720×293 | ~1200×294 | CLEAN | rows 52 px both; badges + menu dots centred on rows |
| 12 | empty-state (696:17) | 420×243 | 420×245 | CLEAN | match |
| 13 | error-404 (696:18) | 880×500 | viewport | CLEAN | content stack 202 px both; body wraps 2 lines both |
| 14 | faq (696:19) | 560×457 | 560×420 | CLEAN | +37 px = accordion rows 52 vs 41 px. Trigger HUGs (Label/Default 19 px + 16/16 pad) so it did reflow; code trigger has ~10 px pad. Pre-existing padding mismatch |
| 15 | feature-section (696:20) | 880×341 | ~1200 wide | CLEAN | heading wraps at viewport step; 3 columns flow identically |
| 16 | file-upload (696:21) | 440×485 | 440×485 | CLEAN | exact; file rows, sizes, close icons, progress bar aligned |
| 17 | footer (696:22) | 880×304 | full width | CLEAN | link rows 27 px both; legal row aligned |
| 18 | forgot-password (696:23) | 380×271 | 380×269 | CLEAN | match |
| 19 | hero (696:25) | 880×446 | viewport | CLEAN | headline at smaller step (exempt); badge, body, CTA row match |
| 20 | invoice (696:26) | 640×418 | 640×430 | CLEAN | 12 px shorter (intended); table rows 35 vs 36 px |
| 21 | kanban (696:27) | 800×261 | 800×262 | CLEAN | match |
| 22 | list-detail (696:28) | 880×520 | full width | CLEAN | inbox rows 83 vs 84 px; detail header/body match |
| 23 | login (696:29) | 380×353 | 380×349 | CLEAN | checkbox aligned to label; footer intact |
| 24 | login-minimal (696:35) | 320×234 | 320×232 | CLEAN | match |
| 25 | login-oauth (696:36) | 340×416 | 340×420 | CLEAN | provider buttons, divider, form, legal line match |
| 26 | login-split-panel (696:37) | 960×560 | ~1200×558 | CLEAN | form stack 348 vs 339; quote panel matches |
| 27 | mail-shell (696:38) | 960×560 | ~1200×558 | CLEAN | inbox rows 85 vs 88; toolbar/header/reply bar match |
| 28 | navbar (696:39) | 880×56 | 56 tall | CLEAN | match |
| 29 | newsletter (696:40) | 560×294 | 560×298 | CLEAN | match |
| 30 | notifications (699:789) | 360×285 | 360×267 | CLEAN | +18 px = row 1 description wraps to 2 lines in Figma (narrower text column beside time/dot), 1 line in code. Width/copy difference, not line-height |
| 31 | onboarding (696:41) | 400×272 | 400×277 | CLEAN | row rhythm 40/44/48 identical both sides |
| 32 | otp-verification (696:42) | 380×259 | 380×259 | CLEAN | exact |
| 33 | page-header (696:50) | 880×99 | ~99 tall | CLEAN | breadcrumb/heading/subtitle offsets 10/55/89 vs 12/56/91 |
| 34 | pricing (696:51) | 880×325 | ~1200×332 | CLEAN | feature rows 27 vs 27.5; Figma cards hug (Starter 290, Pro 325) where code stretches all to equal height — pre-existing grid behaviour |
| 35 | profile-card (696:52) | 340×322 | 340×348 | CLEAN | −26 px is top padding above avatar (16 vs 40); rest lines up ±4. Pre-existing |
| 36 | search-results (699:787) | 440×313 | 440×313 | CLEAN | exact; rows 60 px both |
| 37 | settings (696:53) | 560×394 | 560×387 | CLEAN | toggle centred on 2-line label both sides |
| 38 | sidebar-nav (699:788) | 960×560 | viewport | CLEAN | nav rows 36 vs 32 px (minor); cards, breadcrumb bar, user footer aligned |
| 39 | signup (696:54) | 380×368 | 380×369 | CLEAN | match |
| 40 | signup-social (696:55) | 380×429 | 380×430 | CLEAN | match |
| 41 | stat-cards (699:786) | 880×136 | 136 tall | CLEAN | exact; "vs last month" fits in 208 px cards |
| 42 | stats-band (696:56) | 880×250 | 880×250 | CLEAN | exact |
| 43 | tabs-page (696:63) | 560×250 | 560×252 | CLEAN | match |
| 44 | team-section (696:64) | 880×313 | ~880×318 | CLEAN | member cards 188 px both |
| 45 | testimonial (696:65) | 520×246 | 520×350 | CLEAN | quote at larger display size in code (5 lines vs 4) — pre-existing type-step difference; attribution row aligned |
| 46 | theme-selector (696:71) | 88×28 | trigger ~92×26 | CLEAN | icon + label + chevron on one line, not clipped |
| 47 | wizard (696:72) | 460×311 | 460×313 | CLEAN | stepper circles aligned with labels |
| 48 | example-app-page (700:274) | 960×560 | viewport 1280×900 | **PROBLEM** | stat card 1: "vs last month" runs past the card's right edge (Delta row 16+143 = 159 px inside a 156 px card); card 2 is flush to the edge. Horizontal overflow — see below |
| 49 | example-auth-page (697:289) | 960×560 | ~1200×558 | CLEAN | same composition as login-split-panel; matches |
| 50 | example-marketing-page (697:233) | 880×2141 | capture is 1280×900 (first viewport only) | CLEAN | navbar/hero/feature top match the capture; pricing, testimonial and footer sections compared against their pattern captures (#34, #45, #17), no clipping anywhere in the 2141 px frame |

## PROBLEM roots

### example-app-page — node `700:274`
- **What is wrong:** in the four-up stat-card row (instance `700:131`, "Stat cards", 672 px wide → 156 px per card), the first card's trailing "+12.4%  vs last month" row (`I700:131;632:32`, "Delta") is 143 px wide starting at x = 16, so its right edge (159) is past the card's 156 px width — the "h" of "month" is cut by the card border at 3× zoom, and there is no right padding. The second card ("+4.1%") is flush to its border. Cards 3 and 4 fit.
- **Compared against:** `sb/example-app-page.png`, where the same row sits comfortably inside ~184 px cards at the 1280 viewport; and against the standalone stat-cards pattern (`699:786`, 208 px cards), where the same instance fits with room to spare.
- **Cause / relevance to this change:** this is a horizontal overflow from the 960-wide example composition (256 sidebar → 672 content → 156 px cards), not a vertical reflow. The line-height change only shortens lines; it cannot have caused this. It is reported because criterion 1 ("text running out of its box") is met, and because the cut "h" is visible in the 1× root screenshot. Fix would be either a wider example frame, a shorter delta caption, or letting the Delta row wrap — none of which belong to the line-height task.

## Anything else you noticed (outside the four criteria)

- **Storybook capture artefacts, not Figma issues:** `analytics-charts.png` shows empty chart plots (Recharts animates in; capture fired early). `example-marketing-page.png` and `example-app-page.png` are 2560×1800 (viewport only) even though `index.json` lists 1280×2490 / 1280×948 — the full-page capture did not happen, so the lower half of the marketing page was compared against its pattern captures instead.
- **Calendar grids (calendar-page, calendar-range):** Figma week rows are 52 px vs 36 px in code (Month gap 16 + Week padTop 8 around fixed 28×28 day cells). Day numbers carry no text style and 100% line height, so they are outside the token system entirely. Worth a separate ticket if grid parity matters.
- **FAQ accordion trigger:** Figma trigger padding is 16/16 (52 px rows) vs ~10/10 in code (41 px rows). The text style is Label/Default (13.6 px) in Figma while the code trigger reads as ~16 px — a style-binding mismatch, not a line-height one.
- **Profile card:** Figma has 16 px above the avatar where code has 40 px; everything below aligns.
- **Pricing:** Figma cards hug their own content (Starter 290, Pro 325, Enterprise ~318) while code stretches all three to equal height with the CTA pinned to the bottom.
- **Testimonial:** the quote uses a larger display size in code (~32 px, 5 lines) than in Figma (~20 px, 4 lines); the standalone card is 350 vs 246 px tall. Same in the marketing example.
- **Notifications:** the first row's description wraps to 2 lines in Figma because the text column is narrower beside the time + unread dot; code keeps it on one line. Cosmetic.
- **Sidebar nav:** nav rows are 36 px apart in Figma vs 32 in code (both sidebar-nav and example-app-page).
- **Contact form:** textarea is 69 px in Figma vs 62 in code, and each field gap is 1–2 px looser — sums to +14 px.
- Nothing bound to Body/S, Body/XS, Label/Default or Label/Small showed clipped descenders, cut last lines, overlap, or a fixed-height frame that failed to shrink. The reflow itself looks correct across all 50 roots.
