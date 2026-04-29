import type { UserProfile, CohortType } from './profile'
import type { Move } from './types'

/** Returns move keys in priority order based on user profile */
export function getPrioritizedMoves(
  profile: UserProfile,
  moves: Record<string, Move>
): string[] {
  const isIntl = profile.cohorts.includes('international')
  const isFirstgen = profile.cohorts.includes('firstgen')
  const isLowincome = profile.cohorts.includes('lowincome')
  const isTransfer = profile.cohorts.includes('transfer')

  const order: string[] = []

  // Enrollment deposit — everyone needs this first
  order.push('enrolldeposit')

  // Financial aid tracks for first-gen and low-income
  if (isFirstgen || isLowincome) {
    order.push('fafsa', 'aidaccept')
  }

  // Visa track for international students
  if (isIntl) {
    order.push('i20', 'sevis', 'visaapp')
  }

  // Housing + orientation for everyone
  order.push('housingdeposit', 'orientation')

  // Health insurance for everyone
  order.push('healthinsurance')

  // Transfer-specific
  if (isTransfer) {
    order.push('credittransfer')
  }

  return order.filter(k => moves[k])
}

/** Max 3 Act Now items shown at the top of the timeline */
export function getActNowMoves(
  profile: UserProfile,
  moves: Record<string, Move>
): string[] {
  const prioritized = getPrioritizedMoves(profile, moves)
  const undone = prioritized.filter(k => !moves[k].done)
  return undone.slice(0, 3)
}

/** Personalized top-of-timeline nudge */
export function getDashboardNudge(profile: UserProfile): {
  title: string
  body: string
} {
  const isIntl = profile.cohorts.includes('international')
  const isFirstgen = profile.cohorts.includes('firstgen')
  const isLowincome = profile.cohorts.includes('lowincome')
  const isTransfer = profile.cohorts.includes('transfer')
  const name = profile.name?.split(' ')[0] || 'You'

  if (isFirstgen || isLowincome) {
    return {
      title: 'The steps most first-gen students miss',
      body: `${name}, up to 20% of accepted first-gen students never enroll in the fall. Almost always a missed deadline — not motivation. Your three most urgent steps are below.`,
    }
  }

  if (isIntl) {
    return {
      title: 'Your visa window opens now',
      body: `Getting your I-20 starts the clock on everything else. Your visa appointment, SEVIS payment, and arrival date all depend on it.`,
    }
  }

  if (isTransfer) {
    return {
      title: 'Your transfer checklist is different',
      body: `${name}, transfer students miss credit appeal and housing deadlines that freshmen get reminded about automatically. Your timeline surfaces the steps that fall through the cracks.`,
    }
  }

  return {
    title: 'What you need to do next',
    body: `${name}, your checklist is ordered by deadline and consequence. Everything here has a cost if missed.`,
  }
}

/** Inline AI context for a specific guide */
export function getGuideAI(profile: UserProfile, moveKey: string): string {
  const school = profile.schoolName || 'your school'
  const country = profile.country
  const isIntl = profile.cohorts.includes('international')
  const isFirstgen = profile.cohorts.includes('firstgen')

  if (moveKey === 'fafsa' && isFirstgen) {
    return `At ${school}, first-gen students leave an average of $4,200 in unclaimed institutional grant money per year because they miss the school priority FAFSA deadline — which is months before the federal deadline. The priority deadline is when the money runs out.`
  }

  if (moveKey === 'enrolldeposit' && isFirstgen) {
    return `Many first-gen students assume their acceptance letter confirms their spot. It does not — the enrollment deposit does. May 1 is the national standard, but ${school} may have an earlier deadline. Check your portal today.`
  }

  if (moveKey === 'i20' && country) {
    return `For students from ${country}, visa appointment wait times at peak season can be 8–12 weeks. Requesting your I-20 now and booking your visa appointment immediately after receiving it is the only way to guarantee on-time arrival.`
  }

  if (moveKey === 'visaapp') {
    return `Book your visa appointment the same day your SEVIS confirmation arrives. At peak season, appointment slots at major consulates fill within hours. The DS-160 can be completed after booking your slot.`
  }

  if (moveKey === 'credittransfer') {
    return `At ${school}, credit transfer appeals must be filed within the first semester. After that, changes require Dean-level approval — much slower and less predictable. Starting before classes begin gives you maximum leverage.`
  }

  return ''
}

/** Badge color config per cohort */
export const cohortColors: Record<CohortType, { bg: string; text: string; border: string }> = {
  international: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  firstgen:      { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  lowincome:     { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  transfer:      { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
}

const cohortLabels: Record<CohortType, string> = {
  international: 'International',
  firstgen: 'First-gen',
  lowincome: 'Financial aid',
  transfer: 'Transfer',
}

export function getCohortTag(profile: UserProfile): string {
  if (profile.cohorts.length === 0) return 'Student'
  return profile.cohorts.map(c => cohortLabels[c]).join(' · ')
}
