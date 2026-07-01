'use client'

import { useState } from 'react'
import type { Move, Contact } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getGuideAI } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'

const RED    = '#E85028'
const PURPLE = '#8878CC'
const BROWN  = '#5C3D2E'
const DARK   = '#1C1C1C'
const AMBER  = '#C47820'

interface Props {
  moveKey: string
  move: Move
  profile: UserProfile
  onBack: () => void
  onMarkDone: (key: string) => void
  onAskBruno: (prompt: string) => void
  recoveryPath?: string
  onStartRecovery?: (moveKey: string, path: string) => void
}

const categoryIcon: Record<string, string> = {
  enrollment: '🎓', financial: '💰', visa: '🛂',
  housing: '🏠', health: '🏥', academic: '📚',
}

const NEUTRAL = { bg: '#F5F5F5', text: '#1A1A1A', border: '#E5E5E5' }

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  enrollment: NEUTRAL,
  financial:  NEUTRAL,
  visa:       NEUTRAL,
  housing:    NEUTRAL,
  health:     NEUTRAL,
  academic:   NEUTRAL,
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
  emailSubject: string
  emailBody: string
  phoneScript?: string
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

  const name = profile.name || '[Your Name]'
  const email = profile.email || '[your email]'

  return {
    grace: {
      label: '< 48 hours',
      icon: '🟡',
      headline: 'Grace period window. Act in the next hour',
      reality: `Most offices have an informal 24–48 hour grace period that is never advertised. You are still inside this window. The key is to call, not email. Calls get answered immediately and create a human moment that emails cannot.`,
      steps: [
        `Call the relevant office right now. Use the phone script below before you do anything else.`,
        `Have payment / documents ready before you call so you can act immediately if they say yes.`,
        `If they say the deadline passed, ask: "Is there a formal extension request process I can start right now?"`,
        `Follow up with an email the same day summarizing what you discussed and who you spoke with.`,
      ],
      callToAction: 'Open email draft ↓',
      phoneScript: `Hi, my name is ${name} and I'm an incoming student at ${school}. I just realized I missed the ${task} deadline. I wanted to call right away because I'm ready to complete this immediately. Is there any way to still process it today? I have everything ready to go right now.`,
      emailSubject: `URGENT: Missed ${task} deadline. Available to complete today. ${name}`,
      emailBody: `Dear [Office],\n\nMy name is ${name}, and I am an incoming student at ${school}. I just realized I missed the ${task} deadline, and I am reaching out immediately.\n\nI am available right now to complete this if there is any way to process it today. I apologize for the delay. Can you advise on whether there is still a path forward today?\n\nThank you,\n${name}\n${email}`,
    },
    appeal: {
      label: '3 – 14 days',
      icon: '🟠',
      headline: 'Appeal window. Write a strong, honest explanation',
      reality: `${school} almost certainly has a formal deadline extension or appeal process. Offices expect appeals. They have forms for it. The students who do not get extensions are the ones who do not ask. Your job is to explain what happened and show that you are taking it seriously now.`,
      steps: [
        `Send the appeal email below today. Fill in the brackets honestly and specifically.`,
        `Keep your explanation to 2–3 sentences: what happened, when you found out, and that you are ready to act.`,
        `Call the office the next morning to confirm receipt and ask about turnaround time.`,
        `If denied, ask: "Is there a formal appeals committee I can petition?". There often is.`,
      ],
      callToAction: 'Open appeal email draft ↓',
      emailSubject: `Deadline Extension Request. ${name}. [Your Student ID]`,
      emailBody: `Dear [Office],\n\nMy name is ${name}, and I have been admitted to ${school}. I am writing to request a deadline extension for my ${task}.\n\n[In 2–3 sentences: explain what happened and when you discovered the issue. If there were extenuating circumstances. Medical, family, technical. Mention them briefly and offer documentation.]\n\nI am ready to complete the ${task} immediately upon approval and am committed to resolving this as quickly as possible. Please let me know what you need from me.\n\nThank you for considering my request,\n${name}\n${email}`,
    },
    damage: {
      label: '> 2 weeks',
      icon: '🔴',
      headline: 'Damage control. Understand your remaining options',
      reality: `The original ${task} deadline is almost certainly final at this point. But "this deadline" is not necessarily the end of the road. It depends on what the deadline was for. Your goal now is to understand exactly what you have lost and what alternative paths still exist.`,
      steps: [
        `Send the inquiry email below today. The office needs to hear from you directly.`,
        isInt
          ? `For immigration-related tasks, contact the DSO at the International Students Office separately. Some timelines have legal implications.`
          : `If this affects financial aid, ask explicitly whether emergency grants or non-priority funds are still available.`,
        `Document every conversation: save emails, note names and dates of phone calls.`,
        `Once you know the outcome, update your timeline on UniBuddy so dependent tasks reflect the new reality.`,
      ],
      callToAction: 'Open status inquiry email ↓',
      emailSubject: `Missed ${task} deadline. What are my options?. ${name}`,
      emailBody: `Dear [Office],\n\nMy name is ${name}, and I am an incoming student at ${school}. I missed the ${task} deadline and am writing to understand what options remain available to me.\n\nSpecifically, I would like to know:\n  1. What is the consequence of missing this deadline?\n  2. Is there a late penalty vs. Full disqualification?\n  3. Is there any alternative path or next cycle I can pursue?\n\nI understand this is my responsibility. I simply want to know exactly where I stand and what I can still do.\n\nThank you,\n${name}\n${email}`,
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
    { term: 'Cost of Attendance (COA)', plain: 'The school\'s estimate of everything you\'ll spend in one year: tuition, fees, room, board, books, transportation, and personal expenses.', watchFor: 'This is an estimate. Your actual costs may differ, especially for off-campus living.' },
    { term: 'Grants (Federal Pell, Institutional)', plain: 'Free money. You never repay grants. Pell comes from the federal government; institutional grants come from the school.', watchFor: 'Grants are usually renewable each year if you meet satisfactory academic progress requirements.' },
    { term: 'Subsidized Loans', plain: 'Money you borrow where the government pays the interest while you\'re in school. Repayment starts 6 months after you graduate or drop below half-time.', watchFor: 'These are always better than unsubsidized. Accept these first.' },
    { term: 'Unsubsidized Loans', plain: 'Money you borrow where interest starts accumulating immediately, even while you\'re in school. You can let it capitalize (add to principal) or pay it while enrolled.', watchFor: 'The longer you wait to pay interest, the more you\'ll owe overall.' },
    { term: 'Work-Study', plain: 'A part-time campus job allocation. It\'s NOT deposited into your account. You earn it via paychecks from an on-campus job. You must apply for and get a job to access it.', watchFor: 'Apply for work-study jobs as early as possible. Positions fill up fast.' },
    { term: 'Verification Selected', plain: 'The government randomly selected your application to verify the information you provided. You\'ll need to submit additional documents (tax transcripts, etc.) before aid is finalized.' },
  ],
  i20: [
    { term: 'SEVIS ID (N-number)', plain: 'Your unique US immigration tracking number. Starts with "N" followed by 10 digits. This appears on every immigration document you\'ll ever have.', watchFor: 'Must match exactly on your visa application, SEVIS payment, and at the port of entry.' },
    { term: 'Program of Study', plain: 'Your degree level and major as reported to the US government. Must match what you told your consulate.', watchFor: 'If your major changes significantly, your DSO must update your I-20. Don\'t change programs without telling the international office.' },
    { term: 'Program Dates', plain: 'Start and end dates of your authorized stay. Your F-1 status is technically D/S (Duration of Status). You can stay as long as you\'re in valid status, but these dates define your program.', watchFor: 'If you need more time to complete your degree, request a program extension before the end date.' },
    { term: 'Financial Resources', plain: 'Dollar amounts proving you can fund your education. The government requires proof you can cover the full Cost of Attendance for at least one year.', watchFor: 'This is what your consulate officer reviews during your visa interview.' },
    { term: 'English Proficiency', plain: 'How the school verified you can study in English. Usually a test score (TOEFL/IELTS) or a waiver.', watchFor: 'Some programs have conditional English requirements. Check if you have any language course obligations.' },
    { term: 'DSO Signature / School Certification', plain: 'Your Designated School Official\'s signature certifying this is a valid I-20. The school is accepting legal responsibility for your enrollment status.', watchFor: 'An unsigned or expired I-20 is invalid. Do not travel with one.' },
  ],
  sevis: [
    { term: 'I-901 SEVIS Fee Receipt', plain: 'Your proof that you paid the $350 fee that registers you in the Student and Exchange Visitor Information System. You must show this at your visa interview.', watchFor: 'Only pay at fmjfee.com. There are many scam sites that look official.' },
    { term: 'SEVIS ID on Receipt', plain: 'Should exactly match the N-number on your I-20. If they don\'t match, contact your DSO immediately. You may have paid for the wrong record.', watchFor: 'A mismatch will cause your visa application to be rejected.' },
    { term: 'Payment Date', plain: 'Must be before your visa interview date. There is usually a 3 business day processing delay before it appears in the State Department\'s system.', watchFor: 'Don\'t schedule your visa interview for the same day you pay. Wait 3 business days.' },
    { term: 'School Code', plain: 'Your school\'s SEVIS school code (format: NYC214F00XXX). This links your fee payment to your specific I-20 issuing school.', watchFor: 'Verify this matches the code on your I-20.' },
  ],
  healthinsurance: [
    { term: 'Premium', plain: 'The monthly cost of having insurance, regardless of whether you use it. Usually deducted from your student account each semester.', watchFor: 'Student plans are often billed per semester, not per month. Check the total before waiving.' },
    { term: 'Deductible', plain: 'The amount you pay out-of-pocket before insurance starts covering costs. If your deductible is $500, you pay the first $500 of medical bills yourself each year.', watchFor: 'A high-deductible plan is cheaper monthly but risky if you need unexpected care.' },
    { term: 'Copay / Copayment', plain: 'A fixed amount you pay per visit, regardless of the total bill. "Office visit: $25 copay" means you pay $25, insurance pays the rest (after deductible).', watchFor: 'Copays at in-network providers are much lower. Always check before going to a new doctor.' },
    { term: 'In-Network vs. Out-of-Network', plain: 'In-network providers have negotiated rates with your insurance. Out-of-network means you pay much more. Sometimes the full cost.', watchFor: 'Campus health centers and local urgent care clinics are almost always in-network for student plans.' },
    { term: 'Out-of-Pocket Maximum', plain: 'The most you will ever pay in a single year, even if your medical bills are enormous. Once you hit this limit, insurance covers 100%.', watchFor: 'Look at this number when comparing plans. It\'s the worst-case scenario figure.' },
    { term: 'Waiver', plain: 'The process to opt out of the school plan because you already have qualifying insurance (e.g., parent\'s plan). Must be done by the waiver deadline each year.', watchFor: 'Waivers don\'t roll over. You must reapply every academic year.' },
  ],
}

