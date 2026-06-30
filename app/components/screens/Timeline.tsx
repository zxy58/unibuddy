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

interface Props {
  profile: UserProfile
  moves: Record<string, Move>
  openGuide: (key: string) => void
  evolutionLevel?: BuddyEvolutionLevel
}

function CategoryIcon({ category, color, size = 18 }: { category: string; color: string; size?: number }) {
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
      <svg {...p}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )
    case 'academic': return (
      <svg {...p}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    )
    default: return (
      <svg {...p}><circle cx="12" cy="12" r="9" /></svg>
    )
  }
}

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

// ── Deadline label ───────────────────────────────────────────────────────────

function DeadlineLabel({ days, urgency }: { days: number; urgency: 'critical' | 'soon' | 'upcoming' }) {
  if (days < 0) {
    return <span style={{ fontSize: 12, fontWeight: 700, color: RED }}>{Math.abs(days)}d overdue</span>
  }
  const color = days <= 3 ? RED : days <= 7 ? ORANGE : '#666666'
  const label = days === 0 ? 'Today' : days === 1 ? '1 day left' : `${days}d left`
  return <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
}

// ── Timeline dot + line wrapper ──────────────────────────────────────────────

function TimelineItem({
  dotColor, dotFill = true, isLast = false, children
}: {
  dotColor: string; dotFill?: boolean; isLast?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      {/* Dot + line column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 20 }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 14,
          background: dotFill ? dotColor : 'white',
          border: `2px solid ${dotColor}`,
          zIndex: 1,
        }} />
        {!isLast && (
          <div style={{ width: 2, flex: 1, background: '#EBEBEB', marginTop: 4, marginBottom: -4 }} />
        )}
      </div>
      {/* Card */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 10 }}>
        {children}
      </div>
    </div>
  )
}

// ── Arrow icon (shared) ───────────────────────────────────────────────────────

function ArrowIcon({ color = 'rgba(255,255,255,0.6)' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  )
}

// ── Item cards ───────────────────────────────────────────────────────────────

function OverdueCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const days = Math.abs(move.daysUntil!)
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, background: 'linear-gradient(150deg, #E8372A 0%, #B82218 100%)', borderRadius: 22, padding: '18px 18px 16px', boxShadow: '0 10px 28px rgba(232,55,42,0.30)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <CategoryIcon category={move.category} color="rgba(255,255,255,0.6)" size={13} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{move.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{days}d overdue</span>
          <ArrowIcon />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', lineHeight: 1.15, fontStyle: 'italic' }}>
        {move.title}
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <span style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.22)', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' }}>OVERDUE</span>
        <span style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(0,0,0,0.18)', color: 'rgba(255,255,255,0.75)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{move.consequence}</span>
      </div>
    </button>
  )
}

function ActNowCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const days = move.daysUntil
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, background: 'linear-gradient(150deg, #F5793A 0%, #D95E1C 100%)', borderRadius: 22, padding: '18px 18px 16px', boxShadow: '0 10px 28px rgba(245,121,58,0.28)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <CategoryIcon category={move.category} color="rgba(255,255,255,0.6)" size={13} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{move.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {days !== null && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{days}d left</span>}
          <ArrowIcon />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', lineHeight: 1.15, fontStyle: 'italic' }}>
        {move.title}
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <span style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.22)', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' }}>ACT NOW</span>
        <span style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(0,0,0,0.18)', color: 'rgba(255,255,255,0.75)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>If missed: {move.consequence}</span>
      </div>
    </button>
  )
}

function ComingUpCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, background: 'linear-gradient(150deg, #1E2A3A 0%, #141C28 100%)', borderRadius: 22, padding: '18px 18px 16px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <CategoryIcon category={move.category} color="rgba(255,255,255,0.5)" size={13} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{move.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {move.daysUntil !== null && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{move.daysUntil}d</span>}
          <ArrowIcon color="rgba(255,255,255,0.4)" />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.4px', lineHeight: 1.2, fontStyle: 'italic' }}>
        {move.title}
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <span style={{ padding: '4px 11px', borderRadius: 20, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>UPCOMING</span>
      </div>
    </button>
  )
}

