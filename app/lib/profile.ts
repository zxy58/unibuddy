export type CohortType = 'international' | 'firstgen' | 'lowincome' | 'transfer'

export interface UserProfile {
  name: string
  cohorts: CohortType[]       // student type(s)
  country: string             // home country (intl) or US state (domestic)
  schoolName: string          // enrolled institution
  startDate: string           // "YYYY-MM" — when they start
  phone: string               // for SMS nudges (optional, can be empty)
  email: string               // for email nudges
  notifySMS: boolean
  notifyEmail: boolean
}

const STORAGE_KEY = 'unibuddy-profile-v2'

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
  international: 'International student',
  firstgen: 'First-generation student',
  lowincome: 'Financial aid / low-income',
  transfer: 'Transfer student',
}

export const cohortShort: Record<CohortType, string> = {
  international: '🌐 International',
  firstgen: '⭐ First-gen',
  lowincome: '💛 Financial aid',
  transfer: '↗ Transfer',
}
