'use client'

import { useState } from 'react'
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

const categoryIcon: Record<string, string> = {
  enrollment: '🎓', financial: '💰', visa: '🛂',
  housing: '🏠', health: '🏥', academic: '📚',
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
  const color = days <= 3 ? RED : days <= 7 ? ORANGE : '#8A8A8A'
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

// ── Item cards ───────────────────────────────────────────────────────────────

function OverdueCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '14px 14px 12px', border: '1px solid #F0F0F0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {categoryIcon[move.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{move.title}</div>
          <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{move.subtitle}</div>
        </div>
        <DeadlineLabel days={move.daysUntil!} urgency="critical" />
      </div>
      <div style={{ fontSize: 12, color: '#B91C1C', background: '#FEF2F2', borderRadius: 8, padding: '7px 10px', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        ⚠ {move.consequence}
      </div>
      <button
        onClick={() => openGuide(moveKey)}
        style={{ width: '100%', padding: '11px', borderRadius: 50, background: 'linear-gradient(145deg, #F4442E, #D93020)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: '-0.1px' }}
      >
        Get recovery help →
      </button>
    </div>
  )
}

function ActNowCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '14px 14px 12px', border: '1px solid #F0F0F0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {categoryIcon[move.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{move.title}</div>
          <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{move.subtitle}</div>
        </div>
        {move.daysUntil !== null && <DeadlineLabel days={move.daysUntil} urgency={move.urgency} />}
      </div>
      <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', borderRadius: 8, padding: '7px 10px', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        If missed: {move.consequence}
      </div>
      <button
        onClick={() => openGuide(moveKey)}
        style={{ width: '100%', padding: '11px', borderRadius: 50, background: 'linear-gradient(145deg, #F5793A, #E06020)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
      >
        Start now →
      </button>
    </div>
  )
}

function ComingUpCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'white', border: '1px solid #F0F0F0', cursor: 'pointer' }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {categoryIcon[move.category]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{move.title}</div>
        <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 1 }}>{move.subtitle}</div>
      </div>
      {move.daysUntil !== null && <DeadlineLabel days={move.daysUntil} urgency={move.urgency} />}
      <span style={{ color: '#CCCCCC', fontSize: 16, marginLeft: 2 }}>›</span>
    </button>
  )
}

function LockedCard({ moveKey, move, blockers, openGuide }: { moveKey: string; move: Move; blockers: string[]; openGuide: (k: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #F0F0F0', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, opacity: 0.45 }}>
          {categoryIcon[move.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#AAAAAA' }}>{move.title}</div>
          <div style={{ fontSize: 11, color: '#C0C0C0', marginTop: 1 }}>🔒 Needs {blockers[0]}</div>
        </div>
        <span style={{ fontSize: 11, color: '#D1D5DB' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 14px 12px' }}>
          <div style={{ fontSize: 11, color: '#8A8A8A', marginBottom: 6 }}>Unlocks after:</div>
          {blockers.map((b, i) => (
            <div key={i} style={{ fontSize: 12, color: '#444', fontWeight: 500, marginBottom: 3 }}>→ {b}</div>
          ))}
          <button
            onClick={() => openGuide(moveKey)}
            style={{ marginTop: 8, width: '100%', padding: '9px', borderRadius: 50, background: 'white', border: '1.5px solid #E5E5E5', color: '#8A8A8A', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Preview anyway
          </button>
        </div>
      )}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, color = '#8A8A8A', count }: { label: string; color?: string; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, paddingLeft: 34 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
      {count !== undefined && (
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>{count}</span>
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

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#DFE0D9' }}>

      {/* ── Greeting ── */}
      <div style={{ background: 'white', padding: '18px 18px 16px', borderRadius: '0 0 20px 20px', marginBottom: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
              {overdue.length > 0
                ? `${overdue.length} task${overdue.length > 1 ? 's' : ''} need attention`
                : completedCount === totalCount ? 'All done! 🎉'
                : `Hi ${profile.name?.split(' ')[0] || 'there'}`}
            </div>
            <div style={{ fontSize: 13, color: '#8A8A8A', marginTop: 3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {nudge.body}
            </div>
          </div>
          <BuddyAvatar mood={buddyMood} size={52} evolutionLevel={evolutionLevel} />
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#EFEFEF', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: completedCount === totalCount ? GREEN : ORANGE, width: `${pct}%`, transition: 'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#AAAAAA', flexShrink: 0 }}>
            {completedCount} of {totalCount}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px 16px 96px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <SectionLabel label="Overdue" color={RED} count={overdue.length} />
            <div>
              {overdue.map((k, i) => (
                <TimelineItem key={k} dotColor={RED} isLast={i === overdue.length - 1}>
                  <OverdueCard moveKey={k} move={moves[k]} openGuide={openGuide} />
                </TimelineItem>
              ))}
            </div>
          </div>
        )}

        {/* Act now */}
        {actNow.length > 0 && (
          <div>
            <SectionLabel label="Act now" color={ORANGE} />
            <div>
              {actNow.map((k, i) => (
                <TimelineItem key={k} dotColor={ORANGE} isLast={i === actNow.length - 1}>
                  <ActNowCard moveKey={k} move={moves[k]} openGuide={openGuide} />
                </TimelineItem>
              ))}
            </div>
          </div>
        )}

        {/* Coming up */}
        {comingUp.length > 0 && (
          <div>
            <SectionLabel label="Coming up" color="#AAAAAA" />
            <div>
              {comingUp.map((k, i) => (
                <TimelineItem key={k} dotColor="#CCCCCC" dotFill={false} isLast={i === comingUp.length - 1}>
                  <ComingUpCard moveKey={k} move={moves[k]} openGuide={openGuide} />
                </TimelineItem>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <SectionLabel label="Waiting on" color="#C0C0C0" />
            <div>
              {locked.map((k, i) => (
                <TimelineItem key={k} dotColor="#D1D5DB" dotFill={false} isLast={i === locked.length - 1}>
                  <LockedCard moveKey={k} move={moves[k]} blockers={getBlockers(k, moves)} openGuide={openGuide} />
                </TimelineItem>
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <SectionLabel label="Completed" color={GREEN} count={done.length} />
            <div>
              {done.map((k, i) => (
                <TimelineItem key={k} dotColor={GREEN} isLast={i === done.length - 1}>
                  <button
                    onClick={() => openGuide(k)}
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 13, background: 'white', border: '1px solid #F0F0F0', cursor: 'pointer' }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, color: GREEN }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#AAAAAA', flex: 1 }}>{moves[k].title}</span>
                  </button>
                </TimelineItem>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
