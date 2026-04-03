import type { Move, Peer } from './types'

export const initialMoves: Record<string, Move> = {
  i20: {
    title: 'How to request your I-20 from your DSO',
    meta: 'Learned · Visa · Pre-arrival',
    type: 'learned',
    tags: ['visa'],
    steps: [
      'Find your DSO by searching "[school name] DSO" in your university portal — look for the title Designated School Official.',
      'Email your DSO (don\'t walk in). Subject line: "I-20 request — [Full Name] — [Student ID] — arriving [date]". Attach your acceptance letter and financial proof.',
      'Wait 3–5 business days. If no response in 5 days, send one polite follow-up with the same subject line.',
      'Once received, check that your name, program, and dates are exactly correct before your visa appointment.',
      'Save a digital and physical copy — you need it at your visa interview and again at the port of entry.',
    ],
    insider:
      'The subject line formula is everything. DSOs process dozens of requests — this exact format gets responses 3× faster than vague subject lines.',
    ai: 'At RISD, the ISS office handles I-20s for about 400 students. Peak times are June–July. Emailing now puts you at the front of the queue.',
    madeit: false,
  },
  dso: {
    title: 'The DSO email formula that gets a response in 48h',
    meta: 'Made · Visa · From Min-jun K.',
    type: 'made',
    tags: ['made', 'visa'],
    steps: [
      'Subject line exactly: "I-20 request — [Full Name] — [Student ID] — arriving [date]"',
      'Body: include your program name, intended start date, and confirm documents are attached.',
      'Attach acceptance letter, financial proof, and passport photo page in one email — not separate emails.',
      'Send Tuesday or Wednesday morning. DSOs clear their inbox at the start of the work week.',
      'If no reply in 5 days, forward with "Following up" added to the subject — don\'t start a new thread.',
    ],
    insider:
      '"I got my I-20 in 2 days. My roommate sent a vague email and waited 3 weeks." — Min-jun K., RISD 2nd year',
    ai: 'DSOs use keyword searches to triage their inbox. "I-20 request" in the subject routes your email to the top of their processing queue automatically.',
    madeit: true,
  },
  critique: {
    title: 'How to survive — and use — critique culture',
    meta: 'From peer · Academic · Art school',
    type: 'peer',
    tags: ['peer', 'academic'],
    steps: [
      'Understand the goal: demonstrate critical thinking about your own process, not defend your work.',
      'Talk about your work in third person — "the piece does X" not "I did X." This creates intellectual distance.',
      'Lead with intention before execution — "I was exploring tension between X and Y by..."',
      'Receive feedback as information. Write everything down. Engage analytically after the room clears.',
      'Ask one genuine question about the feedback — this signals engagement and often turns critics into allies.',
    ],
    insider:
      'Students who do best in crits seem least attached to their work. Professors are evaluating intellectual agility, not whether your work is "good."',
    ai: 'At RISD, crits happen in front of your full cohort. Disagreeing with feedback respectfully reads as sophistication. Silence reads as disengagement.',
    madeit: false,
  },
  officehours: {
    title: 'The office hours move that changes 4 years',
    meta: 'From peer · Academic · Career',
    type: 'peer',
    tags: ['peer', 'academic', 'career'],
    steps: [
      'Go in week 2 of the semester — before you need anything. This is the entire move.',
      'Introduce yourself: your name, your program, one genuine thing about their work that interested you.',
      'Ask one question about their practice or current research — not about your grade or assignment.',
      'Follow up two weeks later with one sentence about what you thought about after the conversation.',
      'When you eventually need a recommendation letter, they already know who you are.',
    ],
    insider:
      '"I went in week 2. By semester 3 that professor was my thesis advisor." — Priya J., Columbia 3rd year',
    ai: 'For international students: going to office hours signals seriousness — which matters more than accent or language fluency. Week 2 is your window.',
    madeit: false,
  },
  sevis: {
    title: 'How to pay your SEVIS fee without mistakes',
    meta: 'Learned · Visa · Pre-arrival',
    type: 'learned',
    tags: ['visa'],
    steps: [
      'Go to fmjfee.com — the only official SEVIS payment site. Do not use any other site.',
      'You need your SEVIS ID number from your I-20. Complete the I-20 move first.',
      'Pay the I-901 fee: $350 for F-1 students. Keep your confirmation receipt — you need it for the visa interview.',
      'Allow 3 business days for payment to process before your visa appointment date.',
      'Bring your SEVIS payment confirmation (printed or digital) to your visa interview.',
    ],
    insider:
      'Many students pay the wrong amount or use unofficial sites. Only fmjfee.com is valid. The fee is $350 for F-1 — not $200 or $220 which still circulate online.',
    ai: 'Based on your Aug 24 arrival, pay SEVIS at least 3 days before your visa appointment — meaning by Aug 6 at the latest.',
    madeit: false,
  },
}

export const lockedMoves = [
  {
    title: 'OPT + CPT — the move you plan in year 1',
    tags: 'career',
    unlock: 'First semester',
  },
  {
    title: 'How to appeal your financial aid package',
    tags: 'financial',
    unlock: 'Decision stage',
  },
]

export const peers: Peer[] = [
  {
    id: 'mk',
    initials: 'MK',
    name: 'Min-jun K.',
    detail: 'South Korea · RISD · 2nd year',
    bgColor: '#EEEDFE',
    textColor: '#3C3489',
  },
  {
    id: 'al',
    initials: 'AL',
    name: 'Amara L.',
    detail: 'Nigeria · RISD · 3rd year',
    bgColor: '#E1F5EE',
    textColor: '#0F6E56',
  },
  {
    id: 'pj',
    initials: 'PJ',
    name: 'Priya J.',
    detail: 'India · Columbia · 3rd year',
    bgColor: '#F7F6F4',
    textColor: '#6B6B6B',
  },
  {
    id: 'tw',
    initials: 'TW',
    name: 'Tolu W.',
    detail: 'First-gen · Brown · 1st year',
    bgColor: '#E1F5EE',
    textColor: '#0F6E56',
  },
]
