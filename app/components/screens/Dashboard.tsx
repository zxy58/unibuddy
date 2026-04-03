'use client'

import { useState } from 'react'
import type { TabName } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { cohortColors } from '@/app/lib/recommendations'
import { getDashboardNudge } from '@/app/lib/recommendations'

interface DashboardProps {
  goTo: (tab: TabName, moveKey?: string) => void
  openMove: (key: string) => void
  openShareModal: (moveKey?: string) => void
  aiExpanded: Record<string, boolean>
  toggleAI: (id: string) => void
  profile?: UserProfile | null
  onSignOut?: () => void
}

// SVG donut ring
function ProgressRing({ value, total }: { value: number; total: number }) {
  const r = 46
  const circ = 2 * Math.PI * r
  const filled = (value / total) * circ
  return (
    <svg width="116" height="116" viewBox="0 0 120 120" style={{ display: 'block' }}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#E8E6FF" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="#534AB7"
        strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

// Milestone pill for the timeline strip
function MilestonePill({
  days,
  label,
  urgency,
  onClick,
}: {
  days: number
  label: string
  urgency: 'critical' | 'soon' | 'upcoming' | 'done'
  onClick?: () => void
}) {
  const cfg = {
    critical: { bg: '#FAECE7', border: '#D85A30', num: '#D85A30', dot: '#D85A30' },
    soon:     { bg: '#FEF7EC', border: '#FAC775', num: '#BA7517', dot: '#BA7517' },
    upcoming: { bg: '#EEEDFE', border: '#AFA9EC', num: '#534AB7', dot: '#534AB7' },
    done:     { bg: '#E1F5EE', border: '#9FE1CB', num: '#1D9E75', dot: '#1D9E75' },
  }[urgency]

  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 72,
        padding: '10px 10px 10px 12px',
        borderRadius: 14,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {urgency === 'done' ? (
        <div style={{ fontSize: 20, fontWeight: 700, color: cfg.num, lineHeight: 1 }}>✓</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: cfg.num, lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: 9, color: cfg.num, fontWeight: 500, opacity: 0.7 }}>d</div>
        </div>
      )}
      <div
        style={{
          fontSize: 10,
          color: cfg.num,
          fontWeight: 500,
          marginTop: 4,
          lineHeight: 1.3,
          opacity: 0.85,
          maxWidth: 64,
        }}
      >
        {label}
      </div>
    </div>
  )
}

