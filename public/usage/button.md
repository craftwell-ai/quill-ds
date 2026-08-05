# button (component)

Buttons trigger actions. The default (primary) variant is the single most important action on a surface.

### When to use
- You need to trigger an action — submit, confirm, start a flow — rather than navigate to a page.
- You need an icon-only action trigger (use an icon size with an aria-label).

### Reach for instead
- **link** — when the action navigates somewhere — use the link variant or a real anchor.
- **button-group** — when several related actions belong together as one segmented control.
- **toggle** — when the control switches a state on/off rather than firing an action.

### Rules
- **Do:** Use one default (primary) button per surface, for the single most important action. **Don't:** Scatter several primary buttons on one surface — they compete and none reads as primary.
- **Do:** Leave the focus ring on --ring, the accent-driven ink ring. **Don't:** Restyle the focus ring with a hardcoded pigment such as terracotta.
- **Do:** Give every icon-only button an explicit aria-label. **Don't:** Ship an icon-only button with no accessible name.

### Accessibility
- Native <button> semantics: Enter and Space activate; disabled removes it from the tab order.
- Icon-only sizes (icon, icon-xs, icon-sm, icon-lg) require an aria-label.
- The focus ring uses --ring and must stay visible on every theme ground.

### Design tokens
`--primary` · `--secondary` · `--destructive` · `--muted` · `--radius-lg` · `--ring`

