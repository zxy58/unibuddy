import type { Move, Peer } from './types'

export const initialMoves: Record<string, Move> = {
  enrolldeposit: {
    title: 'Pay your enrollment deposit — lock in your spot',
    meta: 'Learned · Financial · Pre-arrival',
    type: 'learned',
    tags: ['financial'],
    steps: [
      'Log into your admissions portal NOW — most schools require a deposit by May 1 (National Decision Day) or earlier.',
      'Find "Enrollment Deposit" or "Confirm Enrollment" — the amount is usually $100–$500 and is non-refundable.',
      'Pay with a card or bank transfer. Save the confirmation email — you\'ll need it to access housing portals and orientation.',
      'After paying, withdraw from any other schools you were considering (one deposit only — it\'s the ethical and required standard).',
      'Look for a follow-up email about next steps: NetID activation, housing application, and orientation registration.',
    ],
    insider:
      'Missing the enrollment deposit deadline means your spot goes to the waitlist. Schools DO rescind acceptances for late deposits — even from students who got financial aid.',
    ai: 'This is the most commonly missed deadline for first-gen students. The deposit confirms you\'re coming — without it, the school assumes you chose elsewhere.',
    madeit: false,
  },
  fafsa: {
    title: 'FAFSA — what to do after you submit',
    meta: 'Learned · Financial · Pre-arrival',
    type: 'learned',
    tags: ['financial'],
    steps: [
      'Check your Student Aid Report (SAR) at studentaid.gov — look for your EFC/SAI and any error flags.',
      'Log into your school\'s financial aid portal and check if you\'re selected for "verification" — this means they need extra documents.',
      'If verified: submit all requested documents immediately. Delays in verification delay your aid disbursement.',
      'Review your Financial Aid Award Letter carefully — grants and scholarships are free money, loans must be repaid. Accept grants first, decline loans you don\'t need.',
      'Complete any required loan counseling (Entrance Counseling + MPN) at studentaid.gov if you accept federal loans.',
    ],
    insider:
      '"I didn\'t know I had to accept my aid — I thought it was automatic. I almost lost $6,000 in grants." — Jasmine T., Ohio State 2nd year',
    ai: 'First-gen students leave an estimated $2.6 billion in Pell Grant money on the table each year by not completing FAFSA or missing verification steps. Your award expires if unclaimed.',
    madeit: false,
  },
  aidappeal: {
    title: 'How to appeal your financial aid package',
    meta: 'Learned · Financial · Pre-arrival',
    type: 'learned',
    tags: ['financial'],
    steps: [
      'Write a professional appeal letter — address it to the Financial Aid Office, not a specific person.',
      'State clearly: your family\'s financial situation has changed OR the award doesn\'t reflect your demonstrated need.',
      'Include specific documentation: job loss letter, medical bills, divorce decree — anything that explains the gap.',
      'Compare awards from competing schools (if you have them) — schools will often match or beat a better offer.',
      'Follow up by phone 5 business days after submitting — politely ask if they received your appeal and the timeline.',
    ],
    insider:
      'Aid offices expect appeals. "We don\'t negotiate" is a standard first response — it\'s not the last word. Students who appeal with documentation get more money 40% of the time.',
    ai: 'Financial aid appeal season peaks in April–May. Call rather than email — phone calls are triaged faster, and a human voice builds rapport that emails can\'t.',
    madeit: false,
  },
  visaapp: {
    title: 'F-1 visa interview — how to prepare and book',
    meta: 'Learned · Visa · Pre-arrival',
    type: 'learned',
    tags: ['visa'],
    steps: [
      'Complete DS-160 at ceac.state.gov — this is your nonimmigrant visa application. Save your confirmation barcode.',
      'Pay the MRV (visa application) fee at your country\'s US Embassy payment portal — typically $185. Keep the receipt.',
      'Book your visa interview at the US Embassy or Consulate in your home country — wait times vary from 1 week to 3+ months depending on location. Book NOW.',
      'Prepare your documents: I-20, DS-160 barcode, MRV receipt, acceptance letter, financial proof, passport (valid 6+ months beyond intended stay), SEVIS payment receipt.',
      'At the interview: be honest, concise, and confident. You\'ll be asked why you chose this school and how you\'ll fund your education. Practice 3-sentence answers.',
    ],
    insider:
      'In some countries (India, China, Nigeria), F-1 visa appointment slots book out 8–12 weeks in advance in summer. Students who wait until July for an August arrival often miss the window.',
    ai: 'Book your visa interview appointment the same week you receive your I-20 — don\'t wait. Interview slots are first-come, first-served and disappear fast in peak season (June–August).',
    madeit: false,
  },
  orientation: {
    title: 'Register for orientation before it fills up',
    meta: 'Learned · Academic · Pre-arrival',
    type: 'learned',
    tags: ['academic'],
    steps: [
      'Look for an orientation registration email — it usually comes 2–4 weeks after you pay your enrollment deposit.',
      'Log into your student portal and register for your preferred orientation session. Popular dates fill in days.',
      'If you\'re international, look for the International Student Orientation — it runs 1–2 days BEFORE general orientation and covers I-20 check-in, campus ID, and banking.',
      'Attend housing check-in (if applicable) and the advising session — this is where you select your first-semester courses.',
      'Bring your I-20 and passport to international orientation. You\'ll check in with the international office to activate your student status in the SEVIS system.',
    ],
    insider:
      'Students who attend orientation are 30% more likely to return for their second year. It\'s not optional — it\'s where you get your student ID, email activation, and course registration access.',
    ai: 'First-gen students often skip orientation thinking it\'s just ice-breakers. It\'s not — it\'s where financial aid disbursement gets triggered, housing keys are distributed, and your first advisor meeting happens.',
    madeit: false,
  },
  housing: {
    title: 'Secure housing before the deadline',
    meta: 'Learned · Pre-arrival',
    type: 'learned',
    tags: ['academic'],
    steps: [
      'Log into your student portal and find "Housing Application" — it usually opens 2–4 weeks after your enrollment deposit.',
      'Submit your housing application and deposit ASAP — on-campus spots are limited and assigned by date submitted, not by need.',
      'Select roommate preferences carefully — most forms ask about sleep schedule, cleanliness, and study habits. Be honest.',
      'If on-campus housing is full: search university-approved off-campus housing lists, Facebook groups for your school\'s class year, and ask your international student office for safe neighborhoods.',
      'Confirm your move-in date and what you\'re allowed to bring — most dorms prohibit certain appliances and require specific bedding sizes.',
    ],
    insider:
      'Many international students miss the housing deadline because they\'re waiting for visa confirmation. Apply for housing before your visa is approved — you can cancel penalty-free if it\'s denied.',
    ai: 'On-campus housing gives international students faster access to campus resources, meal plans, and peer connections — the ROI on belonging in year 1 is significant.',
    madeit: false,
  },
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
