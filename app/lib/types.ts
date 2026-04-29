export type MoveType = 'todo' | 'done' | 'locked'
export type TabName = 'timeline' | 'guides' | 'profile'
export type MoveCategory = 'visa' | 'financial' | 'enrollment' | 'academic' | 'housing' | 'health'

export interface Move {
  title: string
  category: MoveCategory
  consequence: string          // what happens if you miss this
  daysUntil: number | null     // null = no hard deadline
  dependsOn: string[]          // move keys that must be done first
  steps: string[]
  whatToGather: string[]       // things to have ready before starting
  ifWrongGoesWrong: string     // escalation / error recovery
  peerInsight: string          // one verified peer quote
  ai: string                   // inline AI context block
  done: boolean
  urgency: 'critical' | 'soon' | 'upcoming' | 'locked'
}

export interface AppCallbacks {
  goTo: (tab: TabName) => void
  openGuide: (key: string) => void
  closeGuide: () => void
  showToast: (msg: string) => void
}
