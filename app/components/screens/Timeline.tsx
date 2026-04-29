'use client'

import { useState } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { cohortColors, getDashboardNudge, getPrioritizedMoves } from '@/app/lib/recommendations'

interface Props {
  profile: UserProfile
  moves: Record<string, Move>
  openGuide: (key: string) => void
}

const categoryIcons: Record<string, string> = {
  enrollment: '🎓',
  financial:  '💰',
  visa:       '🛂',
  housing:    '🏠',
  health:     '🏥',
  academic:   '📚',
}

const urgencyConfig = {
  critical: { bar: '#EF4444', bg: '#FEF2F2', border: '#FECACA', badge: '#DC2626', badgeBg: '#FEE2E2', label: 'Act now' },
  soon:     { bar: '#F97316', bg: '#FFF7ED', border: '#FED7AA', badge: '#EA580C', badgeBg: '#FFEDD5', label: 'This week' },
  upcoming: { bar: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', badge: '#6D28D9', badgeBg: '#EDE9FE', label: 'Coming up' },
  locked:   { bar: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB', badge: '#6B7280', badgeBg: '#F3F4F6', label: 'Locked' },
}

function TaskCard({ moveKey, move, openGuide, expanded, onToggleExpand }: {
  moveKey: string
  move: Move
  openGuide: (key: string) => void
  expanded: boolean
  onToggleExpand: () => void
}) {
  const cfg = urgencyConfig[move.urgency]
  const isLocked = move.done || move.urgency === 'locked'

  return (
    <div style={{
      borderRadius: 16,
      border: `1px solid ${cfg.border}`,
      background: move.done ? '#F9FAFB' : cfg.bg,
      overflow: 'hidden',
      opacity: move.done ? 0.65 : 1,
    }}>
      {/* Urgency bar */}
      {!move.done && (
        <div style={{ height: 3, background: cfg.bar }} />
      )}

      {/* Header row */}
      <div style={{ padding: '13px 14px 11px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Category icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: move.done ? '#E5E7EB' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, border: `1px solid ${cfg.border}`,
        }}>
          {move.done ? '✓' : categoryIcons[move.category] || '📋'}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: move.done ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4, textDecoration: move.done ? 'line-through' : 'none' }}>
            {move.title}
          </div>
          {/* Deadline badge */}
          {!move.done && move.daysUntil !== null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: cfg.badgeBg, border: `1px solid ${cfg.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: cfg.badge }}>
                {move.daysUntil === 0 ? 'TODAY' : move.daysUntil === 1 ? '1 day left' : `${move.daysUntil} days`}
              </span>
            </div>
          )}
          {move.done && (
            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Completed ✓</div>
          )}
        </div>

        {/* Chevron toggle */}
        <button
          onClick={onToggleExpand}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-tertiary)', flexShrink: 0, padding: '2px 0' }}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Consequence line — always visible for non-done items */}
      {!move.done && (
        <div style={{ margin: '0 14px 10px', padding: '8px 10px', borderRadius: 8, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)', display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span style={{ fontSize: 12, color: '#B91C1C', lineHeight: 1.45, fontWeight: 500 }}>
            If missed: {move.consequence}
          </span>
        </div>
      )}

      {/* Dependencies warning */}
      {!move.done && move.dependsOn.length > 0 && (
        <div style={{ margin: '0 14px 10px', padding: '6px 10px', borderRadius: 8, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>🔗</span>
          <span style={{ fontSize: 11, color: '#6D28D9', lineHeight: 1.4 }}>
            Requires: {move.dependsOn.join(', ')}
          </span>
        </div>
      )}

      {/* Expanded: AI context + CTA */}
      {expanded && !move.done && (
        <div style={{ borderTop: '1px solid ' + cfg.border }}>
          {move.ai && (
            <div style={{ margin: '12px 14px 0', padding: '10px 12px', borderRadius: 10, background: 'white', border: '1px solid ' + cfg.border }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: cfg.badge, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>
                💡 Why this matters now
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55 }}>{move.ai}</div>
            </div>
          )}
          <div style={{ padding: '12px 14px 14px' }}>
            <button
              onClick={() => openGuide(moveKey)}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                color: 'white', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px',
              }}
            >
              Do this now →
            </button>
          </div>
        </div>
      )}

      {/* Expanded: done state */}
      {expanded && move.done && (
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>This step is complete. View the guide to review details.</div>
          <button
            onClick={() => openGuide(moveKey)}
            style={{ marginTop: 8, fontSize: 12, color: '#7C3AED', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            View guide →
          </button>
        </div>
      )}
    </div>
  )
}

export default function Timeline({ profile, moves, openGuide }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ enrolldeposit: true })
  const nudge = getDashboardNudge(profile)
  const ordered = getPrioritizedMoves(profile, moves)

  const actNow = ordered.filter(k => !moves[k].done && (moves[k].urgency === 'critical' || moves[k].daysUntil !== null && moves[k].daysUntil! <= 21)).slice(0, 3)
  const comingUp = ordered.filter(k => !moves[k].done && !actNow.includes(k))
  const done = ordered.filter(k => moves[k].done)

  const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const completedCount = done.length
  const totalCount = ordered.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Greeting + cohort badges */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
            Hi {profile.name?.split(' ')[0] || 'there'} 👋
          </div>
          {profile.cohorts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {profile.cohorts.map(c => (
                <span key={c} style={{
                  padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                  background: cohortColors[c].bg, color: cohortColors[c].text, border: `1px solid ${cohortColors[c].border}`,
                }}>
                  {c === 'international' ? '🌐 International' : c === 'firstgen' ? '⭐ First-gen' : c === 'lowincome' ? '💛 Financial aid' : '↗ Transfer'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 2 }}>Pre-arrival progress</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{completedCount} of {totalCount} complete</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>{pct}%</div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ height: '100%', borderRadius: 3, background: '#F97316', width: `${pct}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Nudge message */}
        <div style={{ padding: '12px 14px', borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 3 }}>{nudge.title}</div>
            <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.55 }}>{nudge.body}</div>
          </div>
        </div>

        {/* Act Now section */}
        {actNow.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>●</span> Act now — {actNow.length} urgent
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actNow.map(key => (
                <TaskCard
                  key={key}
                  moveKey={key}
                  move={moves[key]}
                  openGuide={openGuide}
                  expanded={!!expanded[key]}
                  onToggleExpand={() => toggleExpand(key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Coming up section */}
        {comingUp.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              Coming up
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {comingUp.map(key => (
                <TaskCard
                  key={key}
                  moveKey={key}
                  move={moves[key]}
                  openGuide={openGuide}
                  expanded={!!expanded[key]}
                  onToggleExpand={() => toggleExpand(key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Done section */}
        {done.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              Done ✓
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {done.map(key => (
                <TaskCard
                  key={key}
                  moveKey={key}
                  move={moves[key]}
                  openGuide={openGuide}
                  expanded={!!expanded[key]}
                  onToggleExpand={() => toggleExpand(key)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
