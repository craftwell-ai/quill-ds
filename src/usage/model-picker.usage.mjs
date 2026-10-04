export const usage = {
  name: 'model-picker',
  kind: 'component',
  summary: 'Lets people choose which AI model answers — a quiet name-and-chevron trigger in the composer that opens a list with Auto first, a line on what each model is good for, and a check on the current one.',
  useWhen: ['An app offers more than one AI model or speed and people may want to switch per message.'],
  alternatives: [
    { name: 'select', when: 'the choice is an ordinary form setting, not an AI model.' },
    { name: 'radio-group', when: 'the model is chosen once on a settings page; show the same options as radios.' },
  ],
  rules: [
    {
      id: 'say-what-it-is-for',
      do: 'Give every model a one-line description of what it is good for ("Fast answers, fewer credits").',
      dont: 'List bare model names — people cannot choose between names they do not know.',
      visual: true,
    },
    {
      id: 'auto-first',
      do: 'Offer Auto first so people who do not care never have to choose.',
      dont: 'Make people pick a model before their first message.',
      visual: false,
    },
  ],
  a11y: [
    'The trigger is named with the current choice ("Model: Auto"); the menu is a radio group, so arrow keys move and the current model is announced as checked.',
  ],
  tokens: ['--popover', '--accent', '--muted', '--ink-soft', '--muted-foreground'],
}
