'use client'

import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'

interface Props {
  moves: Record<string, Move>
  profile: UserProfile | null
  onBack: () => void
  openMove: (key: string) => void
}

type RecItem = { label: string; moveKey?: string; urgent?: boolean }

function MiniRing({ value, total, color = 'white' }: { value: number; total: number; color?: string }) {
  const r = 30, circ = 2 * Math.PI * r
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" style={{ display: 'block' }}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
      <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${(value / total) * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 38 38)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  )
}

export default function ProgressView({ moves, profile, onBack, openMove }: Props) {
  const made = Object.values(moves).filter(m => m.madeit).length
  const learned = Object.values(moves).filter(m => m.type === 'learned').length
  const fromPeers = Object.values(moves).filter(m => m.type === 'peer').length
  const total = 12
  const pct = Math.round((made / total) * 100)

  const isIntl = profile?.cohorts.includes('international')
  const isFirstgen = profile?.cohorts.includes('firstgen')
  const isLowIncome = profile?.cohorts.includes('lowincome')
  const isArt = profile?.schoolType === 'art'
  const isPreArrival = profile?.stage === 'pre-arrival'

  // ── Financial Aid & Enrollment section (summer melt prevention) ──
  const enrollDone: string[] = []
  if (moves['enrolldeposit']?.madeit) enrollDone.push('Enrollment deposit paid ✓')
  if (moves['fafsa']?.madeit) enrollDone.push('Financial aid accepted ✓')
  if (moves['aidappeal']?.madeit) enrollDone.push('Aid appeal submitted ✓')
  if (moves['housing']?.madeit) enrollDone.push('Housing secured ✓')
  if (moves['orientation']?.madeit) enrollDone.push('Orientation registered ✓')

  const enrollRec: RecItem[] = []
  if (!moves['enrolldeposit']?.madeit) enrollRec.push({ label: 'Pay your enrollment deposit', moveKey: 'enrolldeposit', urgent: true })
  if (!moves['fafsa']?.madeit) enrollRec.push({ label: 'Accept your financial aid package', moveKey: 'fafsa', urgent: isFirstgen || isLowIncome })
  if ((isFirstgen || isLowIncome) && !moves['aidappeal']?.madeit) enrollRec.push({ label: 'Appeal your aid if it feels short', moveKey: 'aidappeal' })
  if (!moves['housing']?.madeit) enrollRec.push({ label: 'Apply for on-campus housing', moveKey: 'housing' })
  if (!moves['orientation']?.madeit) enrollRec.push({ label: 'Register for orientation', moveKey: 'orientation' })

  // ── Visa section ──
  const visaDone: string[] = []
  if (moves['i20']?.madeit) visaDone.push('I-20 requested from DSO')
  if (moves['dso']?.madeit) visaDone.push('DSO email formula — used it')
  if (moves['sevis']?.madeit) visaDone.push('SEVIS fee paid correctly')
  if (moves['visaapp']?.madeit) visaDone.push('Visa interview booked & completed')

  const visaRec: RecItem[] = []
  if (!moves['i20']?.madeit) visaRec.push({ label: 'Request your I-20 from your DSO', moveKey: 'i20', urgent: true })
  if (!moves['visaapp']?.madeit) visaRec.push({ label: 'Book your F-1 visa interview now', moveKey: 'visaapp', urgent: true })
  if (!moves['dso']?.madeit) visaRec.push({ label: 'Use the DSO email formula', moveKey: 'dso' })
  if (isIntl && !moves['sevis']?.madeit) visaRec.push({ label: 'Pay your SEVIS fee ($350) at fmjfee.com', moveKey: 'sevis' })

  // ── Academic section ──
  const academicDone: string[] = []
  if (moves['officehours']?.madeit) academicDone.push('Office hours — went in week 2')
  if (moves['critique']?.madeit) academicDone.push('Critique culture — survived first crit')
  if (moves['orientation']?.madeit) academicDone.push('Orientation — registered & attended')

  const academicRec: RecItem[] = []
  if (!moves['officehours']?.madeit) academicRec.push({ label: 'Office hours in week 2', moveKey: 'officehours' })
  if (isArt && !moves['critique']?.madeit) academicRec.push({ label: 'Critique culture prep', moveKey: 'critique' })
  academicRec.push({ label: 'Email your professor before midterms' })
  academicRec.push({ label: 'Find your campus writing / tutoring center' })

  const communityRec: RecItem[] = [
    { label: isIntl ? 'Connect with an international peer advisor' : 'Connect with a peer mentor' },
    { label: isFirstgen ? 'Find your first-gen or TRIO student group' : 'Join a student club in your interest area' },
    { label: 'Schedule a coffee chat with a classmate this week' },
  ]

  const careerRec: RecItem[] = [
    { label: 'Visit your career center this semester' },
    { label: 'Build your LinkedIn profile' },
    { label: isIntl ? 'Learn OPT & CPT eligibility timelines now — plan in year 1' : 'Explore internship search timelines' },
    { label: isFirstgen ? 'Ask your academic advisor about alumni networks' : 'Attend one networking event this semester' },
  ]

  // Build ordered sections
  const sections = [
    // Financial Aid & Enrollment — ALWAYS first for pre-arrival students
    ...(isPreArrival ? [{
      emoji: '🎓', label: 'Enrollment & Financial Aid',
      color: '#B45309', chipBg: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
      done: enrollDone, rec: enrollRec.slice(0, 4),
      insight: (isFirstgen || isLowIncome)
        ? 'Summer melt affects up to 40% of first-gen students — accepted students who never enroll. Completing these steps is how you make sure that\'s not you.'
        : 'Completing enrollment steps early means full access to housing, orientation spots, and financial aid before slots run out.',
    }] : []),

    // Visa — only for international
    ...(isIntl ? [{
      emoji: '🛂', label: 'Visa & Documentation',
      color: '#7C3AED', chipBg: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD',
      done: visaDone, rec: visaRec.slice(0, 4),
      insight: 'F-1 visa appointment slots in many countries book out 8–12 weeks in advance. Starting early removes the single biggest source of uncertainty for international students.',
    }] : []),

    {
      emoji: '📚', label: 'Academic',
      color: '#5B21B6', chipBg: '#5B21B6', bg: '#F5F3FF', border: '#C4B5FD',
      done: academicDone, rec: academicRec.slice(0, 3),
      insight: isFirstgen
        ? 'First-gen students who go to office hours in week 2 earn an average of 0.4 GPA points higher than those who wait until they\'re struggling.'
        : 'Proactive engagement with professors is the single most underrated lever in academic success.',
    },

    {
      emoji: '🤝', label: 'Community & Belonging',
      color: '#4F46E5', chipBg: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE',
      done: [] as string[], rec: communityRec,
      insight: isIntl
        ? 'International students who build 3+ connections by week 4 navigate campus 40% more confidently.'
        : isFirstgen
        ? 'First-gen students who find a peer mentor in semester 1 are 3× more likely to return for sophomore year.'
        : 'Students who connect early compound those relationships across all four years.',
    },

    {
      emoji: '💼', label: 'Career',
      color: '#B45309', chipBg: '#D97706', bg: '#FEF3C7', border: '#FCD34D',
      done: [] as string[], rec: careerRec.slice(0, 3),
      insight: isIntl
        ? 'International students who start career planning in year 1 have 3× more OPT/CPT options when they need them.'
        : isFirstgen
        ? "Most first-gen students don't visit the career center until junior year. Going in year 1 gives you a 2-year head start."
        : "Starting career planning early means building relationships that open doors before you need them.",
    },
  ]

  return (
    <div className="no-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px 0', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)', padding: '0 14px 0 0', lineHeight: 1 }}
        >
          ←
        </button>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Your Progress</div>
      </div>

      <div style={{ padding: '12px 20px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Stats — dark hero card */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', borderRadius: 20, padding: '18px 20px 16px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <MiniRing value={made} total={total} color="#F97316" />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1 }}>{pct}%</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 4 }}>
                {made} of {total} moves
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {profile?.stage === 'pre-arrival' ? 'Pre-arrival phase' : 'Semester 1'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 12 }}>
            {[
              { val: learned, label: 'Learned', color: '#A5B4FC', icon: '📖' },
              { val: made,    label: 'Made',    color: '#6EE7B7', icon: '✓' },
              { val: fromPeers, label: 'Peers', color: '#FCD34D', icon: '🤝' },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational insight */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '13px 14px', background: '#F5F3FF', borderRadius: 14, border: '1px solid #C4B5FD' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⭐</span>
          <span style={{ fontSize: 13, color: '#5B21B6', lineHeight: 1.55, fontWeight: 500 }}>
            {isFirstgen && isIntl
              ? "You're navigating things most students never face. Every move you make here is one your future self will thank you for."
              : isFirstgen
              ? "You're already doing what most first-gen students don't discover until year 2. Keep going."
              : isIntl
              ? "You're building the playbook that nobody handed you. Each move makes the next one easier."
              : "You're ahead of most students who start this journey. Progress compounds — keep the streak."}
          </span>
        </div>

        {/* Summer melt explainer — first-gen / low-income only */}
        {(isFirstgen || isLowIncome) && isPreArrival && (
          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '13px 15px', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💡</span> What is "summer melt"?
            </div>
            <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              Up to <strong>40% of first-gen and low-income accepted students</strong> never show up in fall — not because they chose not to go, but because they missed critical enrollment steps like the deposit or FAFSA acceptance. UniBuddy tracks these for you so you don&apos;t fall through the cracks.
            </div>
          </div>
        )}

        {/* Goal sections */}
        {sections.map((section) => (
          <div key={section.emoji} style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${section.border}` }}>
            {/* Section header */}
            <div style={{ background: section.chipBg, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15 }}>{section.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                {section.label}
              </span>
              {section.done.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {section.done.length} done ✓
                </span>
              )}
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '12px 14px 14px' }}>
              {/* Completed items */}
              {section.done.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: '#065F46' }}>✓</div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{item}</span>
                </div>
              ))}

              {/* Recommended label */}
              {section.rec.length > 0 && (
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, marginTop: section.done.length > 0 ? 4 : 0 }}>
                  {section.done.length > 0 ? 'Next moves' : 'Recommended for you'}
                </div>
              )}

              {/* Recommended items */}
              {section.rec.map((item, i) => (
                <div
                  key={i}
                  onClick={item.moveKey ? () => openMove(item.moveKey!) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 10, marginBottom: 6,
                    background: item.urgent ? '#FAECE7' : section.bg,
                    cursor: item.moveKey ? 'pointer' : 'default',
                    border: item.urgent ? '0.5px solid #D85A30' : `0.5px solid ${section.border}`,
                  }}
                >
                  {item.urgent && <span style={{ fontSize: 10 }}>🔴</span>}
                  {!item.urgent && <div style={{ width: 5, height: 5, borderRadius: '50%', background: section.color, flexShrink: 0 }} />}
                  <span style={{ flex: 1, fontSize: 13, color: item.urgent ? '#993C1D' : 'var(--text-primary)', lineHeight: 1.35, fontWeight: item.urgent ? 600 : 400 }}>
                    {item.label}
                  </span>
                  {item.moveKey && (
                    <span style={{ fontSize: 11, color: item.urgent ? '#D85A30' : section.color, fontWeight: 600, flexShrink: 0 }}>
                      {item.urgent ? 'Do now →' : 'Learn →'}
                    </span>
                  )}
                </div>
              ))}

              {/* Section insight */}
              <div style={{ marginTop: 8, padding: '10px 12px', background: section.bg, borderRadius: 10, borderLeft: `3px solid ${section.color}` }}>
                <span style={{ fontSize: 12, color: section.color, lineHeight: 1.5, fontStyle: 'italic' }}>{section.insight}</span>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
