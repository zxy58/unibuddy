import type { UserProfile, CohortType, GoalType } from './profile'
import { cohortLabels, stageLabels } from './profile'

/** Returns move keys in priority order based on user profile */
export function getPrioritizedMoves(profile: UserProfile): string[] {
  const priority: string[] = []

  // ── Summer melt prevention — highest priority for pre-arrival/decision students ──
  // Research: 10–40% of first-gen/low-income accepted students never enroll
  if (profile.stage === 'pre-arrival') {
    priority.push('enrolldeposit')
    if (
      profile.cohorts.includes('firstgen') ||
      profile.cohorts.includes('lowincome') ||
      profile.goals.includes('financial')
    ) {
      priority.push('fafsa', 'aidappeal')
    }
    priority.push('housing', 'orientation')
  }

  // ── International → visa moves ──
  if (profile.cohorts.includes('international')) {
    for (const k of ['visaapp', 'i20', 'sevis', 'dso']) {
      if (!priority.includes(k)) priority.push(k)
    }
  }

  // ── Art school → critique culture ──
  if (profile.schoolType === 'art') {
    if (!priority.includes('critique')) priority.push('critique')
  }

  // ── Transfer / first-gen / academic / career goal → office hours ──
  if (
    profile.cohorts.includes('transfer') ||
    profile.cohorts.includes('firstgen') ||
    profile.goals.includes('academic') ||
    profile.goals.includes('career')
  ) {
    if (!priority.includes('officehours')) priority.push('officehours')
  }

  // ── Fill remaining ──
  for (const key of ['enrolldeposit', 'fafsa', 'aidappeal', 'visaapp', 'housing', 'orientation', 'dso', 'i20', 'sevis', 'critique', 'officehours']) {
    if (!priority.includes(key)) priority.push(key)
  }

  return priority
}

/** First recommended move key based on profile */
export function getTopMove(profile: UserProfile): string {
  return getPrioritizedMoves(profile)[0] || 'enrolldeposit'
}