export default function Dashboard({ goTo, openMove, aiExpanded, toggleAI, profile, onSignOut }: DashboardProps) {
  const [knowExpanded, setKnowExpanded] = useState(false)
  const [askOpen, setAskOpen] = useState(false)

  const firstName = profile?.name?.split(' ')[0] || 'You'
  const nudge = profile
    ? getDashboardNudge(profile)
    : { title: 'UniBuddy noticed', body: 'Your I-20 window is opening. Learn this move now.', moveKey: 'i20' }

  const learned = 5
  const made = 3
  const fromPeers = 2
  const total = 12
  const complete = made

  const milestones = [
    { days: 0,  label: 'Today',    urgency: 'done'     as const, key: null },
    { days: 8,  label: 'I-20 due', urgency: 'critical' as const, key: 'i20' },
    { days: 12, label: 'Housing',  urgency: 'soon'     as const, key: null },
    { days: 47, label: 'Arrival',  urgency: 'upcoming' as const, key: null },
  ]

  return (
    <div className="no-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '18px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Greeting row ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 400, marginBottom: 2 }}>
              Good morning
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              {firstName}
            </div>
            {profile && profile.cohorts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {profile.cohorts.map((c) => (
                  <span
                    key={c}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.2px',
                      background: cohortColors[c].bg,
                      color: cohortColors[c].text,
                      border: `1px solid ${cohortColors[c].border}`,
                    }}
                  >
                    {c === 'international' ? 'International' : c === 'firstgen' ? 'First-gen' : c === 'lowincome' ? 'Financial aid' : 'Transfer'}
                  </span>
                ))}
              </div>
            )}
          </div>
          {profile && (
            <button
              onClick={onSignOut}
              title="Sign out"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#EEEDFE',
                color: '#534AB7',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 700,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {firstName[0]?.toUpperCase()}
            </button>
          )}
        </div>

        {/* ── Hero progress card ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #534AB7 0%, #3C3489 100%)',
            borderRadius: 20,
            padding: '20px 20px 16px',
            color: 'white',
          }}
        >
          {/* Ring + stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            {/* Donut ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ProgressRing value={complete} total={total} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                  {complete}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 1 }}>
                  of {total}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                Pre-arrival progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { val: learned,   label: 'moves learned', color: '#AFA9EC' },
                  { val: made,      label: 'moves made',    color: '#9FE1CB' },
                  { val: fromPeers, label: 'from peers',    color: '#FAC775' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: s.color,
                        lineHeight: 1,
                        minWidth: 20,
                      }}
                    >
                      {s.val}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thin progress bar */}
          <div style={{ marginBottom: 4 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 4,
                height: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(complete / total) * 100}%`,
                  height: '100%',
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: 4,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
            {total - complete} moves remaining in pre-arrival phase
          </div>
        </div>

        {/* ── Milestone timeline ── */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: 10,
            }}
          >
            Upcoming milestones
          </div>

          {/* Connecting line + pills */}
          <div style={{ position: 'relative' }}>
            {/* Horizontal connector line */}
            <div
              style={{
                position: 'absolute',
                top: 23,
                left: 36,
                right: 8,
                height: 1.5,
                background: 'linear-gradient(90deg, #534AB7 0%, var(--border-secondary) 100%)',
                zIndex: 0,
              }}
            />
            <div
              className="no-scroll"
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 2,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {milestones.map((m, i) => (
                <MilestonePill
                  key={i}
                  days={m.days}
                  label={m.label}
                  urgency={m.urgency}
                  onClick={m.key ? () => openMove(m.key!) : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Priority move — the anchor action ── */}
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: 10,
            }}
          >
            Your next move
          </div>
          <div
            style={{
              borderRadius: 16,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-tertiary)',
              overflow: 'hidden',
            }}
          >
            {/* Urgency bar */}
            <div
              style={{
                background: '#FAECE7',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#D85A30',
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 600, color: '#993C1D', letterSpacing: '0.2px' }}>
                URGENT · 8 DAYS LEFT
              </div>
            </div>

            <div style={{ padding: '16px 16px 18px' }}>
              {/* Countdown + title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 800,
                      color: '#D85A30',
                      lineHeight: 1,
                      letterSpacing: '-1.5px',
                    }}
                  >
                    8
                  </div>
                  <div style={{ fontSize: 9, color: '#D85A30', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    days
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.3,
                      marginBottom: 5,
                      letterSpacing: '-0.2px',
                    }}
                  >
                    Request your I-20 from your DSO
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Without this, your visa appointment can&apos;t be booked.
                  </div>
                </div>
              </div>

              {/* AI nudge — subtle, inline */}
              <div
                style={{
                  background: '#F4F3FD',
                  borderRadius: 10,
                  padding: '9px 12px',
                  marginBottom: 14,
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: 12, flexShrink: 0 }}>✦</div>
                <div style={{ fontSize: 12, color: '#3C3489', lineHeight: 1.5 }}>
                  {nudge.body.length > 110 ? nudge.body.slice(0, 110) + '…' : nudge.body}
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => openMove('i20')}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#534AB7',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '-0.1px',
                  }}
                >
                  Learn the move →
                </button>
                <button
                  onClick={() => setAskOpen((v) => !v)}
                  style={{
                    padding: '11px 13px',
                    background: 'none',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: 10,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ? Ask
                </button>
              </div>

              {/* Ask UniBuddy expanded */}
              {askOpen && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 10,
                    border: '0.5px solid var(--border-tertiary)',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#534AB7', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    For your profile
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    Based on your Aug 24 arrival, your visa appointment must be before Aug 10. Request this week — don&apos;t wait past Friday.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Peer notification — compact ── */}
        <div
          style={{
            background: '#FAEEDA',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid #FAC775',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#FAC775',
              color: '#412402',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            MK
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#412402' }}>
              Min-jun shared a move with you
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#633806',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              &quot;The one thing I wish I knew before my first crit.&quot;
            </div>
          </div>
          <button
            onClick={() => goTo('inbox')}
            style={{
              padding: '6px 10px',
              background: '#FAC775',
              border: 'none',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              color: '#412402',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            View →
          </button>
        </div>

        {/* ── Know this week — collapsible ── */}
        <div>
          <button
            onClick={() => setKnowExpanded((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '0 0 10px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Know this week
            </div>
            <div style={{ fontSize: 11, color: '#534AB7', fontWeight: 500 }}>
              {knowExpanded ? 'Hide ▴' : '1 move ▾'}
            </div>
          </button>

          {knowExpanded && (
            <div
              style={{
                borderRadius: 14,
                border: '1px solid var(--border-tertiary)',
                borderLeft: '3px solid #1D9E75',
                padding: '14px 15px',
                background: 'var(--bg-primary)',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                Office hours — the move nobody teaches you
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                Students who go in week 2 — before they need anything — are the ones professors remember for 4 years.
              </div>
              <button
                onClick={() => openMove('officehours')}
                style={{
                  padding: '8px 14px',
                  background: '#E1F5EE',
                  color: '#0F6E56',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Learn this move →
              </button>
            </div>
          )}
        </div>

        {/* ── Recent moves — compact ── */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Recent moves
            </div>
            <button
              onClick={() => goTo('playbook')}
              style={{
                fontSize: 11,
                color: '#534AB7',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              See all →
            </button>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {[
              { key: 'i20',      dot: '#534AB7', label: 'How to request your I-20',     badge: 'Learned',  badgeBg: '#EEEDFE', badgeTxt: '#3C3489' },
              { key: 'dso',      dot: '#1D9E75', label: 'The DSO email formula',         badge: 'Made it',  badgeBg: '#E1F5EE', badgeTxt: '#0F6E56' },
              { key: 'critique', dot: '#BA7517', label: 'Surviving critique culture',    badge: 'Learned',  badgeBg: '#EEEDFE', badgeTxt: '#3C3489' },
            ].map((item, i) => (
              <div
                key={item.key}
                onClick={() => openMove(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  borderTop: i > 0 ? '1px solid var(--border-tertiary)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: item.dot,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 400 }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: item.badgeTxt,
                    background: item.badgeBg,
                    padding: '3px 8px',
                    borderRadius: 20,
                    letterSpacing: '0.1px',
                  }}
                >
                  {item.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
