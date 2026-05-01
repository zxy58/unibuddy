'use client'

import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { cohortColors, getDashboardNudge, getPrioritizedMoves } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'
import type { BuddyMood, BuddyEvolutionLevel } from '@/app/components/ui/BuddyAvatar'

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

const urgencyStyle = {
  critical: { accent: '#EF4444', badgeBg: '#FEE2E2', badgeText: '#DC2626', cardBorder: '#FECACA', cardBg: '#FFFAFA' },
  soon:     { accent: '#F97316', badgeBg: '#FFEDD5', badgeText: '#EA580C', cardBorder: '#FED7AA', cardBg: '#FFFAF5' },
  upcoming: { accent: 'var(--clr-primary)', badgeBg: 'var(--clr-primary-light)', badgeText: 'var(--clr-primary-dark)', cardBorder: 'var(--clr-primary-border)', cardBg: '#FDFCFF' },
}

function DeadlineBadge({ days, urgency }: { days: number; urgency: 'critical' | 'soon' | 'upcoming' }) {
  const s = urgencyStyle[urgency]
  const label = days === 0 ? 'Today' : days === 1 ? '1 day' : `${days}d`
  return (
    <div style={{ padding: '3px 9px', borderRadius: 20, background: s.badgeBg, border: `1px solid ${s.cardBorder}`, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: s.badgeText }}>{label}</span>
    </div>
  )
}

// Compact row for "coming up" — just title + days + chevron
function CompactRow({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const s = urgencyStyle[move.urgency]
  return (
    <button
      onClick={() => openGuide(moveKey)}
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: 'white', border: `1px solid ${s.cardBorder}`, cursor: 'pointer' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {categoryIcon[move.category]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{move.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{move.subtitle}</div>
      </div>
      {move.daysUntil !== null && <DeadlineBadge days={move.daysUntil} urgency={move.urgency} />}
      <span style={{ color: 'var(--text-tertiary)', fontSize: 16 }}>›</span>
    </button>
  )
}

// Featured "Act Now" card — larger, with consequence + single CTA
function ActNowCard({ moveKey, move, openGuide }: { moveKey: string; move: Move; openGuide: (k: string) => void }) {
  const s = urgencyStyle[move.urgency]
  return (
    <div style={{ borderRadius: 18, border: `1.5px solid ${s.cardBorder}`, background: s.cardBg, overflow: 'hidden' }}>
      {/* Urgency bar */}
      <div style={{ height: 4, background: s.accent }} />
      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {categoryIcon[move.category]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.2px' }}>{move.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{move.subtitle}</div>
          </div>
          {move.daysUntil !== null && <DeadlineBadge days={move.daysUntil} urgency={move.urgency} />}
        </div>

        {/* Consequence — one line, icon-led */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, background: 'rgba(220,38,38,0.06)', marginBottom: 12 }}>
          <span style={{ fontSize: 13 }}>⚠</span>
          <span style={{ fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>If missed: {move.consequence}</span>
        </div>

        {/* CTA */}
        <button
          onClick={() => openGuide(moveKey)}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-primary-dark))', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px' }}
        >
          Do this now →
        </button>
      </div>
    </div>
  )
}

export default function Timeline({ profile, moves, openGuide, evolutionLevel = 0 }: Props) {
  const nudge = getDashboardNudge(profile)
  const ordered = getPrioritizedMoves(profile, moves)

  const actNow = ordered.filter(k => !moves[k].done && moves[k].urgency === 'critical').slice(0, 3)
  const comingUp = ordered.filter(k => !moves[k].done && moves[k].urgency !== 'critical')
  const done = ordered.filter(k => moves[k].done)

  const completedCount = done.length
  const totalCount = ordered.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const buddyMood: BuddyMood = completedCount === totalCount ? 'celebrate' : actNow.length > 0 ? 'urgent' : 'happy'

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '4px 18px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Greeting + Buddy */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
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
          <div style={{ flexShrink: 0 }}>
            <BuddyAvatar mood={buddyMood} size={56} evolutionLevel={evolutionLevel} />
          </div>
        </div>

        {/* Buddy speech bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, padding: '11px 14px', borderRadius: '4px 16px 16px 16px', background: 'var(--clr-primary-light)', border: '1.5px solid var(--clr-primary-border)', position: 'relative' }}>
            <div style={{ fontSize: 13, color: 'var(--clr-primary-dark)', lineHeight: 1.55, fontWeight: 500 }}>{nudge.body}</div>
          </div>
        </div>

        {/* Progress bar — compact */}
        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-dark) 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 1 }}>Pre-arrival checklist</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{completedCount} of {totalCount} done</div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 900 }}>{pct}%</div>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ height: '100%', borderRadius: 3, background: '#F97316', width: `${pct}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Act Now */}
        {actNow.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clr-primary)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Coming up</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comingUp.map(k => <CompactRow key={k} moveKey={k} move={moves[k]} openGuide={openGuide} />)}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Done ✓</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {done.map(k => (
                <button key={k} onClick={() => openGuide(k)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', cursor: 'pointer', opacity: 0.7, textAlign: 'left' }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'line-through', flex: 1 }}>{moves[k].title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
