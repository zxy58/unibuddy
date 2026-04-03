export type MoveType = 'learned' | 'made' | 'peer' | 'locked'
export type TabName = 'dash' | 'playbook' | 'growth' | 'community' | 'inbox'
export type MoveFilter = 'all' | 'made' | 'learned' | 'peer' | 'visa' | 'academic' | 'career' | 'financial'

export interface Move {
  title: string
  meta: string
  type: MoveType
  steps: string[]
  insider: string
  ai: string
  madeit: boolean
  tags: MoveFilter[]
}

export interface Peer {
  id: string
  initials: string
  name: string
  detail: string
  bgColor: string
  textColor: string
}

export interface AppCallbacks {
  goTo: (tab: TabName, moveKey?: string) => void
  openMove: (key: string) => void
  closeMove: () => void
  openShareModal: (moveKey?: string) => void
  openLogModal: (key?: string) => void
  showToast: (msg: string) => void
  toggleAI: (id: string) => void
  toggleLike: (postId: string) => void
  toggleSave: (moveKey: string) => void
}
