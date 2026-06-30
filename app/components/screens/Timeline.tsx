'use client'

import { useState, useRef, useEffect } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getDashboardNudge, getPrioritizedMoves } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'
import type { BuddyMood, BuddyEvolutionLevel } from '@/app/components/ui/BuddyAvatar'

const ORANGE = '#F5793A'
const RED    = '#F4442E'
const GREEN  = '#10B981'

type Filter = 'all' | 'urgent' | 'upcoming' | 'done'

interface Props {
  profile: UserProfile
  moves: Record<string, Move>
  openGuide: (key: string) => void
  evolutionLevel?: BuddyEvolutionLevel
}

// ── Category SVG icons ────────────────────────────────────────────────────────

function CategoryIcon({ category, color, size = 20 }: { category: string; color: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (category) {
    case 'enrollment': return (
      <svg {...p}>
        <polygon points="12 2 22 8.5 12 15 2 8.5" />
        <polyline points="17 11 17 18 12 21 7 18 7 11" />
      </svg>
    )
    case 'financial': return (
      <svg {...p}>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
        <line x1="6" y1="15" x2="9" y2="15" />
      </svg>
    )
    case 'visa': return (
      <svg {...p}>
        <rect x="3" y="2" width="18" height="20" rx="2" />
        <circle cx="12" cy="8.5" r="2.5" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <line x1="8" y1="18" x2="13" y2="18" />
      </svg>
    )
    case 'housing': return (
      <svg {...p}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
    case 'health': return (
      <svg {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    )
    case 'academic': return (
      <svg {...p}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    )
    default: return <svg {...p}><circle cx="12" cy="12" r="9" /></svg>
  }
}

// Per-category color scheme for Coming Up cards
const catColors: Record<string, { bg: string }> = {
  enrollment: { bg: '#4F46E5' },
  financial:  { bg: '#059669' },
  visa:       { bg: '#7C3AED' },
  housing:    { bg: '#D97706' },
  health:     { bg: '#DC2626' },
  academic:   { bg: '#2563EB' },
}
function getCat(c: string) { return catColors[c] ?? { bg: '#6B7280' } }

// ── Helper predicates ─────────────────────────────────────────────────────────

function isLocked(moveKey: string, moves: Record<string, Move>): boolean {
  const move = moves[moveKey]
  if (!move || move.done) return false
  return move.dependsOn.some(dep => !moves[dep]?.done)
}

function getBlockers(moveKey: string, moves: Record<string, Move>): string[] {
  const move = moves[moveKey]
  if (!move) return []
  return move.dependsOn.filter(dep => !moves[dep]?.done).map(dep => moves[dep]?.title ?? dep)
}

function isOverdue(move: Move): boolean {
  return !move.done && move.daysUntil !== null && move.daysUntil < 0
}


// ── Sparkle shape (4-pointed star) ───────────────────────────────────────────

function Sparkle({ x, y, s, color, rot = 0, op = 1 }: { x: number; y: number; s: number; color: string; rot?: number; op?: number }) {
  const h = s / 2, q = s / 5.5
  return (
    <path
      d={`M${x} ${y - h} L${x + q} ${y - q} L${x + h} ${y} L${x + q} ${y + q} L${x} ${y + h} L${x - q} ${y + q} L${x - h} ${y} L${x - q} ${y - q}Z`}
      fill={color} opacity={op} transform={`rotate(${rot},${x},${y})`}
    />
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, sub, badge }: { label: string; sub?: string; badge?: { n: number; color: string } }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#1A1A1A', letterSpacing: '-0.5px' }}>{label}</div>
        {badge && (
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>{badge.n}</span>
          </div>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#999999', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function OverdueCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const days = Math.abs(move.daysUntil!)
  return (
    <div style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF0EF 100%)', borderRadius: 24, padding: '18px 18px 16px', border: '1.5px solid rgba(244,68,46,0.15)', boxShadow: '0 4px 24px rgba(244,68,46,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 17, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(244,68,46,0.38)' }}>
          <CategoryIcon category={move.category} color="white" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.25, letterSpacing: '-0.3px' }}>{move.title}</div>
          <div style={{ fontSize: 12, color: '#999999', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{move.subtitle}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: RED, lineHeight: 1, letterSpacing: '-2px' }}>{days}</div>
          <div style={{ fontSize: 9, color: RED, fontWeight: 800, marginTop: 1, letterSpacing: '0.5px', textTransform: 'uppercase' }}>day{days !== 1 ? 's' : ''} overdue</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, padding: '10px 12px', background: '#FEF2F2', borderRadius: 14 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span style={{ fontSize: 12, color: '#B91C1C', lineHeight: 1.5 }}>{move.consequence}</span>
      </div>
      <button
        onClick={() => openGuide(moveKey)}
        style={{ width: '100%', padding: '13px', borderRadius: 50, background: 'linear-gradient(135deg, #F4442E, #DC2626)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px' }}
      >
        Get recovery help →
      </button>
    </div>
  )
}

function ActNowCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const days = move.daysUntil
  return (
    <div style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)', borderRadius: 24, padding: '18px 18px 16px', border: '1.5px solid rgba(245,121,58,0.15)', boxShadow: '0 4px 24px rgba(245,121,58,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 17, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(245,121,58,0.38)' }}>
          <CategoryIcon category={move.category} color="white" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.25, letterSpacing: '-0.3px' }}>{move.title}</div>
          <div style={{ fontSize: 12, color: '#999999', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{move.subtitle}</div>
        </div>
        {days !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 46, fontWeight: 900, color: ORANGE, lineHeight: 1, letterSpacing: '-2px' }}>{days}</div>
            <div style={{ fontSize: 9, color: ORANGE, fontWeight: 800, marginTop: 1, letterSpacing: '0.5px', textTransform: 'uppercase' }}>day{days !== 1 ? 's' : ''} left</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, padding: '10px 12px', background: '#FFFBEB', borderRadius: 14 }}>
        <span style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>If missed: {move.consequence}</span>
      </div>
      <button
        onClick={() => openGuide(moveKey)}
        style={{ width: '100%', padding: '13px', borderRadius: 50, background: 'linear-gradient(135deg, #F5793A, #E06020)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px' }}
      >
        Start now →
      </button>
    </div>
  )
}

function ComingUpCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const cat = getCat(move.category)
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 20, background: 'white', border: '1.5px solid #F0F0F0', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 15, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CategoryIcon category={move.category} color="white" size={21} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.2px' }}>{move.title}</div>
        <div style={{ fontSize: 11, color: '#999999', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{move.subtitle}</div>
      </div>
      {move.daysUntil !== null && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#1A1A1A', lineHeight: 1, letterSpacing: '-1px' }}>{move.daysUntil}</div>
          <div style={{ fontSize: 9, color: '#BBBBBB', marginTop: 1, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>days</div>
        </div>
      )}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

function LockedCard({ moveKey, move, blockers, openGuide }: { moveKey: string; move: Move; blockers: string[]; openGuide: (k: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#F9F9F8', borderRadius: 18, border: '1.5px solid #EEEEEC', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EEEEEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#AAAAAA', letterSpacing: '-0.2px' }}>{move.title}</div>
          <div style={{ fontSize: 11, color: '#CCCCCC', marginTop: 2 }}>Needs {blockers[0]} first</div>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 15px 14px', borderTop: '1px solid #EEEEEC' }}>
          <div style={{ fontSize: 11, color: '#BBBBBB', marginBottom: 7, marginTop: 10, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Unlocks after</div>
          {blockers.map((b, i) => (
            <div key={i} style={{ fontSize: 12, color: '#888888', fontWeight: 600, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#CCCCCC', flexShrink: 0 }} />
              {b}
            </div>
          ))}
          <button
            onClick={() => openGuide(moveKey)}
            style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 50, background: 'white', border: '1.5px solid #E5E5E5', color: '#AAAAAA', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            Preview anyway
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Timeline({ profile, moves, openGuide, evolutionLevel = 0 }: Props) {
  const nudge = getDashboardNudge(profile)
  const ordered = getPrioritizedMoves(profile, moves)

  const overdue  = ordered.filter(k => !moves[k].done && isOverdue(moves[k]) && !isLocked(k, moves))
  const actNow   = ordered.filter(k => !moves[k].done && !isOverdue(moves[k]) && moves[k].urgency === 'critical' && !isLocked(k, moves))
  const comingUp = ordered.filter(k => !moves[k].done && !isOverdue(moves[k]) && moves[k].urgency !== 'critical' && !isLocked(k, moves))
  const locked   = ordered.filter(k => !moves[k].done && isLocked(k, moves))
  const done     = ordered.filter(k => moves[k].done)

  const completedCount = done.length
  const totalCount     = ordered.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const buddyMood: BuddyMood = completedCount === totalCount ? 'celebrate' : overdue.length > 0 ? 'urgent' : 'happy'

  const [activeFilter, setActiveFilter] = useState<Filter>('all')

  const greetingRef = useRef<HTMLDivElement>(null)
  const [greetingH, setGreetingH] = useState(160)
  useEffect(() => {
    if (greetingRef.current) setGreetingH(greetingRef.current.offsetHeight)
  }, [])

  const greetingText =
    overdue.length > 0
      ? `${overdue.length} task${overdue.length > 1 ? 's' : ''} need attention`
      : completedCount === totalCount
      ? 'All done! 🎉'
      : `Hi ${profile.name?.split(' ')[0] || 'there'}!`

  const showOverdue  = activeFilter === 'all' || activeFilter === 'urgent'
  const showActNow   = activeFilter === 'all' || activeFilter === 'urgent'
  const showComingUp = activeFilter === 'all' || activeFilter === 'upcoming'
  const showLocked   = activeFilter === 'all' || activeFilter === 'upcoming'
  const showDone     = activeFilter === 'all' || activeFilter === 'done'

  const filters: { id: Filter; label: string }[] = [
    { id: 'all',      label: 'All tasks' },
    { id: 'urgent',   label: 'Urgent' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'done',     label: 'Done' },
  ]

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

      {/* ── Illustrated hero greeting ────────────────────────────────────────── */}
      <div ref={greetingRef} style={{ padding: '20px 20px 22px', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative SVG layer — sparkles, dots, grad cap */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 393 160"
          preserveAspectRatio="xMidYMid slice"
        >
          <Sparkle x={338} y={24}  s={16} color="#F59E0B" op={0.55} rot={15} />
          <Sparkle x={362} y={92}  s={10} color="#FB7185" op={0.45} rot={30} />
          <Sparkle x={22}  y={112} s={12} color="#34D399" op={0.45} rot={-10} />
          <Sparkle x={54}  y={18}  s={8}  color="#60A5FA" op={0.50} rot={20} />
          <Sparkle x={308} y={142} s={14} color="#A78BFA" op={0.35} rot={0} />
          <Sparkle x={165} y={8}   s={7}  color="#F5793A" op={0.40} rot={45} />
          <circle cx={374} cy={54}  r={7}  fill="#F5793A" opacity={0.20} />
          <circle cx={16}  cy={52}  r={9}  fill="#60A5FA" opacity={0.15} />
          <circle cx={283} cy={62}  r={5}  fill="#34D399" opacity={0.28} />
          <circle cx={368} cy={132} r={4}  fill="#F59E0B" opacity={0.28} />
          <circle cx={200} cy={150} r={10} fill="#FB7185" opacity={0.12} />
          {/* Grad cap doodle */}
          <g transform="translate(344,108) rotate(12)" opacity={0.32}>
            <polygon points="0,-9 15,0 0,9 -15,0" fill="#F59E0B" />
            <polygon points="8,0 15,0 15,11 8,11" fill="#F59E0B" />
            <line x1="0" y1="9" x2="0" y2="18" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Tiny star cluster top-left */}
          <circle cx={80}  cy={32}  r={2.5} fill="#FB7185" opacity={0.5} />
          <circle cx={90}  cy={22}  r={1.8} fill="#A78BFA" opacity={0.55} />
          <circle cx={100} cy={36}  r={2}   fill="#60A5FA" opacity={0.45} />
        </svg>

        {/* Greeting text + buddy */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1A1A1A', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
              {greetingText}
            </div>
            <div style={{ fontSize: 13, color: '#5C5C52', marginTop: 7, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {nudge.body}
            </div>
          </div>
          <BuddyAvatar mood={buddyMood} size={54} evolutionLevel={evolutionLevel} />
        </div>

        {/* Progress pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 10px', borderRadius: 50, background: 'rgba(0,0,0,0.06)' }}>
          <div style={{ width: 72, height: 5, borderRadius: 5, background: 'rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 5, background: completedCount === totalCount ? GREEN : ORANGE, width: `${pct}%`, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#3A3A3A' }}>{completedCount}/{totalCount} done</span>
        </div>
      </div>

      {/* ── Scroll sheet ─────────────────────────────────────────────────────── */}
      <div className="no-scroll" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ height: greetingH, flexShrink: 0 }} />

        <div style={{
          background: 'white',
          borderRadius: '24px 24px 0 0',
          minHeight: `calc(100% - ${greetingH}px)`,
          padding: '18px 16px 96px',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>

          {/* Filter chips */}
          <div className="no-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '8px 16px', borderRadius: 50, flexShrink: 0, border: 'none', cursor: 'pointer',
                  background: activeFilter === f.id ? '#1A1A1A' : 'white',
                  color: activeFilter === f.id ? 'white' : '#555555',
                  fontSize: 13, fontWeight: 700,
                  boxShadow: activeFilter === f.id ? '0 2px 8px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.07)',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Flat timeline — one continuous line through all sections */}
          {(() => {
            type FI =
              | { t: 'L'; label: string; badge?: { n: number; color: string } }
              | { t: 'overdue' | 'actNow' | 'comingUp' | 'locked' | 'done'; id: string }

            const flat: FI[] = []
            if (showOverdue  && overdue.length  > 0) { flat.push({ t: 'L', label: 'Overdue',   badge: { n: overdue.length,  color: RED   } }); overdue.forEach(id  => flat.push({ t: 'overdue',  id })) }
            if (showActNow   && actNow.length   > 0) { flat.push({ t: 'L', label: 'Act now'                                                }); actNow.forEach(id   => flat.push({ t: 'actNow',   id })) }
            if (showComingUp && comingUp.length > 0) { flat.push({ t: 'L', label: 'Coming up'                                              }); comingUp.forEach(id => flat.push({ t: 'comingUp', id })) }
            if (showLocked   && locked.length   > 0) { flat.push({ t: 'L', label: 'Waiting on'                                             }); locked.forEach(id   => flat.push({ t: 'locked',   id })) }
            if (showDone     && done.length     > 0) { flat.push({ t: 'L', label: 'Completed', badge: { n: done.length,    color: GREEN  } }); done.forEach(id     => flat.push({ t: 'done',     id })) }

            if (flat.length === 0) return null

            const dotColor = (t: string) =>
              t === 'overdue' ? RED : t === 'actNow' ? ORANGE : t === 'done' ? GREEN : '#C8C8C8'
            const dotFill  = (t: string) => t === 'overdue' || t === 'actNow' || t === 'done'

            return (
              <div style={{ position: 'relative' }}>
                {/* Single continuous line — runs from just below filter chips to near last dot */}
                <div style={{ position: 'absolute', left: 9, top: 10, bottom: 22, width: 1.5, background: '#DDDDD8', zIndex: 0 }} />

                {flat.map((item, idx) => {
                  if (item.t === 'L') {
                    return (
                      <div key={`lbl-${idx}`} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ width: 20, flexShrink: 0 }} />
                        <div style={{ flex: 1, padding: `${idx === 0 ? 0 : 20}px 0 6px` }}>
                          <SectionLabel label={item.label} badge={item.badge} />
                        </div>
                      </div>
                    )
                  }

                  const dc = dotColor(item.t)
                  const df = dotFill(item.t)
                  const isLast = idx === flat.length - 1

                  const card = item.t === 'overdue'  ? <OverdueCard  moveKey={item.id} move={moves[item.id]} openGuide={openGuide} />
                             : item.t === 'actNow'   ? <ActNowCard   moveKey={item.id} move={moves[item.id]} openGuide={openGuide} />
                             : item.t === 'comingUp' ? <ComingUpCard moveKey={item.id} move={moves[item.id]} openGuide={openGuide} />
                             : item.t === 'locked'   ? <LockedCard   moveKey={item.id} move={moves[item.id]} blockers={getBlockers(item.id, moves)} openGuide={openGuide} />
                             : (
                              <button onClick={() => openGuide(item.id)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 18, background: 'white', border: '1.5px solid #F0F0F0', cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#666666', flex: 1 }}>{moves[item.id].title}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DDDDDD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                              </button>
                            )

                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 10, paddingBottom: isLast ? 0 : 12 }}>
                      <div style={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 22, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: df ? dc : 'white', border: `2px solid ${dc}` }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>{card}</div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Empty state for filtered views */}
          {((activeFilter === 'urgent'   && overdue.length === 0 && actNow.length === 0) ||
            (activeFilter === 'upcoming' && comingUp.length === 0 && locked.length === 0) ||
            (activeFilter === 'done'     && done.length === 0)) && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#BBBBBB' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#888888', letterSpacing: '-0.3px' }}>All clear here</div>
              <div style={{ fontSize: 13, marginTop: 6, color: '#AAAAAA' }}>Nothing in this section right now</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
