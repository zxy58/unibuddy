export type MoveType = 'todo' | 'done' | 'locked'
export type TabName = 'timeline' | 'guides' | 'profile'
export type MoveCategory = 'visa' | 'financial' | 'enrollment' | 'academic' | 'housing' | 'health'

export interface StepLink {
  label: string   // button text, e.g. "Open site"
  url: string
}

export interface Step {
  action: string        // short imperative, e.g. "Log in to studentaid.gov"
  detail?: string       // one sentence of context, shown collapsed
  link?: StepLink       // direct link button
}

export interface Move {
  title: string
  subtitle: string                // 5–7 word summary shown on the card
  category: MoveCategory
  consequence: string             // ≤12 words: what happens if missed
  daysUntil: number | null
  dependsOn: string[]
  steps: Step[]
  gather: string[]                // short nouns only: "FSA ID", "Passport"
  ifWrong: string                 // one sentence escalation path
  peerInsight: string
  ai: string
  done: boolean
  urgency: 'critical' | 'soon' | 'upcoming'
}

export interface AppCallbacks {
  goTo: (tab: TabName) => void
  openGuide: (key: string) => void
  closeGuide: () => void
  showToast: (msg: string) => void
}
