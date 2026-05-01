'use client'

import { useState } from 'react'
import type { Move, Contact } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getGuideAI } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'

const RED   = '#ED1C24'
const BROWN = '#4E3629'

interface Props {
  moveKey: string
  move: Move
  profile: UserProfile
  onBack: () => void
  onMarkDone: (key: string) => void
  onAskBruno: (prompt: string) => void
}

const categoryIcon: Record<string, string> = {
  enrollment: '🎓', financial: '💰', visa: '🛂',
  housing: '🏠', health: '🏥', academic: '📚',
}

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  enrollment: { bg: '#FFF5F5', text: BROWN,     border: '#FECACA' },
  financial:  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  visa:       { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
  housing:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  health:     { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
  academic:   { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
}

// ── Recovery guide content ──────────────────────────────────────────────────

type RecoveryPath = 'grace' | 'appeal' | 'damage'

interface RecoveryGuide {
  label: string
  icon: string
  headline: string
  reality: string
  steps: string[]
  callToAction: string
}

function getRecoveryGuides(moveKey: string, profile: UserProfile): Record<RecoveryPath, RecoveryGuide> {
  const school = profile.schoolName || 'your school'
  const isInt  = profile.cohorts?.includes('international')

  const titles: Record<string, string> = {
    enrolldeposit: 'enrollment deposit',
    fafsa:         'FAFSA filing',
    aidaccept:     'financial aid acceptance',
    housingdeposit:'housing deposit',
    orientation:   'orientation registration',
    i20:           'I-20 request',
    sevis:         'SEVIS fee payment',
    visaapp:       'visa application',
    healthinsurance:'health insurance enrollment',
  }
  const task = titles[moveKey] ?? 'this task'

  return {
    grace: {
      label: '< 48 hours',
      icon: '🟡',
      headline: 'Grace period window — act in the next hour',
      reality: `Most offices have an informal 24–48 hour grace period that is never advertised. You are still inside this window. The key is to call, not email — calls get answered immediately and create a human moment that emails cannot.`,
      steps: [
        `Call the relevant office right now. Do not email.`,
        `Say exactly: "I just realized I missed the ${task} deadline. Is there any way to still process this today?"`,
        `Have payment / documents ready before you call so you can act immediately if they say yes.`,
        `If they say the deadline has passed, ask: "Is there a formal extension request process I can start right now?"`,
        `Follow up with an email the same day summarizing what you discussed and who you spoke with.`,
      ],
      callToAction: 'Open email draft ↓',
    },
    appeal: {
      label: '3 – 14 days',
      icon: '🟠',
      headline: 'Appeal window — write a strong, honest explanation',
      reality: `${school} almost certainly has a formal deadline extension or appeal process. Offices expect appeals — they have forms for it. The students who do not get extensions are the ones who do not ask. Your job is to explain what happened and show that you are taking it seriously now.`,
      steps: [
        `Email the office today with subject: "Deadline Extension Request — ${profile.name || '[Your Name]'} — [Student ID]"`,
        `In 2–3 sentences, state clearly what happened (no over-explanation) and when you discovered the issue.`,
        `If there were extenuating circumstances (medical, family, technical), mention them briefly and offer to provide documentation.`,
        `State that you are ready to complete the ${task} immediately upon approval.`,
        `Call the office the next morning to confirm they received your email and ask about turnaround time.`,
        `If denied, ask: "Is there a formal appeals committee I can petition?" — there often is.`,
      ],
      callToAction: 'Open appeal email draft ↓',
    },
    damage: {
      label: '> 2 weeks',
      icon: '🔴',
      headline: 'Damage control — understand your remaining options',
      reality: `The original ${task} deadline is almost certainly final at this point. But "this deadline" is not necessarily the end of the road — it depends on what the deadline was for. Your goal now is to understand exactly what you have lost and what alternative paths still exist.`,
      steps: [
        `Email the office today asking directly: "What are my options given that I missed the ${task} deadline?"`,
        `Ask specifically: (1) Is there a late penalty vs. full disqualification? (2) Is there a next cycle or waitlist? (3) What is the latest I can still act?`,
        isInt
          ? `For immigration-related tasks, contact the DSO (Designated School Official) at the International Students Office immediately — some timelines have legal implications.`
          : `If this affects financial aid, ask whether you can still be considered for non-priority institutional funds or emergency grants.`,
        `Document every conversation: save emails, note names and dates of phone calls.`,
        `Once you know the outcome, update your timeline on UniBuddy so dependent tasks reflect the new reality.`,
      ],
      callToAction: 'Open status inquiry email ↓',
    },
  }
}

// ── Document decoder content ─────────────────────────────────────────────────

interface DocField {
  term: string
  plain: string
  watchFor?: string
}

const docDecoder: Partial<Record<string, DocField[]>> = {
  fafsa: [
    { term: 'Student Aid Index (SAI)', plain: 'The number the government calculated your family can contribute toward college costs this year. Lower = more aid eligibility. A negative SAI means maximum need.', watchFor: 'If it looks wrong, you can file a professional judgment appeal with the Financial Aid office.' },
    { term: 'Cost of Attendance (COA)', plain: 'The school\'s estimate of everything you\'ll spend in one year: tuition, fees, room, board, books, transportation, and personal expenses.', watchFor: 'This is an estimate — your actual costs may differ, especially for off-campus living.' },
    { term: 'Grants (Federal Pell, Institutional)', plain: 'Free money. You never repay grants. Pell comes from the federal government; institutional grants come from the school.', watchFor: 'Grants are usually renewable each year if you meet satisfactory academic progress requirements.' },
    { term: 'Subsidized Loans', plain: 'Money you borrow where the government pays the interest while you\'re in school. Repayment starts 6 months after you graduate or drop below half-time.', watchFor: 'These are always better than unsubsidized — accept these first.' },
    { term: 'Unsubsidized Loans', plain: 'Money you borrow where interest starts accumulating immediately, even while you\'re in school. You can let it capitalize (add to principal) or pay it while enrolled.', watchFor: 'The longer you wait to pay interest, the more you\'ll owe overall.' },
    { term: 'Work-Study', plain: 'A part-time campus job allocation. It\'s NOT deposited into your account — you earn it via paychecks from an on-campus job. You must apply for and get a job to access it.', watchFor: 'Apply for work-study jobs as early as possible — positions fill up fast.' },
    { term: 'Verification Selected', plain: 'The government randomly selected your application to verify the information you provided. You\'ll need to submit additional documents (tax transcripts, etc.) before aid is finalized.' },
  ],
  i20: [
    { term: 'SEVIS ID (N-number)', plain: 'Your unique US immigration tracking number. Starts with "N" followed by 10 digits. This appears on every immigration document you\'ll ever have.', watchFor: 'Must match exactly on your visa application, SEVIS payment, and at the port of entry.' },
    { term: 'Program of Study', plain: 'Your degree level and major as reported to the US government. Must match what you told your consulate.', watchFor: 'If your major changes significantly, your DSO must update your I-20 — don\'t change programs without telling the international office.' },
    { term: 'Program Dates', plain: 'Start and end dates of your authorized stay. Your F-1 status is technically D/S (Duration of Status) — you can stay as long as you\'re in valid status, but these dates define your program.', watchFor: 'If you need more time to complete your degree, request a program extension before the end date.' },
    { term: 'Financial Resources', plain: 'Dollar amounts proving you can fund your education. The government requires proof you can cover the full Cost of Attendance for at least one year.', watchFor: 'This is what your consulate officer reviews during your visa interview.' },
    { term: 'English Proficiency', plain: 'How the school verified you can study in English — usually a test score (TOEFL/IELTS) or a waiver.', watchFor: 'Some programs have conditional English requirements — check if you have any language course obligations.' },
    { term: 'DSO Signature / School Certification', plain: 'Your Designated School Official\'s signature certifying this is a valid I-20. The school is accepting legal responsibility for your enrollment status.', watchFor: 'An unsigned or expired I-20 is invalid — do not travel with one.' },
  ],
  sevis: [
    { term: 'I-901 SEVIS Fee Receipt', plain: 'Your proof that you paid the $350 fee that registers you in the Student and Exchange Visitor Information System. You must show this at your visa interview.', watchFor: 'Only pay at fmjfee.com — there are many scam sites that look official.' },
    { term: 'SEVIS ID on Receipt', plain: 'Should exactly match the N-number on your I-20. If they don\'t match, contact your DSO immediately — you may have paid for the wrong record.', watchFor: 'A mismatch will cause your visa application to be rejected.' },
    { term: 'Payment Date', plain: 'Must be before your visa interview date. There is usually a 3 business day processing delay before it appears in the State Department\'s system.', watchFor: 'Don\'t schedule your visa interview for the same day you pay — wait 3 business days.' },
    { term: 'School Code', plain: 'Your school\'s SEVIS school code (format: NYC214F00XXX). This links your fee payment to your specific I-20 issuing school.', watchFor: 'Verify this matches the code on your I-20.' },
  ],
  healthinsurance: [
    { term: 'Premium', plain: 'The monthly cost of having insurance, regardless of whether you use it. Usually deducted from your student account each semester.', watchFor: 'Student plans are often billed per semester, not per month — check the total before waiving.' },
    { term: 'Deductible', plain: 'The amount you pay out-of-pocket before insurance starts covering costs. If your deductible is $500, you pay the first $500 of medical bills yourself each year.', watchFor: 'A high-deductible plan is cheaper monthly but risky if you need unexpected care.' },
    { term: 'Copay / Copayment', plain: 'A fixed amount you pay per visit, regardless of the total bill. "Office visit: $25 copay" means you pay $25, insurance pays the rest (after deductible).', watchFor: 'Copays at in-network providers are much lower — always check before going to a new doctor.' },
    { term: 'In-Network vs. Out-of-Network', plain: 'In-network providers have negotiated rates with your insurance. Out-of-network means you pay much more — sometimes the full cost.', watchFor: 'Campus health centers and local urgent care clinics are almost always in-network for student plans.' },
    { term: 'Out-of-Pocket Maximum', plain: 'The most you will ever pay in a single year, even if your medical bills are enormous. Once you hit this limit, insurance covers 100%.', watchFor: 'Look at this number when comparing plans — it\'s the worst-case scenario figure.' },
    { term: 'Waiver', plain: 'The process to opt out of the school plan because you already have qualifying insurance (e.g., parent\'s plan). Must be done by the waiver deadline each year.', watchFor: 'Waivers don\'t roll over — you must reapply every academic year.' },
  ],
}

// ── Pre-drafted chat prompt per guide ────────────────────────────────────────

function buildBrunoPrompt(moveKey: string, move: Move, profile: UserProfile): string {
  const school = profile.schoolName || 'my school'
  const isInt  = profile.cohorts?.includes('international')

  const prompts: Record<string, string> = {
    enrolldeposit: `I'm looking at the enrollment deposit for ${school}. What do I need to know before paying and what unlocks after I confirm my spot?`,
    fafsa:         `I'm working on my FAFSA as an incoming student at ${school}. What are the most important things to know and when is the priority deadline?`,
    aidaccept:     `I need to accept my financial aid offer at ${school}. What's the difference between grants and loans in my award letter and what should I watch out for?`,
    housingdeposit:`I'm about to pay my housing deposit at ${school}. How does the room queue work and is there anything important to know before submitting?`,
    orientation:   `I need to register for orientation at ${school}${isInt ? ' as an international student' : ''}. What's the most important thing to do at orientation and how does course registration work?`,
    i20:           `I need to request my I-20 from ${school} as an F-1 student from ${profile.country || 'abroad'}. What information do I need to gather and how do I get it processed quickly?`,
    sevis:         `I need to pay my SEVIS fee for my F-1 visa to attend ${school}. What's the safest way to pay, what could go wrong, and what do I do after paying?`,
    visaapp:       `I'm applying for my F-1 student visa to attend ${school}. What documents do I need for the interview and what are the most common reasons for denial?`,
    healthinsurance:`I'm deciding whether to waive ${school}'s student health insurance. What should I consider and when is the waiver deadline?`,
    credittransfer: `I'm a transfer student at ${school} and I want to appeal my transfer credit evaluation. How do I make the strongest case?`,
  }

  return prompts[moveKey] ?? `I'm looking at the "${move.title}" step at ${school}. Can you walk me through what I need to know?`
}

// ── Inline Bruno AI advice ───────────────────────────────────────────────────

function getBrunoAdvice(moveKey: string, profile: UserProfile): string {
  const school   = profile.schoolName || 'your school'
  const isInt    = profile.cohorts?.includes('international')
  const isTransfer = profile.cohorts?.includes('transfer')
  const cohortLabel = isInt ? 'international student' : isTransfer ? 'transfer student' : 'incoming student'

  const advice: Record<string, string> = {
    enrolldeposit: `As an ${cohortLabel} at ${school}, pay your deposit the same day you decide — not "later this week." Seats and housing priority are assigned in real time. Once you pay, take a screenshot of the confirmation page (not just the email) and save it. If the portal shows "pending" after 24 hours, call Admissions directly. Do not wait for an email to resolve itself.`,
    fafsa: `For ${school}: FAFSA opens October 1st for the following academic year. Filing in October vs. February can mean the difference between $15,000 in grants and $5,000 — most institutional money goes to early filers. Use the IRS Direct Data Exchange to pull in tax info automatically, it takes 30 seconds and eliminates the #1 source of errors. If your family\'s income changed significantly from the tax year used, file first and then contact the Financial Aid office about a professional judgment review.`,
    aidaccept: `When reviewing your ${school} award letter, separate the offer into two columns: money you don\'t repay (grants, scholarships) vs. money you do (loans). Most students over-focus on the total package number and miss that $8k of it might be loans. If you\'re comparing offers from multiple schools, use the actual net cost — COA minus grants and scholarships only. ${isInt ? 'International students: check whether aid is renewable and what the GPA/credit requirements are each year.' : 'Ask explicitly whether your merit scholarship is renewable and what the renewal criteria are.'}`,
    housingdeposit: `At ${school}, the housing queue typically works on deposit timestamp — the earlier you pay, the more room/building options you get. ${isInt ? 'As an international student, submit your housing deposit before your visa is confirmed if possible. Most schools hold your assignment and release it if you can\'t enroll — do not wait for visa approval to pay.' : ''} When you get to select rooms, avoid choosing based solely on the floor plan — read student reviews for the specific building. AC, laundry location, and distance to campus matter more than square footage.`,
    orientation: `${school} likely has a separate ${isInt ? 'International Student Orientation that is required and separate from general orientation.' : isTransfer ? 'transfer orientation that covers different ground than first-year orientation.' : 'new student orientation.'} Attend both if there are two. The most valuable part isn\'t the sessions — it\'s meeting your academic advisor and getting your class registration hold lifted. Find out exactly when advising appointments open and book one immediately. Registration order matters for getting into required courses.`,
    i20: `Your I-20 is the most important document in your F-1 student life. Get it early — DSO processing times vary from 3 days to 3 weeks depending on ${school}\'s office. After you receive it, verify three things immediately: (1) your name spelling exactly matches your passport, (2) your SEVIS ID starts with N and is 10 digits, (3) your program start date is correct. Any error requires a corrected I-20 before you can get a visa — catching it now saves weeks later.`,
    sevis: `Pay your SEVIS fee only at fmjfee.com — there are dozens of scam sites. After paying, download and save your I-901 receipt as a PDF. The State Department\'s system takes 3 business days to reflect payment, so don\'t schedule your visa interview until after that window. At your interview, bring your printed I-901 receipt alongside your I-20 — some consulates ask for it physically even if it\'s in their system. ${school}\'s international office can confirm your payment was processed correctly.`,
    visaapp: `The single best way to prepare for your F-1 visa interview is to be able to explain your specific program at ${school} in 2–3 clear sentences. Officers are checking whether you have genuine academic intent and ties to your home country. Common questions: "Why this school?", "What will you do after graduation?", "Who is funding your studies?" Prepare honest, specific answers — vague answers raise flags. Bring every document in an organized folder. If you get a 221(g) administrative processing notice, that\'s normal — it\'s not a denial. Contact ${school}\'s international office and wait.`,
    healthinsurance: `${school}\'s student health plan is usually better than it looks on paper for campus services — the campus health center is often free or very low copay with the school plan. Before waiving, check whether your current coverage (parent\'s plan, home country coverage) is actually accepted by US providers in ${school}\'s area. Home country insurance typically doesn\'t work in the US. ${isInt ? 'International students: many consulates technically require health insurance for your visa — the school plan satisfies this requirement automatically.' : ''} The waiver deadline is strict — missing it means you\'re enrolled and charged for the full year.`,
    credittransfer: `Transfer credit evaluations at ${school} are almost always negotiable, but the window is narrow — most schools only accept appeals in the first semester. Get your official evaluation in writing, then identify every course you believe was mis-classified. Pull the syllabi from your previous institution and write one paragraph per course explaining the content overlap with ${school}\'s equivalent requirement. Bring this to a meeting with your academic advisor, not just the registrar — faculty can sometimes approve equivalencies that the registrar can\'t.`,
  }

  return advice[moveKey] ?? getGuideAI(profile, moveKey) ?? `Here\'s what matters most for this step as an ${cohortLabel} at ${school}: read the instructions on the official portal carefully before starting, complete this when you have 30 uninterrupted minutes, and save/screenshot every confirmation you receive.`
}

// ── Email draft templates ────────────────────────────────────────────────────

function resolveEmail(emailFormat: string, profile: UserProfile): string {
  const school = profile.schoolName?.toLowerCase().replace(/\s+/g, '') || 'yourschool'
  const domainMap: Record<string, string> = {
    ucla: 'ucla.edu', 'utaustin': 'utexas.edu', nyu: 'nyu.edu',
    columbia: 'columbia.edu', risd: 'risd.edu', mit: 'mit.edu',
    stanford: 'stanford.edu', caltech: 'caltech.edu', brown: 'brown.edu',
    'universityofmichigan': 'umich.edu', uchicago: 'uchicago.edu',
  }
  const domain = domainMap[school] || `${school}.edu`
  return emailFormat.replace('[school]', domain.split('.')[0])
}

function buildEmailDraft(
  moveKey: string,
  contact: Contact,
  profile: UserProfile
): { subject: string; body: string } {
  const name   = profile.name || '[Your Name]'
  const school = profile.schoolName || '[Your School]'

  const templates: Record<string, { subject: string; body: string }> = {
    enrolldeposit: {
      subject: `Enrollment Deposit Confirmation — ${name}`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school} for the upcoming academic year. I am writing to confirm my enrollment and to ask about the deposit process.

I would like to:
  1. Confirm the deposit deadline and exact amount
  2. Verify that my portal is showing the correct status after payment
  3. Understand what unlocks next (housing, orientation, etc.)

Could you confirm that my record is in order once I complete payment? Please let me know if there are any additional steps I should take.

Thank you,
${name}
Admitted Student — ${school}
${profile.email || '[your email]'}`,
    },

    fafsa: {
      subject: `FAFSA Status Inquiry — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school}. I am writing regarding my FAFSA submission and would like to confirm:

  1. That my FAFSA has been received and linked to my account
  2. Your priority deadline for institutional grant consideration
  3. Whether I have been selected for verification (and what documents are needed)

I want to make sure I do not miss any institutional aid windows. Please let me know my current status and any action items on my end.

Thank you,
${name}
Admitted Student — ${school}
${profile.email || '[your email]'}`,
    },

    aidaccept: {
      subject: `Financial Aid Package Question — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school}. I have reviewed my financial aid award letter and have a few questions before I finalize my acceptance:

  1. Can you confirm the deadline to accept my award?
  2. I would like to understand the difference between the grants, scholarships, and loans listed — specifically which are "free money" vs. which I will need to repay.
  3. Am I required to accept the full loan amount, or can I accept a partial amount?

I want to make a careful, informed decision. Thank you for your time.

${name}
${profile.email || '[your email]'}`,
    },

    housingdeposit: {
      subject: `Housing Deposit Inquiry — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}${profile.cohorts.includes('international') ? ' (international student)' : ''}. I am writing about the on-campus housing deposit process.

I would like to confirm:
  1. The exact deadline to submit my housing deposit to maintain queue priority
  2. Whether I can apply before my${profile.cohorts.includes('international') ? ' visa is confirmed' : ' enrollment is finalized'}
  3. The cancellation policy if my plans change

Please let me know if there are any forms I need to complete alongside the deposit.

Thank you,
${name}
Incoming Student — ${school}
${profile.email || '[your email]'}`,
    },

    orientation: {
      subject: `Orientation Registration — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}${profile.cohorts.includes('international') ? ' (international student)' : profile.cohorts.includes('transfer') ? ' (transfer student)' : ''}. I am writing to confirm my orientation registration.