// ── Per-step contextual insight ──────────────────────────────────────────────

function getStepInsight(moveKey: string, stepIndex: number, profile: UserProfile): string | null {
  const school = profile.schoolName || 'your school'
  const isInt  = profile.cohorts?.includes('international')

  const insights: Partial<Record<string, Record<number, string>>> = {
    enrolldeposit: {
      0: `Find the enrollment portal at the school's admissions site. It's often a separate site from where you applied. If you can't find it, search "${school} enrollment deposit portal." Never pay through third-party links.`,
      1: `Screenshot your confirmation page immediately. The portal can take 24 hours to update, but the screenshot proves your payment timestamp. If the portal still shows "pending" after 48 hours, call Admissions directly with your payment reference number.`,
      2: `A confirmation email should arrive within 1–2 hours. If it doesn't appear, check spam first, then call Admissions. Your payment may not have fully processed.`,
    },
    fafsa: {
      0: `Your FSA ID is your lifelong federal student aid credential. Use a personal email. Not a school email. Because you'll need this account for loan repayment after graduation. Store the credentials somewhere permanent.`,
      1: `Use the IRS Direct Data Exchange option. It takes 30 seconds to authorize and automatically pulls your tax figures. This eliminates the #1 source of FAFSA errors (mistyped tax amounts) and speeds up processing.`,
      2: `Screenshot the confirmation page. FAFSA doesn't send immediate email confirmation. The submission ID on this screen is your proof the application was received.`,
      3: `If "Verification Selected" appears, that's a routine government audit. It's random, not a red flag. Contact ${school}'s Financial Aid office for the exact list of documents they require.`,
    },
    aidaccept: {
      0: `Separate your award letter into two columns: money you never repay (grants, scholarships) vs. Money you must repay (loans). Many award letters bundle them in ways that obscure how much is actually free money.`,
      1: `You are not required to accept the full loan amount. Accept 100% of grants and scholarships, then decide how much of the loan you actually need. You can enter a lower amount before confirming.`,
      2: `After accepting, watch your student account portal for the disbursement date. Aid typically arrives 10 days before the semester starts. If nothing appears by then, contact Financial Aid proactively.`,
    },
    housingdeposit: {
      0: `Your housing portal is usually separate from your enrollment portal. Look for it under a "Housing" or "Residential Life" section in your student account.`,
      1: `Screenshot your payment confirmation and check for a confirmation email within 2 hours. If you don't receive one, call Housing directly to confirm the deposit was processed.`,
    },
    orientation: {
      0: `Orientation registration often opens immediately after your enrollment deposit clears. If you wait more than a few days, the best session dates (shortest wait until course registration opens) may already be full.`,
      1: `Attending orientation lifts your course registration hold. At most schools, you cannot select any classes until you attend. Check when your session's attendees get registration access. It often varies by session date.`,
    },
    i20: {
      0: `Email your DSO directly rather than a general inbox. A subject line like "I-20 Request. [Full Name]. [Student ID]. Arriving [date]" gets responses faster. Include every required document as attachments in this first email to avoid back-and-forth.`,
      1: `The moment your I-20 arrives, verify three things: (1) your name spelling matches your passport exactly, (2) your SEVIS ID starts with N and has exactly 10 digits, (3) your program start date is correct. Any error requires a corrected I-20. And that delays your visa.`,
      2: `Save your I-20 as a PDF in cloud storage and print at least two physical copies. You'll need to show it at your visa interview and at the port of entry. Never put it in checked luggage.`,
    },
    sevis: {
      0: `The only legitimate site is fmjfee.com. Search results frequently show fraudulent look-alike sites. The fee is exactly $350 for F-1 students. Your SEVIS ID is the N-number printed on your I-20.`,
      1: `Download your I-901 receipt immediately after payment and print a physical copy. The State Department's system takes 3 business days to reflect your payment. Don't schedule your visa interview for the same week you pay.`,
      2: `Verify that the SEVIS ID on your receipt exactly matches your I-20. A mismatch means you may have paid for the wrong record. Contact ${school}'s international office immediately if the numbers differ.`,
    },
    visaapp: {
      0: `Book your appointment slot before finishing the DS-160 form. Slots at major consulates fill within hours, especially June–August. You can complete the DS-160 after securing a date. Don't lose a slot waiting to finish paperwork.`,
      1: `The DS-160 requires a specific photo format (2"×2", taken within 6 months, white background). Have it ready before you start the form. A rejected photo format forces a form restart.`,
      2: `Prepare specific answers to: "Why this school?", "What will you study?", "What will you do after graduation?", "Who is funding your studies?" Vague or rehearsed-sounding answers raise concern. Be honest, specific, and brief. Aim for 2–3 sentences per answer.`,
    },
    healthinsurance: {
      0: `The waiver deadline is often separate from (and earlier than) the tuition payment deadline. Search "${school} health insurance waiver deadline". It varies by school and changes annually.`,
      1: `If waiving with a parent's plan, call the insurance company and ask specifically: "Is [school city/state] within network for in-network providers?" Some plans have out-of-state restrictions that make them invalid for a school waiver.`,
      2: `Submit your waiver well before the deadline. Many students submit the day before and face technical issues. If your waiver is denied for insufficient coverage, you're enrolled and charged for the full year with no refund option.`,
    },
    credittransfer: {
      0: `Request your official credit evaluation in writing. Ask for a formal letter or PDF, not just the portal display. You'll need this document to build your appeal and track which courses are disputed.`,
      1: `Pull the syllabi from your previous institution for every course you want to appeal. Course names don't matter. Content overlap does. A course called "Data Structures" that covers identical content to ${school}'s equivalent can almost always be reclassified.`,
      2: `Bring your appeal directly to the relevant department chair, not to the registrar or front desk staff. Faculty have authority to approve equivalencies that administrative staff cannot. The registrar processes decisions. They don't make them.`,
    },
  }

  return insights[moveKey]?.[stepIndex] ?? null
}

