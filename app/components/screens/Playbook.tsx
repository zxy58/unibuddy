'use client'

import { useState } from 'react'
import MoveDetail from '../ui/MoveDetail'
import type { Move, MoveFilter } from '@/app/lib/types'
import { lockedMoves } from '@/app/lib/data'

interface PlaybookProps {
  moves: Record<string, Move>
  activeMove: string | null
  openMove: (key: string) => void
  closeMove: () => void
  openShareModal: (moveKey?: string) => void
  openLogModal: (key?: string) => void
}

const filters: { id: MoveFilter; label: string }[] = [
  { id: 'all', label: 'All moves' },
  { id: 'made', label: 'Made' },
  { id: 'learned', label: 'Learned' },
  { id: 'peer', label: 'From peers' },
  { id: 'visa', label: 'Visa' },
  { id: 'academic', label: 'Academic' },
  { id: 'career', label: 'Career' },
]

const moveOrder = ['dso', 'i20', 'sevis', 'critique', 'officehours']

const statusConfig = {
  made: { dot: '#1D9E75', label: 'Made it', labelColor: '#0F6E56', border: '#1D9E75' },
  learned: { dot: '#534AB7', label: 'Learned', labelColor: '#3C3489', border: '#534AB7' },
  peer: { dot: '#BA7517', label: 'From peer', labelColor: '#633806', border: '#BA7517' },
  locked: { dot: 'var(--border-secondary)', label: 'Locked', labelColor: 'var(--text-tertiary)', border: 'var(--border-tertiary)' },
}

export default function Playbook({
  moves,
  activeMove,
  openMove,
  closeMove,
  openShareModal,
  openLogModal,
}: PlaybookProps) {
  const [filter, setFilter] = useState<MoveFilter>('all')

  const visibleMoves = moveOrder.filter((key) => {
    const move = moves[key]
    if (!move) return false
    if (filter === 'all') return true
    return move.tags.includes(filter as MoveFilter)
  })

  if (activeMove && moves[activeMove]) {
    return (
      <MoveDetail
        moveKey={activeMove}
        move={moves[activeMove]}
        onBack={closeMove}
        onShare={() => openShareModal(activeMove)}
        onLog={openLogModal}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 20px 12px',
          borderBottom: '0.5px solid var(--border-tertiary)',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
            My playbook
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            5 learned · 3 made · 2 from peers
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '14px 20px 6px', flexShrink: 0 }}>
        <div className="filter-row">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                border: filter === f.id ? 'none' : '0.5px solid var(--border-secondary)',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
                background: filter === f.id ? '#534AB7' : 'var(--bg-primary)',
                color: filter === f.id ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: filter === f.id ? 500 : 400,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Move list */}
      <div
        className="no-scroll"
        style={{ padding: '6px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}
      >
        {visibleMoves.map((key) => {
          const move = moves[key]
          const cfg = statusConfig[move.type]
          return (
            <div
              key={key}
              onClick={() => openMove(key)}
              style={{
                border: '0.5px solid var(--border-tertiary)',
                borderLeft: `3px solid ${cfg.border}`,
                borderRadius: `0 var(--radius-lg) var(--radius-lg) 0`,
                padding: '14px 16px',
                background: 'var(--bg-primary)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: cfg.dot,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: 11, fontWeight: 500, color: cfg.labelColor }}>
                    {cfg.label}
                  </div>
                </div>
                {move.madeit ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: '#E1F5EE',
                      border: '0.5px solid #9FE1CB',
                      borderRadius: 20,
                      padding: '4px 10px',
                      fontSize: 11,
                      color: '#0F6E56',
                      fontWeight: 500,
                    }}
                  >
                    Growth moment logged
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Not yet made</div>
                )}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>
                {move.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{move.meta}</div>
            </div>
          )
        })}

        {/* Locked moves */}
        {(filter === 'all' || filter === 'career' || filter === 'financial') &&
          lockedMoves
            .filter((lm) => filter === 'all' || lm.tags === filter)
            .map((lm) => (
              <div
                key={lm.title}
                style={{
                  border: '0.5px solid var(--border-tertiary)',
                  borderLeft: '3px solid var(--border-tertiary)',
                  borderRadius: `0 var(--radius-lg) var(--radius-lg) 0`,
                  padding: '14px 16px',
                  background: 'var(--bg-primary)',
                  opacity: 0.55,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--border-secondary)',
                    }}
                  />
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                    Locked
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.4,
                    marginBottom: 4,
                  }}
                >
                  {lm.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {lm.tags.charAt(0).toUpperCase() + lm.tags.slice(1)} · Unlocks: {lm.unlock}
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
