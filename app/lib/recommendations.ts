import type { UserProfile, CohortType, GoalType } from './profile'
import { cohortLabels, stageLabels } from './profile'

/** Returns move keys in priority order based on user profile */
export function getPrioritizedMoves(profile: UserProfile): string[] {
  const priority: string[] = []

  // International → visa moves first
  if (profile.cohorts.includes('international')) {
    priority.push('i20', 'sevis', 'dso')
  }

  // Art school → critique culture is critical
  if (profile.schoolType === 'art') {
    if (!priority.includes('critique')) priority.push('critique')
  }

  // Transfer or first-gen or academic goal → office hours is highest leverage
  if (
    profile.cohorts.includes('transfer') ||
    profile.cohorts.includes('firstgen') ||
    profile.goals.includes('academic') ||
    profile.goals.includes('career')
  ) {
    if (!priority.includes('officehours')) priority.push('officehours')
  }

  // Financial goal or low-income → surface financial moves
  if (profile.goals.includes('financial') || profile.cohorts.includes('lowincome')) {
    if (!priority.includes('officehours')) priority.push('officehours')
  }

  // Fill remaining
  for (const key of ['dso', 'i20', 'sevis', 'critique', 'officehours']) {
    if (!priority.includes(key)) priority.push(key)
  }

  return priority
}

/** First recommended move key based on profile */
export function getTopMove(profile: UserProfile): string {
  const moves = getPrioritizedMoves(profile)
  return moves[0] || 'i20'
}

/** Personalized AI nudge text for the dashboard card */
export function getDashboardNudge(profile: UserProfile): { title: string; body: string; moveKey: string } {
  if (profile.cohorts.includes('international') && profile.stage === 'pre-arrival') {
    return {
      title: 'UniBuddy noticed',
      body: `Your I-20 window is opening soon. Based on your ${profile.country ? profile.country + ' ' : ''}background and your ${profile.schoolName || 'school'} arrival date, learning this move now gives you exactly enough time to make it before your visa window closes.`,
      moveKey: 'i20',
    }
  }
  if (profile.cohorts.includes('transfer')) {
    return {
      title: 'For transfer students',
      body: `The office hours move is different for transfers — professors don't know you yet. Going in week 2 resets the clock. Students who do this close the familiarity gap with their cohort within one semester.`,
      moveKey: 'officehours',
    }
  }
  if (profile.cohorts.includes('firstgen')) {
    return {
      title: 'A move most first-gen students miss',
      body: `Office hours aren't just for when you're struggling. Students who go in the first two weeks build relationships that compound across all four years. This is the move your network never told you about.`,
      moveKey: 'officehours',
    }
  }
  if (profile.schoolType === 'art') {
    return {
      title: 'Before your first crit',
      body: `Critique culture at ${profile.schoolName || 'art school'} operates on rules nobody explains in orientation. Learning this move before your first crit means you walk in with the vocabulary and posture that faculty actually respond to.`,
      moveKey: 'critique',
    }
  }
  return {
    title: 'UniBuddy noticed',
    body: `Based on your goals, learning this move now gives you exactly the right knowledge at the right moment in your journey.`,
    moveKey: getTopMove(profile),
  }
}

/** Per-move personalized AI context string */
export function getPersonalizedAI(profile: UserProfile, moveKey: string): string {
  const school = profile.schoolName || 'your school'
  const country = profile.country

  if (moveKey === 'i20') {
    if (profile.schoolType === 'art') {
      return `At ${school}, the ISS office handles F-1 visas for a smaller cohort — which means response times can be faster, but peak windows (June–July) are real. Emailing now puts you at the front of the queue.`
    }
    if (country) {
      return `For students from ${country}, your visa interview window is often narrower than the standard timeline assumes. Email your DSO this week — the 48-hour subject line formula is the single biggest lever.`
    }
    return `Based on your pre-arrival stage, your I-20 request should be your first priority. Email your DSO at least 6 weeks before your intended arrival date.`
  }

  if (moveKey === 'officehours') {
    if (profile.cohorts.includes('international')) {
      return `For international students: going to office hours signals seriousness — which matters more than accent or language fluency. Professors at ${school} specifically remember the students who show up early. Week 2 is your window.`
    }
    if (profile.cohorts.includes('firstgen')) {
      return `First-gen students often assume office hours are for students who already have a relationship with the professor. The opposite is true — it's how the relationship starts. Go in week 2, before you need anything.`
    }
    if (profile.cohorts.includes('transfer')) {
      return `Transfer students have a shorter runway to build faculty relationships. Going to office hours in your first two weeks signals that you're serious and invested — it resets any perception that you're just passing through.`
    }
    return `Going to office hours in week 2 — before you need anything — is the move that changes what the next four years looks like. Most students wait until they're struggling. The students faculty remember go first.`
  }

  if (moveKey === 'critique') {
    if (profile.schoolType === 'art') {
      return `At ${school}, crits happen in front of your full cohort. Disagreeing with feedback respectfully reads as sophistication. The third-person language move alone changes how faculty perceive your intellectual engagement.`
    }
    return `Critique culture shows up in many academic settings — seminars, reviews, presentations. The skills in this move (third-person framing, leading with intention) apply anywhere you need to defend your work.`
  }

  if (moveKey === 'sevis') {
    return `Many students from ${country || 'your region'} encounter unofficial SEVIS payment sites that look legitimate. The only valid site is fmjfee.com. The $350 F-1 fee is non-refundable — getting this right the first time matters.`
  }

  return ''
}

/** Human-readable cohort string for dashboard subtitle */
export function getCohortTag(profile: UserProfile): string {
  if (profile.cohorts.length === 0) return stageLabels[profile.stage]
  const labels = profile.cohorts.map((c) => cohortLabels[c])
  return labels.join(' · ') + ' · ' + stageLabels[profile.stage]
}

/** Badge color config per cohort */
export const cohortColors: Record<CohortType, { bg: string; text: string; border: string }> = {
  international: { bg: '#EEEDFE', text: '#3C3489', border: '#AFA9EC' },
  firstgen: { bg: '#E1F5EE', text: '#0F6E56', border: '#9FE1CB' },
  lowincome: { bg: '#FAEEDA', text: '#633806', border: '#FAC775' },
  transfer: { bg: '#F7F6F4', text: '#6B6B6B', border: '#E0DDD8' },
}

/** Friendly label for goal chips */
export const goalLabels: Record<GoalType, string> = {
  visa: 'Visa & immigration',
  financial: 'Financial aid',
  academic: 'Academic success',
  career: 'Career planning',
  social: 'Social belonging',
}