// ── What-if scenario cards ────────────────────────────────────────────────────

interface WhatIfCard {
  domain: string
  impact: string
  bg: string
  border: string
  color: string
}

function getWhatIfCards(moveKey: string, move: Move, profile: UserProfile): WhatIfCard[] {
  const isInt      = profile.cohorts?.includes('international')
  const isTransfer = profile.cohorts?.includes('transfer')
  const isFirstGen = profile.cohorts?.includes('firstgen') || profile.cohorts?.includes('lowincome')
  const school     = profile.schoolName || 'your school'

  const academic  = { domain: 'Academic',    bg: '#F4F2FC', border: '#DDD8F0', color: PURPLE }
  const financial = { domain: 'Financial',   bg: '#FFFBEB', border: '#FDE68A', color: AMBER  }
  const intl      = { domain: 'Immigration', bg: '#FFF0F0', border: '#FECACA', color: RED    }

  const maps: Partial<Record<string, WhatIfCard[]>> = {
    enrolldeposit: [
      { ...financial, impact: `${school} will release your spot to the waitlist. Your admission letter becomes void. Reapplying means going through the full cycle again. Including competing against a new applicant pool.` },
      { ...academic,  impact: `You lose your class year placement, any merit scholarship tied to your admitted cohort, and your academic advising assignment.` },
      ...(isInt ? [{ ...intl, impact: `Without active enrollment, your DSO cannot issue an I-20. No I-20 means no visa interview, no F-1 status, and no legal path to study.` }] : []),
    ],
    fafsa: [
      { ...financial, impact: `Missing ${school}'s priority deadline (not the federal June 30 deadline) often means losing $5,000–$20,000+ in institutional grants annually. This money goes to early filers and does not roll over.` },
      ...(isFirstGen ? [{ ...academic, impact: `Some institutional scholarships for first-generation students require a FAFSA on file by a specific date. A late filing can disqualify you from funds you otherwise qualified for.` }] : []),
    ],
    aidaccept: [
      { ...financial, impact: `Unaccepted grants and scholarships can expire after the acceptance deadline passes. Schools typically hold them for 2–4 weeks. After that, funds may be reallocated to other students.` },
      { ...academic,  impact: `An unresolved balance on your student account can block course registration for future semesters, creating a cascading delay in your academic progress.` },
    ],
    housingdeposit: [
      { ...academic, impact: `Later deposits mean a lower queue position. You may get a less desirable building, a less favorable room type, or no on-campus housing at all if capacity fills. Forcing you to find off-campus housing on short notice.` },
      ...(isInt ? [{ ...intl, impact: `International students who delay housing often end up in off-campus arrangements. Which requires coordinating a lease before arriving in country, with no guaranteed room access on arrival day.` }] : []),
    ],
    orientation: [
      { ...academic, impact: `Without orientation, your course registration hold stays active. You cannot select any classes. Waiting means small seminars, popular professors, and desirable time slots fill before you get access.` },
      ...(isInt ? [{ ...intl, impact: `International Student Orientation includes mandatory I-20 check-in and SEVIS status reporting steps. Missing it can create unreported status gaps in the federal immigration system.` }] : []),
    ],
    i20: [
      { ...intl,     impact: `Without an I-20, you cannot pay your SEVIS fee, schedule a visa interview, or enter the US on F-1 status. Every day of delay directly shortens your timeline for correcting any errors before arrival.` },
      { ...academic, impact: `I-20 processing takes 3–10 business days. Late requests leave no buffer for fixing errors. A single name mismatch with your passport requires a corrected I-20, which delays your visa appointment.` },
    ],
    sevis: [
      { ...intl, impact: `The State Department's system takes 3 business days to process SEVIS payments. Paying late means you cannot attend your visa interview until the processing clears. Which can push your interview past available slots.` },
    ],
    visaapp: [
      { ...intl,     impact: `Peak season (June–August) visa appointment slots at major consulates fill 60–90 days in advance. Delaying risks no available slots before your program start date. Which means missing the first semester.` },
      { ...academic, impact: `Without a visa, you cannot arrive on time for International Student Orientation or the semester start. Late arrival may forfeit on-campus housing and limit course enrollment options.` },
    ],
    healthinsurance: [
      { ...financial, impact: `Missing the waiver deadline means you're enrolled in the school plan and charged the full annual premium ($1,500–$3,000+) with no refund option. Even if you have qualifying coverage elsewhere.` },
    ],
    credittransfer: [
      { ...academic,  impact: `After your first semester, credit appeals require Dean-level approval and are rarely granted. You may be required to retake courses you've already completed, adding extra semesters to your degree.` },
      ...(isTransfer ? [{ ...financial, impact: `Unnecessary repeated courses mean additional tuition. For transfer students, this can mean $10,000–$40,000 extra in costs depending on the school.` }] : []),
    ],
  }

  return maps[moveKey] ?? [
    { ...academic, impact: move.consequence },
  ]
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
    enrolldeposit: `As an ${cohortLabel} at ${school}, pay your deposit the same day you decide. Not "later this week." Seats and housing priority are assigned in real time. Once you pay, take a screenshot of the confirmation page (not just the email) and save it. If the portal shows "pending" after 24 hours, call Admissions directly. Do not wait for an email to resolve itself.`,
    fafsa: `For ${school}: FAFSA opens October 1st for the following academic year. Filing in October vs. February can mean the difference between $15,000 in grants and $5,000. Most institutional money goes to early filers. Use the IRS Direct Data Exchange to pull in tax info automatically, it takes 30 seconds and eliminates the #1 source of errors. If your family\'s income changed significantly from the tax year used, file first and then contact the Financial Aid office about a professional judgment review.`,
    aidaccept: `When reviewing your ${school} award letter, separate the offer into two columns: money you don\'t repay (grants, scholarships) vs. Money you do (loans). Most students over-focus on the total package number and miss that $8k of it might be loans. If you\'re comparing offers from multiple schools, use the actual net cost. COA minus grants and scholarships only. ${isInt ? 'International students: check whether aid is renewable and what the GPA/credit requirements are each year.' : 'Ask explicitly whether your merit scholarship is renewable and what the renewal criteria are.'}`,
    housingdeposit: `At ${school}, the housing queue typically works on deposit timestamp. The earlier you pay, the more room/building options you get. ${isInt ? 'As an international student, submit your housing deposit before your visa is confirmed if possible. Most schools hold your assignment and release it if you can\'t enroll. Do not wait for visa approval to pay.' : ''} When you get to select rooms, avoid choosing based solely on the floor plan. Read student reviews for the specific building. AC, laundry location, and distance to campus matter more than square footage.`,
    orientation: `${school} likely has a separate ${isInt ? 'International Student Orientation that is required and separate from general orientation.' : isTransfer ? 'transfer orientation that covers different ground than first-year orientation.' : 'new student orientation.'} Attend both if there are two. The most valuable part isn\'t the sessions. It\'s meeting your academic advisor and getting your class registration hold lifted. Find out exactly when advising appointments open and book one immediately. Registration order matters for getting into required courses.`,
    i20: `Your I-20 is the most important document in your F-1 student life. Get it early. DSO processing times vary from 3 days to 3 weeks depending on ${school}\'s office. After you receive it, verify three things immediately: (1) your name spelling exactly matches your passport, (2) your SEVIS ID starts with N and is 10 digits, (3) your program start date is correct. Any error requires a corrected I-20 before you can get a visa. Catching it now saves weeks later.`,
    sevis: `Pay your SEVIS fee only at fmjfee.com. There are dozens of scam sites. After paying, download and save your I-901 receipt as a PDF. The State Department\'s system takes 3 business days to reflect payment, so don\'t schedule your visa interview until after that window. At your interview, bring your printed I-901 receipt alongside your I-20. some consulates ask for it physically even if it\'s in their system. ${school}\'s international office can confirm your payment was processed correctly.`,
    visaapp: `The single best way to prepare for your F-1 visa interview is to be able to explain your specific program at ${school} in 2–3 clear sentences. Officers are checking whether you have genuine academic intent and ties to your home country. Common questions: "Why this school?", "What will you do after graduation?", "Who is funding your studies?" Prepare honest, specific answers. Vague answers raise flags. Bring every document in an organized folder. If you get a 221(g) administrative processing notice, that\'s normal. It\'s not a denial. Contact ${school}\'s international office and wait.`,
    healthinsurance: `${school}\'s student health plan is usually better than it looks on paper for campus services. The campus health center is often free or very low copay with the school plan. Before waiving, check whether your current coverage (parent\'s plan, home country coverage) is actually accepted by US providers in ${school}\'s area. Home country insurance typically doesn\'t work in the US. ${isInt ? 'International students: many consulates technically require health insurance for your visa. The school plan satisfies this requirement automatically.' : ''} The waiver deadline is strict. Missing it means you\'re enrolled and charged for the full year.`,
    credittransfer: `Transfer credit evaluations at ${school} are almost always negotiable, but the window is narrow. Most schools only accept appeals in the first semester. Get your official evaluation in writing, then identify every course you believe was mis-classified. Pull the syllabi from your previous institution and write one paragraph per course explaining the content overlap with ${school}\'s equivalent requirement. Bring this to a meeting with your academic advisor, not just the registrar. Faculty can sometimes approve equivalencies that the registrar can\'t.`,
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
      subject: `Enrollment Deposit Confirmation. ${name}`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school} for the upcoming academic year. I am writing to confirm my enrollment and to ask about the deposit process.