/** Personalized AI nudge text for the dashboard hero card */
export function getDashboardNudge(profile: UserProfile): { title: string; body: string; moveKey: string } {
  const school = profile.schoolName || 'your school'

  // Summer melt: first-gen/low-income pre-arrival — enrollment deposit is THE move
  if (
    (profile.stage === 'pre-arrival') &&
    (profile.cohorts.includes('firstgen') || profile.cohorts.includes('lowincome'))
  ) {
    return {
      title: "⚠️ Don't lose your spot",
      body: `First-gen students are 4× more likely to miss the enrollment deposit deadline — and schools don't give second chances. Confirm your seat at ${school} this week. Everything else depends on this one move.`,
      moveKey: 'enrolldeposit',
    }
  }

  // Financial aid urgency — unclaimed aid is a massive first-gen problem
  if (
    profile.cohorts.includes('lowincome') ||
    (profile.cohorts.includes('firstgen') && profile.goals.includes('financial'))
  ) {
    return {
      title: '💰 Your aid package needs action',
      body: `Accepting your financial aid is not automatic — you have to log in and confirm it. First-gen students leave an estimated $2.6B in unclaimed grants each year. Check your ${school} portal today.`,
      moveKey: 'fafsa',
    }
  }

  // International + pre-arrival → book visa interview NOW
  if (profile.cohorts.includes('international') && profile.stage === 'pre-arrival') {
    return {
      title: '🛂 Book your visa interview now',
      body: `F-1 visa appointments in ${profile.country || 'your country'} book out 8–12 weeks in advance in summer. Students who wait until July for an August arrival often miss the window completely. Book the moment you receive your I-20.`,
      moveKey: 'visaapp',
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
      body: `Critique culture at ${school} operates on rules nobody explains in orientation. Learning this move before your first crit means you walk in with the vocabulary and posture that faculty actually respond to.`,
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

  if (moveKey === 'enrolldeposit') {
    if (profile.cohorts.includes('firstgen')) {
      return `Many first-gen students assume that getting accepted means they're automatically enrolled. They're not — the deposit is the confirmation. At ${school}, the deadline is typically May 1. Without it, your seat goes to the waitlist.`
    }
    return `Your enrollment deposit confirms your seat at ${school}. This is non-refundable and required — it's the one action that makes every other step possible.`
  }

  if (moveKey === 'fafsa') {
    if (profile.cohorts.includes('firstgen') || profile.cohorts.includes('lowincome')) {
      return `At ${school}, your financial aid award letter may look complete — but many students don't realize they have to log in and actively accept each component. Grants are free money; loans accumulate interest. Accept grants first and only take loans you actually need.`
    }
    return `Check your student portal for any "verification" flag on your FAFSA — if selected, you must submit additional documents before aid is disbursed.`
  }

  if (moveKey === 'aidappeal') {
    return `Financial aid offices at most schools have discretionary funds specifically for students who appeal. The first offer is not always the final offer — especially if your family's situation has changed since you filed your FAFSA.`
  }

  if (moveKey === 'visaapp') {
    if (country) {
      return `For students from ${country}, F-1 visa appointment slots at the US Embassy typically book out 8–12 weeks in advance during summer. If you're arriving in August, book your interview by late May at the latest.`
    }
    return `F-1 visa interviews are required for most international students. Book your appointment immediately after receiving your I-20 — slots fill in days during peak season (June–August).`
  }

  if (moveKey === 'orientation') {
    if (profile.cohorts.includes('firstgen')) {
      return `First-gen students who attend orientation register for courses 2 weeks earlier on average — better sections, preferred professors. It's also where financial aid disbursement is triggered. Skipping it can delay your refund check.`
    }
    if (profile.cohorts.includes('international')) {
      return `International orientation at ${school} includes required I-20 check-in with your DSO — legally required before you can be enrolled. Missing this step can create SEVIS compliance issues.`
    }
    return `Orientation is where your student life officially begins — student ID, email access, course registration, and advisor meetings all happen here.`
  }

  if (moveKey === 'housing') {
    if (profile.cohorts.includes('international')) {
      return `Apply for housing before your visa is approved — you can withdraw penalty-free if your visa is denied. Waiting for visa confirmation often means missing the housing deadline entirely.`
    }
    return `On-campus housing applications fill within weeks of opening. Apply the same day you pay your enrollment deposit.`
  }

  if (moveKey === 'i20') {
    if (profile.schoolType === 'art') {
      return `At ${school}, the ISS office handles F-1 visas for a smaller cohort — response times can be faster, but peak windows (June–July) are real. Emailing now puts you at the front of the queue.`
    }
    if (country) {
      return `For students from ${country}, your visa interview window is often narrower than the standard timeline assumes. Email your DSO this week — the 48-hour subject line formula is the single biggest lever.`
    }
    return `Based on your pre-arrival stage, your I-20 request should be a top priority. Email your DSO at least 6 weeks before your intended arrival date.`
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
    return `Going to office hours in week 2 — before you need anything — is the move that changes what the next four years looks like.`
  }

  if (moveKey === 'critique') {
    if (profile.schoolType === 'art') {
      return `At ${school}, crits happen in front of your full cohort. Disagreeing with feedback respectfully reads as sophistication. The third-person language move alone changes how faculty perceive your intellectual engagement.`
    }
    return `Critique culture shows up in seminars, reviews, presentations. The skills in this move (third-person framing, leading with intention) apply anywhere you need to defend your work.`
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
  international: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  firstgen:      { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  lowincome:     { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  transfer:      { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
}

/** Friendly label for goal chips */
export const goalLabels: Record<GoalType, string> = {
  visa: 'Visa & immigration',
  financial: 'Financial aid',
  academic: 'Academic success',
  career: 'Career planning',
  social: 'Social belonging',
}