function LockedCard({ moveKey, move, blockers, openGuide }: { moveKey: string; move: Move; blockers: string[]; openGuide: (k: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#F2F1EE', borderRadius: 18, border: '1px solid #E8E7E3', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#E4E3DF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CategoryIcon category={move.category} color="#AAAAAA" size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#AAAAAA', fontStyle: 'italic' }}>{move.title}</div>
          <div style={{ fontSize: 11, color: '#BBBBBB', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Needs {blockers[0]}
          </div>
        </div>
        <span style={{ fontSize: 10, color: '#CCCCCC', fontWeight: 600 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #E8E7E3' }}>
          <div style={{ fontSize: 11, color: '#BBBBBB', marginBottom: 6, marginTop: 10 }}>Unlocks after:</div>
          {blockers.map((b, i) => (
            <div key={i} style={{ fontSize: 12, color: '#888888', fontWeight: 500, marginBottom: 3 }}>→ {b}</div>
          ))}
          <button onClick={() => openGuide(moveKey)} style={{ marginTop: 10, width: '100%', padding: '9px', borderRadius: 50, background: 'white', border: '1.5px solid #DDDDDD', color: '#999999', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Preview anyway
          </button>
        </div>
      )}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, color = '#888888', count }: { label: string; color?: string; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
      {count !== undefined && (
        <div style={{ width: 19, height: 19, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: 'white' }}>{count}</span>
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

  const greetingRef = useRef<HTMLDivElement>(null)
  const [greetingH, setGreetingH] = useState(136)

  useEffect(() => {
    if (greetingRef.current) setGreetingH(greetingRef.current.offsetHeight)
  }, [])

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

      {/* ── Greeting — sits on the gradient background behind the scroll sheet ── */}
      <div ref={greetingRef} style={{ padding: '18px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
              {overdue.length > 0
                ? `${overdue.length} task${overdue.length > 1 ? 's' : ''} need attention`
                : completedCount === totalCount ? 'All done! 🎉'
                : `Hi ${profile.name?.split(' ')[0] || 'there'}`}
            </div>
            <div style={{ fontSize: 13, color: '#5C5C52', marginTop: 3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {nudge.body}
            </div>
          </div>
          <BuddyAvatar mood={buddyMood} size={52} evolutionLevel={evolutionLevel} />
        </div>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: completedCount === totalCount ? GREEN : ORANGE, width: `${pct}%`, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', flexShrink: 0 }}>
            {completedCount} of {totalCount}
          </span>
        </div>
      </div>

      {/* ── Scroll sheet — slides up over the greeting when scrolled ── */}
      <div
        className="no-scroll"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* Transparent spacer: greeting is visible through this */}
        <div style={{ height: greetingH, flexShrink: 0 }} />

        {/* White card sheet with rounded top corners */}
        <div style={{
          background: 'white',
          borderRadius: '20px 20px 0 0',
          minHeight: `calc(100% - ${greetingH}px)`,
          padding: '20px 16px 96px',
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>

          {/* Overdue */}
          {overdue.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionLabel label="Overdue" color={RED} count={overdue.length} />
              {overdue.map(k => <OverdueCard key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          )}

          {/* Act now */}
          {actNow.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionLabel label="Act now" color={ORANGE} />
              {actNow.map(k => <ActNowCard key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          )}

          {/* Coming up */}
          {comingUp.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionLabel label="Coming up" color="#6B6B6B" />
              {comingUp.map(k => <ComingUpCard key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionLabel label="Waiting on" color="#AAAAAA" />
              {locked.map(k => <LockedCard key={k} moveKey={k} move={moves[k]} blockers={getBlockers(k, moves)} openGuide={openGuide} />)}
            </div>
          )}

          {/* Done */}
          {done.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SectionLabel label="Completed" color={GREEN} count={done.length} />
              {done.map(k => (
                <button
                  key={k}
                  onClick={() => openGuide(k)}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'white', border: '1px solid #F0F0F0', cursor: 'pointer' }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: 13, color: '#666666', flex: 1, fontStyle: 'italic' }}>{moves[k].title}</span>
                  <CategoryIcon category={moves[k].category} color="#CCCCCC" size={14} />
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
