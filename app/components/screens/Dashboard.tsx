'use client'

import type { TabName } from '@/app/lib/types'

interface DashboardProps {
  goTo: (tab: TabName, moveKey?: string) => void
  openMove: (key: string) => void
  openShareModal: (moveKey?: string) => void
  aiExpanded: Record<string, boolean>
  toggleAI: (id: string) => void
}

export default function Dashboard({ goTo, openMove, aiExpanded, toggleAI }: DashboardProps) {
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

  return (
    <div className="no-scroll" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Greeting */}
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>
            Good morning, Muzi
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Pre-arrival · 47 days to go
          </div>
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

        {/* AI nudge */}
        <div
          style={{
            background: '#EEEDFE',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            border: '0.5px solid #AFA9EC',
          }}
        >
          <div style={{ fontSize: 11, color: '#534AB7', fontWeight: 500, marginBottom: 4 }}>
            UniBuddy noticed
          </div>
          <div style={{ fontSize: 13, color: '#3C3489', lineHeight: 1.5, marginBottom: 8 }}>
            Your I-20 window opens in 8 days. Learning this move now gives you exactly enough time to
            make it before your visa appointment window closes.
          </div>
          <button style={shb('purple') as React.CSSProperties} onClick={() => openMove('i20')}>
            Learn the move →
          </button>
        </div>

        {/* Act now */}
        <div style={sectionLabel}>Act now</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Urgent item 1 */}
          <div
            style={{
              border: '0.5px solid var(--border-tertiary)',
              borderLeft: '3px solid #D85A30',
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
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                Request your I-20 from your DSO
              </div>
              <div
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 20,
                  background: '#FAECE7',
                  color: '#993C1D',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                8 days
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                marginBottom: 10,
                lineHeight: 1.5,
              }}
            >
              Without this, your visa appointment can&apos;t be booked. Learning this move earns it in
              your playbook.
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <button style={shb('purple') as React.CSSProperties} onClick={() => openMove('i20')}>
                Learn the move →
              </button>
              <button style={helpBtn} onClick={() => toggleAI('dai1')}>
                ? Ask UniBuddy
              </button>
            </div>
            {aiBox('dai1', 'For your profile', 'Based on your Aug 24 arrival, your visa appointment must be before Aug 10. Request this week — don\'t wait past Friday.')}
          </div>

          {/* Urgent item 2 */}
          <div
            style={{
              border: '0.5px solid var(--border-tertiary)',
              borderLeft: '3px solid #534AB7',
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
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                Confirm housing deposit
              </div>
              <div
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 20,
                  background: '#EEEDFE',
                  color: '#3C3489',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                12 days
              </div>
            </div>
            <div
              style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}
            >
              Your room is released if the deposit isn&apos;t received in time.
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <button style={shb('purple') as React.CSSProperties} onClick={() => goTo('playbook')}>
                Learn the move →
              </button>
              <button style={helpBtn} onClick={() => toggleAI('dai2')}>
                ? Ask UniBuddy
              </button>
            </div>
            {aiBox('dai2', 'Housing scam alert', 'Before paying: verify the listing on Google Maps Street View, confirm landlord name matches county records, and never pay via wire transfer or gift cards.')}
          </div>
        </div>

        {/* Know this week */}
        <div style={sectionLabel}>Know this week</div>
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
          {aiBox('dai3', 'For RISD specifically', 'At RISD, critique faculty remember students who come before crits, not after. Go once in week 2, introduce yourself, ask one genuine question about their practice.')}
        </div>

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
