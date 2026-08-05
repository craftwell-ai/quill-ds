export const usage = {
  name: 'button',
  kind: 'component',
  summary: 'Buttons trigger actions. The default (primary) variant is the single most important action on a surface.',
  useWhen: [
    'You need to trigger an action — submit, confirm, start a flow — rather than navigate to a page.',
    'You need an icon-only action trigger (use an icon size with an aria-label).',
  ],
  alternatives: [
    { name: 'link', when: 'the action navigates somewhere — use the link variant or a real anchor.' },
    { name: 'button-group', when: 'several related actions belong together as one segmented control.' },
    { name: 'toggle', when: 'the control switches a state on/off rather than firing an action.' },
  ],
  rules: [
    {
      id: 'one-primary',
      do: 'Use one default (primary) button per surface, for the single most important action.',
      dont: 'Scatter several primary buttons on one surface — they compete and none reads as primary.',
      visual: true,
    },
    {
      id: 'focus-ring-accent',
      do: 'Leave the focus ring on --ring, the accent-driven ink ring.',
      dont: 'Restyle the focus ring with a hardcoded pigment such as terracotta.',
      visual: false,
    },
    {
      id: 'icon-only-label',
      do: 'Give every icon-only button an explicit aria-label.',
      dont: 'Ship an icon-only button with no accessible name.',
      visual: false,
    },
  ],
  a11y: [
    'Native <button> semantics: Enter and Space activate; disabled removes it from the tab order.',
    'Icon-only sizes (icon, icon-xs, icon-sm, icon-lg) require an aria-label.',
    'The focus ring uses --ring and must stay visible on every theme ground.',
  ],
  tokens: ['--primary', '--secondary', '--destructive', '--muted', '--radius-lg', '--ring'],
}
