'use client'

import { useState } from 'react'
import type { Move } from '@/app/lib/types'

interface LogModalProps {
  move: Move | null
  moveKey: string
  onClose: () => void
  onConfirm: () => void
  onShareAfter: () => void
}

const outcomes = ['Worked well', 'Worked partially', 'Tried but struggled', 'Learned something new']

export default function LogModal({ move, onClose, onConfirm, onShareAfter }: LogModalProps) {
  const [note, setNote] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)

  const log = () => {
    onConfirm()
    setStep(2)
  }

  const done = () => {
    setStep(1)
    setNote('')
    setSelectedOutcome(null)
    onClose()
  }

  const shareAfter = () => {
    setStep(1)
    setNote('')
    setSelectedOutcome(null)
    onShareAfter()
  }

  const cancel = () => {
    setStep(1)
    setNote('')
    setSelectedOutcome(null)
    onClose()
  }

  return (
    <div
      className="no-scroll"
      style={{
        background: 'var(--bg-primary)',
        borderRadius: '20px 20px 0 0',
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: 36,
          height: 3,
          borderRadius: 2,
          background: 'var(--border-secondary)',
          margin: '0 auto 16px',
        }}
      />

      {step === 1 ? (
        <>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
            Log a growth moment
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {move?.title}
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            What happened when you made this move?
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Describe what you did and what happened. This becomes part of your growth record."
            style={{
              width: '100%',
              border: '0.5px solid var(--border-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 14px',
              fontSize: 13,
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
            onFocus={(e) => (e.target.style.borderColor = '#534AB7')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-secondary)')}
          />

          <div
            style={{
              marginTop: 12,
              marginBottom: 8,
              fontSize: 11,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}
          >
            How did it go?
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {outcomes.map((o) => (
              <button
                key={o}
                onClick={() => setSelectedOutcome(o)}
                style={{
                  border: selectedOutcome === o ? 'none' : '0.5px solid var(--border-secondary)',
                  borderRadius: 20,
                  padding: '6px 12px',
                  fontSize: 12,
                  background: selectedOutcome === o ? '#534AB7' : 'var(--bg-primary)',
                  color: selectedOutcome === o ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: selectedOutcome === o ? 500 : 400,
                }}
              >
                {o}
              </button>
            ))}
          </div>

          <button
            onClick={log}
            disabled={!selectedOutcome}
            style={{
              width: '100%',
              background: selectedOutcome ? '#534AB7' : 'var(--border-secondary)',
              color: selectedOutcome ? 'white' : 'var(--text-tertiary)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: selectedOutcome ? 'pointer' : 'default',
              marginTop: 14,
            }}
          >
            Log this moment
          </button>
          <button
            onClick={cancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              width: '100%',
              marginTop: 10,
              padding: 6,
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#E1F5EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              margin: '0 auto 12px',
              color: '#0F6E56',
            }}
          >
            ↑
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            Growth moment logged
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            This move is now marked as made in your playbook. Your experience is part of your documented
            journey.
          </div>
          <div
            style={{
              background: '#EEEDFE',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              textAlign: 'left',
              marginBottom: 14,
              border: '0.5px solid #AFA9EC',
            }}
          >
            <div style={{ fontSize: 11, color: '#534AB7', fontWeight: 500, marginBottom: 5 }}>
              UniBuddy suggests
            </div>
            <div style={{ fontSize: 13, color: '#3C3489', lineHeight: 1.5 }}>
              Now that you&apos;ve made this move, sharing it with a peer takes 30 seconds and can change
              how they navigate the same moment.
            </div>
          </div>
          <button
            onClick={shareAfter}
            style={{
              width: '100%',
              background: '#534AB7',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: 10,
            }}
          >
            Share this move →
          </button>
          <button
            onClick={done}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '0.5px solid var(--border-secondary)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Save and close
          </button>
        </div>
      )}
    </div>
  )
}