I would like to:
  1. Confirm the deposit deadline and exact amount
  2. Verify that my portal is showing the correct status after payment
  3. Understand what unlocks next (housing, orientation, etc.)

Could you confirm that my record is in order once I complete payment? Please let me know if there are any additional steps I should take.

Thank you,
${name}
Admitted Student. ${school}
${profile.email || '[your email]'}`,
    },

    fafsa: {
      subject: `FAFSA Status Inquiry. ${name}. [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school}. I am writing regarding my FAFSA submission and would like to confirm:

  1. That my FAFSA has been received and linked to my account
  2. Your priority deadline for institutional grant consideration
  3. Whether I have been selected for verification (and what documents are needed)

I want to make sure I do not miss any institutional aid windows. Please let me know my current status and any action items on my end.

Thank you,
${name}
Admitted Student. ${school}
${profile.email || '[your email]'}`,
    },

    aidaccept: {
      subject: `Financial Aid Package Question. ${name}. [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school}. I have reviewed my financial aid award letter and have a few questions before I finalize my acceptance:

  1. Can you confirm the deadline to accept my award?
  2. I would like to understand the difference between the grants, scholarships, and loans listed. Specifically which are "free money" vs. Which I will need to repay.
  3. Am I required to accept the full loan amount, or can I accept a partial amount?

I want to make a careful, informed decision. Thank you for your time.

${name}
${profile.email || '[your email]'}`,
    },

    housingdeposit: {
      subject: `Housing Deposit Inquiry. ${name}. [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}${profile.cohorts.includes('international') ? ' (international student)' : ''}. I am writing about the on-campus housing deposit process.

I would like to confirm:
  1. The exact deadline to submit my housing deposit to maintain queue priority
  2. Whether I can apply before my${profile.cohorts.includes('international') ? ' visa is confirmed' : ' enrollment is finalized'}
  3. The cancellation policy if my plans change

Please let me know if there are any forms I need to complete alongside the deposit.

Thank you,
${name}
Incoming Student. ${school}
${profile.email || '[your email]'}`,
    },

    orientation: {
      subject: `Orientation Registration. ${name}. [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}${profile.cohorts.includes('international') ? ' (international student)' : profile.cohorts.includes('transfer') ? ' (transfer student)' : ''}. I am writing to confirm my orientation registration.

I have a few questions:
  1. ${profile.cohorts.includes('international') ? 'I understand there is a separate International Student Orientation. Should I attend both?' : 'Which orientation session is recommended for my start date?'}
  2. Are there any pre-orientation tasks (immunization records, placement tests) I should complete first?
  3. When does course registration open relative to orientation?

Thank you for your guidance.

${name}
${profile.email || '[your email]'}`,
    },

    i20: {
      subject: `I-20 Request. ${name}. [Student ID]. Arriving [Date]`,
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
      subject: `SEVIS Fee Payment Issue. ${name}. SEVIS ID: [N-XXXXXXXXXX]`,
      body: `Dear ${contact.office},

