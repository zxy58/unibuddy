export type CohortType = 'international' | 'firstgen' | 'lowincome' | 'transfer'
export type SchoolType = 'art' | 'research' | 'largepublic' | 'liberal' | 'community'
export type JourneyStage = 'pre-arrival' | 'first-semester' | 'sophomore' | 'transfer-first'
export type GoalType = 'visa' | 'financial' | 'academic' | 'career' | 'social'

export interface UserProfile {
  name: string
  email: string
  cohorts: CohortType[]
  schoolType: SchoolType
  schoolName: string
  country: string
  stage: JourneyStage
  goals: GoalType[]
  approach: 'solo' | 'help' | 'wait'
  newSituation: 'jump' | 'observe' | 'guide'
  trustSource: 'experience' | 'official' | 'peers'
}

const STORAGE_KEY = 'unibuddy-profile-v1'

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {}
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export const cohortLabels: Record<CohortType, string> = {
  international: 'International',
  firstgen: 'First-gen',
  lowincome: 'Financial aid',
  transfer: 'Transfer',
}

export const stageLabels: Record<JourneyStage, string> = {
  'pre-arrival': 'Pre-arrival',
  'first-semester': 'First semester',
  'sophomore': 'Continuing student',
  'transfer-first': 'Transfer — first semester',
}

export const schoolTypeLabels: Record<SchoolType, string> = {
  art: 'Art & design school',
  research: 'Research university',
  largepublic: 'Large public university',
  liberal: 'Liberal arts college',
  community: 'Community college',
}
