export interface UsageRule {
  id: string
  do: string
  dont: string
  visual: boolean
}

export interface UsageAlternative {
  name: string
  when: string
}

export interface Usage {
  name: string
  kind: 'component' | 'pattern'
  summary: string
  useWhen: string[]
  alternatives: UsageAlternative[]
  rules: UsageRule[]
  a11y: string[]
  tokens: string[]
}
