'use client'

import { useState } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getGuideAI } from '@/app/lib/recommendations'

interface Props {
  moveKey: string
  move: Move
  profile: UserProfile
  onBack: () => void
  onMarkDone: (key: string) => void
}

const categoryIcons: Record<string, string> = {
  enrollment: '🎓',
  financial:  '💰',
  visa:       '🛂',
  housing:    '🏠',
  health:     '🏥',
  academic:   '📚',
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  enrollment: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  financial:  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  visa:       { bg: '#EDE9FE', text: '#4C1D95', border: '#C4B5FD' },
  housing:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  health:     { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
  academic:   { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
}

export default function GuideDetail({ moveKey, move, profile, onBack, onMarkDone }: Props) {
  const [aiOpen, setAiOpen] = useState(false)
  const personalizedAI = getGuideAI(profile, moveKey)
  const catColor = categoryColors[move.category] || categoryColors.enrollment

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid var(--border-tertiary)' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 14 }}
        >
          ← Back to timeline
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: catColor.bg, border: `1px solid ${catColor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {categoryIcons[move.category] || '📋'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: catColor.text, marginBottom: 4 }}>
              {move.category.toUpperCase()}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, letterSpacing: '-0.3px' }}>
              {move.title}
            </div>
          </div>
        </div>

        {/* Deadline badge */}
        {!move.done && move.daysUntil !== null && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: move.daysUntil <= 7 ? '#FEE2E2' : '#FFF7ED', border: `1px solid ${move.daysUntil <= 7 ? '#FECACA' : '#FED7AA'}` }}>
            <span style={{ fontSize: 13 }}>🗓</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: move.daysUntil <= 7 ? '#DC2626' : '#EA580C' }}>
              {move.daysUntil === 0 ? 'Due TODAY' : move.daysUntil === 1 ? 'Due tomorrow' : `Due in ${move.daysUntil} days`}
            </span>
          </div>
        )}
        {move.done && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>✓ Completed</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Consequence block */}
        {!move.done && (
          <div style={{ padding: '12px 14px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>⚠ If you miss this</div>
            <div style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>{move.consequence}</div>
          </div>
        )}

        {/* What to gather before you start */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            📎 Gather first
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {move.whatToGather.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 10, background: '#F5F3FF', border: '1px solid #EDE9FE' }}>
                <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>□</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Step by step
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {move.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: catColor.bg, border: `1px solid ${catColor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: catColor.text, flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.55, flex: 1 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* If things go wrong */}
        <div style={{ padding: '14px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>🔧 If something goes wrong</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{move.ifWrongGoesWrong}</div>
        </div>

        {/* Peer insight */}
        <div style={{ padding: '14px', borderRadius: 12, background: catColor.bg, border: `1px solid ${catColor.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: catColor.text, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>💬 From a peer</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55, fontStyle: 'italic' }}>{move.peerInsight}</div>
        </div>

        {/* Ask UniBuddy AI */}
        <div style={{ borderRadius: 14, border: '1px solid #DDD6FE', overflow: 'hidden' }}>
          <button
            onClick={() => setAiOpen(o => !o)}
            style={{ width: '100%', padding: '13px 14px', background: '#7C3AED', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Ask UniBuddy</span>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{aiOpen ? '▲' : '▼'}</span>
          </button>
          {aiOpen && (
            <div style={{ padding: '14px', background: '#F5F3FF' }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {personalizedAI || move.ai}
              </div>
            </div>
          )}
        </div>

        {/* Mark done CTA */}
        {!move.done && (
          <button
            onClick={() => onMarkDone(moveKey)}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px',
            }}
          >
            Mark as done ✓
          </button>
        )}

      </div>
    </div>
  )
}
