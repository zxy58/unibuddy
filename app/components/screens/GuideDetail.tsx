'use client'

import { useState } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getGuideAI } from '@/app/lib/recommendations'
import FormGuide from '@/app/components/ui/FormGuide'

const FORM_GUIDE_MOVES = new Set(['i20', 'fafsa', 'enrolldeposit'])

interface Props {
  moveKey: string
  move: Move
  profile: UserProfile
  onBack: () => void
  onMarkDone: (key: string) => void
}

const categoryIcon: Record<string, string> = {
  enrollment: '🎓', financial: '💰', visa: '🛂',
  housing: '🏠', health: '🏥', academic: '📚',
}

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  enrollment: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  financial:  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  visa:       { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
  housing:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  health:     { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
  academic:   { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
}

export default function GuideDetail({ moveKey, move, profile, onBack, onMarkDone }: Props) {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({})
  const [aiOpen, setAiOpen] = useState(false)
  const [showPeer, setShowPeer] = useState(false)

  const personalizedAI = getGuideAI(profile, moveKey)
  const col = categoryColor[move.category] || categoryColor.enrollment

  const toggleStep = (i: number) =>
    setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }))

  const checkedCount = Object.values(checkedSteps).filter(Boolean).length
  const allChecked = checkedCount === move.steps.length

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Sticky header */}
      <div style={{ padding: '10px 18px 14px', borderBottom: '1px solid var(--border-tertiary)', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12 }}>
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: col.bg, border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {categoryIcon[move.category]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.2px' }}>{move.title}</div>
            {!move.done && move.daysUntil !== null && (
              <div style={{ fontSize: 11, color: move.daysUntil <= 7 ? '#DC2626' : '#EA580C', fontWeight: 700, marginTop: 3 }}>
                {move.daysUntil === 0 ? 'Due today' : `${move.daysUntil} days left`}
              </div>
            )}
            {move.done && <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 3 }}>Completed ✓</div>}
          </div>
        </div>

        {/* Step progress bar */}
        {!move.done && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Steps</span>
              <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>{checkedCount} / {move.steps.length}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#E9E4FF', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: '#7C3AED', width: `${(checkedCount / move.steps.length) * 100}%`, transition: 'width 0.25s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Consequence — compact, icon-only when good */}
        {!move.done && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>⚠</span>
            <span style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.4 }}>If missed: <strong>{move.consequence}</strong></span>
          </div>
        )}

        {/* Gather chips — pills not bullets */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
            Have ready
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {move.gather.map((item, i) => (
              <div key={i} style={{ padding: '5px 11px', borderRadius: 20, background: col.bg, border: `1px solid ${col.border}`, fontSize: 12, fontWeight: 500, color: col.text }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Steps — interactive checklist */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
            Steps
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {move.steps.map((step, i) => {
              const checked = !!checkedSteps[i]
              return (
                <div key={i} style={{ borderRadius: 12, border: `1px solid ${checked ? '#D1FAE5' : 'var(--border-secondary)'}`, background: checked ? '#F0FDF4' : 'white', overflow: 'hidden' }}>
                  {/* Step row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 12px' }}>
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleStep(i)}
                      style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? '#10B981' : col.border}`, background: checked ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                    >
                      {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </button>

                    {/* Step number + action */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: col.text, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.4, textDecoration: checked ? 'line-through' : 'none' }}>
                          {step.action}
                        </span>
                      </div>
                      {step.detail && !checked && (
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, marginLeft: 16, lineHeight: 1.4 }}>{step.detail}</div>
                      )}
                    </div>
                  </div>

                  {/* Link button — full-width tap target */}
                  {step.link && !checked && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: col.bg, borderTop: `1px solid ${col.border}`, textDecoration: 'none' }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>🔗 {step.link.label}</span>
                      <span style={{ fontSize: 12, color: col.text }}>↗</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* If wrong — compact */}
        <div style={{ padding: '11px 13px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔧</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>If something goes wrong</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{move.ifWrong}</div>
          </div>
        </div>

        {/* Peer insight — collapsed by default */}
        <button
          onClick={() => setShowPeer(p => !p)}
          style={{ width: '100%', textAlign: 'left', padding: '11px 13px', borderRadius: 12, background: col.bg, border: `1px solid ${col.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>💬 From a peer</span>
            <span style={{ fontSize: 12, color: col.text }}>{showPeer ? '▲' : '▼'}</span>
          </div>
          {showPeer && (
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55, fontStyle: 'italic', marginTop: 8 }}>{move.peerInsight}</div>
          )}
        </button>

        {/* Ask UniBuddy AI */}
        <button
          onClick={() => setAiOpen(o => !o)}
          style={{ width: '100%', textAlign: 'left', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #7C3AED', cursor: 'pointer', background: 'none' }}
        >
          <div style={{ padding: '11px 13px', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>✦ Ask UniBuddy</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{aiOpen ? '▲' : '▼'}</span>
          </div>
          {aiOpen && (
            <div style={{ padding: '12px 13px', background: '#F5F3FF' }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, textAlign: 'left' }}>
                {personalizedAI || move.ai}
              </div>
            </div>
          )}
        </button>

        {/* Form Guide — for moves that have fillable forms */}
        {FORM_GUIDE_MOVES.has(moveKey) && !move.done && (
          <FormGuide moveKey={moveKey} profile={profile} />
        )}

        {/* Mark done */}
        {!move.done && (
          <button
            onClick={() => onMarkDone(moveKey)}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: allChecked
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px',
              transition: 'background 0.3s ease',
            }}
          >
            {allChecked ? 'All steps done — Mark complete ✓' : 'Mark as done ✓'}
          </button>
        )}

      </div>
    </div>
  )
}
