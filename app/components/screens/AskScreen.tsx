'use client'

import { useState, useRef, useEffect } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'

const RED    = '#E85028'
const PURPLE = '#8878CC'
const DARK   = '#1C1C1C'
const AMBER  = '#C47820'
const BROWN  = '#5C3D2E'

interface Props {
  profile: UserProfile
  moves: Record<string, Move>
  openGuide: (key: string) => void
  initialInput?: string
}

interface WorkflowCard {
  guideKey: string
  office: string
  whyItMatters: string
  deadline: string | null
  estimatedTime: string
  priority: 'critical' | 'soon' | 'upcoming'
}

interface GeneratedWorkflow {
  goal: string
  summary: string
  cards: WorkflowCard[]
  criticalNote?: string
}

// ── Workflow detection engine ───────────────────────────────────────────────

function detectWorkflow(
  input: string,
  profile: UserProfile,
  moves: Record<string, Move>
): GeneratedWorkflow {
  const isInt      = profile.cohorts?.includes('international')
  const isTransfer = profile.cohorts?.includes('transfer')
  const isFirstGen = profile.cohorts?.includes('firstgen') || profile.cohorts?.includes('lowincome')
  const school     = profile.schoolName || 'your school'
  const name       = profile.name?.split(' ')[0] || 'you'

  const pending = (key: string) => moves[key] && !moves[key].done

  // ── Leave of absence / gap year ──
  if (/gap year|leave|time off|semester off|defer|pause|medical leave|personal leave|break from school/i.test(input)) {
    const cards: WorkflowCard[] = []

    if (pending('enrolldeposit')) {
      cards.push({
        guideKey: 'enrolldeposit',
        office: 'Admissions Office',
        whyItMatters: 'You must be an enrolled student to request a leave. Confirm your spot first.',
        deadline: moves['enrolldeposit'].daysUntil !== null ? `${moves['enrolldeposit'].daysUntil}d left` : null,
        estimatedTime: '10 min',
        priority: 'critical',
      })
    }

    cards.push({
      guideKey: 'orientation',
      office: "Registrar's Office",
      whyItMatters: 'The Registrar processes your official leave and holds your re-enrollment spot.',
      deadline: 'Before semester start',
      estimatedTime: '1–2 days',
      priority: 'critical',
    })

    if (isInt) {
      cards.push({
        guideKey: 'i20',
        office: 'International Student Office',
        whyItMatters: 'F-1 students must get DSO authorization before any leave. Unauthorized gaps can trigger a SEVIS violation.',
        deadline: '30 days before leave',
        estimatedTime: '3–5 business days',
        priority: 'critical',
      })
    }

    if (pending('fafsa')) {
      cards.push({
        guideKey: 'fafsa',
        office: 'Financial Aid Office',
        whyItMatters: 'A leave can pause your grants and change your loan repayment start date.',
        deadline: 'Before leave starts',
        estimatedTime: '30 min',
        priority: 'soon',
      })
    }

    return {
      goal: 'Take a leave of absence',
      summary: isInt
        ? `F-1 leave workflow for ${school}. DSO authorization must happen first, before anything else.`
        : `Leave of absence workflow for ${school}. Complete these in order.`,
      cards,
      criticalNote: isInt ? 'Start with the International Office. Everything else depends on DSO approval.' : undefined,
    }
  }

  // ── Financial aid / FAFSA ──
  if (/financial aid|fafsa|aid|scholarship|afford|tuition|grant|pell|loan|fund|money for school|appeal.*aid|aid.*appeal/i.test(input)) {
    const cards: WorkflowCard[] = []

    if (pending('fafsa')) {
      cards.push({
        guideKey: 'fafsa',
        office: 'Financial Aid Office',
        whyItMatters: isFirstGen
          ? 'First-gen students who file early get significantly more institutional grant money. The deadline is not June 30.'
          : `${school}'s priority grants go to early filers. The federal deadline doesn't matter here.`,
        deadline: moves['fafsa']?.daysUntil !== null ? `${moves['fafsa'].daysUntil}d left` : 'Priority: Oct 1',
        estimatedTime: '45–60 min',
        priority: (moves['fafsa']?.urgency as 'critical' | 'soon' | 'upcoming') || 'critical',
      })
    }

    if (pending('aidaccept')) {
      cards.push({
        guideKey: 'aidaccept',
        office: 'Financial Aid Office',
        whyItMatters: 'Your grants don\'t activate automatically. They expire if you don\'t accept them in the portal.',
        deadline: moves['aidaccept']?.daysUntil !== null ? `${moves['aidaccept'].daysUntil}d left` : null,
        estimatedTime: '20 min',
        priority: (moves['aidaccept']?.urgency as 'critical' | 'soon' | 'upcoming') || 'soon',
      })
    }

    return {
      goal: 'Financial aid workflow',
      summary: isFirstGen
        ? `${school} priority grants go to the earliest FAFSA filers. Time is the variable, not eligibility.`
        : `Your financial aid steps for ${school}, in order.`,
      cards: cards.length > 0 ? cards : [{
        guideKey: 'fafsa',
        office: 'Financial Aid Office',
        whyItMatters: 'Aid steps complete. If your finances changed, ask about a Professional Judgment appeal.',
        deadline: null,
        estimatedTime: '1–2 weeks',
        priority: 'upcoming',
      }],
      criticalNote: isFirstGen && pending('fafsa') ? 'Every week of delay costs real grant money. File today.' : undefined,
    }
  }

  // ── Visa / immigration ──
  if (/visa|f-?1|i-?20|sevis|immigration|consulate|embassy|dso|ds.?160|enter.*us|come.*us|study.*us|passport.*school/i.test(input)) {
    const cards: WorkflowCard[] = []

    if (pending('i20')) {
      cards.push({
        guideKey: 'i20',
        office: 'International Student Office',
        whyItMatters: 'Every other step depends on having your I-20. Request it immediately.',
        deadline: moves['i20']?.daysUntil !== null ? `${moves['i20'].daysUntil}d left` : '8+ weeks before arrival',
        estimatedTime: '3–10 business days',
        priority: 'critical',
      })
    }

    if (pending('sevis')) {
      cards.push({
        guideKey: 'sevis',
        office: 'US Dept of Homeland Security',
        whyItMatters: 'You cannot attend your visa interview without this. Only pay at fmjfee.com.',
        deadline: '3+ days before interview',
        estimatedTime: '15 min + 3 days to process',
        priority: 'critical',
      })
    }

    if (pending('visaapp')) {
      cards.push({
        guideKey: 'visaapp',
        office: 'US Consulate / Embassy',
        whyItMatters: 'Peak-season slots fill 60–90 days out. Book your date before finishing the DS-160.',
        deadline: 'Schedule 2–3 months ahead',
        estimatedTime: '2–3 hours on interview day',
        priority: (moves['visaapp']?.urgency as 'critical' | 'soon' | 'upcoming') || 'soon',
      })
    }

    return {
      goal: 'F-1 visa workflow',
      summary: `Complete in sequence. Each step is a prerequisite for the next.`,
      cards: cards.length > 0 ? cards : [{
        guideKey: 'i20',
        office: 'International Student Office',
        whyItMatters: 'Visa steps complete. Check the guide for post-arrival SEVIS reporting.',
        deadline: null,
        estimatedTime: 'Reference only',
        priority: 'upcoming',
      }],
      criticalNote: 'Verify your I-20 name matches your passport exactly the moment it arrives.',
    }
  }

  // ── Transfer credit appeal ──
  if (/transfer credit|credit.*appeal|appeal.*credit|transcript|course.*count|count.*course|prior learning/i.test(input)) {
    return {
      goal: 'Transfer credit appeal',
      summary: `The window is your first semester only. After that it requires Dean approval.`,
      cards: [{
        guideKey: 'credittransfer',
        office: "Registrar / Department Chairs",
        whyItMatters: isTransfer
          ? 'Every miscategorized credit adds semesters and tuition. Fight this now.'
          : 'The appeal window closes after your first semester.',
        deadline: 'First semester only',
        estimatedTime: '1–2 weeks',
        priority: 'critical',
      }],
      criticalNote: 'Go directly to the department chair. They have authority the Registrar doesn\'t.',
    }
  }

  // ── Enrollment / confirm spot ──
  if (/enroll|confirm.*spot|spot.*confirm|accept.*admission|may 1|decision day|pay.*deposit|secure.*spot|commit.*school/i.test(input)) {
    const cards: WorkflowCard[] = []

    if (pending('enrolldeposit')) {
      cards.push({
        guideKey: 'enrolldeposit',
        office: 'Admissions Office',
        whyItMatters: `Until the deposit is paid, ${school} can release your spot to the waitlist.`,
        deadline: moves['enrolldeposit']?.daysUntil !== null ? `${moves['enrolldeposit'].daysUntil}d left` : 'May 1',
        estimatedTime: '10 min',
        priority: 'critical',
      })
    }

    if (pending('orientation')) {
      cards.push({
        guideKey: 'orientation',
        office: 'New Student Programs',
        whyItMatters: 'Attending orientation lifts your course registration hold. Earlier session = better class selection.',
        deadline: moves['orientation']?.daysUntil !== null ? `${moves['orientation'].daysUntil}d left` : 'After deposit',
        estimatedTime: '10 min to register',
        priority: 'soon',
      })
    }

    if (pending('housingdeposit')) {
      cards.push({
        guideKey: 'housingdeposit',
        office: 'Housing & Residential Life',
        whyItMatters: 'Queue position = deposit timestamp. Earlier means better rooms.',
        deadline: moves['housingdeposit']?.daysUntil !== null ? `${moves['housingdeposit'].daysUntil}d left` : 'ASAP',
        estimatedTime: '15 min',
        priority: 'soon',
      })
    }

    return {
      goal: 'Confirm enrollment',
      summary: `Enrollment sequence for ${school}. Each step unlocks the next.`,
      cards,
      criticalNote: pending('enrolldeposit') ? 'One-day delay can cost you your seat.' : undefined,
    }
  }

  // ── Housing ──
  if (/housing|dorm|room|residential|live on campus|where.*live|on.*campus.*housing|move.?in/i.test(input)) {
    const cards: WorkflowCard[] = []

    if (pending('housingdeposit')) {
      cards.push({
        guideKey: 'housingdeposit',
        office: 'Housing & Residential Life',
        whyItMatters: isInt
          ? 'Pay before your visa is confirmed. Most schools hold the assignment until enrollment is final.'
          : 'Queue is strictly first-come, first-served. Best rooms fill in hours.',
        deadline: moves['housingdeposit']?.daysUntil !== null ? `${moves['housingdeposit'].daysUntil}d left` : 'ASAP',
        estimatedTime: '15 min',
        priority: 'critical',
      })
    }

    return {
      goal: 'On-campus housing',
      summary: isInt
        ? `Apply before your visa is confirmed. The spot is held.`
        : `Queue position = timestamp. Earlier is always better.`,
      cards: cards.length > 0 ? cards : [{
        guideKey: 'housingdeposit',
        office: 'Housing & Residential Life',
        whyItMatters: 'Housing deposit complete. Check the guide for move-in details.',
        deadline: null,
        estimatedTime: 'Reference',
        priority: 'upcoming',
      }],
    }
  }

  // ── Health insurance ──
  if (/health|insurance|medical|waive.*insurance|insurance.*waive|student.*plan|coverage/i.test(input)) {
    return {
      goal: 'Health insurance',
      summary: `You're auto-enrolled and charged. Action only needed if you want to waive.`,
      cards: [{
        guideKey: 'healthinsurance',
        office: 'Student Health Services',
        whyItMatters: isInt
          ? 'International students often can\'t waive. The school plan satisfies your visa requirement.'
          : 'Miss the waiver deadline and you pay for the full year. No refunds.',
        deadline: 'Early September (varies)',
        estimatedTime: '30 min',
        priority: 'soon',
      }],
    }
  }

  // ── Fallback: show top urgent tasks ──
  const urgentPending = Object.entries(moves)
    .filter(([, m]) => !m.done && m.urgency === 'critical')
    .sort((a, b) => (a[1].daysUntil ?? 99) - (b[1].daysUntil ?? 99))
    .slice(0, 3)

  const fallbackCards: WorkflowCard[] = urgentPending.map(([key, m]) => ({
    guideKey: key,
    office: m.contacts?.[0]?.office || 'Relevant Office',
    whyItMatters: m.consequence,
    deadline: m.daysUntil !== null ? `${m.daysUntil} days left` : null,
    estimatedTime: '15–60 minutes',
    priority: m.urgency as 'critical' | 'soon' | 'upcoming',
  }))

  return {
    goal: 'Your current priorities',
    summary: `Based on your profile at ${school}, here are your most time-sensitive pending tasks. Each card shows exactly what to do and why it matters for you specifically.`,
    cards: fallbackCards,
  }
}

