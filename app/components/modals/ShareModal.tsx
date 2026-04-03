'use client'

import { useState } from 'react'
import type { Move, Peer } from '@/app/lib/types'

interface ShareModalProps {
  move: Move | null
  moveKey: string
  peers: Peer[]
  onClose: () => void
  onConfirm: () => void
}

export default function ShareModal({ move, peers, onClose, onConfirm }: ShareModalProps) {
  const [selectedPeers, setSelectedPeers] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const toggle = (id: string) => {
    setSelectedPeers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const send = () => setStep(2)

  const done = () => {
    setStep(1)
    setSelectedPeers([])
    setNote('')
    onConfirm()
  }

  const cancel = () => {
    setStep(1)
    setSelectedPeers([])
    setNote('')
    onClose()
  }

  const selectedNames = peers
    .filter((p) => selectedPeers.includes(p.id))
    .map((p) => p.name)
    .join(', ')

  return (
    <>
      {/* Bottom sheet */}
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
              Share this move
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
                marginBottom: 10,
              }}
            >
              Who made this move recently?
            </div>

            {peers.map((peer) => {
              const selected = selectedPeers.includes(peer.id)
              return (
                <div
                  key={peer.id}
                  onClick={() => toggle(peer.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '0.5px solid var(--border-tertiary)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: peer.bgColor,
                      color: peer.textColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {peer.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {peer.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{peer.detail}</div>
                  </div>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: selected ? 'none' : '1.5px solid var(--border-secondary)',
                      background: selected ? '#534AB7' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What made this move work for you? Your note makes it real for them."
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
                marginTop: 14,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#534AB7')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-secondary)')}
            />

            <button
              onClick={send}
              disabled={selectedPeers.length === 0}
              style={{
                width: '100%',
                background: selectedPeers.length > 0 ? '#534AB7' : 'var(--border-secondary)',
                color: selectedPeers.length > 0 ? 'white' : 'var(--text-tertiary)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                padding: '13px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: selectedPeers.length > 0 ? 'pointer' : 'default',
                marginTop: 12,
              }}
            >
              Send move
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
              ✓
            </div>
            <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
              Move shared
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Sent to {selectedNames || 'your peers'}.
            </div>
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: 14,
                textAlign: 'left',
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5 }}>
                What happens next
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                This move lands in their playbook tagged &quot;From peer&quot; with your name and note. It
                also surfaces in the community feed so others with similar profiles can discover it.
              </div>
            </div>
            <button
              onClick={done}
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
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </>
  )
}