I have a few questions:
  1. ${profile.cohorts.includes('international') ? 'I understand there is a separate International Student Orientation — should I attend both?' : 'Which orientation session is recommended for my start date?'}
  2. Are there any pre-orientation tasks (immunization records, placement tests) I should complete first?
  3. When does course registration open relative to orientation?

Thank you for your guidance.

${name}
${profile.email || '[your email]'}`,
    },

    i20: {
      subject: `I-20 Request — ${name} — [Student ID] — Arriving [Date]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school} as an F-1 student from ${profile.country || '[your country]'}. I am writing to formally request my initial I-20 document.

My information:
  • Full legal name (as on passport): ${name}
  • Student ID: [your Student ID]
  • Program: [your program and degree level]
  • Intended arrival date: [your arrival date]
  • Country of citizenship: ${profile.country || '[your country]'}

I have attached the following documents to this email:
  1. Acceptance letter
  2. Bank statement showing sufficient funds for tuition and living expenses
  3. Passport photo page

Please let me know if any additional documents are required. I need the I-20 to pay my SEVIS fee and schedule my visa interview.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    sevis: {
      subject: `SEVIS Fee Payment Issue — ${name} — SEVIS ID: [N-XXXXXXXXXX]`,
      body: `Dear ${contact.office},

My name is ${name}, an incoming F-1 student at ${school}. I am writing regarding an issue with my SEVIS fee payment.

[Describe your specific issue — e.g.:]
  • I believe I may have paid on an unofficial site. My SEVIS ID is [N-XXXXXXXXXX] and I paid on [date].
  • The fmjfee.com website is not reflecting my payment after 3 business days.
  • I need to confirm my I-901 receipt is valid before my visa interview on [date].

I would appreciate any guidance or documentation you can provide to support my case.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    visaapp: {
      subject: `F-1 Visa Application Support — ${name}`,
      body: `Dear ${contact.office},

My name is ${name}, an incoming F-1 student at ${school} from ${profile.country || '[your country]'}. I am in the process of completing my visa application and have a question.

[Describe your specific question — e.g.:]
  • I am preparing for my visa interview on [date] and want to confirm I have all required documents.
  • My visa appointment is scheduled but I have a question about my DS-160 application.
  • I received a visa denial and am seeking guidance on next steps before reapplying.

Attached: I-20 from ${school} (for context).

Thank you for your support,
${name}
${profile.email || '[your email]'}`,
    },

    healthinsurance: {
      subject: `Health Insurance Waiver Request — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}. I am writing to submit a health insurance waiver request, as I am currently covered under [your insurance plan / parent\'s plan].

My coverage details:
  • Insurance provider: [provider name]
  • Policy number: [policy number]
  • Group number: [group number]
  • Coverage period: [dates]

I have attached proof of coverage to this email. Please confirm the waiver deadline and let me know if any additional documentation is required.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    credittransfer: {
      subject: `Transfer Credit Appeal — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming transfer student at ${school}. I have reviewed my official credit evaluation and would like to appeal the classification of several courses that I believe should satisfy degree requirements rather than counting as general electives.

Courses I am appealing:
  • [Course name] → should satisfy [requirement]
  • [Course name] → should satisfy [requirement]

I have attached the syllabi for each course, which demonstrate the content overlap with your equivalent requirements.

I understand that appeals must be filed within the first semester. I wanted to begin this process proactively and would welcome a brief meeting to discuss.

Thank you for your consideration,
${name}
Transfer Student — ${school}
${profile.email || '[your email]'}`,
    },
  }

  return templates[moveKey] ?? {
    subject: `Question about ${moveKey} — ${name}`,
    body: `Dear ${contact.office},\n\nMy name is ${name}, an incoming student at ${school}. I have a question about [topic].\n\nThank you,\n${name}\n${profile.email || '[your email]'}`,
  }
}

