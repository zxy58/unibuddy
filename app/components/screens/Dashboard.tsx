'use client'

import { useState } from 'react'
import type { TabName, Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { cohortColors, getDashboardNudge } from '@/app/lib/recommendations'
import ProgressView from './ProgressView'

interface DashboardProps {
  goTo: (tab: TabName, moveKey?: string) => void
  openMove: (key: string) => void
  openShareModal: (moveKey?: string) => void
  aiExpanded: Record<string, boolean>
  toggleAI: (id: string) => void
  profile?: UserProfile | null
  onSignOut?: () => void
  moves: Record<string, Move>
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const r = 46, circ = 2 * Math.PI * r, filled = (value / total) * circ
  return (
    <svg width="116" height="116" viewBox="0 0 120 120" style={{ display: 'block' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  )
}

function MilestonePill({ days, label, urgency, onClick }: {
  days: number; label: string; urgency: 'critical' | 'soon' | 'upcoming' | 'done'; onClick?: () => void
}) {
  const cfg = {
    critical: { bg: '#FAECE7', border: '#D85A30', num: '#D85A30' },
    soon:     { bg: '#FEF7EC', border: '#FAC775', num: '#BA7517' },
    upcoming: { bg: '#EEF2FF', border: '#C7D2FE', num: '#4F46E5' },
    done:     { bg: '#E1F5EE', border: '#9FE1CB', num: '#1D9E75' },
  }[urgency]

  return (
    <div onClick={onClick} style={{
      minWidth: 72, padding: '10px 10px 10px 12px', borderRadius: 14,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      cursor: onClick ? 'pointer' : 'default', flexShrink: 0,
    }}>
      {urgency === 'done' ? (
        <div style={{ fontSize: 20, fontWeight: 700, color: cfg.num, lineHeight: 1 }}>✓</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: cfg.num, lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: 9, color: cfg.num, fontWeight: 500, opacity: 0.7 }}>d</div>
        </div>
      )}
      <div style={{ fontSize: 10, color: cfg.num, fontWeight: 500, marginTop: 4, lineHeight: 1.3, opacity: 0.85, maxWidth: 64 }}>
        {label}
      </div>
    </div>
  )
}

export default function Dashboard({ goTo, openMove, profile, moves }: DashboardProps) {
  const [progressOpen, setProgressOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)

  if (progressOpen) {
    return (
      <ProgressView
        moves={moves}
        profile={profile || null}
        onBack={() => setProgressOpen(false)}
        openMove={(key) => { setProgressOpen(false); openMove(key) }}
      />
    )
  }

  const firstName = profile?.name?.split(' ')[0] || 'You'
  const nudge = profile
    ? getDashboardNudge(profile)
    : { title: 'UniBuddy noticed', body: 'Your I-20 window is opening. Learn this move now.', moveKey: 'i20' }

  const learned = Object.values(moves).filter(m => m.type === 'learned').length
  const made = Object.values(moves).filter(m => m.madeit).length
  const fromPeers = Object.values(moves).filter(m => m.type === 'peer').length
  const total = 12
  const complete = made

  const milestones = [
    { days: 0,  label: 'Today',    urgency: 'done'     as const, key: null },
    { days: 8,  label: 'I-20 due', urgency: 'critical' as const, key: 'i20' },
    { days: 12, label: 'Housing',  urgency: 'soon'     as const, key: null },
    { days: 47, label: 'Arrival',  urgency: 'upcoming' as const, key: null },
  ]

  // Category chip counts
  const visaDone = ['i20', 'dso', 'sevis'].filter(k => moves[k]?.madeit).length
  const academicDone = ['officehours', 'critique'].filter(k => moves[k]?.madeit).length

  const categories = [
    { emoji: '📚', label: 'Academic',   done: academicDone, total: 2, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
    { emoji: '🛂', label: 'Visa',       done: visaDone,     total: 3, color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD' },
    { emoji: '💼', label: 'Career',     done: 0,            total: 3, color: '#B45309', bg: '#FEF3C7', border: '#FCD34D' },
    { emoji: '🤝', label: 'Community',  done: 0,            total: 3, color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
  ]

  return (
    <div className="no-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '14px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Greeting ── */}
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 400, marginBottom: 2 }}>Good morning</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', lineHeight: 1.1, marginBottom: 6 }}>
            {firstName} 👋
          </div>
          {profile && profile.cohorts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {profile.cohorts.map((c) => (
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

        {/* ── Hero progress card — tappable ── */}
        <div
          onClick={() => setProgressOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            borderRadius: 20, padding: '18px 20px 0', color: 'white', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ProgressRing value={complete} total={total} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1 }}>{complete}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>of {total}</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Pre-arrival progress</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { val: learned,   label: 'moves learned', color: '#A5B4FC' },
                  { val: made,      label: 'moves made',    color: '#6EE7B7' },
                  { val: fromPeers, label: 'from peers',    color: '#FCD34D' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1, minWidth: 20 }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Tap indicator strip */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{total - complete} moves remaining</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>View full progress →</div>
          </div>
        </div>

        {/* ── Category chips 2×2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {categories.map((cat) => (
            <div
              key={cat.label}
              onClick={() => setProgressOpen(true)}
              style={{
                padding: '14px 16px', borderRadius: 16, background: cat.bg,
                border: `1px solid ${cat.border}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0 }}>{cat.emoji}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: cat.color, lineHeight: 1 }}>
                  {cat.done}
                  <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.55 }}>/{cat.total}</span>
                </div>
                <div style={{ fontSize: 11, color: cat.color, opacity: 0.75, fontWeight: 500, marginTop: 2 }}>{cat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Milestone timeline ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Upcoming milestones
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 23, left: 36, right: 8, height: 1.5, background: 'linear-gradient(90deg, #7C3AED 0%, var(--border-secondary) 100%)', zIndex: 0 }} />
            <div className="no-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, position: 'relative', zIndex: 1 }}>
              {milestones.map((m, i) => (
                <MilestonePill key={i} days={m.days} label={m.label} urgency={m.urgency}
                  onClick={m.key ? () => openMove(m.key!) : undefined} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Priority move — Your next action ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Your next move
          </div>
          <div style={{ borderRadius: 16, background: 'var(--bg-primary)', border: '1px solid var(--border-tertiary)', overflow: 'hidden' }}>
            <div style={{ background: '#FAECE7', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D85A30', flexShrink: 0 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: '#993C1D', letterSpacing: '0.2px' }}>URGENT · 8 DAYS LEFT</div>
            </div>
            <div style={{ padding: '16px 16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: '#D85A30', lineHeight: 1, letterSpacing: '-1.5px' }}>8</div>
                  <div style={{ fontSize: 9, color: '#D85A30', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>days</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 5, letterSpacing: '-0.2px' }}>
                    Request your I-20 from your DSO
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Without this, your visa appointment can&apos;t be booked.
                  </div>
                </div>
              </div>
              <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '9px 12px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 12, flexShrink: 0 }}>✦</div>
                <div style={{ fontSize: 12, color: '#5B21B6', lineHeight: 1.5 }}>
                  {nudge.body.length > 110 ? nudge.body.slice(0, 110) + '…' : nudge.body}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openMove('i20')} style={{
                  flex: 1, padding: '11px', background: '#F97316', color: 'white', border: 'none',
                  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Learn the move →
                </button>
                <button onClick={() => setAskOpen(v => !v)} style={{
                  padding: '11px 13px', background: 'none', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-secondary)', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                }}>
                  ? Ask
                </button>
              </div>
              {askOpen && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '0.5px solid var(--border-tertiary)' }}>
                  <div style={{ fontSize: 10, color: '#7C3AED', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>For your profile</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    Based on your Aug 24 arrival, your visa appointment must be before Aug 10. Request this week — don&apos;t wait past Friday.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Peer notification ── */}
        <div style={{ background: '#FAEEDA', borderRadius: 14, padding: '12px 14px', border: '1px solid #FAC775', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#FAC775', color: '#412402', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
            MK
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#412402' }}>Min-jun shared a move with you</div>
            <div style={{ fontSize: 11, color: '#633806', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              &quot;The one thing I wish I knew before my first crit.&quot;
            </div>
          </div>
          <button onClick={() => goTo('inbox')} style={{
            padding: '6px 10px', background: '#FAC775', border: 'none', borderRadius: 8,
            fontSize: 11, fontWeight: 600, color: '#412402', cursor: 'pointer', flexShrink: 0,
          }}>
            View →
          </button>
        </div>

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
