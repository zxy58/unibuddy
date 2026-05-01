'use client'

import { useState } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { cohortColors, getDashboardNudge, getPrioritizedMoves } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'
import type { BuddyMood, BuddyEvolutionLevel } from '@/app/components/ui/BuddyAvatar'

const RED   = '#ED1C24'
const BROWN = '#4E3629'

interface Props {
  profile: UserProfile
  moves: Record<string, Move>
  openGuide: (key: string) => void
  evolutionLevel?: BuddyEvolutionLevel
}

const categoryIcon: Record<string, string> = {
  enrollment: '🎓', financial: '💰', visa: '🛂',
  housing: '🏠', health: '🏥', academic: '📚',
}

// ── helpers ──────────────────────────────────────────────────────────────────

function isLocked(moveKey: string, moves: Record<string, Move>): boolean {
  const move = moves[moveKey]
  if (!move || move.done) return false
  return move.dependsOn.some(dep => !moves[dep]?.done)
}

function getBlockers(moveKey: string, moves: Record<string, Move>): string[] {
  const move = moves[moveKey]
  if (!move) return []
  return move.dependsOn
    .filter(dep => !moves[dep]?.done)
    .map(dep => moves[dep]?.title ?? dep)
}

function isOverdue(move: Move): boolean {
  return !move.done && move.daysUntil !== null && move.daysUntil < 0
}

// ── sub-components ────────────────────────────────────────────────────────────