// ── Contact card ─────────────────────────────────────────────────────────────

function ContactCard({ contact, moveKey, profile, col }: {
  contact: Contact
  moveKey: string
  profile: UserProfile
  col: { bg: string; text: string; border: string }
}) {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState<'subject' | 'body' | 'all' | null>(null)

  const resolvedEmail = resolveEmail(contact.emailFormat, profile)
  const draft         = buildEmailDraft(moveKey, contact, profile)

  const copy = (type: 'subject' | 'body' | 'all') => {
    const text = type === 'subject' ? draft.subject
      : type === 'body' ? draft.body
      : `To: ${resolvedEmail}\nSubject: ${draft.subject}\n\n${draft.body}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div style={{ borderRadius: 12, border: `1.5px solid ${open ? col.border : 'var(--border-secondary)'}`, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <div style={{ padding: '12px 14px', background: open ? col.bg : 'white' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{contact.office}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{contact.role}</div>
            <a
              href={`mailto:${resolvedEmail}`}
              style={{ fontSize: 12, color: col.text, fontWeight: 600, fontFamily: 'monospace', marginTop: 5, display: 'block', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {resolvedEmail}
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Response: {contact.responseTime}</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 8, background: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {open ? 'Close' : '✉ Draft email'}
          </button>
        </div>
        {contact.tip && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 11 }}>💡</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.45 }}>{contact.tip}</span>
          </div>
        )}
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${col.border}`, background: '#FAFAFA' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px 0' }}>
            <BuddyAvatar mood="thinking" size={30} />
            <div style={{ flex: 1, padding: '8px 11px', borderRadius: '4px 12px 12px 12px', background: '#FFF5F5', border: '1.5px solid #FECACA' }}>
              <div style={{ fontSize: 12, color: BROWN, lineHeight: 1.5 }}>
                Here&apos;s a ready-to-send draft. Fill in the bracketed parts, then copy and send from your email.
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</span>
                <button onClick={() => copy('subject')} style={{ fontSize: 10, fontWeight: 700, color: col.text, border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, background: col.bg }}>
                  {copied === 'subject' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', color: '#1E293B', lineHeight: 1.5 }}>
                {draft.subject}
              </div>
            </div>

            <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Body</span>
                <button onClick={() => copy('body')} style={{ fontSize: 10, fontWeight: 700, color: col.text, background: col.bg, border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>
                  {copied === 'body' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '10px', fontSize: 11, fontFamily: 'monospace', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                {draft.body}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => copy('all')}
                style={{ flex: 1, padding: '10px', borderRadius: 9, background: copied === 'all' ? '#059669' : col.text, border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                {copied === 'all' ? '✓ Copied everything' : 'Copy full email'}
              </button>
              <a
                href={`mailto:${resolvedEmail}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
                style={{ padding: '10px 14px', borderRadius: 9, background: 'white', border: `1.5px solid ${col.border}`, color: col.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
              >
                Open in Mail ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Recovery triage block ────────────────────────────────────────────────────

function RecoveryBlock({ moveKey, move, profile }: { moveKey: string; move: Move; profile: UserProfile }) {
  const [selected, setSelected] = useState<RecoveryPath | null>(null)
  const overdueDays = move.daysUntil !== null ? Math.abs(move.daysUntil) : 0
  const guides = getRecoveryGuides(moveKey, profile)

  const options: { path: RecoveryPath; label: string; icon: string; hint: string }[] = [
    { path: 'grace',  icon: '🟡', label: 'Less than 48 hours',  hint: 'Grace period window' },
    { path: 'appeal', icon: '🟠', label: '3 – 14 days ago',     hint: 'Appeal territory' },
    { path: 'damage', icon: '🔴', label: 'More than 2 weeks',   hint: 'Damage control' },
  ]

  const active = selected ? guides[selected] : null

  return (
    <div style={{ borderRadius: 14, border: `2px solid ${RED}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '11px 14px', background: RED, display: 'flex', alignItems: 'center', gap: 10 }}>
        <BuddyAvatar mood="urgent" size={36} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>
            This task is {overdueDays} day{overdueDays !== 1 ? 's' : ''} overdue
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>
            Select when the deadline passed to get your recovery plan
          </div>
        </div>
      </div>

      {/* Triage buttons */}
      <div style={{ padding: '12px 14px', background: '#FFF5F5', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: BROWN, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
          When did the deadline pass?
        </div>
        {options.map(opt => (
          <button
            key={opt.path}
            onClick={() => setSelected(s => s === opt.path ? null : opt.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
              border: selected === opt.path ? `2px solid ${RED}` : '1.5px solid #FECACA',
              background: selected === opt.path ? '#FFF0F0' : 'white',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 16 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BROWN }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{opt.hint}</div>
            </div>
            <span style={{ fontSize: 12, color: selected === opt.path ? RED : '#9CA3AF' }}>
              {selected === opt.path ? '▲' : '▼'}
            </span>
          </button>
        ))}

        {/* Recovery guide */}
        {active && (
          <div style={{ marginTop: 4, borderRadius: 10, background: 'white', border: `1px solid #FECACA`, overflow: 'hidden' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #FEE2E2', background: '#FEF2F2' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: BROWN }}>{active.headline}</div>
            </div>
            <div style={{ padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{active.reality}</p>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: BROWN, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Your action steps
                </div>
                {active.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: RED, color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GuideDetail({ moveKey, move, profile, onBack, onMarkDone, onAskBruno }: Props) {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({})
  const [decoderOpen,  setDecoderOpen]  = useState(false)
  const [showPeer,     setShowPeer]     = useState(false)

  const col     = categoryColor[move.category] || categoryColor.enrollment
  const overdue = !move.done && move.daysUntil !== null && move.daysUntil < 0
  const decoder = docDecoder[moveKey]

  const toggleStep = (i: number) =>
    setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }))

  const checkedCount = Object.values(checkedSteps).filter(Boolean).length
  const allChecked   = checkedCount === move.steps.length

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Sticky header */}
      <div style={{ padding: '10px 18px 14px', borderBottom: '1px solid var(--border-tertiary)', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12 }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: col.bg, border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {categoryIcon[move.category]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.2px' }}>{move.title}</div>
            {overdue && move.daysUntil !== null && (
              <div style={{ fontSize: 11, color: RED, fontWeight: 700, marginTop: 3 }}>
                {Math.abs(move.daysUntil)}d overdue — recovery plan below
              </div>
            )}
            {!overdue && !move.done && move.daysUntil !== null && (
              <div style={{ fontSize: 11, color: move.daysUntil <= 7 ? '#DC2626' : '#EA580C', fontWeight: 700, marginTop: 3 }}>
                {move.daysUntil === 0 ? 'Due today' : `${move.daysUntil} days left`}
              </div>
            )}
            {move.done && <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 3 }}>Completed ✓</div>}
          </div>
        </div>

        {!move.done && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Steps</span>
              <span style={{ fontSize: 11, color: RED, fontWeight: 600 }}>{checkedCount} / {move.steps.length}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: BROWN, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: RED, width: `${(checkedCount / move.steps.length) * 100}%`, transition: 'width 0.25s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Recovery triage (overdue only) ── */}
        {overdue && (
          <RecoveryBlock moveKey={moveKey} move={move} profile={profile} />
        )}

        {/* ── Consequence (non-overdue, non-done) ── */}
        {!move.done && !overdue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>⚠</span>
            <span style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.4 }}>If missed: <strong>{move.consequence}</strong></span>
          </div>
        )}

        {/* ── Have ready ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Have ready</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {move.gather.map((item, i) => (
              <div key={i} style={{ padding: '5px 11px', borderRadius: 20, background: col.bg, border: `1px solid ${col.border}`, fontSize: 12, fontWeight: 500, color: col.text }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ── Steps + inline Bruno ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Steps</div>
            <button
              onClick={() => onAskBruno(buildBrunoPrompt(moveKey, move, profile))}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: `1.5px solid #FECACA`, background: 'white', color: BROWN, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              <BuddyAvatar mood="wave" size={18} />
              <span>? Ask Bruno</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {move.steps.map((step, i) => {
              const checked = !!checkedSteps[i]
              return (
                <div key={i} style={{ borderRadius: 12, border: `1px solid ${checked ? '#D1FAE5' : 'var(--border-secondary)'}`, background: checked ? '#F0FDF4' : 'white', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 12px' }}>
                    <button
                      onClick={() => toggleStep(i)}
                      style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? '#10B981' : col.border}`, background: checked ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                    >
                      {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: col.text, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.4, textDecoration: checked ? 'line-through' : 'none' }}>
                          {step.action}
                        </span>
                      </div>
                      {step.detail && !checked && (
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, marginLeft: 16, lineHeight: 1.4 }}>{step.detail}</div>
                      )}
                    </div>
                  </div>
                  {step.link && !checked && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: col.bg, borderTop: `1px solid ${col.border}`, textDecoration: 'none' }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>🔗 {step.link.label}</span>
                      <span style={{ fontSize: 12, color: col.text }}>↗</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Document decoder ── */}
        {decoder && (
          <div style={{ borderRadius: 12, border: `1.5px solid #D1D5DB`, overflow: 'hidden' }}>
            <button
              onClick={() => setDecoderOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', background: decoderOpen ? BROWN : '#F9FAFB', border: 'none', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: decoderOpen ? 'white' : BROWN }}>Decode this document</div>
                  <div style={{ fontSize: 11, color: decoderOpen ? 'rgba(255,255,255,0.75)' : '#6B7280' }}>Plain English, field by field</div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: decoderOpen ? 'white' : '#9CA3AF' }}>{decoderOpen ? '▲' : '▼'}</span>
            </button>

            {decoderOpen && (
              <div style={{ borderTop: '1px solid #E5E7EB', background: 'white' }}>
                {decoder.map((field, i) => (
                  <div key={i} style={{ padding: '11px 13px', borderBottom: i < decoder.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: BROWN, marginBottom: 3 }}>{field.term}</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.55 }}>{field.plain}</div>
                    {field.watchFor && (
                      <div style={{ marginTop: 5, display: 'flex', gap: 5, padding: '5px 8px', borderRadius: 6, background: '#FFF5F5', border: '1px solid #FECACA' }}>
                        <span style={{ fontSize: 11, flexShrink: 0 }}>👀</span>
                        <span style={{ fontSize: 11, color: '#991B1B', lineHeight: 1.4 }}>{field.watchFor}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── If something goes wrong ── */}
        <div style={{ padding: '11px 13px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔧</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>If something goes wrong</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{move.ifWrong}</div>
          </div>
        </div>

        {/* ── Contacts ── */}
        {move.contacts && move.contacts.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
              Who to contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {move.contacts.map((contact, i) => (
                <ContactCard key={i} contact={contact} moveKey={moveKey} profile={profile} col={col} />
              ))}
            </div>
          </div>
        )}

        {/* ── From a peer ── */}
        <button
          onClick={() => setShowPeer(p => !p)}
          style={{ width: '100%', textAlign: 'left', padding: '11px 13px', borderRadius: 12, background: col.bg, border: `1px solid ${col.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>💬 From a peer</span>
            <span style={{ fontSize: 12, color: col.text }}>{showPeer ? '▲' : '▼'}</span>
          </div>
          {showPeer && (
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55, fontStyle: 'italic', marginTop: 8 }}>{move.peerInsight}</div>
          )}
        </button>

        {/* ── Mark done ── */}
        {!move.done && (
          <button
            onClick={() => onMarkDone(moveKey)}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: allChecked ? '#059669' : RED,
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px',
              transition: 'background 0.3s ease',
            }}
          >
            {allChecked ? 'All steps done — Mark complete ✓' : 'Mark as done ✓'}
          </button>
        )}

      </div>
    </div>
  )
}