My name is ${name}, an incoming F-1 student at ${school}. I am writing regarding an issue with my SEVIS fee payment.

[Describe your specific issue. E.g.:]
  • I believe I may have paid on an unofficial site. My SEVIS ID is [N-XXXXXXXXXX] and I paid on [date].
  • The fmjfee.com website is not reflecting my payment after 3 business days.
  • I need to confirm my I-901 receipt is valid before my visa interview on [date].

I would appreciate any guidance or documentation you can provide to support my case.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    visaapp: {
      subject: `F-1 Visa Application Support. ${name}`,
      body: `Dear ${contact.office},

My name is ${name}, an incoming F-1 student at ${school} from ${profile.country || '[your country]'}. I am in the process of completing my visa application and have a question.

[Describe your specific question. E.g.:]
  • I am preparing for my visa interview on [date] and want to confirm I have all required documents.
  • My visa appointment is scheduled but I have a question about my DS-160 application.
  • I received a visa denial and am seeking guidance on next steps before reapplying.

Attached: I-20 from ${school} (for context).

Thank you for your support,
${name}
${profile.email || '[your email]'}`,
    },

    healthinsurance: {
      subject: `Health Insurance Waiver Request. ${name}. [Student ID]`,
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
      subject: `Transfer Credit Appeal. ${name}. [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming transfer student at ${school}. I have reviewed my official credit evaluation and would like to appeal the classification of several courses that I believe should satisfy degree requirements rather than counting as general electives.

Courses I am appealing:
  • [Course name] → should satisfy [requirement]
  • [Course name] → should satisfy [requirement]

I have attached the syllabi for each course, which demonstrate the content overlap with your equivalent requirements.

I understand that appeals must be filed within the first semester. I wanted to begin this process proactively and would welcome a brief meeting to discuss.

Thank you for your consideration,
${name}
Transfer Student. ${school}
${profile.email || '[your email]'}`,
    },
  }

  return templates[moveKey] ?? {
    subject: `Question about ${moveKey}. ${name}`,
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
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{contact.office}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{contact.role}</div>
            <a
              href={`mailto:${resolvedEmail}`}
              style={{ fontSize: 11, color: col.text, fontWeight: 600, fontFamily: 'monospace', marginTop: 5, display: 'block', textDecoration: 'none', wordBreak: 'break-all' }}
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
            style={{ flexShrink: 0, padding: '6px 10px', borderRadius: 8, background: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
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

// ── Recovery action panel (email draft + phone script) ───────────────────────

function RecoveryActionPanel({ guide, accent }: { guide: RecoveryGuide; accent: string }) {
  const [showEmail, setShowEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copied, setCopied] = useState<'subject' | 'body' | 'all' | null>(null)

  const copyPhone = () => {
    if (!guide.phoneScript) return
    navigator.clipboard.writeText(guide.phoneScript).then(() => {
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    })
  }

  const copyEmail = (type: 'subject' | 'body' | 'all') => {
    const text = type === 'subject' ? guide.emailSubject
      : type === 'body' ? guide.emailBody
      : `Subject: ${guide.emailSubject}\n\n${guide.emailBody}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const accentLight = accent === AMBER ? '#FFF8EC' : accent === RED ? '#FFF5F5' : '#F5F3FF'
  const accentBorder = accent === AMBER ? '#FDE68A' : accent === RED ? '#FECACA' : '#DDD6FE'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: 'uppercase' as const, letterSpacing: '0.7px' }}>
        Ready-to-use tools
      </div>

      {/* Phone script (grace period only) */}
      {guide.phoneScript && (
        <div style={{ borderRadius: 10, border: `1.5px solid ${accentBorder}`, overflow: 'hidden', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: accentLight, borderBottom: `1px solid ${accentBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14 }}>📞</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>Call script. Read this word for word</span>
            </div>
            <button
              onClick={copyPhone}
              style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 6, background: accent, border: 'none', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              {copiedPhone ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div style={{ padding: '10px 12px', fontSize: 12, color: '#374151', lineHeight: 1.65, fontStyle: 'italic' }}>
            &ldquo;{guide.phoneScript}&rdquo;
          </div>
        </div>
      )}

      {/* Email draft */}
      <div style={{ borderRadius: 10, border: `1.5px solid ${accentBorder}`, overflow: 'hidden', background: 'white' }}>
        <button
          onClick={() => setShowEmail(v => !v)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: accentLight, border: 'none', cursor: 'pointer', textAlign: 'left' as const }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 14 }}>✉</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>Recovery email draft. Ready to send</span>
          </div>
          <span style={{ fontSize: 11, color: accent, fontWeight: 700 }}>{showEmail ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showEmail && (
          <div style={{ borderTop: `1px solid ${accentBorder}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {/* Subject */}
            <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Subject</span>
                <button onClick={() => copyEmail('subject')} style={{ fontSize: 10, fontWeight: 700, color: accent, border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, background: accentLight }}>
                  {copied === 'subject' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '7px 10px', fontSize: 11, fontFamily: 'monospace', color: '#1E293B', lineHeight: 1.5 }}>
                {guide.emailSubject}
              </div>
            </div>

            {/* Body */}
            <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Body</span>
                <button onClick={() => copyEmail('body')} style={{ fontSize: 10, fontWeight: 700, color: accent, background: accentLight, border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>
                  {copied === 'body' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '9px 10px', fontSize: 11, fontFamily: 'monospace', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' as const, maxHeight: 160, overflowY: 'auto' as const }}>
                {guide.emailBody}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 7 }}>
              <button
                onClick={() => copyEmail('all')}
                style={{ flex: 1, padding: '9px', borderRadius: 9, background: copied === 'all' ? '#059669' : accent, border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                {copied === 'all' ? '✓ Copied everything' : 'Copy full email'}
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent(guide.emailSubject)}&body=${encodeURIComponent(guide.emailBody)}`}
                style={{ padding: '9px 12px', borderRadius: 9, background: 'white', border: `1.5px solid ${accentBorder}`, color: accent, fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' as const }}
              >
                Open in Mail ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Recovery steps view (after starting a plan) ──────────────────────────────

function RecoveryStepsView({ guide, onMarkDone }: { guide: RecoveryGuide; onMarkDone: () => void }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const toggle = (i: number) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))
  const checkedCount = Object.values(checked).filter(Boolean).length
  const allChecked = checkedCount === guide.steps.length
  const pct = guide.steps.length > 0 ? (checkedCount / guide.steps.length) * 100 : 0

  return (
    <div style={{ borderRadius: 14, border: `2px solid ${AMBER}`, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', background: AMBER }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '1px', textTransform: 'uppercase' as const, marginBottom: 3 }}>Recovery plan in progress</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{guide.headline}</div>
        <div style={{ marginTop: 9, height: 3, borderRadius: 2, background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'white', width: `${pct}%`, transition: 'width 0.25s ease' }} />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{checkedCount} of {guide.steps.length} steps done</div>
      </div>

      <div style={{ padding: '12px 14px', background: '#FFF8EC' }}>
        <p style={{ margin: '0 0 11px', fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{guide.reality}</p>

        {/* Action tools. Email + phone script */}
        <div style={{ marginBottom: 14 }}>
          <RecoveryActionPanel guide={guide} accent={AMBER} />
        </div>

        <div style={{ fontSize: 10, fontWeight: 800, color: AMBER, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
          Action steps
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {guide.steps.map((step, i) => {
            const done = !!checked[i]
            return (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: done ? '#FFF0D0' : 'white', border: `1.5px solid ${done ? AMBER : '#E5E7EB'}` }}>
                <button
                  onClick={() => toggle(i)}
                  style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? AMBER : '#D1D5DB'}`, background: done ? AMBER : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                >
                  {done && <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: done ? '#9CA3AF' : DARK, lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none' }}>
                      {step}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {allChecked && (
          <button
            onClick={onMarkDone}
            style={{ marginTop: 12, width: '100%', padding: '13px', borderRadius: 12, background: '#059669', border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
          >
            Recovery complete. Mark task done ✓
          </button>
        )}
      </div>
    </div>
  )
}

// ── Recovery triage block ────────────────────────────────────────────────────

function RecoveryBlock({ moveKey, move, profile, onStartRecovery }: { moveKey: string; move: Move; profile: UserProfile; onStartRecovery: (path: RecoveryPath) => void }) {
  const [selected, setSelected] = useState<RecoveryPath | null>(null)
  const overdueDays = move.daysUntil !== null ? Math.abs(move.daysUntil) : 0
  const guides = getRecoveryGuides(moveKey, profile)

  const triageIcons: Record<RecoveryPath, React.ReactNode> = {
    grace: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.8"/>
        <circle cx="11" cy="11" r="1.5" fill="#F59E0B"/>
        <path d="M11 7v4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M11 11l2.5 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    appeal: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="2" width="14" height="18" rx="2.5" fill="#EDE9FB" stroke={PURPLE} strokeWidth="1.8"/>
        <path d="M7.5 7.5h7M7.5 11h7M7.5 14.5h4.5" stroke={PURPLE} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    damage: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L3 5.5v5.2C3 15.4 6.5 19.5 11 21c4.5-1.5 8-5.6 8-10.3V5.5L11 2z" fill="#FEE2E2" stroke={RED} strokeWidth="1.8"/>
        <path d="M11 8v4" stroke={RED} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="11" cy="14.5" r="1" fill={RED}/>
      </svg>
    ),
  }

  const options: { path: RecoveryPath; label: string; hint: string }[] = [
    { path: 'grace',  label: 'Less than 48 hours',  hint: 'Grace period window' },
    { path: 'appeal', label: '3 – 14 days ago',     hint: 'Appeal territory' },
    { path: 'damage', label: 'More than 2 weeks',   hint: 'Damage control' },
  ]

  const active = selected ? guides[selected] : null

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', background: 'white' }}>

      {/* Header — dark with red day-count badge */}
      <div style={{ padding: '14px 16px', background: DARK, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: RED, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'white', lineHeight: 1 }}>{overdueDays}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {overdueDays !== 1 ? 'days' : 'day'}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.2px' }}>
            This task is overdue
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            Select when the deadline passed
          </div>
        </div>
      </div>

      {/* Question label */}
      <div style={{ padding: '12px 16px 6px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.6px' }}>
        When did the deadline pass?
      </div>

      {/* Triage list */}
      {options.map((opt, idx) => (
        <div key={opt.path}>
          <button
            onClick={() => setSelected(s => s === opt.path ? null : opt.path)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderLeft: `3px solid ${selected === opt.path ? RED : 'transparent'}`,
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: selected === opt.path ? '#FFF5F5' : '#F4F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
              {triageIcons[opt.path]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: DARK, letterSpacing: '-0.2px' }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{opt.hint}</div>
            </div>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0, transform: selected === opt.path ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
              <path d="M1 1l4 4-4 4" stroke={selected === opt.path ? RED : '#D1D5DB'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Expanded recovery guide */}
          {selected === opt.path && active && (
            <div style={{ margin: '0 12px 10px', borderRadius: 12, background: '#F9FAFB', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #EFEFEF' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: DARK }}>{active.headline}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>{active.reality}</div>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <RecoveryActionPanel guide={active} accent={RED} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
                    Step-by-step plan
                  </div>
                  {active.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: DARK, color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onStartRecovery(selected!)}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, background: DARK, border: 'none', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: '-0.2px' }}
                >
                  Track my recovery progress →
                </button>
              </div>
            </div>
          )}

          {idx < options.length - 1 && (
            <div style={{ margin: '0 16px', height: 1, background: '#F3F4F6' }} />
          )}
        </div>
      ))}

      <div style={{ height: 8 }} />
    </div>
  )
}

// ── Bruno prompt builder ──────────────────────────────────────────────────────

interface Q1Data { question: string; options: string[] }

const q1Data: Record<string, Q1Data> = {
  enrolldeposit:  { question: 'What part of the enrollment deposit are you working on?', options: ['Finding where to pay', 'Payment declined or errored', 'Portal not updating after payment', 'Not sure of the deadline or amount', 'Something else'] },
  fafsa:          { question: 'What part of the FAFSA are you working on?', options: ['Creating my FSA ID / logging in', 'Filling out the application questions', 'Linking my tax information', 'Checking if my submission went through', 'Understanding my Student Aid Index', 'Something else'] },
  aidaccept:      { question: 'What part of accepting your aid are you stuck on?', options: ['Finding the accept/decline option in my portal', 'Understanding what each item in my award means', 'Deciding whether to take out loans', 'The deadline to respond', 'Something else'] },
  housingdeposit: { question: 'What part of the housing deposit are you stuck on?', options: ['Finding where to pay', 'Not sure when to pay vs. Visa timeline', 'Deposit paid but no confirmation', 'Understanding the cancellation policy', 'Something else'] },
  orientation:    { question: 'What part of orientation are you stuck on?', options: ['Registering for a session', 'International vs. General orientation difference', 'Pre-orientation requirements', 'When course registration opens', 'Something else'] },
  i20:            { question: 'What part of the I-20 request are you stuck on?', options: ['What documents to attach to my email', 'Writing or sending the request email', 'Following up. School has not responded', 'My I-20 has an error on it', 'Something else'] },
  sevis:          { question: 'What part of the SEVIS fee are you stuck on?', options: ['Finding the official payment site', 'Entering my SEVIS ID correctly', 'Payment failed or was declined', 'Confirming my receipt is valid', 'Worried I paid the wrong site', 'Something else'] },
  visaapp:        { question: 'What part of the visa application are you stuck on?', options: ['Scheduling my interview appointment', 'Completing the DS-160 form', 'Preparing documents for the interview', 'My visa was denied or put on hold', 'Something else'] },
  healthinsurance:{ question: 'What part of health insurance are you stuck on?', options: ['Understanding my plan options', 'How to submit a waiver', 'Checking if my current coverage qualifies to waive', 'Finding the waiver deadline', 'Something else'] },
  credittransfer: { question: 'What part of the credit transfer are you stuck on?', options: ['Reading my official evaluation', 'Identifying which courses to appeal', 'Writing the appeal letter', 'Escalating after a denial', 'Something else'] },
}

const q2Data = {
  question: 'What kind of help do you need?',
  options: ['Walk me through what to do step by step', 'I hit an error or problem I cannot solve', 'I completed it but need to check I did it right', 'This is urgent. My deadline is very soon'],
}

function assemblePrompt(moveKey: string, move: Move, profile: UserProfile, q1: string, q2: string): string {
  const school   = profile.schoolName || 'my school'
  const isInt    = profile.cohorts?.includes('international')
  const isTransfer = profile.cohorts?.includes('transfer')
  const cohort   = isInt ? 'international' : isTransfer ? 'transfer' : 'incoming'

  const helpMap: Record<string, string> = {
    'Walk me through what to do step by step': 'Can you walk me through exactly what to do?',
    'I hit an error or problem I cannot solve': 'I ran into a specific problem and need help troubleshooting it.',
    'I completed it but need to check I did it right': 'I think I finished this step but I want to make sure I did it correctly.',
    'This is urgent. My deadline is very soon': 'This is urgent. My deadline is very soon and I need clear, actionable guidance right now.',
  }

  const helpText = helpMap[q2] ?? q2

  return `I'm a${isInt ? 'n' : ''} ${cohort} student at ${school} working on ${move.title.toLowerCase()}. Specifically, I'm stuck on: "${q1}". ${helpText}`
}

function BrunoPromptBuilder({ moveKey, move, profile, onSubmit, onDismiss }: {
  moveKey: string
  move: Move
  profile: UserProfile
  onSubmit: (prompt: string) => void
  onDismiss: () => void
}) {
  const q1 = q1Data[moveKey] ?? { question: `What part of "${move.title}" are you stuck on?`, options: ['Understanding what to do', 'A technical issue or error', 'Not sure if I did it right', 'Something else'] }

  type Step = 'q1' | 'q2' | 'preview'
  const [step, setStep]       = useState<Step>('q1')
  const [q1Answer, setQ1]     = useState('')
  const [q2Answer, setQ2]     = useState('')
  const [editedPrompt, setEditedPrompt] = useState('')

  const selectQ1 = (opt: string) => { setQ1(opt); setStep('q2') }
  const selectQ2 = (opt: string) => {
    setQ2(opt)
    setEditedPrompt(assemblePrompt(moveKey, move, profile, q1Answer, opt))
    setStep('preview')
  }

  const stepNum  = step === 'q1' ? 1 : step === 'q2' ? 2 : 3
  const stepPct  = (stepNum / 3) * 100

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{ position: 'absolute', inset: 0, background: 'rgba(78,54,41,0.45)', zIndex: 20 }}
      />

      {/* Sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, borderRadius: '20px 20px 0 0', background: 'white', overflow: 'hidden' }}>

        {/* Sheet header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BuddyAvatar mood="thinking" size={28} />
              <span style={{ fontSize: 13, fontWeight: 800, color: BROWN }}>
                {step === 'preview' ? 'Your question is ready' : `Question ${stepNum} of 2`}
              </span>
            </div>
            <button onClick={onDismiss} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', fontSize: 14, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: RED, width: `${stepPct}%`, transition: 'width 0.25s ease' }} />
          </div>
        </div>

        <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Q1 */}
          {step === 'q1' && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: BROWN, lineHeight: 1.4, marginBottom: 2 }}>{q1.question}</div>
              {q1.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectQ1(opt)}
                  style={{ width: '100%', textAlign: 'left', padding: '11px 13px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 13, color: BROWN, fontWeight: 500, cursor: 'pointer' }}
                >
                  {opt}
                </button>
              ))}
            </>
          )}

          {/* Q2 */}
          {step === 'q2' && (
            <>
              <div style={{ padding: '8px 10px', borderRadius: 8, background: '#FFF5F5', border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 11, color: '#6B7280' }}>You said:</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: BROWN, marginTop: 2 }}>{q1Answer}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BROWN, lineHeight: 1.4, marginBottom: 2 }}>{q2Data.question}</div>
              {q2Data.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectQ2(opt)}
                  style={{ width: '100%', textAlign: 'left', padding: '11px 13px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 13, color: BROWN, fontWeight: 500, cursor: 'pointer' }}
                >
                  {opt}
                </button>
              ))}
              <button
                onClick={() => setStep('q1')}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer', textAlign: 'left', padding: '2px 0' }}
              >
                ← Back
              </button>
            </>
          )}

          {/* Preview */}
          {step === 'preview' && (
            <>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                Bruno will see this question. Edit it if you want, then send.
              </div>
              <textarea
                value={editedPrompt}
                onChange={e => setEditedPrompt(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: `1.5px solid #FECACA`, fontSize: 13, color: BROWN, lineHeight: 1.6, fontFamily: 'inherit', resize: 'none', outline: 'none', background: '#FFF5F5', boxSizing: 'border-box' }}
              />
              <button
                onClick={() => onSubmit(editedPrompt)}
                style={{ width: '100%', padding: '13px', borderRadius: 12, background: RED, border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
              >
                Send to Bruno →
              </button>
              <button
                onClick={() => { setStep('q1'); setQ1(''); setQ2('') }}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#9CA3AF', cursor: 'pointer', textAlign: 'center' }}
              >
                Start over
              </button>
            </>
          )}

        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GuideDetail({ moveKey, move, profile, onBack, onMarkDone, onAskBruno, recoveryPath, onStartRecovery }: Props) {
  const [checkedSteps,     setCheckedSteps]     = useState<Record<number, boolean>>({})
  const [decoderOpen,      setDecoderOpen]      = useState(false)
  const [showPeer,         setShowPeer]         = useState(false)
  const [showBuilder,      setShowBuilder]      = useState(false)
  const [expandedInsight,  setExpandedInsight]  = useState<number | null>(null)
  const [showWhatIf,       setShowWhatIf]       = useState(false)

  const col     = categoryColor[move.category] || categoryColor.enrollment
  const overdue = !move.done && move.daysUntil !== null && move.daysUntil < 0
  const decoder = docDecoder[moveKey]
  const inRecovery = !!recoveryPath
  const recoveryGuide = inRecovery ? getRecoveryGuides(moveKey, profile)[recoveryPath as RecoveryPath] : null

  const toggleStep = (i: number) =>
    setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }))

  const checkedCount = Object.values(checkedSteps).filter(Boolean).length
  const allChecked   = checkedCount === move.steps.length

  return (
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
    {showBuilder && (
      <BrunoPromptBuilder
        moveKey={moveKey}
        move={move}
        profile={profile}
        onSubmit={(prompt) => { setShowBuilder(false); onAskBruno(prompt) }}
        onDismiss={() => setShowBuilder(false)}
      />
    )}
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Sticky header */}
      <div style={{ padding: '10px 18px 14px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#F8F7F6', position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Back button. Icon only */}
        <button
          onClick={onBack}
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(28,28,28,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
        >
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M8 1L1.5 7.5 8 14" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Title row */}
        <div style={{ fontSize: 26, fontWeight: 900, color: DARK, lineHeight: 1.15, letterSpacing: '-0.7px', marginBottom: 10 }}>{move.title}</div>

        {/* Meta badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: !move.done ? 12 : 0, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#F0EEF9', border: '1px solid #DDD8F0', fontSize: 11, fontWeight: 700, color: PURPLE }}>
            <span>{categoryIcon[move.category]}</span>
            <span style={{ textTransform: 'capitalize' }}>{move.category}</span>
          </span>
          {overdue && move.daysUntil !== null && !inRecovery && (
            <span style={{ padding: '4px 10px', borderRadius: 20, background: RED, color: 'white', fontSize: 11, fontWeight: 700 }}>
              {Math.abs(move.daysUntil)}d overdue
            </span>
          )}
          {inRecovery && (
            <span style={{ padding: '4px 10px', borderRadius: 20, background: AMBER, color: 'white', fontSize: 11, fontWeight: 700 }}>
              ● In Recovery
            </span>
          )}
          {!overdue && !move.done && move.daysUntil !== null && (
            <span style={{ padding: '4px 10px', borderRadius: 20, background: move.daysUntil <= 7 ? '#FEE2E2' : '#EDE9FB', color: move.daysUntil <= 7 ? RED : PURPLE, fontSize: 11, fontWeight: 700 }}>
              {move.daysUntil === 0 ? 'Due today' : `${move.daysUntil}d left`}
            </span>
          )}
          {move.done && (
            <span style={{ padding: '4px 10px', borderRadius: 20, background: '#D1FAE5', color: '#059669', fontSize: 11, fontWeight: 700 }}>
              Completed ✓
            </span>
          )}
        </div>

        {!move.done && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Progress</span>
              <span style={{ fontSize: 11, color: PURPLE, fontWeight: 700 }}>{checkedCount} / {move.steps.length}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#E8E4F8', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: PURPLE, width: `${(checkedCount / move.steps.length) * 100}%`, transition: 'width 0.25s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Recovery (overdue only) ── */}
        {overdue && inRecovery && recoveryGuide && (
          <RecoveryStepsView guide={recoveryGuide} onMarkDone={() => onMarkDone(moveKey)} />
        )}
        {overdue && !inRecovery && (
          <RecoveryBlock moveKey={moveKey} move={move} profile={profile} onStartRecovery={(path) => onStartRecovery?.(moveKey, path)} />
        )}

        {/* ── Consequence (non-overdue, non-done) ── */}
        {!move.done && !overdue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14, background: 'white', border: '1px solid #FECACA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" fill="#FEE2E2" stroke={RED} strokeWidth="1.5"/>
              <path d="M8 5v3.5" stroke={RED} strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="8" cy="11" r="0.9" fill={RED}/>
            </svg>
            <span style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.4 }}>If missed: <strong>{move.consequence}</strong></span>
          </div>
        )}

        {/* ── Have ready ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 5px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', marginBottom: 11 }}>Have ready</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {move.gather.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: '#F4F2FC', border: '1px solid #DDD8F0', fontSize: 12, fontWeight: 600, color: PURPLE }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ── Steps + per-step contextual AI ── */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 5px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', marginBottom: 12 }}>Steps</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {move.steps.map((step, i) => {
              const checked = !!checkedSteps[i]
              const insight = getStepInsight(moveKey, i, profile)
              const insightOpen = expandedInsight === i
              return (
                <div key={i} style={{ borderRadius: 12, border: `1px solid ${checked ? '#D1FAE5' : insightOpen ? '#DDD8F0' : '#EFEFEF'}`, background: checked ? '#F0FDF4' : insightOpen ? '#F9F7FF' : '#FAFAFA', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 12px' }}>
                    <button
                      onClick={() => toggleStep(i)}
                      style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? '#10B981' : '#D1D5DB'}`, background: checked ? '#10B981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                    >
                      {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: PURPLE, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: checked ? '#9CA3AF' : DARK, lineHeight: 1.4, textDecoration: checked ? 'line-through' : 'none' }}>
                          {step.action}
                        </span>
                      </div>
                      {step.detail && !checked && (
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, marginLeft: 16, lineHeight: 1.4 }}>{step.detail}</div>
                      )}
                    </div>
                  </div>

                  {/* Contextual insight toggle */}
                  {insight && !checked && (
                    <div style={{ borderTop: `1px solid ${insightOpen ? '#DDD8F0' : '#EFEFEF'}` }}>
                      <button
                        onClick={() => setExpandedInsight(insightOpen ? null : i)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <BuddyAvatar mood="thinking" size={16} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: insightOpen ? PURPLE : '#9CA3AF', flex: 1 }}>
                          {insightOpen ? 'Hide guidance' : 'What to know about this step'}
                        </span>
                        <span style={{ fontSize: 10, color: insightOpen ? PURPLE : '#9CA3AF' }}>{insightOpen ? '▲' : '▼'}</span>
                      </button>
                      {insightOpen && (
                        <div style={{ padding: '0 12px 11px', display: 'flex', gap: 8 }}>
                          <div style={{ width: 2, borderRadius: 2, background: PURPLE, flexShrink: 0, margin: '2px 0' }} />
                          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{insight}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {step.link && !checked && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#F4F2FC', borderTop: '1px solid #DDD8F0', textDecoration: 'none' }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: PURPLE }}>🔗 {step.link.label}</span>
                      <span style={{ fontSize: 12, color: PURPLE }}>↗</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── What if I delay? ── */}
        {!move.done && !overdue && (() => {
          const whatIfCards = getWhatIfCards(moveKey, move, profile)
          return (
            <div style={{ borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', background: 'white', boxShadow: '0 1px 5px rgba(0,0,0,0.07)' }}>
              <button
                onClick={() => setShowWhatIf(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#FEF3C7" stroke={AMBER} strokeWidth="1.5"/>
                    <path d="M8 5v3.5" stroke={AMBER} strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.9" fill={AMBER}/>
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 800, color: DARK, letterSpacing: '-0.3px' }}>What if I delay?</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{showWhatIf ? '▲' : '▼'}</span>
              </button>

              {showWhatIf && (
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {whatIfCards.map(card => (
                    <div key={card.domain} style={{ padding: '11px 12px', borderRadius: 12, background: card.bg, border: `1px solid ${card.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: card.color, textTransform: 'uppercase' as const, letterSpacing: '0.6px', marginBottom: 5 }}>{card.domain} impact</div>
                      <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{card.impact}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

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
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 5px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: DARK, letterSpacing: '-0.3px', marginBottom: 8 }}>If something goes wrong</div>
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{move.ifWrong}</div>
        </div>

        {/* ── Contacts ── */}
        {move.contacts && move.contacts.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', boxShadow: '0 1px 5px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', marginBottom: 12 }}>
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
          style={{ width: '100%', textAlign: 'left', padding: '13px 15px', borderRadius: 14, background: 'white', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>💬 From a peer</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{showPeer ? '▲' : '▼'}</span>
          </div>
          {showPeer && (
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, fontStyle: 'italic', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>{move.peerInsight}</div>
          )}
        </button>

        {/* ── Mark done ── */}
        {!move.done && (
          <button
            onClick={() => onMarkDone(moveKey)}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: allChecked ? '#059669' : DARK,
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px',
              transition: 'background 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            {allChecked ? 'All steps done. Mark complete ✓' : 'Mark as done ✓'}
          </button>
        )}

        {/* ── More help ── */}
        <button
          onClick={() => setShowBuilder(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border-secondary)', background: 'white', cursor: 'pointer', width: '100%' }}
        >
          <BuddyAvatar mood="wave" size={18} />
          <span style={{ fontSize: 12, fontWeight: 700, color: BROWN }}>Have a specific question? Ask Bruno</span>
        </button>

      </div>
    </div>
    </div>
  )
}
