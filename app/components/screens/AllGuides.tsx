'use client'

import type { Move, MoveCategory } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getPrioritizedMoves } from '@/app/lib/recommendations'

interface Props {
  moves: Record<string, Move>
  profile: UserProfile
  openGuide: (key: string) => void
}

const categoryIcons: Record<MoveCategory, string> = {
  enrollment: '🎓',
  financial:  '💰',
  visa:       '🛂',
  housing:    '🏠',
  health:     '🏥',
  academic:   '📚',
}

const categoryColors: Record<MoveCategory, { bg: string; text: string; border: string }> = {
  enrollment: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  financial:  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  visa:       { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
  housing:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  health:     { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
  academic:   { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
}

export default function AllGuides({ moves, profile, openGuide }: Props) {
  const ordered = getPrioritizedMoves(profile, moves)

  // Group by category
  const byCategory: Partial<Record<MoveCategory, string[]>> = {}
  for (const key of ordered) {
    const cat = moves[key].category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat]!.push(key)
  }

  const categories = Object.keys(byCategory) as MoveCategory[]

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Process guides</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>Step-by-step instructions for every admin task</div>
        </div>

        {categories.map(cat => {
          const keys = byCategory[cat]!
          const col = categoryColors[cat]
          return (
            <div key={cat}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: col.bg, border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {categoryIcons[cat]}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: col.text, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
              </div>

              {/* Guide cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {keys.map(key => {
                  const move = moves[key]
                  return (
                    <button
                      key={key}
                      onClick={() => openGuide(key)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '13px 14px',
                        borderRadius: 14, background: move.done ? '#F9FAFB' : 'white',
                        border: `1px solid ${move.done ? '#E5E7EB' : col.border}`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                        opacity: move.done ? 0.7 : 1,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, textDecoration: move.done ? 'line-through' : 'none' }}>
                          {move.title}
                        </div>
                        {!move.done && move.daysUntil !== null && (
                          <div style={{ fontSize: 11, color: move.daysUntil <= 7 ? '#DC2626' : '#EA580C', fontWeight: 600, marginTop: 3 }}>
                            {move.daysUntil === 0 ? 'Due today' : `${move.daysUntil}d left`}
                          </div>
                        )}
                        {move.done && <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 3 }}>Complete ✓</div>}
                      </div>
                      <span style={{ fontSize: 16, color: 'var(--text-tertiary)', flexShrink: 0 }}>›</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
