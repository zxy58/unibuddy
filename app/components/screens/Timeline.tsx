'use client'

import { useState, useRef, useEffect } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getDashboardNudge, getPrioritizedMoves } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'
import type { BuddyMood, BuddyEvolutionLevel } from '@/app/components/ui/BuddyAvatar'

const RED    = '#E85028'
const PURPLE = '#8878CC'
const DARK   = '#1C1C1C'

type Filter = 'all' | 'urgent' | 'upcoming' | 'done'

const filterColors: Record<Filter, { bg: string; text: string }> = {
  all:      { bg: DARK,   text: '#FFFFFF' },
  urgent:   { bg: RED,    text: '#FFFFFF' },
  upcoming: { bg: PURPLE, text: '#FFFFFF' },
  done:     { bg: '#E8E4F8', text: PURPLE },
}

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

const catColors: Record<string, { bg: string; iconColor: string }> = {
  enrollment: { bg: PURPLE, iconColor: '#FFFFFF' },
  financial:  { bg: DARK,   iconColor: '#FFFFFF' },
  visa:       { bg: PURPLE, iconColor: '#FFFFFF' },
  housing:    { bg: RED,    iconColor: '#FFFFFF' },
  health:     { bg: RED,    iconColor: '#FFFFFF' },
  academic:   { bg: PURPLE, iconColor: '#FFFFFF' },
}
function getCat(c: string) { return catColors[c] ?? { bg: DARK, iconColor: '#FFFFFF' } }

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

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, badge }: { label: string; badge?: { n: number; color: string; textColor?: string } }) {
  return (
    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: DARK, letterSpacing: '-0.6px' }}>{label}</div>
      {badge && (
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: badge.textColor ?? '#FFFFFF' }}>{badge.n}</span>
        </div>
      )}
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function OverdueCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const days = Math.abs(move.daysUntil!)
  return (
    <div className="card-press" style={{ background: RED, borderRadius: 24, padding: '20px 20px 18px', cursor: 'pointer' }} onClick={() => openGuide(moveKey)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 8 }}>Overdue</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.4px' }}>{move.title}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-3px' }}>{days}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginTop: 2 }}>day{days !== 1 ? 's' : ''} overdue</div>
        </div>
      </div>
      <div style={{ padding: '10px 13px', background: 'rgba(0,0,0,0.16)', borderRadius: 14, marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>{move.consequence}</span>
      </div>
      <button
        onClick={() => openGuide(moveKey)}
        style={{ width: '100%', padding: '13px', borderRadius: 50, background: '#FFFFFF', color: RED, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px' }}
      >
        Get recovery help →
      </button>
    </div>
  )
}

function ActNowCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const days = move.daysUntil
  return (
    <div className="card-press" style={{ background: PURPLE, borderRadius: 24, padding: '20px 20px 18px', cursor: 'pointer' }} onClick={() => openGuide(moveKey)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 8 }}>Act now</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.4px' }}>{move.title}</div>
        </div>
        {days !== null && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-3px' }}>{days}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' as const, marginTop: 2 }}>day{days !== 1 ? 's' : ''} left</div>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 13px', background: 'rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>If missed: {move.consequence}</span>
      </div>
      <button
        onClick={() => openGuide(moveKey)}
        style={{ width: '100%', padding: '13px', borderRadius: 50, background: '#FFFFFF', color: PURPLE, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px' }}
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
      className="card-press"
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 20, background: `${cat.bg}10`, border: `1.5px solid ${cat.bg}30`, cursor: 'pointer' }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 14, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CategoryIcon category={move.category} color={cat.iconColor} size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: DARK, letterSpacing: '-0.3px' }}>{move.title}</div>
        {move.daysUntil !== null && (
          <div style={{ fontSize: 12, fontWeight: 700, color: cat.bg, marginTop: 3 }}>{move.daysUntil} days left</div>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cat.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

function LockedCard({ moveKey, move, blockers, openGuide }: { moveKey: string; move: Move; blockers: string[]; openGuide: (k: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#F4F4F2', borderRadius: 18, border: '1.5px solid #E8E8E5', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E8E8E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#AAAAAA', letterSpacing: '-0.2px' }}>{move.title}</div>
          <div style={{ fontSize: 11, color: '#C0C0C0', marginTop: 2 }}>Needs {blockers[0]} first</div>
        </div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 15px 14px', borderTop: '1px solid #E8E8E5' }}>
          <div style={{ fontSize: 11, color: '#BBBBBB', marginBottom: 7, marginTop: 10, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' as const }}>Unlocks after</div>
          {blockers.map((b, i) => (
            <div key={i} style={{ fontSize: 12, color: '#888888', fontWeight: 600, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8C8C8', flexShrink: 0 }} />
              {b}
            </div>
          ))}
          <button
            onClick={() => openGuide(moveKey)}
            style={{ marginTop: 10, width: '100%', padding: '10px', borderRadius: 50, background: 'white', border: '1.5px solid #E0E0E0', color: '#AAAAAA', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
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

  const firstName = profile.name?.split(' ')[0] || 'there'
  const greetingText =
    overdue.length > 0
      ? `${overdue.length} task${overdue.length > 1 ? 's' : ''} need attention`
      : completedCount === totalCount
      ? 'All done!'
      : `Hi ${firstName}!`

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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div ref={greetingRef} style={{ padding: '20px 20px 22px', position: 'relative', overflow: 'hidden' }}>

        {/* Ambient decorative sparkles (background) */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          {/* Purple 4-pt sparkle top-left */}
          <path d="M36 17 L37.6 12 L39.2 17 L44.2 18.6 L39.2 20.2 L37.6 25.2 L36 20.2 L31 18.6 Z" fill={PURPLE} opacity="0.5" />
          {/* Red sparkle top-center */}
          <path d="M166 9 L167.2 5 L168.4 9 L172.4 10.2 L168.4 11.4 L167.2 15.4 L166 11.4 L162 10.2 Z" fill={RED} opacity="0.4" />
          {/* Tiny dot top */}
          <circle cx="130" cy="7" r="2.5" fill={PURPLE} opacity="0.22" />
          {/* Tiny dot upper-right */}
          <circle cx="254" cy="18" r="2.5" fill={RED} opacity="0.18" />
          {/* Purple sparkle bottom-left */}
          <path d="M16 102 L17.3 98 L18.6 102 L22.6 103.3 L18.6 104.6 L17.3 108.6 L16 104.6 L12 103.3 Z" fill={PURPLE} opacity="0.4" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: DARK, letterSpacing: '-1px', lineHeight: 1.1 }}>
              {greetingText}
            </div>
            <div style={{ fontSize: 13, color: '#6B6B60', marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              {nudge.body}
            </div>
          </div>
          <BuddyAvatar mood={buddyMood} size={60} evolutionLevel={evolutionLevel} />
        </div>

        {/* Progress + 3-D shape pile */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 10px', borderRadius: 50, background: 'rgba(0,0,0,0.06)' }}>
            <div style={{ width: 72, height: 5, borderRadius: 5, background: 'rgba(0,0,0,0.10)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 5, background: PURPLE, width: `${pct}%`, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{completedCount}/{totalCount} done</span>
          </div>

          {/* 3-D shape pile — focal point right of progress bar */}
          <svg aria-hidden="true" width="100" height="72" viewBox="0 0 100 72" fill="none" style={{ pointerEvents: 'none', flexShrink: 0, marginRight: -4 }}>
            {/* ── Pyramid (red) — top centre ── */}
            <g transform="translate(32, 2)">
              {/* drop shadow */}
              <ellipse cx="17" cy="40" rx="17" ry="3.5" fill="rgba(0,0,0,0.09)" />
              {/* left face (shadow) */}
              <polygon points="17,0 0,40 17,40" fill="#B83418" />
              {/* right face (lit) */}
              <polygon points="17,0 34,40 17,40" fill="#E85028" />
              {/* top-edge glint */}
              <line x1="0" y1="40" x2="34" y2="40" stroke="rgba(255,210,190,0.45)" strokeWidth="1" />
            </g>

            {/* ── Dome (warm peach) — bottom left ── */}
            <g transform="translate(2, 34)">
              {/* shadow */}
              <ellipse cx="15" cy="32" rx="15" ry="3" fill="rgba(0,0,0,0.07)" />
              {/* dome body */}
              <path d="M0,32 Q0,6 15,6 Q30,6 30,32" fill="#F5A87C" />
              {/* specular highlight */}
              <ellipse cx="10" cy="15" rx="4.5" ry="6" fill="rgba(255,255,255,0.28)" transform="rotate(-8 10 15)" />
            </g>

            {/* ── Cube (purple) — bottom right ── */}
            <g transform="translate(56, 36)">
              {/* shadow */}
              <ellipse cx="15" cy="33" rx="15" ry="3" fill="rgba(0,0,0,0.08)" />
              {/* top face */}
              <polygon points="15,0 30,8 15,16 0,8" fill="#B8ACEC" />
              {/* right face */}
              <polygon points="30,8 30,30 15,38 15,16" fill="#8878CC" />
              {/* left face */}
              <polygon points="0,8 15,16 15,38 0,30" fill="#6450A8" />
            </g>
          </svg>
        </div>
      </div>

      {/* ── Scroll sheet ─────────────────────────────────────────────────── */}
      <div className="no-scroll" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', zIndex: 2 }}>
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
            {filters.map(f => {
              const fc = filterColors[f.id]
              const active = activeFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding: '8px 16px', borderRadius: 50, flexShrink: 0, border: 'none', cursor: 'pointer',
                    background: active ? fc.bg : 'white',
                    color: active ? fc.text : '#666666',
                    fontSize: 13, fontWeight: 700,
                    boxShadow: active ? `0 2px 10px ${fc.bg}44` : '0 1px 4px rgba(0,0,0,0.07)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Flat timeline */}
          {(() => {
            type FI =
              | { t: 'L'; label: string; badge?: { n: number; color: string; textColor?: string } }
              | { t: 'overdue' | 'actNow' | 'comingUp' | 'locked' | 'done'; id: string }

            const flat: FI[] = []
            if (showOverdue  && overdue.length  > 0) { flat.push({ t: 'L', label: 'Overdue',   badge: { n: overdue.length, color: RED,  textColor: '#FFFFFF' } }); overdue.forEach(id  => flat.push({ t: 'overdue',  id })) }
            if (showActNow   && actNow.length   > 0) { flat.push({ t: 'L', label: 'Act now'                                                                       }); actNow.forEach(id   => flat.push({ t: 'actNow',   id })) }
            if (showComingUp && comingUp.length > 0) { flat.push({ t: 'L', label: 'Coming up'                                                                     }); comingUp.forEach(id => flat.push({ t: 'comingUp', id })) }
            if (showLocked   && locked.length   > 0) { flat.push({ t: 'L', label: 'Waiting on'                                                                    }); locked.forEach(id   => flat.push({ t: 'locked',   id })) }
            if (showDone     && done.length     > 0) { flat.push({ t: 'L', label: 'Completed', badge: { n: done.length,   color: '#E8E4F8', textColor: PURPLE     } }); done.forEach(id     => flat.push({ t: 'done',     id })) }

            if (flat.length === 0) return null

            const dotColor = (t: string) =>
              t === 'overdue' ? RED : t === 'actNow' ? PURPLE : t === 'done' ? PURPLE : '#D0D0CC'
            const dotFill  = (t: string) => t === 'overdue' || t === 'actNow' || t === 'done'

            return (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 9, top: 10, bottom: 22, width: 1.5, background: '#E8E8E4', zIndex: 0 }} />

                {flat.map((item, idx) => {
                  if (item.t === 'L') {
                    return (
                      <div key={`lbl-${idx}`} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ width: 20, flexShrink: 0 }} />
                        <div style={{ flex: 1, padding: `${idx === 0 ? 0 : 22}px 0 8px` }}>
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
                              <button onClick={() => openGuide(item.id)} className="card-press" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 18, background: '#F2F0FB', border: '1.5px solid #D4CDEF', cursor: 'pointer' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#E8E4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: DARK, flex: 1, opacity: 0.6 }}>{moves[item.id].title}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}><path d="M9 18l6-6-6-6" /></svg>
                              </button>
                            )

                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 10, paddingBottom: isLast ? 0 : 12 }}>
                      <div style={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 22, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: df ? dc : 'white', border: `2.5px solid ${dc}` }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>{card}</div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Empty state */}
          {((activeFilter === 'urgent'   && overdue.length === 0 && actNow.length === 0) ||
            (activeFilter === 'upcoming' && comingUp.length === 0 && locked.length === 0) ||
            (activeFilter === 'done'     && done.length === 0)) && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: DARK, letterSpacing: '-0.3px' }}>All clear here</div>
              <div style={{ fontSize: 13, marginTop: 6, color: '#AAAAAA' }}>Nothing in this section right now</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
