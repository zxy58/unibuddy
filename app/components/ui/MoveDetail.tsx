'use client'

import type { Move } from '@/app/lib/types'

interface MoveDetailProps {
  moveKey: string
  move: Move
  onBack: () => void
  onShare: () => void
  onLog: (key: string) => void
}

const stepColors: Record<string, string> = {
  learned: '#534AB7',
  made: '#1D9E75',
  peer: '#BA7517',
}

const hintColors: Record<string, { bg: string; border: string; label: string; text: string }> = {
  learned: { bg: '#EEEDFE', border: '#AFA9EC', label: '#534AB7', text: '#3C3489' },
  made: { bg: '#E1F5EE', border: '#9FE1CB', label: '#0F6E56', text: '#085041' },
  peer: { bg: '#FAEEDA', border: '#FAC775', label: '#633806', text: '#412402' },
}

export default function MoveDetail({ moveKey, move, onBack, onShare, onLog }: MoveDetailProps) {
  const stepColor = stepColors[move.type] || '#534AB7'
  const hint = hintColors[move.type] || hintColors.learned

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 20px 12px',
          borderBottom: '0.5px solid var(--border-tertiary)',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: 'var(--text-primary)',
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {move.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
            {move.meta}
          </div>
        </div>
        <button
          onClick={onShare}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            color: '#534AB7',
            background: '#EEEDFE',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '6px 11px',
            cursor: 'pointer',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          Share →
        </button>
      </div>

      {/* Body */}
      <div
        className="no-scroll"
        style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', flex: 1 }}
      >
        {/* What this move does */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}
          >
            What this move does
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            This is part of the hidden curriculum — knowledge that students with insider networks already
            have. Learning and making this move builds capability you keep.
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}
          >
            How to make it
          </div>
          <div
            style={{
              border: '0.5px solid var(--border-tertiary)',
              borderRadius: 'var(--radius-lg)',
              padding: '4px 14px',
              background: 'var(--bg-primary)',
            }}
          >
            {move.steps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '9px 0',
                  borderBottom:
                    i < move.steps.length - 1 ? '0.5px solid var(--border-tertiary)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: stepColor,
                    fontSize: 11,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                    color: 'white',
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insider knowledge */}
        <div
          style={{
            background: hint.bg,
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            border: `0.5px solid ${hint.border}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: 5,
              color: hint.label,
            }}
          >
            Insider knowledge
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: hint.text }}>{move.insider}</div>
        </div>

        {/* AI for your profile */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            border: '0.5px solid var(--border-tertiary)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500,
              marginBottom: 5,
            }}
          >
            UniBuddy — for your profile
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {move.ai}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
              ✓ You made this move
            </div>
          ) : (
            <button
              onClick={() => onLog(moveKey)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: 'white',
                background: '#534AB7',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '6px 11px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              I made this move — log it →
            </button>
          )}
          <button
            onClick={onShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              color: '#534AB7',
              background: '#EEEDFE',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '6px 11px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Share this move →
          </button>
        </div>
      </div>
    </div>
  )
}
