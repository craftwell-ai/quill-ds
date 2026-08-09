export const usage = {
  name: 'tone-badge',
  kind: 'component',
  summary: "Quill's uppercase tag pill for status, tiers, and labels — wraps Badge with the pigment vocabulary (moss/gold/terracotta/indigo/neutral/muted) baked in so tone never drifts per call site.",
  useWhen: [
    "You need Quill's uppercase tag pill for a status, tier, or label — trusted/current, developing, red flag, dormant, building — and want the tone-to-pigment mapping guaranteed correct and AA-checked.",
  ],
  alternatives: [
    { name: 'badge', when: "the label is a generic chip outside Quill's tag-pill vocabulary — use Badge directly instead of forcing it through a tone." },
  ],
  rules: [
    {
      id: 'tinted-default-solid-emphasis',
      do: 'Leave `solid` false (the tinted default) for regular status/tier labels — it is the visually quieter option and still hits AA contrast per tone.',
      dont: 'Set `solid` on every ToneBadge in a view — solid is reserved for the one strong cue (a "current" marker, a live state) and loses its signal once everything is solid.',
      visual: false,
    },
    {
      id: 'no-hand-rolled-pills',
      do: 'Render every uppercase tag pill through ToneBadge, even one-off labels.',
      dont: 'Hand-roll a `rounded-full … uppercase` span with ad hoc tone colors — it drifts from the AA-checked tint/solid pairs and the two-size scale.',
      visual: true,
    },
    {
      id: 'two-sizes-only',
      do: "Use ToneBadge's own size scale — `md` (20px) or `sm` (16px, the count-pill scale).",
      dont: "Shrink a pill by hand-tightening its tracking or padding instead of passing `size=\"sm\"` — type stays `--text-2xs` at 0.1em tracking in both sizes.",
      visual: false,
    },
  ],
  a11y: [
    'ToneBadge renders through Badge, so it inherits the same non-interactive `<span>` semantics — no built-in role or keyboard focus.',
    'Pass `title` for a native tooltip when a tone label is abbreviated or needs a fuller description.',
    'Every tint/solid pairing is contrast-checked per tone in the component source — e.g. solid gold uses `--gold-text`, not `--gold-deep`, because paper text on `--gold-deep` measures 3.3:1, under AA.',
  ],
  tokens: [
    '--moss', '--moss-deep', '--gold', '--gold-text', '--terracotta', '--terracotta-deep',
    '--indigo', '--indigo-deep', '--paper-deep', '--ink-soft', '--ink-muted', '--ink', '--paper',
    '--text-2xs',
  ],
}
