export const usage = {
  name: 'file-upload',
  kind: 'pattern',
  summary: 'An asset-upload card with a drag-and-drop dropzone and a progress-tracked upload queue.',
  useWhen: [
    'You need drag-and-drop asset upload with a progress-tracked queue.',
  ],
  alternatives: [
    { name: 'contact-form', when: 'you need a single attachment inside a broader form, not a dedicated upload queue as the whole card.' },
  ],
  rules: [
    {
      id: 'dropzone-is-also-clickable',
      do: 'Make the dropzone a real, focusable <button> that also opens a file picker on click/Enter — never make drag-and-drop the only way in.',
      dont: 'Ship a dropzone that only responds to a pointer drag gesture.',
      visual: false,
    },
  ],
  a11y: [
    'Each in-progress file\'s Progress has its own aria-label (e.g. "Uploading field-notes-issue-001.pdf"), not one shared label for the whole queue.',
    'Every remove button carries a per-file aria-label ("Remove field-notes-issue-001.pdf"), not a generic "Remove".',
  ],
  tokens: ['--card', '--input', '--muted', '--primary'],
}