// ── Component ───────────────────────────────────────────────────────────────

type Phase = 'intake' | 'analyzing' | 'workflow'

const EXAMPLE_PROMPTS = [
  "I need to figure out my visa",
  "How do I handle financial aid?",
  "I want to take a gap year",
  "Help me secure housing",
  "I'm a transfer. How do I appeal my credits?",
]

const PRIORITY_COLORS = {
  critical: { bg: '#FFF0F0', border: '#FECACA', label: 'Urgent',    text: RED    },
  soon:     { bg: '#FFFBEB', border: '#FDE68A', label: 'Soon',      text: AMBER  },
  upcoming: { bg: '#F4F2FC', border: '#DDD6FE', label: 'Upcoming',  text: PURPLE },
}

export default function AskScreen({ profile, moves, openGuide, initialInput = '' }: Props) {
  const [phase,    setPhase]    = useState<Phase>('intake')
  const [input,    setInput]    = useState('')
  const [workflow, setWorkflow] = useState<GeneratedWorkflow | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // If launched from GuideDetail's "Ask Bruno". auto-analyze
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput)
      setPhase('analyzing')
      const t = setTimeout(() => {
        setWorkflow(detectWorkflow(initialInput, profile, moves))
        setPhase('workflow')
      }, 950)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const analyze = (text: string) => {
    if (!text.trim()) return
    setInput(text.trim())
    setPhase('analyzing')
    setTimeout(() => {
      setWorkflow(detectWorkflow(text.trim(), profile, moves))
      setPhase('workflow')
    }, 1000)
  }

  const reset = () => { setPhase('intake'); setInput(''); setWorkflow(null) }

  // ── Intake ────────────────────────────────────────────────────────────────
  if (phase === 'intake') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border-tertiary)', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: DARK, letterSpacing: '-0.5px' }}>Describe your situation</div>
        </div>

        <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 96px' }}>

          {/* AI context card. solid purple */}
          <div style={{ padding: '16px', borderRadius: 16, background: PURPLE, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <BuddyAvatar mood="thinking" size={32} />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
                You shouldn&apos;t have to figure out what to ask
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              Tell me your situation in plain English. I&apos;ll map the right steps for you.
            </div>
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), analyze(input))}
            placeholder="E.g., I need to sort out my visa and housing before I arrive in August..."
            rows={4}
            style={{
              width: '100%', padding: '14px 15px', borderRadius: 14,
              border: `1.5px solid ${input ? PURPLE : '#DDD8F0'}`,
              fontSize: 14, color: DARK, lineHeight: 1.6, fontFamily: 'inherit',
              resize: 'none', outline: 'none', background: 'white',
              boxSizing: 'border-box', marginBottom: 12, transition: 'border-color 0.15s',
            }}
          />

          <button
            onClick={() => analyze(input)}
            disabled={!input.trim()}
            style={{
              width: '100%', padding: '14px', borderRadius: 13,
              background: input.trim() ? RED : '#F3F4F6',
              color: input.trim() ? 'white' : '#9CA3AF',
              border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px',
              marginBottom: 24, transition: 'background 0.15s',
            }}
          >
            Generate my workflow →
          </button>

          {/* Example situations */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Or pick a common situation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {EXAMPLE_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => analyze(prompt)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid var(--border-secondary)', background: 'white',
                  fontSize: 13, color: DARK, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span>{prompt}</span>
                <span style={{ fontSize: 16, color: 'var(--text-tertiary)', flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Analyzing ─────────────────────────────────────────────────────────────
  if (phase === 'analyzing') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <BuddyAvatar mood="thinking" size={52} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: DARK, marginBottom: 6 }}>Mapping your workflow…</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 240, lineHeight: 1.55 }}>
            Identifying the right institutional steps for your profile
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{ width: 8, height: 8, borderRadius: '50%', background: PURPLE, animation: `wfpulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <style>{`@keyframes wfpulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
      </div>
    )
  }

  // ── Workflow results ──────────────────────────────────────────────────────
  if (phase === 'workflow' && workflow) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 18px 14px', borderBottom: '1px solid var(--border-tertiary)', flexShrink: 0 }}>
          <button
            onClick={reset}
            style={{ background: 'none', border: 'none', fontSize: 13, color: PURPLE, fontWeight: 700, cursor: 'pointer', padding: '0 0 10px', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            ← Different situation
          </button>
          <div style={{ fontSize: 19, fontWeight: 900, color: DARK, letterSpacing: '-0.45px', lineHeight: 1.25 }}>
            {workflow.goal}
          </div>
        </div>

        <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 96px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* AI summary bubble. solid dark */}
          <div style={{ padding: '14px 16px', borderRadius: 16, background: DARK }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <BuddyAvatar mood="happy" size={22} />
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Bruno&apos;s read</div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6 }}>
              {workflow.summary}
            </div>
          </div>

          {/* Critical note. solid red */}
          {workflow.criticalNote && (
            <div style={{ padding: '13px 15px', borderRadius: 14, background: RED }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>Critical</div>
              <div style={{ fontSize: 13, color: 'white', lineHeight: 1.55, fontWeight: 600 }}>
                {workflow.criticalNote}
              </div>
            </div>
          )}

          {/* Section label */}
          {workflow.cards.length > 0 && (
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your personalized steps, in order
            </div>
          )}

          {/* Workflow cards */}
          {workflow.cards.map((card, idx) => {
            const m = moves[card.guideKey]
            const col = PRIORITY_COLORS[card.priority]
            return (
              <div key={card.guideKey} style={{ borderRadius: 20, background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>

                {/* Header: number + title + badge */}
                <div style={{ padding: '16px 16px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: col.text, color: 'white', fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, fontSize: 17, fontWeight: 900, color: '#0A0A0A', lineHeight: 1.2, letterSpacing: '-0.4px', paddingTop: 4 }}>
                      {m ? m.title : card.guideKey}
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 20, background: col.bg, color: col.text, fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap', marginTop: 2 }}>
                      {col.label}
                    </span>
                  </div>

                  {/* Metadata grid: Office / Deadline / Time */}
                  <div style={{ display: 'flex', gap: 0 }}>
                    <div style={{ flex: 1.4, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Office</div>
                      <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 700, lineHeight: 1.3 }}>{card.office}</div>
                    </div>
                    {card.deadline && (
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Deadline</div>
                        <div style={{ fontSize: 12, color: col.text, fontWeight: 800 }}>{card.deadline}</div>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Time</div>
                      <div style={{ fontSize: 12, color: '#1A1A1A', fontWeight: 700 }}>{card.estimatedTime}</div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

                {/* Footer: insight + CTA */}
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                    {card.whyItMatters}
                  </div>
                  {m && (
                    <button
                      onClick={() => openGuide(card.guideKey)}
                      style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 20, background: DARK, color: 'white', border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Open →
                    </button>
                  )}
                </div>

              </div>
            )
          })}

          {/* Try another situation */}
          <div style={{ marginTop: 4, padding: '14px 16px', borderRadius: 14, background: '#F9FAFB', border: '1px solid var(--border-secondary)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 10 }}>Have a different situation in mind?</div>
            <button
              onClick={reset}
              style={{ padding: '10px 22px', borderRadius: 10, background: DARK, color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Describe a new situation
            </button>
          </div>

        </div>
      </div>
    )
  }

  return null
}
