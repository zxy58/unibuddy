'use client'

import { useState } from 'react'
import type { TabName } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { cohortColors } from '@/app/lib/recommendations'
import { getDashboardNudge, getCohortTag } from '@/app/lib/recommendations'

interface DashboardProps {
  goTo: (tab: TabName, moveKey?: string) => void
  openMove: (key: string) => void
  openShareModal: (moveKey?: string) => void
  aiExpanded: Record<string, boolean>
  toggleAI: (id: string) => void
  profile?: UserProfile | null
  onSignOut?: () => void
}

export default function Dashboard({ goTo, openMove, aiExpanded, toggleAI, profile, onSignOut }: DashboardProps) {
  const [knowExpanded, setKnowExpanded] = useState(false)
  const [actExpanded, setActExpanded] = useState<Record<string, boolean>>({ act0: true })

  const firstName = profile?.name?.split(' ')[0] || 'Muzi'
  const cohortTag = profile ? getCohortTag(profile) : 'Pre-arrival · 47 days to go'
  const nudge = profile ? getDashboardNudge(profile) : {
    title: 'UniBuddy noticed',
    body: 'Your I-20 window opens in 8 days. Learning this move now gives you exactly enough time to make it before your visa appointment window closes.',
    moveKey: 'i20',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 500,
  }

  const shb = (color = 'purple'): React.CSSProperties => {
    const configs: Record<string, React.CSSProperties> = {
      purple: { color: '#534AB7', background: '#EEEDFE' },
      green: { color: '#0F6E56', background: '#E1F5EE' },
      amber: { color: '#633806', background: '#FAEEDA' },
    }
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      padding: '6px 11px',
      cursor: 'pointer',
      fontWeight: 500,
      ...configs[color],
    }
  }

  const helpBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: 'var(--text-secondary)',
    background: 'none',
    border: '0.5px solid var(--border-secondary)',
    borderRadius: 20,
    padding: '5px 10px',
    cursor: 'pointer',
  }

  const aiBox = (id: string, label: string, text: string) =>
    aiExpanded[id] ? (
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 14px',
          border: '0.5px solid var(--border-tertiary)',
          marginTop: 8,
        }}
      >
        <div
          style={{ fontSize: 11, color: '#534AB7', fontWeight: 500, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{text}</div>
      </div>
    ) : null

  const actItems = [
    {
      id: 'act0',
      borderColor: '#D85A30',
      title: 'Request your I-20 from your DSO',
      badge: '8 days',
      badgeBg: '#FAECE7',
      badgeColor: '#993C1D',
      desc: "Without this, your visa appointment can't be booked. Learning this move earns it in your playbook.",
      moveKey: 'i20',
      aiId: 'dai1',
      aiLabel: 'For your profile',
      aiText: "Based on your Aug 24 arrival, your visa appointment must be before Aug 10. Request this week — don't wait past Friday.",
    },
    {
      id: 'act1',
      borderColor: '#534AB7',
      title: 'Confirm housing deposit',
      badge: '12 days',
      badgeBg: '#EEEDFE',
      badgeColor: '#3C3489',
      desc: "Your room is released if the deposit isn't received in time.",
      moveKey: 'playbook',
      aiId: 'dai2',
      aiLabel: 'Housing scam alert',
      aiText: 'Before paying: verify the listing on Google Maps Street View, confirm landlord name matches county records, and never pay via wire transfer or gift cards.',
    },
  ]

  return (
    <div className="no-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

        {/* Greeting row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>
              Good morning, {firstName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
              {cohortTag}
            </div>
            {/* Cohort badges */}
            {profile && profile.cohorts.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {profile.cohorts.map((c) => (
                  <span
                    key={c}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 500,
                      background: cohortColors[c].bg,
                      color: cohortColors[c].text,
                      border: `0.5px solid ${cohortColors[c].border}`,
                    }}
                  >
                    {c === 'international' ? 'Intl' : c === 'firstgen' ? 'First-gen' : c === 'lowincome' ? 'Financial aid' : 'Transfer'}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Avatar / sign out */}
          {profile && (
            <button
              onClick={onSignOut}
              title="Sign out"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#EEEDFE',
                color: '#534AB7',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {firstName[0]?.toUpperCase()}
            </button>
          )}
        </div>

        {/* Peer notification */}
        <div
          style={{
            background: '#FAEEDA',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            border: '0.5px solid #FAC775',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#FAC775',
                color: '#412402',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              MK
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#412402', marginBottom: 3 }}>
                Min-jun shared a move with you
              </div>
              <div style={{ fontSize: 12, color: '#633806', lineHeight: 1.5, marginBottom: 8 }}>
                &quot;This is the one thing I wish someone had told me before my first RISD crit.&quot;
              </div>
              <button style={shb('amber') as React.CSSProperties} onClick={() => goTo('inbox')}>
                View move →
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pre-arrival progress</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#534AB7' }}>4 of 12 done</div>
          </div>
          <div
            style={{
              background: 'var(--border-secondary)',
              borderRadius: 4,
              height: 5,
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '33%', height: '100%', background: '#534AB7', borderRadius: 4 }} />
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 12,
              borderTop: '0.5px solid var(--border-tertiary)',
              paddingTop: 10,
            }}
          >
            {[
              { value: '5', label: 'Moves learned', color: '#534AB7' },
              { value: '3', label: 'Moves made', color: '#1D9E75' },
              { value: '2', label: 'From peers', color: '#BA7517' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  borderLeft: i > 0 ? '0.5px solid var(--border-tertiary)' : 'none',
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 500, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI nudge — personalized */}
        <div
          style={{
            background: '#EEEDFE',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            border: '0.5px solid #AFA9EC',
          }}
        >
          <div style={{ fontSize: 11, color: '#534AB7', fontWeight: 500, marginBottom: 4 }}>
            {nudge.title}
          </div>
          <div style={{ fontSize: 13, color: '#3C3489', lineHeight: 1.5, marginBottom: 8 }}>
            {nudge.body}
          </div>
          <button style={shb('purple') as React.CSSProperties} onClick={() => openMove(nudge.moveKey)}>
            Learn the move →
          </button>
        </div>

        {/* Act now — collapsible items */}
        <div style={sectionLabel}>Act now</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {actItems.map((item) => {
            const expanded = actExpanded[item.id] !== false
            return (
              <div
                key={item.id}
                style={{
                  border: '0.5px solid var(--border-tertiary)',
                  borderLeft: `3px solid ${item.borderColor}`,
                  borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
                  padding: '14px 16px',
                  background: 'var(--bg-primary)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: expanded ? 4 : 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => setActExpanded((prev) => ({ ...prev, [item.id]: !expanded }))}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 20,
                        background: item.badgeBg,
                        color: item.badgeColor,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.badge}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1 }}>
                      {expanded ? '▾' : '▸'}
                    </div>
                  </div>
                </div>
                {expanded && (
                  <>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-secondary)',
                        marginBottom: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        style={shb('purple') as React.CSSProperties}
                        onClick={() => item.moveKey === 'playbook' ? goTo('playbook') : openMove(item.moveKey)}
                      >
                        Learn the move →
                      </button>
                      <button style={helpBtn} onClick={() => toggleAI(item.aiId)}>
                        ? Ask UniBuddy
                      </button>
                    </div>
                    {aiBox(item.aiId, item.aiLabel, item.aiText)}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Know this week — collapsible */}
        <button
          onClick={() => setKnowExpanded((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <div style={sectionLabel}>Know this week</div>
          <div style={{ fontSize: 12, color: '#534AB7' }}>
            {knowExpanded ? 'Hide ▴' : '1 move ▾'}
          </div>
        </button>
        {knowExpanded && (
          <div
            style={{
              border: '0.5px solid var(--border-tertiary)',
              borderLeft: '3px solid #1D9E75',
              borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
              padding: '14px 16px',
              background: 'var(--bg-primary)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 }}>
              Office hours — the move nobody teaches you
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
              Most students go when struggling. The students who go in week 2 are the ones professors
              remember for 4 years.
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <button style={shb('green') as React.CSSProperties} onClick={() => openMove('officehours')}>
                Learn this move →
              </button>
              <button style={helpBtn} onClick={() => toggleAI('dai3')}>
                ? Ask UniBuddy
              </button>
            </div>
            {aiBox('dai3', profile?.schoolName ? `For ${profile.schoolName} specifically` : 'For your school', 'At RISD, critique faculty remember students who come before crits, not after. Go once in week 2, introduce yourself, ask one genuine question about their practice.')}
          </div>
        )}

        {/* Recent moves */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recent moves in your playbook</div>
            <button
              onClick={() => goTo('playbook')}
              style={{
                fontSize: 12,
                color: '#534AB7',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              See all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: 'i20', dot: '#534AB7', label: 'How to request your I-20', badge: 'Learned', badgeBg: '#EEEDFE', badgeText: '#3C3489' },
              { key: 'dso', dot: '#BA7517', label: 'The DSO email formula', badge: 'Made it', badgeBg: '#E1F5EE', badgeText: '#0F6E56' },
              { key: 'critique', dot: '#1D9E75', label: 'Surviving critique culture', badge: 'Learned', badgeBg: '#EEEDFE', badgeText: '#3C3489' },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => openMove(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: item.dot,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{item.label}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: item.badgeText,
                    background: item.badgeBg,
                    padding: '2px 8px',
                    borderRadius: 20,
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