function OverdueBadge({ days }: { days: number }) {
  return (
    <div style={{ padding: '3px 9px', borderRadius: 20, background: '#FEE2E2', border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>{days}d overdue</span>
    </div>
  )
}

function DeadlineBadge({ days, urgency }: { days: number; urgency: 'critical' | 'soon' | 'upcoming' }) {
  if (days < 0) return <OverdueBadge days={Math.abs(days)} />
  const styles = {
    critical: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', dot: '#EF4444' },
    soon:     { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA', dot: '#F97316' },
    upcoming: { bg: '#FFF5F5', text: BROWN,     border: '#FECACA', dot: RED },
  }
  const s = styles[urgency]
  const label = days === 0 ? 'Today' : days === 1 ? '1 day' : `${days}d`
  return (
    <div style={{ padding: '3px 9px', borderRadius: 20, background: s.bg, border: `1px solid ${s.border}`, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: s.text }}>{label}</span>
    </div>
  )
}

// Overdue card — always fully expanded, shows recovery CTA
function OverdueCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  return (
    <div style={{ borderRadius: 16, border: '1.5px solid #FECACA', background: '#FFFAFA', overflow: 'hidden' }}>
      <div style={{ height: 3, background: RED }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {categoryIcon[move.category]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{move.title}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{move.subtitle}</div>
          </div>
          <OverdueBadge days={Math.abs(move.daysUntil!)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#FEF2F2', marginBottom: 10 }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>⚠</span>
          <span style={{ fontSize: 12, color: '#991B1B', fontWeight: 500 }}>{move.consequence}</span>
        </div>

        <button
          onClick={() => openGuide(moveKey)}
          style={{ width: '100%', padding: '11px', borderRadius: 10, background: RED, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
        >
          Get recovery help →
        </button>
      </div>
    </div>
  )
}

// Normal act-now card
function ActNowCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const urgency = move.urgency
  const styles = {
    critical: { accent: '#EF4444', badgeBg: '#FEE2E2', cardBorder: '#FECACA', cardBg: '#FFFAFA' },
    soon:     { accent: '#F97316', badgeBg: '#FFEDD5', cardBorder: '#FED7AA', cardBg: '#FFFAF5' },
    upcoming: { accent: RED,       badgeBg: '#FFF5F5', cardBorder: '#FECACA', cardBg: '#FFFAFA' },
  }
  const s = styles[urgency]
  return (
    <div style={{ borderRadius: 16, border: `1.5px solid ${s.cardBorder}`, background: s.cardBg, overflow: 'hidden' }}>
      <div style={{ height: 3, background: s.accent }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {categoryIcon[move.category]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{move.title}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{move.subtitle}</div>
          </div>
          {move.daysUntil !== null && <DeadlineBadge days={move.daysUntil} urgency={urgency} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 8, background: 'rgba(220,38,38,0.06)', marginBottom: 10 }}>
          <span style={{ fontSize: 12 }}>⚠</span>
          <span style={{ fontSize: 11, color: '#B91C1C', fontWeight: 500 }}>If missed: {move.consequence}</span>
        </div>
        <button
          onClick={() => openGuide(moveKey)}
          style={{ width: '100%', padding: '12px', borderRadius: 10, background: RED, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800 }}
        >
          Do this now →
        </button>
      </div>
    </div>
  )
}

// Compact coming-up row
function CompactRow({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, background: 'white', border: '1px solid #E5E7EB', cursor: 'pointer' }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {categoryIcon[move.category]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{move.title}</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{move.subtitle}</div>
      </div>
      {move.daysUntil !== null && move.daysUntil >= 0 && <DeadlineBadge days={move.daysUntil} urgency={move.urgency} />}
      <span style={{ color: '#9CA3AF', fontSize: 16 }}>›</span>
    </button>
  )
}

// Locked card — shows what's blocking it
function LockedCard({ moveKey, move, blockers, openGuide }: { moveKey: string; move: Move; blockers: string[]; openGuide: (k: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ borderRadius: 12, border: '1.5px dashed #E5E7EB', background: '#F9FAFB', overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, opacity: 0.5 }}>
          {categoryIcon[move.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>{move.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 11 }}>🔒</span>
            <span style={{ fontSize: 11, color: '#6B7280' }}>Complete {blockers[0]} first</span>
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#D1D5DB' }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ padding: '9px 10px', borderRadius: 8, background: 'white', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>UNLOCKS AFTER:</div>
            {blockers.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < blockers.length - 1 ? 4 : 0 }}>
                <span style={{ fontSize: 12 }}>→</span>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{b}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => openGuide(moveKey)}
            style={{ marginTop: 8, width: '100%', padding: '9px', borderRadius: 9, background: 'white', border: '1.5px solid #E5E7EB', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Preview guide anyway →
          </button>
        </div>
      )}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function Timeline({ profile, moves, openGuide, evolutionLevel = 0 }: Props) {
  const nudge = getDashboardNudge(profile)
  const ordered = getPrioritizedMoves(profile, moves)

  // Partition tasks into four buckets
  const overdue  = ordered.filter(k => !moves[k].done && isOverdue(moves[k]) && !isLocked(k, moves))
  const actNow   = ordered.filter(k => !moves[k].done && !isOverdue(moves[k]) && moves[k].urgency === 'critical' && !isLocked(k, moves))
  const comingUp = ordered.filter(k => !moves[k].done && !isOverdue(moves[k]) && moves[k].urgency !== 'critical' && !isLocked(k, moves))
  const locked   = ordered.filter(k => !moves[k].done && isLocked(k, moves))
  const done     = ordered.filter(k => moves[k].done)

  const completedCount = done.length
  const totalCount     = ordered.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const buddyMood: BuddyMood = completedCount === totalCount ? 'celebrate' : overdue.length > 0 ? 'urgent' : 'happy'

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
              Hi {profile.name?.split(' ')[0] || 'there'} 👋
            </div>
            {profile.cohorts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {profile.cohorts.map(c => (
                  <span key={c} style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: cohortColors[c].bg, color: cohortColors[c].text, border: `1px solid ${cohortColors[c].border}` }}>
                    {c === 'international' ? '🌐 International' : c === 'firstgen' ? '⭐ First-gen' : c === 'lowincome' ? '💛 Financial aid' : '↗ Transfer'}
                  </span>
                ))}
              </div>
            )}
          </div>
          <BuddyAvatar mood={buddyMood} size={52} evolutionLevel={evolutionLevel} />
        </div>

        {/* Bruno speech bubble */}
        <div style={{ padding: '11px 14px', borderRadius: '4px 14px 14px 14px', background: '#FFF5F5', border: `1.5px solid #FECACA` }}>
          <div style={{ fontSize: 13, color: BROWN, lineHeight: 1.55, fontWeight: 500 }}>{nudge.body}</div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '14px 16px', borderRadius: 14, background: BROWN, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 1 }}>Pre-arrival checklist</div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{completedCount} of {totalCount} done</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>{pct}%</div>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ height: '100%', borderRadius: 3, background: RED, width: `${pct}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: RED }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Overdue — get help now</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {overdue.map(k => <OverdueCard key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          </div>
        )}

        {/* Act now */}
        {actNow.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Act now</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actNow.map(k => <ActNowCard key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          </div>
        )}

        {/* Coming up */}
        {comingUp.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: RED }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: BROWN, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Coming up</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {comingUp.map(k => <CompactRow key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>🔒</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Waiting on dependencies</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {locked.map(k => (
                <LockedCard
                  key={k}
                  moveKey={k}
                  move={moves[k]}
                  blockers={getBlockers(k, moves)}
                  openGuide={openGuide}
                />
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Done ✓</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {done.map(k => (
                <button key={k} onClick={() => openGuide(k)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', cursor: 'pointer', opacity: 0.65, textAlign: 'left' }}>
                  <span style={{ fontSize: 15, color: '#10B981' }}>✓</span>
                  <span style={{ fontSize: 13, color: '#6B7280', textDecoration: 'line-through', flex: 1 }}>{moves[k].title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
